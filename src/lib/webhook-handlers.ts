/**
 * Handlers de eventos de Stripe para /api/webhooks/stripe.
 *
 * OUT-OF-ORDER HANDLING:
 *   invoice.paid and customer.subscription.* events may arrive before
 *   checkout.session.completed. When this happens, UPDATE returns 0
 *   rows. We log result=out_of_order and rely on Stripe re-delivering
 *   these events (it does, at minimum once per billing cycle).
 *   Eventual consistency is guaranteed.
 *
 *   FUTURE: nightly reconciliation job comparing active Stripe
 *   subscriptions vs subscriptions table, flagging gaps. Not for
 *   this phase.
 *
 * STRUCTURED LOGS:
 *   All log lines use key=value format so production logs can be
 *   grepped (e.g. `grep result=out_of_order` to detect systemic
 *   convergence issues).
 *
 * HANDLERS LEAN (5s-30s budget de Stripe):
 *   Estos handlers solo tocan BBDD local + 1 listLineItems en
 *   checkout.session.completed. Si en el futuro hay que mandar
 *   emails, integrar Twilio, etc., NO añadirlo aquí — delegar a un
 *   job/queue para no comer el budget de respuesta.
 */

import type Stripe from 'stripe';
import { eq, sql } from 'drizzle-orm';
import { db } from './db';
import { orders, subscriptions, users } from '../../drizzle/schema';
import { stripe } from './stripe';
import { findCatalogItemByPriceId } from '@/config/stripe-price-helpers';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

type CartLine = { catalog_id: string; quantity: number; amount_subtotal: number };

/**
 * Reconstruye el carrito desde line_items de Stripe usando el mapping
 * priceId → catalogId. Items desconocidos se omiten con warning.
 */
async function listCartFromSession(sessionId: string): Promise<CartLine[]> {
  const lines: CartLine[] = [];
  // listLineItems devuelve hasta 100 por página; en nuestro flujo nunca pasa de ~10.
  const li = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 100, expand: ['data.price'] });
  for (const item of li.data) {
    const priceId = (typeof item.price === 'object' && item.price?.id) || null;
    if (!priceId) {
      console.warn(`[stripe-webhook] result=warn reason=line_item_no_price session_id=${sessionId}`);
      continue;
    }
    const catalogItem = findCatalogItemByPriceId(priceId);
    if (!catalogItem) {
      console.warn(`[stripe-webhook] result=warn reason=price_not_in_catalog price_id=${priceId} session_id=${sessionId}`);
      continue;
    }
    lines.push({
      catalog_id: catalogItem.id,
      quantity: item.quantity ?? 1,
      amount_subtotal: item.amount_subtotal ?? 0,
    });
  }
  return lines;
}

/* =====================================================================
 * checkout.session.completed
 * =====================================================================
 * - Si mode 'subscription': UPSERT subscriptions con datos disponibles.
 *   Los detalles de current_period_start/end llegarán típicamente con
 *   invoice.paid o customer.subscription.updated.
 * - Si mode 'payment': INSERT order (one-time).
 * - En ambos casos: si users.stripe_customer_id está vacío, lo seteamos.
 * - Si metadata.phone_agent === 'yes': set users.phone_agent_pending_provision = true.
 */
