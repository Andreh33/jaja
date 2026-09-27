import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { arcadeIceServers } from '../src/lib/arcade-ice';
import { peerConfiguration } from '../src/lib/arcade-peer';

describe('Optional arcade relay credentials', () => {
  it('keeps STUN-only fallback when no relay is configured', () => {
    assert.equal(arcadeIceServers('room', 0, {}).length, 1);
    assert.equal(arcadeIceServers('room', 0, { ARCADE_TURN_URLS: 'turn:relay.example:3478' }).length, 1);
  });
  it('issues one-hour, room-scoped credentials without exposing the signing secret', () => {
    const secret = 'test-secret-only';
    const servers = arcadeIceServers('room-1', 100_000, { ARCADE_TURN_URLS: 'turn:relay.example:3478?transport=udp,turns:relay.example:5349?transport=tcp', ARCADE_TURN_SECRET: secret });
    assert.equal(servers[1].username, '3700:room-1');
    assert.equal(servers[1].credential, createHmac('sha1', secret).update('3700:room-1').digest('base64'));
    assert.equal(JSON.stringify(servers).includes(secret), false);
    assert.deepEqual(peerConfiguration(servers).iceServers, servers);
    assert.equal(peerConfiguration(servers).iceCandidatePoolSize, 2);
  });
  it('rejects unrelated schemes and embedded credential URLs', () => {
    assert.equal(arcadeIceServers('room', 0, { ARCADE_TURN_URLS: 'https://example.com,turn:user:pass@relay.example', ARCADE_TURN_SECRET: 'test' }).length, 1);
  });
});
