import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { generateSQLiteDrizzleJson, generateSQLiteMigration } from 'drizzle-kit/api';
import { tvRemoteSessions } from '../drizzle/schema';
import { createTvRemoteService, RemoteError } from '../src/lib/tv-remote-service';
import { TV_INVITE_MS, TV_SESSION_MS, remoteRequestSchema } from '../src/lib/tv-remote-protocol';
import { tvDeviceInfo } from '../src/lib/tv-device-info';
import { tvProjects, tvChannels } from '../src/lib/tv-channels';
import { measurementPath } from '../src/lib/measurement';
const client = createClient({ url: ':memory:' });
const database = drizzle(client);
let now = 1_800_000_000_000;
const execute = createTvRemoteService(database, () => now);
const info = { browser: 'Safari 18', os: 'iOS / iPadOS', device: 'Móvil', country: null, city: null };
let ip = 0;
const context = () => ({ ipHash: `test-${ip++}`, info });
const secret = (digit: string) => digit.repeat(64);
const create = () => execute({ action: 'create', channel: 'studio', expanded: false }, context());
async function pair() { const host = await create(); assert.ok('token' in host && 'invite' in host); const controller = secret('a'); await execute({ action: 'join', id: host.id, invite: host.invite, controller }, context()); return { host, controller }; }
const rejects = (promise: Promise<unknown>, status: number) => assert.rejects(promise, (error: unknown) => error instanceof RemoteError && error.status === status);
before(async () => {
  const empty = await generateSQLiteDrizzleJson({}); const schema = await generateSQLiteDrizzleJson({ tvRemoteSessions });
  for (const sql of await generateSQLiteMigration(empty, schema)) await client.execute(sql);
});
after(() => client.close());
describe('Temporary TV remote', () => {
  it('stores only hashes and pairs automatically once, with idempotent retries', async () => {
    const { host, controller } = await pair();
    const again = await execute({ action: 'join', id: host.id, invite: host.invite, controller }, context());
    assert.equal(again.paired, true);
    await rejects(execute({ action: 'join', id: host.id, invite: host.invite, controller: secret('b') }, context()), 409);
    const [row] = await database.select().from(tvRemoteSessions).where((await import('drizzle-orm')).eq(tvRemoteSessions.id, host.id));
    assert.notEqual(row.hostTokenHash, host.token); assert.notEqual(row.controllerTokenHash, controller); assert.equal(row.inviteTokenHash, null);
    assert.equal('hostTokenHash' in again, false); assert.equal('controllerInfo' in again, false);
  });
  it('authenticates roles; the invite cannot control or poll', async () => {
    const { host } = await pair();
    await rejects(execute({ action: 'command', id: host.id, command: 'next' }, { ...context(), token: host.token }), 401);
    await rejects(execute({ action: 'poll', id: host.id, role: 'controller' }, { ...context(), token: host.invite }), 401);
  });
  it('never allows two concurrent controllers to claim one QR', async () => {
    const host = await create(); assert.ok('invite' in host);
    const results = await Promise.allSettled([secret('d'), secret('e')].map(controller => execute({ action: 'join', id: host.id, invite: host.invite, controller }, context())));
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    const rejected = results.find(result => result.status === 'rejected');
    assert.ok(rejected && rejected.status === 'rejected');
  });
  it('handles stale host acknowledgements without losing a remote command', async () => {
    const { host, controller } = await pair();
    const command = await execute({ action: 'command', id: host.id, command: 'channel', channel: tvProjects[0].slug }, { ...context(), token: controller });
    assert.equal(command.commandVersion, 1); assert.equal(command.displayedChannel, 'studio');
    const stale = await execute({ action: 'poll', id: host.id, role: 'host', appliedVersion: 0, channel: 'studio', expanded: false }, { ...context(), token: host.token });
    assert.equal(stale.channel, tvProjects[0].slug); assert.equal(stale.appliedVersion, 0);
    const ack = await execute({ action: 'poll', id: host.id, role: 'host', appliedVersion: 1, channel: command.channel, expanded: false }, { ...context(), token: host.token });
    assert.equal(ack.displayedChannel, command.channel); assert.equal(ack.appliedVersion, 1);
    now += 200;
    const scroll = await execute({ action: 'command', id: host.id, command: 'scroll-down' }, { ...context(), token: controller });
    assert.equal(scroll.lastAction, 'scroll-down'); assert.equal(scroll.channel, command.channel);
  });
  it('rejects unlisted channels, arbitrary URLs and additional command properties', () => {
    for (const channel of ['zonasport', 'maison-noir', 'https://evil.example', '__proto__']) assert.equal(remoteRequestSchema.safeParse({ action: 'command', id: crypto.randomUUID(), command: 'channel', channel }).success, false);
    assert.equal(remoteRequestSchema.safeParse({ action: 'command', id: crypto.randomUUID(), command: 'channel' }).success, false);
    assert.equal(remoteRequestSchema.safeParse({ action: 'create', channel: 'studio', expanded: false, url: 'https://evil.example' }).success, false);
  });
  it('keeps scroll inside the expanded screen; only page shortcuts close it', async () => {
    const { host, controller } = await pair();
    await execute({ action: 'poll', id: host.id, role: 'host', appliedVersion: 0, channel: 'studio', expanded: true }, { ...context(), token: host.token });
    for (const command of ['scroll-down', 'scroll-up'] as const) {
      now += 200;
      const result = await execute({ action: 'command', id: host.id, command }, { ...context(), token: controller });
      assert.equal(result.expanded, true);
    }
    now += 200;
    const visit = await execute({ action: 'command', id: host.id, command: 'visit-projects' }, { ...context(), token: controller });
    assert.equal(visit.expanded, false);
  });
  it('expires QR invitations, sessions and offline hosts', async () => {
    const host = await create(); assert.ok('invite' in host);
    now += TV_INVITE_MS;
    await rejects(execute({ action: 'join', id: host.id, invite: host.invite, controller: secret('c') }, context()), 410);
    const paired = await pair(); now += 20_000;
    await rejects(execute({ action: 'command', id: paired.host.id, command: 'next' }, { ...context(), token: paired.controller }), 409);
    now += TV_SESSION_MS;
    await rejects(execute({ action: 'poll', id: paired.host.id, role: 'host' }, { ...context(), token: paired.host.token }), 410);
  });
  it('disconnects and invalidates both devices immediately', async () => {
    const { host, controller } = await pair();
    await execute({ action: 'disconnect', id: host.id, role: 'controller' }, { ...context(), token: controller });
    await rejects(execute({ action: 'poll', id: host.id, role: 'host' }, { ...context(), token: host.token }), 410);
    await rejects(execute({ action: 'join', id: host.id, invite: host.invite, controller }, context()), 410);
  });
  it('enforces a persisted creation limit even after disconnection', async () => {
    const ctx = context();
    for (let n = 0; n < 6; n++) { const host = await execute({ action: 'create', channel: 'studio', expanded: false }, ctx); assert.ok('token' in host); await execute({ action: 'disconnect', id: host.id, role: 'host' }, { ...ctx, token: host.token }); }
    await rejects(execute({ action: 'create', channel: 'studio', expanded: false }, ctx), 429);
  });
  it('records coarse device metadata, not raw IP, UA or invented locations', () => {
    const headers = new Headers({ 'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) Version/18.0 Mobile/15E148 Safari/604.1', 'x-vercel-ip-city': 'Madrid', 'x-vercel-ip-country': 'ES' });
    assert.deepEqual(tvDeviceInfo(headers, false), info);
    assert.equal(tvDeviceInfo(headers, true).city, 'Madrid');
    assert.equal(measurementPath('/mando'), null);
  });
  it('offers every permitted project, teletext and keeps blocked projects out of the TV', () => { assert.equal(tvProjects.length, 11); assert.equal(tvChannels.length, 13); assert.ok(tvChannels.some(channel=>channel.id==='teletext')); assert.equal(tvProjects[0].slug, 'monkey'); assert.ok(!tvProjects.some(project => project.id === 'zonasport')); });
});