export async function handleCheckoutSessionCompleted(
  tx: Tx,
  event: Stripe.Event,
): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.user_id;
  if (!userId) {
    console.warn(
      `[stripe-webhook] event_id=${event.id} type=${event.type} result=warn reason=missing_metadata_user_id session_id=${session.id}`,
    );
    return;
  }
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;

  // 1. Set users.stripe_customer_id si vacío + flag phone_agent.
  const phoneAgent = session.metadata?.phone_agent === 'yes';
  if (customerId || phoneAgent) {
    const setObj: Partial<{ stripeCustomerId: string; phoneAgentPendingProvision: boolean }> = {};
    if (customerId) setObj.stripeCustomerId = customerId;
    if (phoneAgent) setObj.phoneAgentPendingProvision = true;
    await tx
      .update(users)
      .set(setObj)
      .where(eq(users.id, userId));
  }

  // 2. Reconstruir carrito.
  const cart = await listCartFromSession(session.id);

  if (session.mode === 'subscription') {
    const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
    if (!subId) {
      console.warn(
        `[stripe-webhook] event_id=${event.id} type=${event.type} result=warn reason=session_subscription_id_missing session_id=${session.id}`,
      );
      return;
    }
    const cadence = session.metadata?.cadence === 'yearly' ? 'yearly' : 'monthly';

    // UPSERT subscription. Si no existe, crea con datos disponibles.
    await tx
      .insert(subscriptions)
      .values({
        userId,
        stripeSubscriptionId: subId,
        stripeCustomerId: customerId ?? '',
        status: 'incomplete', // checkout.session.completed no garantiza pago final
        cadence,
        items: cart,
      })
      .onConflictDoUpdate({
        target: subscriptions.stripeSubscriptionId,
        set: {
          items: cart,
          stripeCustomerId: customerId ?? sql`stripe_customer_id`,
          updatedAt: sql`(unixepoch())`,
        },
      });
    console.log(
      `[stripe-webhook] event_id=${event.id} type=${event.type} result=processed mode=subscription session_id=${session.id} subscription_id=${subId} user_id=${userId}`,
    );
  } else if (session.mode === 'payment') {
    // INSERT order (one-time). UNIQUE en stripe_session_id evita duplicados.
    const piId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null;
    await tx
      .insert(orders)
      .values({
        userId,
        stripeSessionId: session.id,
        stripePaymentIntentId: piId,
        stripeCustomerId: customerId,
        amountTotal: session.amount_total ?? 0,
        currency: (session.currency || 'eur').toLowerCase(),
        status: session.payment_status === 'paid' ? 'paid' : 'pending',
        lineItems: cart,
      })
      .onConflictDoNothing({ target: orders.stripeSessionId });
    console.log(
      `[stripe-webhook] event_id=${event.id} type=${event.type} result=processed mode=payment session_id=${session.id} user_id=${userId} amount_total=${session.amount_total}`,
    );
  }
}

/* =====================================================================
 * invoice.paid
 * =====================================================================
 * UPDATE puro. Si la fila aún no existe (out-of-order: invoice.paid antes
 * que checkout.session.completed), 0 rows affected → log + return. Los
 * datos convergen cuando llegue checkout.session.completed; además Stripe
 * dispara customer.subscription.updated periódicamente con period_end.
 *
 * No usamos UPSERT porque insertar requeriría un user_id (notNull + FK).
 * El user_id solo está disponible en checkout.session.completed.
 */
export async function handleInvoicePaid(tx: Tx, event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  // En la SDK 22.x, invoice.subscription puede no estar en el typing oficial pero sí en wire format.
  const subId = (invoice as unknown as { subscription?: string | { id: string } | null }).subscription;
  const subIdStr = typeof subId === 'string' ? subId : subId?.id ?? null;
  if (!subIdStr) {
    console.log(
      `[stripe-webhook] event_id=${event.id} type=${event.type} result=skipped reason=no_subscription invoice_id=${invoice.id}`,
    );
    return;
  }

  const periodStart = (invoice.lines.data[0]?.period?.start as number | undefined) ?? null;
  const periodEnd = (invoice.lines.data[0]?.period?.end as number | undefined) ?? null;

  const updated = await tx
    .update(subscriptions)
    .set({
      status: 'active',
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      updatedAt: sql`(unixepoch())`,
    })
    .where(eq(subscriptions.stripeSubscriptionId, subIdStr))
    .returning({ id: subscriptions.id });

  if (updated.length === 0) {
    console.warn(
      `[stripe-webhook] event_id=${event.id} type=${event.type} result=out_of_order subscription_id=${subIdStr} invoice_id=${invoice.id}`,
    );
    return;
  }
  console.log(
    `[stripe-webhook] event_id=${event.id} type=${event.type} result=processed subscription_id=${subIdStr} invoice_id=${invoice.id}`,
  );
}

