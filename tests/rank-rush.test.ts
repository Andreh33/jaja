import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceRankRush, newRankRushState, rankRushDecay, rankRushPosition,
  rankRushRequiredRate, startRankRush, tapRankRush, type RankRushMode,
} from '../src/components/home/playground/rank-rush-model';

function playAtRate(rate: number, mode: RankRushMode = 'rush') {
  let game = startRankRush(mode);
  let nextTap = 0;
  while (game.status === 'playing') {
    if (game.elapsed + 1e-8 >= nextTap) {
      game = tapRankRush(game);
      nextTap += 1 / rate;
    }
    game = advanceRankRush(game, 1 / 120);
  }
  return game;
}

test('rank rush starts at six, climbs gradually and caps repeated same-frame input', () => {
  const idle = newRankRushState();
  assert.equal(tapRankRush(idle), idle);
  const tapped = tapRankRush(startRankRush('rush'));
  assert.equal(tapped.taps, 1);
  assert.equal(tapped.progress, 1.35);
  assert.equal(rankRushPosition(tapped.progress), 6);
  assert.equal(tapRankRush(tapped), tapped);
  assert.equal(rankRushPosition(20), 5);
  assert.equal(rankRushPosition(99.9), 2);
  assert.equal(rankRushPosition(100), 1);
});

test('the higher the climb, the more rhythm it demands; stopping loses places', () => {
  const low = { ...startRankRush('rush'), progress: 10 };
  const high = { ...low, progress: 90 };
  assert.ok(rankRushDecay(high) > rankRushDecay(low));
  assert.ok(rankRushRequiredRate(high) > rankRushRequiredRate(low));
  let falling = high;
  for (let frame = 0; frame < 600; frame++) falling = advanceRankRush(falling, 1 / 60);
  assert.ok(falling.progress < 60);
  assert.ok(rankRushPosition(falling.progress) > rankRushPosition(high.progress));
});

test('human rapid tapping can win, a slow rhythm cannot, and steady mode is accessible', () => {
  const fast = playAtRate(6);
  assert.equal(fast.status, 'won');
  assert.ok(fast.elapsed > 15 && fast.elapsed < 60);
  assert.equal(fast.progress, 100);
  assert.equal(playAtRate(2).status, 'over');
  assert.equal(playAtRate(1, 'steady').status, 'won');
});

test('terminal states, invalid delta and zero progress are safe', () => {
  const start = startRankRush('rush');
  assert.equal(advanceRankRush(start, Number.NaN), start);
  assert.equal(advanceRankRush(start, -1), start);
  assert.equal(advanceRankRush(start, 0), start);
  assert.equal(advanceRankRush(start, 300).elapsed, 60);
  assert.equal(advanceRankRush(start, 0.1).progress, 0);
  const ended = advanceRankRush({ ...start, elapsed: 59.99 }, 0.02);
  assert.equal(ended.status, 'over');
  assert.equal(ended.elapsed, 60);
  assert.equal(tapRankRush(ended), ended);
  assert.equal(advanceRankRush(ended, 0.1), ended);
  const won = tapRankRush({ ...start, progress: 99.5 });
  assert.equal(won.status, 'won');
  assert.equal(advanceRankRush(won, 0.1), won);
});

test('20 fps and 60 fps consume the same active time and pressure', () => {
  const run = (fps: number) => {
    let state = { ...startRankRush('rush'), progress: 90 };
    for (let frame = 0; frame < fps * 12; frame++) state = advanceRankRush(state, 1 / fps);
    return state;
  };
  const slow = run(20), fast = run(60);
  assert.ok(Math.abs(slow.elapsed - 12) < 1e-8);
  assert.ok(Math.abs(fast.elapsed - 12) < 1e-8);
  assert.ok(Math.abs(slow.progress - fast.progress) < 0.001);
  assert.equal(advanceRankRush(slow, 0), slow, 'paused or first resumed frame cannot consume time');
});
