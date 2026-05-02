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
import {
  buildCartItem,
  buildCartItemFromSubscriptionItem,
  extractInvoiceSubscriptionId,
  extractSubscriptionCadence,
  extractSubscriptionPeriods,
  type CartLine,
} from './stripe-shape-helpers';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

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
    const cartItem = buildCartItem({
      priceId,
      quantity: item.quantity ?? 1,
      amountSubtotal: item.amount_subtotal ?? 0,
    });
    if (!cartItem) {
      console.warn(`[stripe-webhook] result=warn reason=price_not_in_catalog price_id=${priceId} session_id=${sessionId}`);
      continue;
    }
    lines.push(cartItem);
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
    // Cadence: leer del Subscription real (recurring.interval del primer item).
    // session.metadata no contiene cadence — /api/checkout no la pone.
    const stripeSub = await stripe.subscriptions.retrieve(subId);
    const detectedCadence = extractSubscriptionCadence(stripeSub);
    let cadence: 'monthly' | 'yearly';
    if (detectedCadence === 'unknown') {
      console.warn(
        `[stripe-webhook] event_id=${event.id} type=${event.type} result=warn reason=cadence_unknown subscription_id=${subId} — defaulting to monthly`,
      );
      cadence = 'monthly';
    } else {
      cadence = detectedCadence;
    }

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
          cadence,
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
  const subIdStr = extractInvoiceSubscriptionId(invoice);
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
  const subIdStr = extractInvoiceSubscriptionId(invoice);
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

  // Reconstruir items desde sub.items.data con el mismo shape que escribe
  // handleCheckoutSessionCompleted: {catalog_id, quantity, amount_subtotal}.
  const items = sub.items.data
    .map((item) => buildCartItemFromSubscriptionItem(item))
    .filter((x): x is CartLine => x !== null);

  const periods = extractSubscriptionPeriods(sub);
  const detectedCadence = extractSubscriptionCadence(sub);
  // Defensivo: si no podemos determinar cadence con confianza, NO degradamos
  // el valor existente — omitimos el campo del UPDATE.
  const setObj: Record<string, unknown> = {
    status: sub.status,
    stripeCustomerId: customerId,
    items,
    currentPeriodStart: periods.start,
    currentPeriodEnd: periods.end,
    cancelAtPeriodEnd: !!(sub as unknown as { cancel_at_period_end?: boolean }).cancel_at_period_end,
    updatedAt: sql`(unixepoch())`,
  };
  if (detectedCadence !== 'unknown') {
    setObj.cadence = detectedCadence;
  } else {
    console.warn(
      `[stripe-webhook] event_id=${event.id} type=${event.type} result=warn reason=cadence_unknown subscription_id=${sub.id} — keeping existing local cadence`,
    );
  }
  const updated = await tx
    .update(subscriptions)
    .set(setObj)
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
