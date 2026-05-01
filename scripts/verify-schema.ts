/**
 * Inspector general del schema en Turso.
 * Imprime tablas, columnas, índices nombrados y conteos de filas.
 *
 * USO:
 *   npx tsx scripts/verify-schema.ts
 *
 * Útil tras un `db:push` para revisar el estado real de la BBDD.
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@libsql/client';

const KNOWN_TABLES = [
  'users',
  'empresas',
  'archivos',
  'posts',
  'contact_messages',
  'password_resets',
  'subscriptions',
  'orders',
] as const;

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    console.error('Faltan TURSO_DATABASE_URL / TURSO_AUTH_TOKEN');
    process.exit(1);
  }
  const client = createClient({ url, authToken });

  // 1) Tablas
  const tables = await client.execute(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream%' ORDER BY name`,
  );
  console.log('=== TABLAS ===');
  for (const r of tables.rows) console.log('  ' + r.name);

  // 2) Columnas por tabla conocida
  for (const tbl of KNOWN_TABLES) {
    console.log(`\n=== ${tbl} (PRAGMA table_info) ===`);
    try {
      const cols = await client.execute(`PRAGMA table_info(${tbl})`);
      if (cols.rows.length === 0) {
        console.log('  (tabla no existe)');
        continue;
      }
      for (const r of cols.rows) {
        console.log(
          `  ${String(r.name).padEnd(35)} ${String(r.type).padEnd(10)} default=${r.dflt_value ?? '-'} notnull=${r.notnull}`,
        );
      }
    } catch (e) {
      console.log('  ❌ ' + (e as Error).message);
    }
  }

  // 3) Indices nombrados (no auto)
  console.log('\n=== INDICES (nombrados) ===');
  const idx = await client.execute(
    `SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY tbl_name, name`,
  );
  for (const r of idx.rows) console.log(`  ${String(r.tbl_name).padEnd(20)} ${r.name}`);

  // 4) Conteos
  console.log('\n=== ROW COUNTS ===');
  for (const tbl of KNOWN_TABLES) {
    try {
      const r = await client.execute(`SELECT COUNT(*) c FROM ${tbl}`);
      console.log(`  ${tbl.padEnd(20)} ${r.rows[0].c}`);
    } catch {
      console.log(`  ${tbl.padEnd(20)} (no existe)`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
