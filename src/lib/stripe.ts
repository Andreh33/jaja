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
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
  appInfo: {
    name: 'Latech Calculator',
    version: '1.0.0',
  },
});
