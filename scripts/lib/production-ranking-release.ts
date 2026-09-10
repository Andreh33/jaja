import { createHash } from 'node:crypto';
import { chmodSync, closeSync, fsyncSync, openSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createClient, type Client, type Transaction, type Value } from '@libsql/client';

export class RankingReleaseError extends Error {
  constructor(public code: string, message: string) { super(message); }
}
export const RANKING_SQL_SHA256 = 'fe6e0438ac3521486169c91e7bf32cf2a459344b5f7e052e61081eeacba6f723';
export type ProductionTarget = { expectedHost: string; databaseUrl: string; authToken: string };
type Connector = (config: { url: string; authToken: string; intMode: 'bigint' }) => Pick<Client, 'transaction' | 'close'>;
type SchemaObject = { type: string; name: string; table: string; sql: string };
type TableCopy = { name: string; columns: string[]; rows: Value[][]; rowid: boolean };
type Snapshot = { schema: SchemaObject[]; tables: TableCopy[]; userVersion: string; applicationId: string; foreignKeys: string[] };
const quote = (name: string) => `"${name.replaceAll('"', '""')}"`;
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex');
const normalizeSql = (sql: string) => sql.replace(/\bIF\s+NOT\s+EXISTS\s+/gi, '').replace(/\s+/g, ' ').trim().replace(/;$/, '');
const fail = (code: string, message: string): never => { throw new RankingReleaseError(code, message); };
function syncDirectory(directory: string) {
  const fd = openSync(directory, 'r');
  try { fsyncSync(fd); } finally { closeSync(fd); }
}

export function validateProductionTarget(target: ProductionTarget) {
  let url: URL;
  try { url = new URL(target.databaseUrl); } catch { return fail('TARGET_MISMATCH', 'A valid explicit Turso target is required.'); }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)*\.turso\.io$/.test(target.expectedHost)
    || url.protocol !== 'libsql:' || url.hostname !== target.expectedHost || url.username || url.password || url.port
    || (url.pathname !== '' && url.pathname !== '/') || url.search || url.hash) {
    fail('TARGET_MISMATCH', 'The database URL must match the exact expected Turso host, without any embedded credentials or additional URL components.');
  }
  if (typeof target.authToken !== 'string' || target.authToken.length < 20 || target.authToken.length > 8192 || /\s/.test(target.authToken)) {
    fail('INVALID_CREDENTIAL', 'The private credential file must contain a valid database token.');
  }
  return { url: url.href, authToken: target.authToken, intMode: 'bigint' as const };
}

function encoded(value: Value): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return `s:${JSON.stringify(value)}`;
  if (typeof value === 'bigint') return `i:${value}`;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return fail('UNSUPPORTED_VALUE', 'A database number cannot be represented losslessly.');
    return `n:${Object.is(value, -0) ? '-0' : value}`;
  }
  return `b:${Buffer.from(value).toString('hex')}`;
}
function rowHash(row: Value[]) { return sha(JSON.stringify(row.map(encoded))); }
function tableSummary(table: TableCopy) {
  return { name: table.name, rows: table.rows.length, columns: table.columns, rowid: table.rowid,
    sha256: sha(JSON.stringify(table.rows.map(rowHash).sort())) };
}
function assertIntegrity(result: Awaited<ReturnType<Transaction['execute']>>) {
  if (result.rows.length !== 1 || result.rows[0][0] !== 'ok') fail('INTEGRITY_FAILED', 'SQLite integrity verification failed. Details remain private; no migration was committed.');
}

/** All schema and row reads belong to this one caller-owned transaction. */
async function readSnapshot(tx: Transaction): Promise<Snapshot> {
  const [schemaResult, integrity, versions, application, foreignKeys] = await tx.batch([
    "SELECT type, name, tbl_name, sql FROM sqlite_schema WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY type, name",
    'PRAGMA integrity_check', 'PRAGMA user_version', 'PRAGMA application_id', 'PRAGMA foreign_key_check',
  ]);
  assertIntegrity(integrity);
  const schema: SchemaObject[] = schemaResult.rows.map((r) => ({ type: String(r.type), name: String(r.name), table: String(r.tbl_name), sql: String(r.sql) }));
  if (schema.some((object) => !['table', 'index', 'view', 'trigger'].includes(object.type)
    || (object.type === 'table' && !/^CREATE\s+TABLE\b/i.test(object.sql)))) {
    fail('UNSUPPORTED_SCHEMA', 'The snapshot supports ordinary SQLite tables, indexes, views and triggers; virtual tables require a separately reviewed backup.');
  }
  const tableObjects = schema.filter((object) => object.type === 'table');
  const hasSequence = await tx.execute("SELECT 1 FROM sqlite_schema WHERE name = 'sqlite_sequence' AND type = 'table'");
  if (hasSequence.rows.length) tableObjects.push({ type: 'table', name: 'sqlite_sequence', table: 'sqlite_sequence', sql: '' });
  const layouts = await tx.batch(tableObjects.map((object) => `PRAGMA table_xinfo(${quote(object.name)})`));
  const tables: TableCopy[] = tableObjects.map((object, i) => {
    const columns = layouts[i].rows.filter((row) => Number(row.hidden) === 0).map((row) => String(row.name));
    if (!columns.length) fail('UNSUPPORTED_SCHEMA', 'A table has no supported writable columns.');
    const rowid = !/\bWITHOUT\s+ROWID\b/i.test(object.sql) && object.name !== 'sqlite_sequence';
    if (rowid && columns.some((name) => ['rowid', '_rowid_', 'oid'].includes(name.toLowerCase()))) {
      fail('UNSUPPORTED_SCHEMA', 'A table shadows SQLite row identifiers; its backup requires explicit review.');
    }
    return { name: object.name, columns, rows: [], rowid };
  });
  const datasets = await tx.batch(tables.map((table) => `SELECT ${table.rowid ? 'rowid, ' : ''}${table.columns.map(quote).join(', ')} FROM ${quote(table.name)}`));
  for (let i = 0; i < tables.length; i++) tables[i].rows = datasets[i].rows.map((row) => datasets[i].columns.map((_, index) => row[index]));
  return { schema, tables, userVersion: String(versions.rows[0][0]), applicationId: String(application.rows[0][0]),
    foreignKeys: foreignKeys.rows.map((row) => rowHash(foreignKeys.columns.map((_, i) => row[i]))).sort() };
}

