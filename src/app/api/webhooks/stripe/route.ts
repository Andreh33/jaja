/**
 * Stripe webhooks endpoint — verifica firma + idempotencia + dispatch.
 *
 * Flujo de cada request:
 *   1. Verifica firma con stripe.webhooks.constructEvent (raw body byte a byte).
 *   2. SELECT en webhook_events por event.id → si existe, return 200 ya procesado.
 *   3. BEGIN tx → ejecutar handler → INSERT en webhook_events → COMMIT.
 *      Si algo falla en tx, ROLLBACK → return 500 → Stripe reintenta.
 *   4. Eventos no manejados: log "ignorado" + return 200 (no reintentos inútiles).
 *
 * IMPORTANTE — STRIPE_WEBHOOK_SECRET:
 *   Se lee de process.env. Misma variable en local (`stripe listen` da
 *   un whsec_ que pegas en .env.local) y en producción (dashboard.stripe.com
 *   → Webhooks → Signing secret). Si falta, fail-loud con 500 explícito.
 *
 * IMPORTANTE — handlers lean (budget de Stripe ~5-30s):
 *   Mantén los handlers sin trabajo pesado (emails, Twilio, etc.). Si hace
 *   falta, delega a un job/queue.
 */

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { webhookEvents } from '../../../../../drizzle/schema';
import {
  handleCheckoutSessionCompleted,
  handleCustomerSubscriptionDeleted,
  handleCustomerSubscriptionUpdated,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
} from '@/lib/webhook-handlers';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  // 1. Webhook secret obligatorio.
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error(
      '[stripe-webhook] STRIPE_WEBHOOK_SECRET missing — webhooks not processable. Run `stripe listen --forward-to <url>/api/webhooks/stripe` and update .env.local.',
    );
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    console.warn('[stripe-webhook] result=rejected reason=missing_signature_header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  // Raw body — necesario para verificar firma byte a byte.
  const rawBody = await req.text();

  // 2. Verificación de firma.
  let event: import('stripe').Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    const msg = (err as Error).message;
    console.warn(`[stripe-webhook] result=rejected reason=signature_verification_failed err="${msg}"`);
    return NextResponse.json({ error: `Webhook signature failed: ${msg}` }, { status: 400 });
  }

  // 3. Idempotencia: ya procesado?
  const seen = await db
    .select({ id: webhookEvents.eventId })
    .from(webhookEvents)
    .where(eq(webhookEvents.eventId, event.id))
    .limit(1);
  if (seen.length > 0) {
    console.log(
      `[stripe-webhook] event_id=${event.id} type=${event.type} result=duplicate`,
    );
    return NextResponse.json({ received: true, duplicate: true });
  }

  // 4. Procesar dentro de transacción + insert en webhook_events al final.
  try {
    await db.transaction(async (tx) => {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(tx, event);
          break;
        case 'invoice.paid':
          await handleInvoicePaid(tx, event);
          break;
        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(tx, event);
          break;
        case 'customer.subscription.updated':
          await handleCustomerSubscriptionUpdated(tx, event);
          break;
        case 'customer.subscription.deleted':
          await handleCustomerSubscriptionDeleted(tx, event);
          break;
        default:
          console.log(
            `[stripe-webhook] event_id=${event.id} type=${event.type} result=ignored`,
          );
          // No procesar — pero igualmente marcamos como visto al final del tx.
      }

      // INSERT al final de la transacción. Si algo falla arriba, ROLLBACK
      // deja webhook_events sin la fila → Stripe puede reintentar.
      await tx.insert(webhookEvents).values({
        eventId: event.id,
        type: event.type,
      });
    });
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(
      `[stripe-webhook] event_id=${event.id} type=${event.type} result=error err="${(err as Error).message}"`,
      err,
    );
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
}
