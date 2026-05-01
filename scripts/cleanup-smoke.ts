/**
 * Limpia restos de smoke tests (Turso + Stripe test mode).
 *
 * Filtra por patrón de email: claude-smoke-*@example.com
 *   - Borra users de Turso con ese email.
 *   - Borra Customers de Stripe con ese email (test mode).
 *
 * Uso: npx tsx scripts/cleanup-smoke.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@libsql/client';
import Stripe from 'stripe';

const SMOKE_EMAIL_PATTERN = 'claude-smoke-%@example.com';

async function main() {
  // 1. Turso
  const c = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  const dbRes = await c.execute({
    sql: `DELETE FROM users WHERE email LIKE ? RETURNING email`,
    args: [SMOKE_EMAIL_PATTERN],
  });
  console.log(`[turso] deleted ${dbRes.rows.length} users:`, dbRes.rows.map((r) => r.email));

  // 2. Stripe
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error('[stripe] STRIPE_SECRET_KEY missing — skipping Stripe cleanup.');
    return;
  }
  if (!key.startsWith('sk_test')) {
    console.error('[stripe] REFUSING to clean — secret key is NOT test mode. Aborting.');
    process.exit(1);
  }

  const stripe = new Stripe(key, { apiVersion: '2026-04-22.dahlia', typescript: true });

  // Stripe customers.list no acepta wildcards; iteramos páginas y filtramos.
  // Para una BBDD con pocos clientes test esto es suficiente.
  let deleted = 0;
  let scanned = 0;
  for await (const customer of stripe.customers.list({ limit: 100 })) {
    scanned++;
    const email = customer.email || '';
    if (email.startsWith('claude-smoke-') && email.endsWith('@example.com')) {
      await stripe.customers.del(customer.id);
      console.log(`[stripe] deleted ${customer.id} ${email}`);
      deleted++;
    }
  }
  console.log(`[stripe] scanned=${scanned} deleted=${deleted}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
