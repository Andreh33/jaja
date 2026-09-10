/** Explicit local API smoke. Writes QA scores only to the locally running app. */
import assert from 'node:assert/strict';

async function main() {
  const base = new URL(process.argv[2] || 'http://localhost:3010');
  if (!['localhost', '127.0.0.1', '[::1]'].includes(base.hostname) || !['http:', 'https:'].includes(base.protocol) || base.username || base.password) {
    throw new Error('This smoke script only accepts a loopback URL.');
  }
  const request = (path: string, body: unknown, origin = true) => fetch(new URL(path, base), {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(origin ? { Origin: base.origin } : {}) }, body: JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });
  const category = { mode: 'infinito', difficulty: 'facil' };
  assert.equal((await request('/api/escape-runs', category, false)).status, 403);
  assert.equal((await request('/api/escape-runs', { mode: 'unknown' })).status, 400);
  const start = await request('/api/escape-runs', category);
  assert.equal(start.status, 201, 'Local ranking tables must be prepared before this smoke.');
  assert.equal(start.headers.get('cache-control'), 'no-store');
  const credentials = await start.json() as { runId: string; runToken: string; rulesVersion: string };
  assert.equal(credentials.rulesVersion, 'escape-v2');
  const result = { runId: credentials.runId, runToken: credentials.runToken, name: 'QA local', score: 0, durationMs: 0 };
  assert.equal((await request('/api/escape-leaderboard', { ...result, runToken: '0'.repeat(64) })).status, 401);
  const responses = await Promise.all(Array.from({ length: 3 }, () => request('/api/escape-leaderboard', result)));
  for (const response of responses) assert.equal(response.status, 200);
  const payloads = await Promise.all(responses.map((response) => response.json() as Promise<{ duplicate: boolean; entry: Record<string, unknown> }>));
  assert.equal(payloads.filter((payload) => !payload.duplicate).length, 1);
  for (const payload of payloads) assert.deepEqual(Object.keys(payload.entry).sort(), ['durationMs', 'id', 'name', 'score']);
  assert.equal((await request('/api/escape-leaderboard', { ...result, score: 1 })).status, 409);
  const board = await fetch(new URL('/api/escape-leaderboard?mode=infinito&difficulty=facil', base), { signal: AbortSignal.timeout(60_000) });
  assert.equal(board.status, 200);
  assert.equal(board.headers.get('cache-control'), 'no-store');
  const data = await board.json() as { mode: string; difficulty: string; rulesVersion: string; top: { id: string }[] };
  assert.equal(data.mode, category.mode);
  assert.equal(data.difficulty, category.difficulty);
  assert.equal(data.rulesVersion, 'escape-v2');
  assert.ok(Array.isArray(data.top));
  console.log('Local ranking smoke passed: origin, validation, sessions, tokens, concurrent idempotence, conflict and leaderboard. No credentials logged.');
}
main().catch((error) => { console.error(error instanceof Error ? error.message : 'Local API smoke failed'); process.exitCode = 1; });
