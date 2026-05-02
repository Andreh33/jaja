/**
 * Carga server-side los datos del dashboard de facturación.
 *
 * Diseño:
 *   - Si el user no tiene `stripe_customer_id` → estado vacío sin llamar a Stripe.
 *   - Si el customer fue borrado en Stripe → tratar como "sin customer" + warning.
 *   - 3 llamadas a Stripe en paralelo (Promise.allSettled): upcoming preview,
 *     listado de facturas. La subscription la leemos de BBDD local porque ya
 *     refleja el estado convergido por los webhooks.
 *   - Cada llamada falla aislada: si una rompe, las otras secciones siguen.
 *     La UI muestra "—" o degrada en la sección afectada.
 *
 * Source of truth para "plan actual": tabla `subscriptions` local. Para
 * "próximo cobro" e "historial": Stripe en directo (siempre fresco).
 */

import type Stripe from 'stripe';
import { eq, and, ne, desc } from 'drizzle-orm';
import { db } from './db';
import { subscriptions, users } from '../../drizzle/schema';
import { stripe } from './stripe';

export type LocalSubscription = typeof subscriptions.$inferSelect;

export type BillingData = {
  user: { id: string; email: string; stripeCustomerId: string | null };
  subscription: LocalSubscription | null;
  upcoming: Stripe.Invoice | null;
  invoices: Stripe.Invoice[];
  customerDeleted: boolean;
  errors: {
    upcoming?: string;
    invoices?: string;
    customer?: string;
  };
};

/**
 * Subscription "actual" del usuario: la más reciente que no esté en
 * estado terminal. Excluye 'canceled' e 'incomplete_expired' para no
 * mostrar planes muertos.
 *
 * Read-only de BBDD local. NO llama a Stripe — apto para usar en
 * páginas que solo necesitan saber si hay plan activo (dashboard
 * principal, listado admin).
 */
export async function getActiveLocalSubscription(
  userId: string,
): Promise<LocalSubscription | null> {
  const subs = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        ne(subscriptions.status, 'canceled'),
        ne(subscriptions.status, 'incomplete_expired'),
      ),
    )
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);
  return subs[0] ?? null;
}

export async function getBillingData(userId: string): Promise<BillingData> {
  const userRow = (
    await db
      .select({ id: users.id, email: users.email, stripeCustomerId: users.stripeCustomerId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
  )[0];

  const base: BillingData = {
    user: {
      id: userRow?.id ?? userId,
      email: userRow?.email ?? '',
      stripeCustomerId: userRow?.stripeCustomerId ?? null,
    },
    subscription: await getActiveLocalSubscription(userId),
    upcoming: null,
    invoices: [],
    customerDeleted: false,
    errors: {},
  };

  if (!base.user.stripeCustomerId) {
    return base;
  }

  // 2. Validar customer + llamadas a Stripe en paralelo.
  // En API 2026-04-22.dahlia, createPreview requiere `subscription` (o
  // alternativas explícitas); ya no infiere desde el customer. Solo
  // tiene sentido llamarlo cuando tenemos una sub local activa-like.
  const customerId = base.user.stripeCustomerId;
  const subIdForPreview = base.subscription?.stripeSubscriptionId ?? null;
  const [customerRes, upcomingRes, invoicesRes] = await Promise.allSettled([
    stripe.customers.retrieve(customerId),
    subIdForPreview
      ? stripe.invoices.createPreview({ subscription: subIdForPreview })
      : Promise.resolve(null),
    stripe.invoices.list({ customer: customerId, limit: 24 }),
  ]);

  // 2a. Customer.
  if (customerRes.status === 'fulfilled') {
    const c = customerRes.value as Stripe.Customer | Stripe.DeletedCustomer;
    if ((c as Stripe.DeletedCustomer).deleted) {
      base.customerDeleted = true;
      console.warn(
        `[billing] result=warn reason=stripe_customer_deleted user_id=${userId} stripe_customer_id=${customerId}`,
      );
    }
  } else {
    const err = customerRes.reason as { code?: string; message?: string };
    if (err?.code === 'resource_missing') {
      base.customerDeleted = true;
      console.warn(
        `[billing] result=warn reason=stripe_customer_not_found user_id=${userId} stripe_customer_id=${customerId}`,
      );
    } else {
      base.errors.customer = err?.message ?? 'unknown';
      console.error(
        `[billing] result=error customer_retrieve user_id=${userId} stripe_customer_id=${customerId} err="${err?.message}"`,
      );
    }
  }

  // Si el customer está borrado, las otras llamadas no aportan datos útiles.
  if (base.customerDeleted) {
    return base;
  }

  // 2b. Próximo cobro.
  if (upcomingRes.status === 'fulfilled') {
    // null cuando no había sub para previsualizar.
    base.upcoming = upcomingRes.value;
  } else {
    const err = upcomingRes.reason as { code?: string; message?: string };
    // Casos esperados que NO son error UI: no hay invoice próximo.
    if (err?.code === 'invoice_upcoming_none') {
      base.upcoming = null;
    } else {
      base.errors.upcoming = err?.message ?? 'unknown';
      console.error(
        `[billing] result=error upcoming_preview user_id=${userId} subscription_id=${subIdForPreview} err="${err?.message}"`,
      );
    }
  }

  // 2c. Historial.
  if (invoicesRes.status === 'fulfilled') {
    // Filtrar drafts/voids — no aportan al cliente.
    base.invoices = invoicesRes.value.data.filter(
      (inv) => inv.status !== 'draft' && inv.status !== 'void',
    );
  } else {
    const err = invoicesRes.reason as { message?: string };
    base.errors.invoices = err?.message ?? 'unknown';
    console.error(
      `[billing] result=error invoices_list user_id=${userId} err="${err?.message}"`,
    );
  }

  return base;
}
