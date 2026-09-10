import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeTraceLevel, generateTraceLevel, jumpReach, levelFromSamples, TRACE_PRESETS, type TracePoint } from '../src/lib/trace-game/level';
import { newTraceRun, requestTraceJump, stepTraceRun } from '../src/lib/trace-game/physics';

const drawings: TracePoint[][] = [
  [{ x: 0, y: .5 }, { x: 1, y: .5 }],
  [{ x: 0, y: 0 }, { x: 1, y: 1 }],
  [{ x: 0, y: 1 }, { x: 1, y: 0 }],
  Array.from({ length: 32 }, (_, i) => ({ x: i / 31, y: i % 2 })),
  Array.from({ length: 100 }, (_, i) => ({ x: (Math.cos(i / 99 * Math.PI * 2) + 1) / 2, y: (Math.sin(i / 99 * Math.PI * 2) + 1) / 2 })),
  [{ x: -20, y: -20 }, { x: 20, y: 20 }],
  [{ x: 1, y: .1 }, { x: 0, y: .9 }],
  [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }],
  Array.from({ length: 256 }, (_, i) => ({ x: i / 255, y: Math.abs(Math.sin(i * 47.123)) })),
  [{ x: .5, y: .5 }, { x: .59, y: .51 }],
];

test('ten extreme drawings generate finite bounded levels with reachable jumps', () => {
  for (const points of drawings) {
    const level = generateTraceLevel(points);
    assert.equal(level.platforms.length, 17);
    assert.equal(level.samples.length, 16);
    assert.match(level.token, /^1\.[0-9a-v]{16}$/);
    for (let i = 1; i < level.platforms.length; i++) {
      const previous = level.platforms[i - 1], next = level.platforms[i];
      assert.ok(Number.isFinite(next.x + next.y + next.width));
      assert.ok(Math.abs(next.y - previous.y) <= 30);
      assert.ok(jumpReach(previous, next) > next.x - previous.x - previous.width + 40);
    }
  }
});

test('shared levels round trip exactly and reject malformed versions, payloads and lengths', () => {
  for (const points of drawings) {
    const original = generateTraceLevel(points);
    assert.deepEqual(decodeTraceLevel(original.token), original);
  }
  for (const token of ['2.0000000000000000', '1.0000', '1.wwwwwwwwwwwwwwww', '<script>', '1.' + '0'.repeat(5000)]) assert.equal(decodeTraceLevel(token), null);
  assert.throws(() => levelFromSamples([NaN]));
  assert.throws(() => generateTraceLevel([{ x: 0, y: 0 }, { x: NaN, y: 1 }]));
  assert.throws(() => generateTraceLevel([{ x: .5, y: 0 }, { x: .5, y: 1 }]));
  assert.throws(() => generateTraceLevel(Array.from({ length: 257 }, () => ({ x: 0, y: 0 }))));
});

test('every preset and extreme repaired drawing can finish using the actual physics', () => {
  const levels = [...TRACE_PRESETS.map((preset) => levelFromSamples(preset.samples)), ...drawings.map(generateTraceLevel)];
  for (const level of levels) {
    const run = newTraceRun(level);
    for (let frame = 0; frame < 6000 && run.status === 'playing'; frame++) {
      const platform = level.platforms.find((p) => run.x >= p.x && run.x < p.x + p.width && Math.abs(run.y - p.y) < 1);
      if (run.grounded && platform && platform.x + platform.width - run.x < 27 && run.x < level.finish - 50) requestTraceJump(run);
      stepTraceRun(run, level, 1 / 120);
    }
    assert.equal(run.status, 'won', `unreachable ${level.token} at x=${run.x.toFixed(1)}`);
    assert.ok(run.time > 15 && run.time < 25);
  }
});

test('no input falls, restarting resets, zero elapsed preserves pause and invalid time is ignored', () => {
  const level = levelFromSamples(TRACE_PRESETS[0].samples);
  const run = newTraceRun(level);
  for (let i = 0; i < 900; i++) stepTraceRun(run, level, 1 / 60);
  assert.equal(run.status, 'lost');
  const fresh = newTraceRun(level), saved = { ...fresh };
  stepTraceRun(fresh, level, 0); stepTraceRun(fresh, level, NaN); stepTraceRun(fresh, level, -1);
  assert.deepEqual(fresh, saved);
  assert.equal(fresh.time, 0);
  assert.equal(fresh.status, 'playing');
});
