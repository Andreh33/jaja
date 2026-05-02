import Stripe from 'stripe';
import { STRIPE_PRICES, type StripeMode } from '@/config/stripe-prices';

/**
 * Cliente Stripe singleton (server-only).
 * NUNCA importar desde código client. La clave está en STRIPE_SECRET_KEY.
 */

const key = process.env.STRIPE_SECRET_KEY;

/**
 * Detecta el modo Stripe por el prefijo de la secret key.
 * Usado por getCurrentPrices() para elegir entre los IDs test y live.
 *
 * Lanza error si la clave falta o tiene un prefijo inesperado — fail-loud
 * preferible a usar IDs erróneos silenciosamente.
 */
export function getStripeMode(secretKey?: string): StripeMode {
  const k = secretKey ?? process.env.STRIPE_SECRET_KEY ?? '';
  if (k.startsWith('sk_live_')) return 'live';
  if (k.startsWith('sk_test_')) return 'test';
  throw new Error(
    `STRIPE_SECRET_KEY missing or invalid (must start with sk_test_ or sk_live_; got "${k.slice(0, 8)}...")`,
  );
}

/**
 * Devuelve el mapa de Products/Prices correspondiente al modo activo.
 * En desarrollo local con sk_test_* → IDs de la cuenta TEST.
 * En producción con sk_live_*       → IDs de la cuenta LIVE.
 */
export function getCurrentPrices() {
  return STRIPE_PRICES[getStripeMode()];
}

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
