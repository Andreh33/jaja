import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { generateSQLiteDrizzleJson, generateSQLiteMigration } from 'drizzle-kit/api';
import { tvArcadeSessions } from '../drizzle/schema';
import { arcadeMove, arcadeView, newArcadeGame, type NavalGame, type SpaceGame } from '../src/lib/arcade-engine';
import { newPlatformWorld, stepPlatform } from '../src/lib/platform-engine';
import { activeInput, decodeInput } from '../src/lib/arcade-peer';
import { createArcadeService } from '../src/lib/arcade-service';
import { cleanupArcade } from '../src/lib/arcade-retention';
import { ARCADE_SESSION_MS, arcadeRequestSchema } from '../src/lib/arcade-protocol';
import { RemoteError } from '../src/lib/tv-remote-service';
describe('Arcade rules', () => {
  it('creates complete private fleets with no repeated squares', () => { for (let n = 0; n < 50; n++) { const game = newArcadeGame('naval') as NavalGame; for (const fleet of game.fleets) { assert.equal(fleet.length, 14); assert.equal(new Set(fleet).size, 14); assert.ok(fleet.every(cell => cell >= 0 && cell < 64)); } const host = arcadeView(game, null); const p0 = arcadeView(game, 0); assert.equal('fleets' in host, false); assert.ok(host.kind === 'naval' && !host.boards.flat().includes(3)); assert.ok(p0.kind === 'naval' && p0.boards[0].filter(value => value === 3).length === 14 && !p0.boards[1].includes(3)); } });
  it('rejects out-of-turn/repeated shots and does not mutate the input', () => { const game = newArcadeGame('naval') as NavalGame; assert.throws(() => arcadeMove(game, 1, 0)); const next = arcadeMove(game, 0, 0); assert.equal(game.moves, 0); assert.equal(next.moves, 1); assert.throws(() => arcadeMove(arcadeMove(next, 1, 1), 0, 0)); });
  it('ends naval combat after the last hit', () => { const game = newArcadeGame('naval') as NavalGame; game.shots[0] = game.fleets[1].slice(0, -1); const result = arcadeMove(game, 0, game.fleets[1].at(-1)!); assert.equal(result.winner, 0); assert.throws(() => arcadeMove(result, 1, 2)); });
  it('detects four-in-a-row without wrapping across rows', () => { let game = newArcadeGame('orbit'); for (const column of [0, 1, 0, 1, 0, 1, 0]) game = arcadeMove(game, game.turn, column); assert.equal(game.winner, 0); assert.ok(game.kind === 'orbit' && game.winning.length === 4); });
  it('has ten playable Space Wars waves and a team victory', () => { let game = newArcadeGame('space') as SpaceGame; for (let level = 1; level <= 10; level++) { assert.equal(game.level, level); game.enemies = [{ cell: 0, hp: 1 }]; game = arcadeMove(game, game.turn, 0) as SpaceGame; } assert.equal(game.winner, 'team'); assert.equal(game.level, 10); });
  it('moves enemies only after both pilots and damages hull on breach', () => { const game = newArcadeGame('space') as SpaceGame; game.enemies = [{ cell: 32, hp: 2 }]; const p0 = arcadeMove(game, 0, -1) as SpaceGame; assert.equal(p0.enemies[0].cell, 32); const p1 = arcadeMove(p0, 1, -1) as SpaceGame; assert.equal(p1.hull, 9); assert.equal(p1.enemies[0].cell, 0); });
  it('bounds tactical moves', () => { assert.throws(() => arcadeMove(newArcadeGame('naval'), 0, 64)); assert.throws(() => arcadeMove(newArcadeGame('space'), 0, -2)); assert.throws(() => arcadeMove(newArcadeGame('orbit'), 0, 7)); });
});
describe('Platformer and direct inputs', () => {
  it('lands on the floor, moves and jumps using deterministic fixed steps', () => { const world = newPlatformWorld(); for (let i = 0; i < 120; i++) stepPlatform(world, 0, 1 / 120); assert.equal(world.player.grounded, true); assert.equal(world.player.y, 430); for (let i = 0; i < 30; i++) stepPlatform(world, 2, 1 / 120); assert.ok(world.player.x > 130); const y = world.player.y; stepPlatform(world, 4, 1 / 120); assert.ok(world.player.y < y); assert.ok(world.player.vy < 0); });
  it('rewards coins only once', () => { const world = newPlatformWorld(); world.coins = [{ x: 120, y: 424, taken: false }]; stepPlatform(world, 0, 1 / 120); assert.equal(world.score, 50); stepPlatform(world, 0, 1 / 120); assert.equal(world.score, 50); });
  it('respawns after a fall and finishes at the portal', () => { const world = newPlatformWorld(); world.player.y = 700; stepPlatform(world, 0, 1 / 120); assert.equal(world.lives, 2); assert.ok(world.player.y < 500); world.player.x = world.width - 100; world.player.y = 380; stepPlatform(world, 0, 1 / 120); assert.equal(world.state, 'complete'); });
  it('builds four distinct worlds', () => { const worlds = [1, 2, 3, 4].map(level => newPlatformWorld(level)); assert.equal(new Set(worlds.map(world => world.title)).size, 4); assert.ok(worlds.every(world => world.platforms.length > 15 && world.coins.length > 35)); assert.ok(worlds[3].enemies.length > worlds[0].enemies.length); });
  it('makes every consecutive ground platform reachable in all four worlds', () => {
    for (const level of [1, 2, 3, 4]) {
      const floors = newPlatformWorld(level).platforms.filter(platform => !platform.brick);
      for (let index = 0; index < floors.length - 1; index++) {
        const from = floors[index]; const to = floors[index + 1]; let reachable = false;
        for (const speed of [290, 420]) for (const margin of [5, 20, 40, 60, 80, 100, 130]) {
          if (reachable) continue;
          const world = newPlatformWorld(level); world.enemies = []; world.coins = [];
          Object.assign(world.player, { x: from.x + from.w - 38 - margin, y: from.y - 52, vx: speed, grounded: true });
          for (let frame = 0; frame < 150; frame++) {
            stepPlatform(world, 2 | 4 | (speed === 420 ? 8 : 0), 1 / 120);
            if (world.player.grounded && world.player.y === to.y - 52 && world.player.x + 38 > to.x && world.player.x < to.x + to.w) { reachable = true; break; }
          }
        }
        assert.ok(reachable, `World ${level}, ground gap ${index + 1}`);
      }
    }
  });
  it('drops stale/replayed/oversized remote inputs and releases after 320ms', () => { assert.deepEqual(decodeInput('{"m":6,"s":4}', 3), { mask: 6, sequence: 4 }); for (const value of ['{"m":16,"s":4}', '{"m":6,"s":3}', '{}', 'x'.repeat(101)]) assert.equal(decodeInput(value, 3), null); assert.equal(activeInput({ mask: 6, at: 0, sequence: 1 }, 319), 6); assert.equal(activeInput({ mask: 6, at: 0, sequence: 1 }, 320), 0); });
});
const client = createClient({ url: ':memory:' }); const database = drizzle(client); let now = 1800000000000; let ip = 0;
const info = { browser: 'Chrome 145', os: 'Android', device: 'Móvil', city: null, country: null }; const context = () => ({ info, ipHash: `arcade-test-${ip++}` });
const execute = createArcadeService(database, () => now); const rejected = (task: Promise<unknown>, status: number) => assert.rejects(task, error => error instanceof RemoteError && error.status === status);
before(async () => { const empty = await generateSQLiteDrizzleJson({}); const schema = await generateSQLiteDrizzleJson({ tvArcadeSessions }); for (const statement of await generateSQLiteMigration(empty, schema)) await client.execute(statement); });
after(() => client.close());
async function pair() { const host = await execute({ action: 'create' }, context()); assert.ok(host.token && host.invites); const tokens = ['a'.repeat(64), 'b'.repeat(64)]; for (const slot of [0, 1] as const) await execute({ action: 'join', id: host.id, slot, invite: host.invites[slot], controller: tokens[slot] }, context()); return { host, tokens }; }
describe('Two-controller arcade protocol', () => {
  it('pairs two distinct seats automatically and keeps invitations one-use', async () => { const { host, tokens } = await pair(); const result = await execute({ action: 'poll', id: host.id, role: 'host' }, { ...context(), token: host.token }); assert.ok(result.players.every(player => player.connected)); await rejected(execute({ action: 'join', id: host.id, slot: 0, invite: host.invites![0], controller: 'c'.repeat(64) }, context()), 409); const retry = await execute({ action: 'join', id: host.id, slot: 0, invite: host.invites![0], controller: tokens[0] }, context()); assert.equal(retry.players[0].connected, true); });
  it('prevents player impersonation and host-only actions', async () => { const { host, tokens } = await pair(); await rejected(execute({ action: 'poll', id: host.id, role: 'p1' }, { ...context(), token: tokens[0] }), 401); await rejected(execute({ action: 'select', id: host.id, role: 'host', mode: 'naval', version: 0 }, { ...context(), token: tokens[0] }), 401); await rejected(execute({ action: 'close', id: host.id, role: 'p0' }, { ...context(), token: tokens[0] }), 403); });
  it('keeps fleets private and rejects replayed move versions', async () => { const { host, tokens } = await pair(); const selected = await execute({ action: 'select', id: host.id, role: 'host', mode: 'naval', version: 0 }, { ...context(), token: host.token }); assert.ok(selected.game?.kind === 'naval' && !selected.game.boards.flat().includes(3)); const p0 = await execute({ action: 'poll', id: host.id, role: 'p0' }, { ...context(), token: tokens[0] }); assert.ok(p0.game?.kind === 'naval' && p0.game.boards[0].includes(3) && !p0.game.boards[1].includes(3)); const move = { action: 'move', id: host.id, role: 'p0', cell: 0, version: 1 } as const; await execute(move, { ...context(), token: tokens[0] }); await rejected(execute(move, { ...context(), token: tokens[0] }), 409); });
  it('restricts signaling to the owned seat and hides network details from the other player', async () => { const { host, tokens } = await pair(); const signalId = crypto.randomUUID(); const sdp = 'v=0\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\n'; await execute({ action: 'signal', id: host.id, role: 'host', slot: 0, signalId, sdp }, { ...context(), token: host.token }); const p1 = await execute({ action: 'poll', id: host.id, role: 'p1' }, { ...context(), token: tokens[1] }); assert.equal(p1.signals[0].offer, undefined); await rejected(execute({ action: 'signal', id: host.id, role: 'p1', slot: 0, signalId, sdp }, { ...context(), token: tokens[1] }), 403); await rejected(execute({ action: 'signal', id: host.id, role: 'p0', slot: 0, signalId, sdp: 'v=0\r\nm=video 9\r\nm=application 9' }, { ...context(), token: tokens[0] }), 400); });
  it('clears SDP and secrets on close and on retention cleanup', async () => { const { host } = await pair(); await execute({ action: 'close', id: host.id, role: 'host' }, { ...context(), token: host.token }); const [row] = await database.select().from(tvArcadeSessions).where(eq(tvArcadeSessions.id, host.id)); assert.equal(row.hostTokenHash, null); assert.ok(row.seats.every(seat => !seat.tokenHash && !seat.inviteHash && !seat.offer && !seat.answer)); const next = await pair(); now += ARCADE_SESSION_MS + 1; await cleanupArcade(database, now); const [expired] = await database.select().from(tvArcadeSessions).where(eq(tvArcadeSessions.id, next.host.id)); assert.ok(expired.seats.every(seat => !seat.tokenHash)); await rejected(execute({ action: 'poll', id: next.host.id, role: 'host' }, { ...context(), token: next.host.token }), 410); });
  it('validates all action payloads strictly', () => { assert.equal(arcadeRequestSchema.safeParse({ action: 'create', url: 'https://example.com' }).success, false); assert.equal(arcadeRequestSchema.safeParse({ action: 'join', id: crypto.randomUUID(), slot: 2, invite: 'a'.repeat(64), controller: 'b'.repeat(64) }).success, false); });
});
