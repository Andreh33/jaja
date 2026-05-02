import Stripe from 'stripe';

/**
 * Cliente Stripe singleton (server-only).
 * NUNCA importar desde código client. La clave está en STRIPE_SECRET_KEY.
 */

const key = process.env.STRIPE_SECRET_KEY;

if (!key) {
  // No lanzamos en import-time para no romper builds donde la var aún no está;
  // pero cualquier llamada a `stripe.*` fallará explícitamente.
  console.warn('[stripe] STRIPE_SECRET_KEY no definida. Las llamadas a Stripe fallarán.');
}

export const stripe = new Stripe(key || 'sk_invalid_at_runtime', {
  // Pinned API version. Si Stripe cambia, lo bumpeamos manualmente.
  //
  // API 2026-04-22.dahlia movió campos clave fuera del root de varios objetos:
  //   - invoice.subscription          → invoice.parent.subscription_details.subscription
  //   - subscription.current_period_* → subscription.items.data[].current_period_*
  //
  // Nuestros webhook handlers (src/lib/webhook-handlers.ts) usan los helpers
  // extractInvoiceSubscriptionId y extractSubscriptionPeriods con fallback al
  // root para tolerar redeliveries de eventos viejos. Antes de cambiar este
  // pin, REVISA esos helpers y los tests en tests/webhook-handlers.test.ts —
  // y consulta docs/MIGRATION_NOTES.md para más contexto.
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
  appInfo: {
    name: 'Latech Calculator',
    version: '1.0.0',
  },
});
