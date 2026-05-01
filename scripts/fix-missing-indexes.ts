/**
 * Recreación manual de UNIQUE indexes críticos en libsql/turso.
 *
 * ¿CUÁNDO SE USA?
 * Solo si `scripts/verify-uniques.ts` reporta MISSING tras un `db:push`. Eso
 * indicaría que drizzle-kit ha vuelto a ejecutar un DROP de unique indexes
 * sin recrearlos correctamente (bug recurrente con dialect:'turso' que
 * documentamos en docs/MIGRATION_NOTES.md).
 *
 * ¿POR QUÉ EXISTE?
 * En el primer push de la migración Stripe (subscriptions/orders), drizzle-kit
 * 0.31.10 ejecutó CREATE UNIQUE INDEX seguido de DROP INDEX para los mismos
 * dos índices, dejando las tablas sin unicidad enforced. Este script reaplica
 * los índices con `IF NOT EXISTS` (idempotente).
 *
 * ¿ES SEGURO?
 * Sí: usa IF NOT EXISTS, así que si los índices ya están es no-op. No toca
 * datos. La unicidad solo se enforce sobre filas existentes y futuras.
 *
 * USO:
 *   npx tsx scripts/fix-missing-indexes.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@libsql/client';

const STATEMENTS: { name: string; sql: string }[] = [
  {
    name: 'subscriptions_stripe_subscription_id_unique',
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_unique ON subscriptions (stripe_subscription_id)`,
  },
  {
    name: 'orders_stripe_session_id_unique',
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_session_id_unique ON orders (stripe_session_id)`,
  },
  {
    name: 'users_email_unique',
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email)`,
  },
  {
    name: 'posts_slug_unique',
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_unique ON posts (slug)`,
  },
  {
    name: 'password_resets_token_unique',
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS password_resets_token_unique ON password_resets (token)`,
  },
];

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    console.error('Faltan TURSO_DATABASE_URL / TURSO_AUTH_TOKEN');
    process.exit(1);
  }
  const client = createClient({ url, authToken });

  for (const s of STATEMENTS) {
    console.log(`Applying: ${s.name}`);
    await client.execute(s.sql);
    console.log(`  ✓ ok`);
  }
  console.log('\nDone. Verifica con: npx tsx scripts/verify-uniques.ts');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
