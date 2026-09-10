import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createClient } from '@libsql/client';
import { createEscapeRankingStore } from '../src/lib/escape-ranking-store';
import { createEscapeRun, submitEscapeResult, ESCAPE_RULES_VERSION, ESCAPE_RUN_TTL_MS, EscapeRankingError, type EscapeRankingStore } from '../src/lib/escape-ranking';

const category = { mode: 'infinito', difficulty: 'facil' } as const;
const startedAt = 1_800_000_000_000;
async function fixture(t: TestContext) {
  const client = createClient({ url: ':memory:' });
  t.after(() => client.close());
  await client.execute('PRAGMA foreign_keys = ON');
  await client.executeMultiple(readFileSync(new URL('../scripts/sql/escape-ranking-v2.sql', import.meta.url), 'utf8'));
  const store = createEscapeRankingStore(client);
  const run = await createEscapeRun(category, store, startedAt);
  const result = { runId: run.runId, runToken: run.runToken, name: 'Álex', score: 110, durationMs: 10_000 };
  return { client, store, run, result };
}
function rejectsCode(code: string) { return (error: unknown) => error instanceof EscapeRankingError && error.code === code; }

test('session stores only a hash and keeps its category and rules', async (t) => {
  const { store, run } = await fixture(t);
  const stored = await store.getRun(run.runId);
  assert.equal(stored?.mode, category.mode);
  assert.equal(stored?.rulesVersion, ESCAPE_RULES_VERSION);
  assert.equal(stored?.tokenHash.length, 64);
  assert.notEqual(stored?.tokenHash, run.runToken);
  assert.equal(run.expiresAt, startedAt + ESCAPE_RUN_TTL_MS);
});

test('rejects missing categories, malformed aliases and forged session tokens', async (t) => {
  const { store, result } = await fixture(t);
  await assert.rejects(createEscapeRun({}, store, startedAt), rejectsCode('INVALID_CATEGORY'));
  await assert.rejects(submitEscapeResult({ ...result, name: '<script>' }, store, startedAt + 10_000), rejectsCode('INVALID_RESULT'));
  await assert.rejects(submitEscapeResult({ ...result, runToken: '0'.repeat(64) }, store, startedAt + 10_000), rejectsCode('INVALID_SESSION'));
  assert.equal((await store.top(category, ESCAPE_RULES_VERSION)).length, 0);
});

test('rejects expired runs, excessive scores and durations beyond elapsed server time', async (t) => {
  const { store, result } = await fixture(t);
  await assert.rejects(submitEscapeResult(result, store, startedAt + ESCAPE_RUN_TTL_MS), rejectsCode('SESSION_EXPIRED'));
  await assert.rejects(submitEscapeResult({ ...result, score: 111 }, store, startedAt + 10_000), rejectsCode('IMPLAUSIBLE_RESULT'));
  await assert.rejects(submitEscapeResult(result, store, startedAt + 7_999), rejectsCode('IMPLAUSIBLE_RESULT'));
  await assert.rejects(submitEscapeResult({ ...result, durationMs: 1_800_001 }, store, startedAt + 1_800_001), rejectsCode('INVALID_RESULT'));
});

test('one immutable result per run supports identical retry even after expiry', async (t) => {
  const { client, store, result } = await fixture(t);
  const first = await submitEscapeResult(result, store, startedAt + 10_000);
  const retry = await submitEscapeResult(result, store, startedAt + ESCAPE_RUN_TTL_MS + 1000);
  assert.equal(first.duplicate, false);
  assert.equal(retry.duplicate, true);
  assert.deepEqual(retry.entry, first.entry);
  await assert.rejects(submitEscapeResult({ ...result, name: 'Otro' }, store, startedAt + 11_000), rejectsCode('RESULT_CONFLICT'));
  assert.equal((await client.execute('SELECT COUNT(*) AS n FROM escape_results')).rows[0].n, 1);
});

test('concurrent identical submissions accept exactly one row', async (t) => {
  const { client, store, result } = await fixture(t);
  const submissions = await Promise.all(Array.from({ length: 5 }, () => submitEscapeResult(result, store, startedAt + 10_000)));
  assert.equal(submissions.filter((item) => !item.duplicate).length, 1);
  assert.equal((await client.execute('SELECT COUNT(*) AS n FROM escape_results')).rows[0].n, 1);
});

test('retry recovers a committed result whose leaderboard response failed', async (t) => {
  const { store, result } = await fixture(t);
  const broken: EscapeRankingStore = { ...store, top: async () => { throw new Error('simulated network loss'); } };
  await assert.rejects(submitEscapeResult(result, broken, startedAt + 10_000), /simulated network loss/);
  const retry = await submitEscapeResult(result, store, startedAt + 10_001);
  assert.equal(retry.duplicate, true);
  assert.equal(retry.top.length, 1);
});

test('leaderboards separate modes, difficulties and rules; legacy scores remain untouched', async (t) => {
  const { client, store, result } = await fixture(t);
  await client.execute('CREATE TABLE escape_scores (name TEXT, score INTEGER)');
  await client.execute("INSERT INTO escape_scores VALUES ('Legacy', 100000)");
  await submitEscapeResult(result, store, startedAt + 10_000);
  for (const otherCategory of [{ mode: 'campana', difficulty: 'facil' }, { mode: 'infinito', difficulty: 'normal' }] as const) {
    const run = await createEscapeRun(otherCategory, store, startedAt);
    await submitEscapeResult({ ...result, runId: run.runId, runToken: run.runToken, name: 'Otra' }, store, startedAt + 10_000);
    assert.equal((await store.top(otherCategory, ESCAPE_RULES_VERSION)).length, 1);
  }
  assert.deepEqual((await store.top(category, ESCAPE_RULES_VERSION)).map((entry) => entry.name), ['Álex']);
  assert.equal((await store.top(category, 'old-rules')).length, 0);
  assert.equal((await client.execute('SELECT COUNT(*) AS n FROM escape_scores')).rows[0].n, 1);
});
