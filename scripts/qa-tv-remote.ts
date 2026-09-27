/** Local-only API smoke test. Never connects to production or prints credentials. */
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
const base = process.env.TV_QA_URL || 'http://127.0.0.1:3103';
const origin = new URL(base).origin;
if (!['127.0.0.1', 'localhost'].includes(new URL(base).hostname)) throw new Error('TV QA only permits loopback hosts.');
async function post(body: unknown, token?: string, requestOrigin = origin) {
  return fetch(`${origin}/api/tv-remote`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: requestOrigin, ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
}
async function main() {
  assert.equal((await post({ action: 'create', channel: 'studio', expanded: false }, undefined, 'https://outside.example')).status, 403);
  assert.equal((await post({ text: 'x'.repeat(2200) })).status, 413);
  const response = await post({ action: 'create', channel: 'studio', expanded: false });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control')!, /no-store/);
  const host = await response.json();
  const token = randomBytes(32).toString('hex');
  try {
    const paired = await post({ action: 'join', id: host.id, invite: host.invite, controller: token });
    assert.equal(paired.status, 200); assert.equal((await paired.json()).paired, true);
    assert.equal((await post({ action: 'command', id: host.id, command: 'next' }, host.token)).status, 401);
    assert.equal((await post({ action: 'command', id: host.id, command: 'channel', channel: 'https://outside.example' }, token)).status, 400);
    const command = await post({ action: 'command', id: host.id, command: 'channel', channel: 'monkey' }, token);
    assert.equal(command.status, 200); const next = await command.json();
    const poll = await post({ action: 'poll', id: host.id, role: 'host', channel: 'studio', expanded: false, appliedVersion: 0 }, host.token);
    assert.equal((await poll.json()).channel, 'monkey');
    const ack = await post({ action: 'poll', id: host.id, role: 'host', channel: 'monkey', expanded: false, appliedVersion: next.commandVersion }, host.token);
    assert.equal((await ack.json()).displayedChannel, 'monkey');
    assert.equal((await post({ action: 'disconnect', id: host.id, role: 'controller' }, token)).status, 200);
    assert.equal((await post({ action: 'poll', id: host.id, role: 'host' }, host.token)).status, 410);
    const admin = await fetch(`${origin}/admin/mandos`, { redirect: 'manual' });
    assert.ok([302, 303, 307].includes(admin.status)); assert.match(admin.headers.get('location')!, /admin\/login/);
    console.log('TV API QA: origin, body limit, auto-pair, role separation, allowlist, ack, disconnect and private CRM all passed.');
  } finally { await post({ action: 'disconnect', id: host.id, role: 'host' }, host.token); }
}
main().catch(error => { console.error('TV API QA failed; credentials intentionally omitted.', error instanceof assert.AssertionError ? { actual: error.actual, expected: error.expected } : { type: error?.name }); process.exitCode = 1; });
