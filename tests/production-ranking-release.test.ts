import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createClient, type Transaction } from '@libsql/client';
import { backupAndApplyRanking, RankingReleaseError, validateProductionTarget, type ProductionTarget } from '../scripts/lib/production-ranking-release';

const sql = readFileSync(new URL('../scripts/sql/escape-ranking-v2.sql', import.meta.url), 'utf8');
const target: ProductionTarget = { expectedHost: 'latech-example.turso.io', databaseUrl: 'libsql://latech-example.turso.io', authToken: 'test-only-not-a-real-token' };
const code = (value: string) => (error: unknown) => error instanceof RankingReleaseError && error.code === value;
async function fixture(t: TestContext) {
  const directory = mkdtempSync(join(tmpdir(), 'latech-release-test-'));
  const backup = join(directory, 'backup'); mkdirSync(backup, { mode: 0o700 });
  const url = `file:${join(directory, 'source.db')}`;
  const probe = createClient({ url, intMode: 'bigint' });
  t.after(() => { probe.close(); rmSync(directory, { recursive: true, force: true }); });
  await probe.executeMultiple(`
    PRAGMA journal_mode=WAL;
    CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT);
    CREATE TABLE posts (id TEXT PRIMARY KEY, content TEXT, published INTEGER);
    CREATE TABLE orders (id TEXT PRIMARY KEY, amount INTEGER, bytes BLOB);
    CREATE TABLE contact_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, body TEXT);
    CREATE TABLE escape_scores (id TEXT PRIMARY KEY, score INTEGER);
    CREATE TABLE trigger_log (id INTEGER PRIMARY KEY, body TEXT);
    CREATE VIEW public_posts AS SELECT id FROM posts WHERE published=1;
    CREATE INDEX posts_published ON posts (published);
    INSERT INTO users VALUES ('client', 'private example');
    INSERT INTO posts VALUES ('public', 'Text with quotes '' and Unicode á', 1), ('draft', 'private draft', 0);
    INSERT INTO contact_messages(body) VALUES ('keep this contact');
    INSERT INTO contact_messages(body) VALUES ('deleted historical contact');
    DELETE FROM contact_messages WHERE id=2;
    INSERT INTO escape_scores VALUES ('old-run', 73);
    CREATE TRIGGER posts_log AFTER INSERT ON posts BEGIN INSERT INTO trigger_log(body) VALUES (new.content); END;
    PRAGMA user_version=7;
    PRAGMA application_id=42;
  `);
  await probe.execute({ sql: 'INSERT INTO orders VALUES (?, ?, ?)', args: ['order', BigInt('9007199254740993'), new Uint8Array([0, 255, 17])] });
  return { probe, backup, directory, connect: () => createClient({ url, intMode: 'bigint' as const }) };
}

test('wrong host and modified SQL fail before connecting', async () => {
  const regionalHost = 'latech-example.aws-eu-west-1.turso.io';
  assert.equal(validateProductionTarget({ ...target, expectedHost: regionalHost, databaseUrl: `libsql://${regionalHost}` }).url, `libsql://${regionalHost}`);
  let calls = 0;
  const connect = () => { calls++; throw new Error('Must not connect'); };
  for (const bad of [{ ...target, expectedHost: 'other.turso.io' }, { ...target, databaseUrl: `${target.databaseUrl}?token=anything` }]) {
    await assert.rejects(backupAndApplyRanking(bad, sql, '/unused', true, connect), code('TARGET_MISMATCH'));
  }
  await assert.rejects(backupAndApplyRanking(target, `${sql}\nDELETE FROM posts;`, '/unused', true, connect), code('MIGRATION_CHANGED'));
  assert.equal(calls, 0);
});

test('backup-only restores actual rows, bigint, blobs, rowids, sequence, view and trigger without remote writes', async (t) => {
  const f = await fixture(t);
  const result = await backupAndApplyRanking(target, sql, f.backup, false, f.connect);
  assert.equal(result.applied, false);
  assert.equal((await f.probe.execute("SELECT COUNT(*) FROM sqlite_schema WHERE name='escape_runs'")).rows[0][0], BigInt('0'));
  const restored = createClient({ url: `file:${join(f.backup, 'snapshot.db')}`, intMode: 'bigint' });
  try {
    assert.equal((await restored.execute('PRAGMA integrity_check')).rows[0][0], 'ok');
    const row = (await restored.execute('SELECT amount, bytes FROM orders')).rows[0];
    assert.equal(row.amount, BigInt('9007199254740993'));
    assert.deepEqual(Buffer.from(row.bytes as ArrayBuffer), Buffer.from([0, 255, 17]));
    assert.equal((await restored.execute('SELECT COUNT(*) FROM trigger_log')).rows[0][0], BigInt('0'));
    assert.equal((await restored.execute('SELECT COUNT(*) FROM public_posts')).rows[0][0], BigInt('1'));
    assert.equal((await restored.execute("SELECT seq FROM sqlite_sequence WHERE name='contact_messages'")).rows[0][0], BigInt('2'));
    assert.equal((await restored.execute('PRAGMA user_version')).rows[0][0], BigInt('7'));
  } finally { restored.close(); }
  assert.equal(statSync(join(f.backup, 'snapshot.db')).mode & 0o777, 0o600);
  assert.equal(statSync(join(f.backup, 'snapshot-manifest.json')).mode & 0o777, 0o600);
});