/* =====================================================================
 * invoice.payment_failed
 * =====================================================================
 */
export async function handleInvoicePaymentFailed(tx: Tx, event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const subId = (invoice as unknown as { subscription?: string | { id: string } | null }).subscription;
  const subIdStr = typeof subId === 'string' ? subId : subId?.id ?? null;
  if (!subIdStr) {
    console.log(
      `[stripe-webhook] event_id=${event.id} type=${event.type} result=skipped reason=no_subscription invoice_id=${invoice.id}`,
    );
    return;
  }
  const updated = await tx
    .update(subscriptions)
    .set({ status: 'past_due', updatedAt: sql`(unixepoch())` })
    .where(eq(subscriptions.stripeSubscriptionId, subIdStr))
    .returning({ id: subscriptions.id });
  if (updated.length === 0) {
    console.warn(
      `[stripe-webhook] event_id=${event.id} type=${event.type} result=out_of_order subscription_id=${subIdStr} invoice_id=${invoice.id}`,
    );
    return;
  }
  console.log(
    `[stripe-webhook] event_id=${event.id} type=${event.type} result=processed subscription_id=${subIdStr} invoice_id=${invoice.id}`,
  );
}

/* =====================================================================
 * customer.subscription.updated
 * =====================================================================
 */
export async function handleCustomerSubscriptionUpdated(tx: Tx, event: Stripe.Event): Promise<void> {
  const sub = event.data.object as Stripe.Subscription;
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? '';

  // Reconstruir items desde sub.items.data.
  const items = sub.items.data
    .map((item) => {
      const priceId = item.price?.id;
      const catalogItem = priceId ? findCatalogItemByPriceId(priceId) : null;
      if (!catalogItem) return null;
      return { catalog_id: catalogItem.id, quantity: item.quantity ?? 1 };
    })
    .filter((x): x is { catalog_id: string; quantity: number } => x !== null);

  const updated = await tx
    .update(subscriptions)
    .set({
      status: sub.status,
      stripeCustomerId: customerId,
      items,
      // SDK varía el casing/nombre entre versiones; casting defensivo.
      currentPeriodStart: (sub as unknown as { current_period_start?: number | null }).current_period_start ?? null,
      currentPeriodEnd: (sub as unknown as { current_period_end?: number | null }).current_period_end ?? null,
      cancelAtPeriodEnd: !!(sub as unknown as { cancel_at_period_end?: boolean }).cancel_at_period_end,
      updatedAt: sql`(unixepoch())`,
    })
    .where(eq(subscriptions.stripeSubscriptionId, sub.id))
    .returning({ id: subscriptions.id });
  if (updated.length === 0) {
    console.warn(
      `[stripe-webhook] event_id=${event.id} type=${event.type} result=out_of_order subscription_id=${sub.id} status=${sub.status}`,
    );
    return;
  }
  console.log(
    `[stripe-webhook] event_id=${event.id} type=${event.type} result=processed subscription_id=${sub.id} status=${sub.status}`,
  );
}

/* =====================================================================
 * customer.subscription.deleted
 * =====================================================================
 */
export async function handleCustomerSubscriptionDeleted(tx: Tx, event: Stripe.Event): Promise<void> {
  const sub = event.data.object as Stripe.Subscription;
  const updated = await tx
    .update(subscriptions)
    .set({ status: 'canceled', updatedAt: sql`(unixepoch())` })
    .where(eq(subscriptions.stripeSubscriptionId, sub.id))
    .returning({ id: subscriptions.id });
  if (updated.length === 0) {
    console.warn(
      `[stripe-webhook] event_id=${event.id} type=${event.type} result=out_of_order subscription_id=${sub.id}`,
    );
    return;
  }
  console.log(
    `[stripe-webhook] event_id=${event.id} type=${event.type} result=processed subscription_id=${sub.id}`,
  );
}
