import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ArcadeHttpError, selectArcadeMode, type ArcadeRequest, type ArcadeState } from '../src/lib/arcade-protocol';

const credentials = { id: 'test-room', token: 'test-only-token' };
const state = (version: number) => ({ version }) as ArcadeState;

describe('Host game selection after a recent turn', () => {
  it('refreshes a stale version and retries the explicit selection once, never a move', async () => {
    const requests: ArcadeRequest[] = [];
    const result = await selectArcadeMode(credentials, 'lobby', 12, async (request, token) => {
      assert.equal(token, credentials.token);
      requests.push(request);
      if (requests.length === 1) throw new ArcadeHttpError(409, 'stale');
      return state(request.action === 'poll' ? 13 : 14);
    });
    assert.equal(result.version, 14);
    assert.deepEqual(requests, [
      { action: 'select', id: credentials.id, role: 'host', mode: 'lobby', version: 12 },
      { action: 'poll', id: credentials.id, role: 'host' },
      { action: 'select', id: credentials.id, role: 'host', mode: 'lobby', version: 13 },
    ]);
  });
  it('does not retry authorization failures or loop when another turn wins the retry', async () => {
    let calls = 0;
    await assert.rejects(selectArcadeMode(credentials, 'fight', 1, async () => { calls++; throw new ArcadeHttpError(401, 'expired'); }), { status: 401 });
    assert.equal(calls, 1);
    calls = 0;
    await assert.rejects(selectArcadeMode(credentials, 'fight', 1, async request => {
      calls++;
      if (request.action === 'poll') return state(2);
      throw new ArcadeHttpError(409, 'stale');
    }), { status: 409 });
    assert.equal(calls, 3);
  });
});