test('additive application preserves all old data and can verify an already matching schema', async (t) => {
  const f = await fixture(t);
  const result = await backupAndApplyRanking(target, sql, f.backup, true, f.connect);
  assert.equal(result.addedObjects, 5);
  assert.equal(result.applied, true);
  assert.equal((await f.probe.execute('SELECT COUNT(*) FROM escape_runs')).rows[0][0], BigInt('0'));
  assert.equal((await f.probe.execute('SELECT score FROM escape_scores')).rows[0][0], BigInt('73'));
  assert.equal((await f.probe.execute('SELECT COUNT(*) FROM posts')).rows[0][0], BigInt('2'));
  assert.equal(JSON.parse(readFileSync(join(f.backup, 'migration-committed.json'), 'utf8')).backupSha256, result.backupSha256);
  const second = join(f.directory, 'second'); mkdirSync(second, { mode: 0o700 });
  const again = await backupAndApplyRanking(target, sql, second, true, f.connect);
  assert.equal(again.addedObjects, 0);
});

test('incompatible existing ranking is backed up then rejected without adding objects', async (t) => {
  const f = await fixture(t);
  await f.probe.execute('CREATE TABLE escape_runs (id TEXT)');
  await f.probe.execute("INSERT INTO escape_runs VALUES ('keep')");
  await assert.rejects(backupAndApplyRanking(target, sql, f.backup, true, f.connect), code('RANKING_SCHEMA_DRIFT'));
  assert.equal((await f.probe.execute('SELECT id FROM escape_runs')).rows[0][0], 'keep');
  assert.equal((await f.probe.execute("SELECT COUNT(*) FROM sqlite_schema WHERE name='escape_results'")).rows[0][0], BigInt('0'));
  assert.ok(statSync(join(f.backup, 'snapshot.db')).size > 0);
});

test('the read snapshot stays consistent while a second connection commits; migration preserves the new row', async (t) => {
  const f = await fixture(t);
  let inserted = false;
  const connect = () => {
    const client = f.connect();
    return { close: () => client.close(), transaction: async (mode: 'read' | 'write' | 'deferred' = 'write') => {
      const tx = await client.transaction(mode);
      return new Proxy(tx, { get(object, property) {
        if (property === 'batch' && mode === 'read') return async (...args: Parameters<Transaction['batch']>) => {
          const result = await object.batch(...args);
          if (!inserted) { inserted = true; await f.probe.execute("INSERT INTO contact_messages(body) VALUES ('arrived concurrently')"); }
          return result;
        };
        const value = Reflect.get(object, property, object);
        return typeof value === 'function' ? value.bind(object) : value;
      } }) as Transaction;
    } };
  };
  await backupAndApplyRanking(target, sql, f.backup, true, connect);
  const restored = createClient({ url: `file:${join(f.backup, 'snapshot.db')}`, intMode: 'bigint' });
  try { assert.equal((await restored.execute('SELECT COUNT(*) FROM contact_messages')).rows[0][0], BigInt('1')); } finally { restored.close(); }
  assert.equal((await f.probe.execute('SELECT COUNT(*) FROM contact_messages')).rows[0][0], BigInt('2'));
});

test('an injected mutation during DDL fails preservation verification and rolls back rows and new tables', async (t) => {
  const f = await fixture(t);
  const connect = () => {
    const client = f.connect();
    return { close: () => client.close(), transaction: async (mode: 'read' | 'write' | 'deferred' = 'write') => {
      const tx = await client.transaction(mode);
      return new Proxy(tx, { get(object, property) {
        if (property === 'executeMultiple' && mode === 'write') return async (text: string) => { await object.executeMultiple(text); await object.execute('DELETE FROM orders'); };
        const value = Reflect.get(object, property, object);
        return typeof value === 'function' ? value.bind(object) : value;
      } }) as Transaction;
    } };
  };
  await assert.rejects(backupAndApplyRanking(target, sql, f.backup, true, connect), code('DATA_CHANGED'));
  assert.equal((await f.probe.execute('SELECT COUNT(*) FROM orders')).rows[0][0], BigInt('1'));
  assert.equal((await f.probe.execute("SELECT COUNT(*) FROM sqlite_schema WHERE name='escape_runs'")).rows[0][0], BigInt('0'));
});

test('lost commit acknowledgement is reported as uncertain, never retried automatically', async (t) => {
  const f = await fixture(t);
  let writes = 0;
  const connect = () => {
    const client = f.connect();
    return { close: () => client.close(), transaction: async (mode: 'read' | 'write' | 'deferred' = 'write') => {
      const tx = await client.transaction(mode);
      if (mode === 'write') writes++;
      return new Proxy(tx, { get(object, property) {
        if (property === 'commit' && mode === 'write') return async () => { await object.commit(); throw new Error('Lost acknowledgement'); };
        const value = Reflect.get(object, property, object);
        return typeof value === 'function' ? value.bind(object) : value;
      } }) as Transaction;
    } };
  };
  await assert.rejects(backupAndApplyRanking(target, sql, f.backup, true, connect), code('COMMIT_STATUS_UNKNOWN'));
  assert.equal(writes, 1);
  assert.equal((await f.probe.execute('SELECT COUNT(*) FROM escape_runs')).rows[0][0], BigInt('0'));
});
