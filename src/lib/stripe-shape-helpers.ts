/**
 * Helpers puros sobre el shape de objetos de Stripe.
 *
 * Aislados aquí (sin imports transitivos de `./stripe`) para que se puedan
 * usar desde scripts y tests sin disparar la inicialización del cliente
 * Stripe (que loguea warning si STRIPE_SECRET_KEY aún no está cargada por
 * dotenv).
 *
 * Nota crítica: el pin de apiVersion vive en `src/lib/stripe.ts`. Estos
 * helpers asumen el shape de la API 2026-04-22.dahlia con fallback a APIs
 * anteriores. Si bumpeas el pin, REVISA los tres helpers y los tests
 * en `tests/webhook-handlers.test.ts`.
 */

import type Stripe from 'stripe';
import { findCatalogItemByPriceId } from '@/config/stripe-price-helpers';

/** Shape único de items persistidos en `subscriptions.items` y `orders.line_items`. */
export type CartLine = {
  catalog_id: string;
  quantity: number;
  amount_subtotal: number;
};

/**
 * Extrae el subscription_id de un objeto Invoice tolerando dos shapes:
 *   - API 2026-04-22.dahlia (current): invoice.parent.subscription_details.subscription
 *   - APIs anteriores: invoice.subscription (root)
 *
 * Devuelve null si el invoice no está asociado a ninguna subscription
 * (p.ej. invoice ad-hoc one-shot creada vía API). En ese caso el handler
 * debe loguear skipped y salir.
 */
export function extractInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const parent = (invoice as unknown as {
    parent?: {
      type?: string;
      subscription_details?: { subscription?: string | { id: string } | null } | null;
    } | null;
  }).parent;
  const fromParent = parent?.subscription_details?.subscription ?? null;
  if (fromParent) return typeof fromParent === 'string' ? fromParent : fromParent.id;

  const root = (invoice as unknown as { subscription?: string | { id: string } | null }).subscription;
  if (root) return typeof root === 'string' ? root : root.id;

  return null;
}

/**
 * Extrae current_period_start/end de un Subscription tolerando dos shapes:
 *   - API 2026-04-22.dahlia (current): subscription.items.data[0].current_period_*
 *   - APIs anteriores: subscription.current_period_* (root)
 *
 * Toma del primer item porque en nuestro modelo todos los items de una
 * subscription comparten cadencia.
 */
export function extractSubscriptionPeriods(sub: Stripe.Subscription): {
  start: number | null;
  end: number | null;
} {
  const item0 = sub.items?.data?.[0] as unknown as
    | { current_period_start?: number | null; current_period_end?: number | null }
    | undefined;
  if (item0 && (item0.current_period_start || item0.current_period_end)) {
    return {
      start: item0.current_period_start ?? null,
      end: item0.current_period_end ?? null,
    };
  }
  const root = sub as unknown as {
    current_period_start?: number | null;
    current_period_end?: number | null;
  };
  return {
    start: root.current_period_start ?? null,
    end: root.current_period_end ?? null,
  };
}

/**
 * Construye una línea de carrito persistible a partir de un priceId Stripe.
 *
 * Se usa desde:
 *   - handleCheckoutSessionCompleted (vía listLineItems, donde Stripe ya da
 *     amount_subtotal pre-calculado).
 *   - handleCustomerSubscriptionUpdated (donde Stripe da unit_amount y
 *     calculamos amount_subtotal = unit_amount * quantity).
 *
 * Devuelve null si el priceId no está en el catálogo (p.ej. price viejo
 * desactivado, item ajeno a nuestro flujo).
 */
export function buildCartItem(args: {
  priceId: string;
  quantity: number;
  amountSubtotal: number;
}): CartLine | null {
  const catalogItem = findCatalogItemByPriceId(args.priceId);
  if (!catalogItem) return null;
  return {
    catalog_id: catalogItem.id,
    quantity: args.quantity,
    amount_subtotal: args.amountSubtotal,
  };
}

/**
 * Determina la cadence de una Subscription leyendo el primer item:
 *   items.data[0].price.recurring.interval === 'month' → 'monthly'
 *   items.data[0].price.recurring.interval === 'year'  → 'yearly'
 *   resto (sin items, recurring null, intervalo 'day'/'week') → 'unknown'
 *
 * Asume invariante del proyecto: todos los items de una subscription
 * comparten interval (en /api/checkout construimos el carrito con un
 * único `cadence` aplicado a todos los recurring). El handler debe
 * tratar 'unknown' como bug del flujo y loguear warning.
 */
export function extractSubscriptionCadence(
  sub: Stripe.Subscription,
): 'monthly' | 'yearly' | 'unknown' {
  const interval = sub.items?.data?.[0]?.price?.recurring?.interval;
  if (interval === 'month') return 'monthly';
  if (interval === 'year') return 'yearly';
  return 'unknown';
}

/**
 * Conveniencia: dado un Stripe.SubscriptionItem (de sub.items.data),
 * devuelve la CartLine usando price.unit_amount * quantity para
 * reconstruir amount_subtotal. Devuelve null si el priceId no se conoce.
 */
export function buildCartItemFromSubscriptionItem(
  item: Stripe.SubscriptionItem,
): CartLine | null {
  const priceId = item.price?.id;
  if (!priceId) return null;
  const quantity = item.quantity ?? 1;
  const unit = item.price?.unit_amount ?? 0;
  return buildCartItem({ priceId, quantity, amountSubtotal: unit * quantity });
}
