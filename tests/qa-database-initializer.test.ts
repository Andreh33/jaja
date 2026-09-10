import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createClient, type Transaction } from '@libsql/client';
import { initializeNewQaDatabase, QaInitializationError, type QaTarget } from '../scripts/lib/qa-database-initializer';
import { publicQaPosts } from '../scripts/lib/public-qa-posts';

const schemaSql = execFileSync(process.execPath, ['node_modules/drizzle-kit/bin.cjs', 'export', '--dialect', 'sqlite', '--schema', './drizzle/schema.ts'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const target: QaTarget = { databaseName: 'latech-qa-evolution', expectedHost: 'latech-qa-evolution-example.turso.io', databaseUrl: 'libsql://latech-qa-evolution-example.turso.io', authToken: 'test-only-not-a-real-token', applyNewQaDatabase: true };
const seeds = [{ slug: 'public-example', title: 'Artículo público', content: 'Contenido público de prueba.', category: 'Tutoriales' }];
const rejectsCode = (code: string) => (error: unknown) => error instanceof QaInitializationError && error.code === code;
function fixture(t: TestContext) {
  const directory = mkdtempSync(join(tmpdir(), 'latech-qa-init-'));
  const url = `file:${join(directory, 'test.db')}`;
  const probe = createClient({ url });
  t.after(() => { probe.close(); rmSync(directory, { recursive: true, force: true }); });
  return { probe, connect: () => createClient({ url }) };
}

test('wrong configuration never reaches a database connector', async () => {
  let connections = 0;
  const connect = () => { connections++; throw new Error('Must not connect'); };
  for (const bad of [
    { ...target, applyNewQaDatabase: false },
    { ...target, databaseName: 'latech-production' },
    { ...target, databaseUrl: 'libsql://latech-production-example.turso.io' },
    { ...target, expectedHost: 'latech-qa-other-example.turso.io' },
    { ...target, databaseUrl: `${target.databaseUrl}?authToken=embedded` },
    { ...target, databaseUrl: 'https://latech-qa-evolution-example.turso.io' },
  ]) await assert.rejects(initializeNewQaDatabase(bad, schemaSql, seeds, connect), QaInitializationError);
  assert.equal(connections, 0);
});

test('existing tables are rejected even empty; existing orders stay unchanged', async (t) => {
  const { probe, connect } = fixture(t);
  await probe.execute('CREATE TABLE users (id TEXT PRIMARY KEY)');
  await assert.rejects(initializeNewQaDatabase(target, schemaSql, seeds, connect), rejectsCode('DATABASE_NOT_EMPTY'));
  await probe.execute('CREATE TABLE orders (id TEXT PRIMARY KEY, amount INTEGER)');
  await probe.execute("INSERT INTO orders VALUES ('existing-order', 12345)");
  await assert.rejects(initializeNewQaDatabase(target, schemaSql, seeds, connect), rejectsCode('DATABASE_NOT_EMPTY'));
  assert.equal((await probe.execute('SELECT amount FROM orders')).rows[0].amount, 12345);
  assert.deepEqual((await probe.execute("SELECT name FROM sqlite_schema WHERE type='table' ORDER BY name")).rows.map((row) => row.name), ['orders', 'users']);
});

test('real Drizzle export creates the full schema and public posts without accounts or private data', async (t) => {
  const { probe, connect } = fixture(t);
  const result = await initializeNewQaDatabase(target, schemaSql, publicQaPosts, connect);
  assert.ok(result.tables > 15);
  assert.equal(result.publicPosts, publicQaPosts.length);
  assert.ok(result.publicPosts > 0);
  assert.equal((await probe.execute('SELECT COUNT(*) AS n FROM posts')).rows[0].n, publicQaPosts.length);
  assert.equal(result.accountsCreated, 0);
  assert.equal((await probe.execute('SELECT published FROM posts')).rows[0].published, 1);
  for (const table of ['users', 'orders', 'contact_messages', 'escape_runs', 'escape_results']) {
    assert.equal((await probe.execute(`SELECT COUNT(*) AS n FROM ${table}`)).rows[0].n, 0);
  }
  await assert.rejects(initializeNewQaDatabase(target, schemaSql, seeds, connect), rejectsCode('DATABASE_NOT_EMPTY'));
});

test('a failure while seeding rolls back the new schema and every inserted row', async (t) => {
  const { probe, connect } = fixture(t);
  const failingSchema = schemaSql.replace('`content` text NOT NULL', '`content` text NOT NULL CHECK (length(content) = 0)');
  assert.notEqual(failingSchema, schemaSql);
  await assert.rejects(initializeNewQaDatabase(target, failingSchema, seeds, connect), rejectsCode('INITIALIZATION_FAILED'));
  assert.equal((await probe.execute("SELECT COUNT(*) AS n FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%'")).rows[0].n, 0);
});

test('transaction-control SQL and duplicate public slugs are rejected before connecting', async () => {
  let connections = 0;
  const connect = () => { connections++; throw new Error('Must not connect'); };
  await assert.rejects(initializeNewQaDatabase(target, `${schemaSql}\nCOMMIT;`, seeds, connect), rejectsCode('UNSAFE_SCHEMA_SQL'));
  await assert.rejects(initializeNewQaDatabase(target, schemaSql, [...seeds, ...seeds], connect), rejectsCode('INVALID_PUBLIC_SEEDS'));
  await assert.rejects(initializeNewQaDatabase(target, schemaSql, [{ ...seeds[0], password: 'not-editorial-data' }], connect), rejectsCode('INVALID_PUBLIC_SEEDS'));
  assert.equal(connections, 0);
});

test('a lost commit response is reported as uncertain and cannot cause a second initialization', async (t) => {
  const { probe, connect } = fixture(t);
  const uncertainConnect = () => {
    const client = connect();
    return {
      close: () => client.close(),
      transaction: async () => {
        const tx = await client.transaction('write');
        return new Proxy(tx, { get(object, property) {
          if (property === 'commit') return async () => { await object.commit(); throw new Error('Simulated lost acknowledgement'); };
          const value = Reflect.get(object, property, object);
          return typeof value === 'function' ? value.bind(object) : value;
        } }) as Transaction;
      },
    };
  };
  await assert.rejects(initializeNewQaDatabase(target, schemaSql, seeds, uncertainConnect), rejectsCode('COMMIT_STATUS_UNKNOWN'));
  assert.equal((await probe.execute('SELECT COUNT(*) AS n FROM posts')).rows[0].n, 1);
  await assert.rejects(initializeNewQaDatabase(target, schemaSql, seeds, connect), rejectsCode('DATABASE_NOT_EMPTY'));
});
