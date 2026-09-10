import test from 'node:test';
import assert from 'node:assert/strict';
import { gameStorage, readGameNumber } from '../src/components/home/playground/game-storage';
import { readCoins, readOwned, readLB, OWNED_KEY, LB_KEY, COINS_KEY } from '../src/components/home/playground/escape-model';

test('blocked storage never prevents playing and returns defensive defaults', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { get localStorage() { throw new Error('blocked'); } } });
  try {
    assert.equal(gameStorage.getItem('key'), null);
    assert.equal(gameStorage.setItem('key', 'value'), false);
    assert.equal(gameStorage.removeItem('key'), false);
    assert.equal(readCoins(), 0);
    assert.deepEqual(readOwned(), ['default']);
    assert.deepEqual(readLB(), []);
  } finally { if (previous) Object.defineProperty(globalThis, 'window', previous); else Reflect.deleteProperty(globalThis, 'window'); }
});

test('corrupt and excessive game values cannot inject skins or invalid scores', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const data = new Map<string, string>();
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value), removeItem: (key: string) => data.delete(key) } } });
  try {
    for (const invalid of ['NaN', 'Infinity', '-4', '{}']) { data.set(COINS_KEY, invalid); assert.equal(readCoins(), 0); }
    data.set(COINS_KEY, '999999999999'); assert.equal(readCoins(), 1_000_000);
    data.set(COINS_KEY, '4.9'); assert.equal(readCoins(), 4);
    assert.equal(readGameNumber('missing', 3), 3);
    data.set(OWNED_KEY, '["default","default","neon","javascript:alert(1)",true,{}]');
    assert.deepEqual(readOwned(), ['default', 'neon']);
    data.set(LB_KEY, '[{"name":"x","score":-1},{"name":"valid","score":4},{"score":3}]');
    assert.deepEqual(readLB(), [{ name: 'valid', score: 4 }]);
    data.set(OWNED_KEY, '{'); assert.deepEqual(readOwned(), ['default']);
  } finally { if (previous) Object.defineProperty(globalThis, 'window', previous); else Reflect.deleteProperty(globalThis, 'window'); }
});