function assertSameData(before: Snapshot, after: Snapshot) {
  if (before.userVersion !== after.userVersion || before.applicationId !== after.applicationId
    || JSON.stringify(before.foreignKeys) !== JSON.stringify(after.foreignKeys)) fail('DATA_CHANGED', 'Database metadata or foreign-key state changed unexpectedly.');
  for (const table of before.tables) {
    const other = after.tables.find((candidate) => candidate.name === table.name);
    if (!other || JSON.stringify(tableSummary(table)) !== JSON.stringify(tableSummary(other))) fail('DATA_CHANGED', 'An existing table changed unexpectedly; the migration will not be committed.');
  }
  for (const object of before.schema) {
    const other = after.schema.find((candidate) => candidate.name === object.name && candidate.type === object.type);
    if (!other || JSON.stringify(object) !== JSON.stringify(other)) fail('SCHEMA_CHANGED', 'An existing schema object changed unexpectedly; the migration will not be committed.');
  }
}

async function restoreAndVerify(snapshot: Snapshot, filename: string) {
  // The caller provides a newly created 0700 directory. The empty file is never public.
  const fd = openSync(filename, 'wx', 0o600); closeSync(fd);
  const local = createClient({ url: `file:${filename}`, intMode: 'bigint' });
  let tx: Transaction | undefined;
  try {
    await local.execute('PRAGMA foreign_keys = OFF');
    tx = await local.transaction('write');
    for (const object of snapshot.schema.filter((object) => object.type === 'table')) await tx.execute(object.sql);
    for (const table of snapshot.tables) {
      if (table.name === 'sqlite_sequence') await tx.execute('DELETE FROM sqlite_sequence');
      const columns = [...(table.rowid ? ['rowid'] : []), ...table.columns];
      const sql = `INSERT INTO ${quote(table.name)} (${columns.map(quote).join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;
      for (let offset = 0; offset < table.rows.length; offset += 100) {
        await tx.batch(table.rows.slice(offset, offset + 100).map((row) => ({ sql, args: row })));
      }
    }
    // Create triggers after loading rows, so restoring does not run application side effects.
    for (const object of snapshot.schema.filter((object) => object.type !== 'table')) await tx.execute(object.sql);
    await tx.execute(`PRAGMA user_version = ${snapshot.userVersion}`);
    await tx.execute(`PRAGMA application_id = ${snapshot.applicationId}`);
    await tx.commit();
    tx = await local.transaction('read');
    const restored = await readSnapshot(tx);
    assertSameData(snapshot, restored);
    if (restored.schema.length !== snapshot.schema.length || restored.tables.length !== snapshot.tables.length) fail('RESTORE_MISMATCH', 'The restored snapshot contains a different inventory.');
    await tx.rollback();
  } finally { tx?.close(); local.close(); chmodSync(filename, 0o600); }
  const flush = openSync(filename, 'r');
  try { fsyncSync(flush); } finally { closeSync(flush); }
  syncDirectory(dirname(filename));
  return sha(readFileSync(filename));
}

function privateJson(filename: string, data: unknown) {
  const fd = openSync(filename, 'wx', 0o600);
  try { writeFileSync(fd, `${JSON.stringify(data, null, 2)}\n`); fsyncSync(fd); } finally { closeSync(fd); }
  syncDirectory(dirname(filename));
}

async function referenceSchema(sql: string): Promise<SchemaObject[]> {
  const local = createClient({ url: 'file::memory:', intMode: 'bigint' });
  try {
    await local.executeMultiple(sql);
    const result = await local.execute("SELECT type, name, tbl_name, sql FROM sqlite_schema WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY type, name");
    return result.rows.map((r) => ({ type: String(r.type), name: String(r.name), table: String(r.tbl_name), sql: String(r.sql) }));
  } finally { local.close(); }
}
function assertRankingSchema(snapshot: Snapshot, expected: SchemaObject[], required: boolean) {
  for (const object of expected) {
    const existing = snapshot.schema.find((candidate) => candidate.name === object.name);
    if ((!existing && required) || (existing && (existing.type !== object.type || existing.table !== object.table || normalizeSql(existing.sql) !== normalizeSql(object.sql)))) {
      fail('RANKING_SCHEMA_DRIFT', 'A ranking table/index is missing after DDL or has an incompatible existing definition. No automatic repair or replacement is allowed.');
    }
  }
}

/** Back up first; optionally apply ONLY the pinned, additive ranking migration. */
export async function backupAndApplyRanking(
  target: ProductionTarget, migrationSql: string, backupDirectory: string, apply: boolean, connect: Connector = createClient,
) {
  const credentials = validateProductionTarget(target);
  if (sha(migrationSql) !== RANKING_SQL_SHA256) fail('MIGRATION_CHANGED', 'The ranking SQL differs from the reviewed migration. No connection opened.');
  const expected = await referenceSchema(migrationSql);
  syncDirectory(backupDirectory);
  syncDirectory(dirname(backupDirectory));
  const client = connect(credentials);
  let tx: Transaction | undefined;
  let commitAttempted = false;
  let committed = false;
  let phase = 'snapshot';
  try {
    const snapshotStartedAt = new Date().toISOString();
    tx = await client.transaction('read');
    const snapshot = await readSnapshot(tx);
    if (!['users', 'posts', 'orders', 'contact_messages'].every((name) => snapshot.tables.some((table) => table.name === name))) {
      fail('APPLICATION_TABLES_MISSING', 'The target is missing expected existing Latech application tables.');
    }
    await tx.rollback();
    tx = undefined;
    const snapshotReadCompletedAt = new Date().toISOString();
    phase = 'local-restore';
    const backupSha256 = await restoreAndVerify(snapshot, join(backupDirectory, 'snapshot.db'));
    privateJson(join(backupDirectory, 'snapshot-manifest.json'), {
      version: 1, snapshotStartedAt, snapshotReadCompletedAt, completedAt: new Date().toISOString(), expectedHost: target.expectedHost,
      sqliteSha256: backupSha256, migrationSha256: RANKING_SQL_SHA256, integrity: 'ok',
      restoration: 'verified locally by schema and every row hash', foreignKeyViolationCount: snapshot.foreignKeys.length,
      tables: snapshot.tables.map(tableSummary), schema: snapshot.schema,
    });
    if (!apply) return { applied: false, backupVerified: true, backupSha256, tables: snapshot.tables.length };
    phase = 'migration';
    tx = await client.transaction('write');
    // This second snapshot is under the write lock. Legitimate writes since the
    // backup are preserved and included in the before/after comparison.
    const before = await readSnapshot(tx);
    assertRankingSchema(before, expected, false);
    await tx.executeMultiple(migrationSql);
    const after = await readSnapshot(tx);
    assertRankingSchema(after, expected, true);
    assertSameData(before, after);
    const additions = after.schema.filter((object) => !before.schema.some((old) => old.type === object.type && old.name === object.name));
    if (additions.some((object) => !expected.some((wanted) => wanted.type === object.type && wanted.name === object.name))) {
      fail('UNEXPECTED_ADDITION', 'The migration added an unexpected schema object.');
    }
    for (const table of after.tables.filter((table) => !before.tables.some((old) => old.name === table.name))) {
      if (table.rows.length) fail('UNEXPECTED_DATA', 'A new ranking table is not empty.');
    }
    // Persist precommit verification before asking the remote server to commit.
    privateJson(join(backupDirectory, 'migration-verification.json'), {
      verifiedAt: new Date().toISOString(), expectedHost: target.expectedHost, backupSha256,
      preservedTables: before.tables.map(tableSummary), additions: additions.map((object) => ({ type: object.type, name: object.name })),
      integrity: 'ok', allPreviousRowsUnchanged: true,
    });
    commitAttempted = true;
    await tx.commit();
    committed = true;
    privateJson(join(backupDirectory, 'migration-committed.json'), { committedAt: new Date().toISOString(), backupSha256, migrationSha256: RANKING_SQL_SHA256 });
    return { applied: true, backupVerified: true, backupSha256, tables: snapshot.tables.length, addedObjects: additions.length };
  } catch (error) {
    let rollbackUncertain = false;
    if (tx && !tx.closed) { try { await tx.rollback(); } catch { rollbackUncertain = true; } }
    if (committed) fail('COMMITTED_RECEIPT_FAILED', 'The migration commit was confirmed but its local receipt could not be saved. Do not retry; inspect schema read-only.');
    if (commitAttempted || (phase === 'migration' && rollbackUncertain)) fail('COMMIT_STATUS_UNKNOWN', 'The transaction result is uncertain. Do not retry blindly; inspect the exact target schema read-only.');
    if (error instanceof RankingReleaseError) throw error;
    return fail('RELEASE_FAILED', `Ranking release stopped during ${phase}. No migration commit was confirmed. Raw database errors and credentials are not logged.`);
  } finally { tx?.close(); client.close(); }
}
