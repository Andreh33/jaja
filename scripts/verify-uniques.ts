/**
 * Red de seguridad: verifica que todos los UNIQUE INDEX críticos existan
 * en la BBDD live antes de cada `db:push` (enganchado vía `predb:push`).
 *
 * Si algún índice falta, exit code 1 con mensaje claro. Esto previene que
 * un push silenciosamente rompa la unicidad de columnas críticas (un bug
 * que ya hemos visto en drizzle-kit 0.31.x con dialect:'turso').
 *
 * Uso manual: npx tsx scripts/verify-uniques.ts
 * Uso automático: dispara antes de cada `npm run db:push`.
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@libsql/client';

const REQUIRED_UNIQUES: { table: string; index: string; column: string }[] = [
  { table: 'users', index: 'users_email_unique', column: 'email' },
  { table: 'posts', index: 'posts_slug_unique', column: 'slug' },
  { table: 'password_resets', index: 'password_resets_token_unique', column: 'token' },
  { table: 'subscriptions', index: 'subscriptions_stripe_subscription_id_unique', column: 'stripe_subscription_id' },
  { table: 'orders', index: 'orders_stripe_session_id_unique', column: 'stripe_session_id' },
];

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    console.error('[verify-uniques] FALTAN TURSO_DATABASE_URL / TURSO_AUTH_TOKEN.');
    process.exit(1);
  }
  const client = createClient({ url, authToken });

  const res = await client.execute(
    `SELECT name, tbl_name, sql FROM sqlite_master WHERE type='index'`,
  );
  const presentByName = new Map<string, { tbl_name: string; sql: string | null }>();
  for (const r of res.rows) {
    presentByName.set(String(r.name), {
      tbl_name: String(r.tbl_name),
      sql: r.sql == null ? null : String(r.sql),
    });
  }

  const missing: typeof REQUIRED_UNIQUES = [];
  const wrongTable: { req: typeof REQUIRED_UNIQUES[number]; foundOn: string }[] = [];

  for (const req of REQUIRED_UNIQUES) {
    const found = presentByName.get(req.index);
    if (!found) {
      missing.push(req);
      continue;
    }
    if (found.tbl_name !== req.table) {
      wrongTable.push({ req, foundOn: found.tbl_name });
    }
  }

  if (missing.length === 0 && wrongTable.length === 0) {
    console.log('[verify-uniques] ✓ Todos los UNIQUE indexes críticos están presentes:');
    for (const r of REQUIRED_UNIQUES) console.log(`  ✓ ${r.index} on ${r.table}(${r.column})`);
    return;
  }

  console.error('[verify-uniques] ✗ FALLA — UNIQUE indexes críticos comprometidos:');
  for (const m of missing) {
    console.error(`  ✗ MISSING: ${m.index} (${m.table}.${m.column})`);
  }
  for (const w of wrongTable) {
    console.error(`  ✗ WRONG TABLE: ${w.req.index} esperado en ${w.req.table}, encontrado en ${w.foundOn}`);
  }
  console.error('\nAborta cualquier db:push hasta restaurar la unicidad.');
  console.error('Para reaplicar manualmente: ver scripts/fix-missing-indexes.ts');
  process.exit(1);
}

main().catch((e) => {
  console.error('[verify-uniques] error inesperado:', e);
  process.exit(1);
});
