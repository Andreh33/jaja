/**
 * Backup lógico de Turso ANTES de cualquier `db:push`.
 *
 * El CLI oficial de Turso no se instala limpio en Windows nativo (requiere WSL),
 * así que generamos un `.dump` equivalente vía @libsql/client: volcamos el
 * esquema (CREATE TABLE/INDEX) y TODAS las filas como INSERT a un .sql
 * restaurable en backups/turso-dump-<timestamp>.sql (carpeta ignorada en git).
 *
 * Uso:  npx tsx scripts/backup-turso.ts
 * Restaurar (si hiciera falta):  cargar el .sql con el shell de libsql/turso.
 */

import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

dotenv.config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) {
  console.error('[backup] FALTA TURSO_DATABASE_URL o TURSO_AUTH_TOKEN en .env.local');
  process.exit(1);
}

function quote(v: unknown): string {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : 'NULL';
  if (typeof v === 'bigint') return v.toString();
  if (typeof v === 'boolean') return v ? '1' : '0';
  if (v instanceof Uint8Array) {
    let hex = '';
    for (const b of v) hex += b.toString(16).padStart(2, '0');
    return `X'${hex}'`;
  }
  return `'${String(v).replace(/'/g, "''")}'`;
}

async function main() {
  const db = createClient({ url: url!, authToken: authToken! });

  const tablesRes = await db.execute(
    `SELECT name, sql FROM sqlite_master
     WHERE type='table' AND name NOT LIKE 'sqlite_%' AND sql IS NOT NULL
     ORDER BY name`,
  );
  const indexesRes = await db.execute(
    `SELECT name, sql FROM sqlite_master
     WHERE type='index' AND name NOT LIKE 'sqlite_%' AND sql IS NOT NULL
     ORDER BY name`,
  );

  const stampRes = await db.execute('SELECT strftime(\'%Y%m%d-%H%M%S\',\'now\') AS s');
  const stamp = String(stampRes.rows[0].s);

  const out: string[] = [];
  out.push('-- Backup lógico Turso (Latech) — pre db:push plataforma-formacion');
  out.push(`-- Generado: ${stamp} UTC`);
  out.push('PRAGMA foreign_keys=OFF;');
  out.push('BEGIN TRANSACTION;');

  const summary: { table: string; rows: number }[] = [];

  for (const t of tablesRes.rows) {
    const tname = String(t.name);
    out.push('', `-- ===== Tabla: ${tname} =====`);
    out.push(`${String(t.sql)};`);

    const rowsRes = await db.execute(`SELECT * FROM "${tname}"`);
    const cols = rowsRes.columns;
    for (const row of rowsRes.rows) {
      const vals = cols.map((c) => quote((row as Record<string, unknown>)[c]));
      out.push(
        `INSERT INTO "${tname}" (${cols.map((c) => `"${c}"`).join(', ')}) VALUES (${vals.join(', ')});`,
      );
    }
    summary.push({ table: tname, rows: rowsRes.rows.length });
  }

  out.push('', '-- ===== Índices =====');
  for (const i of indexesRes.rows) {
    out.push(`${String(i.sql)};`);
  }

  out.push('', 'COMMIT;', 'PRAGMA foreign_keys=ON;', '');

  mkdirSync('backups', { recursive: true });
  const file = join('backups', `turso-dump-${stamp}.sql`);
  writeFileSync(file, out.join('\n'), 'utf8');

  console.log(`[backup] ✓ ${file}`);
  console.log('[backup] Tablas y filas respaldadas:');
  for (const s of summary) console.log(`  - ${s.table}: ${s.rows} filas`);
  const total = summary.reduce((a, s) => a + s.rows, 0);
  console.log(`[backup] Total: ${summary.length} tablas, ${total} filas.`);
}

main().catch((err) => {
  console.error('[backup] ERROR', err);
  process.exit(1);
});
