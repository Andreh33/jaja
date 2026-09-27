import { it } from 'node:test';
import assert from 'node:assert/strict';
import { arcadeSoundEnabled, initializeArcadeSound, toggleArcadeSound, subscribeArcadeSound } from '../src/lib/arcade-audio';

it('defaults to sound on, honors stored mute and tolerates unavailable audio', async () => {
  assert.equal(arcadeSoundEnabled(), true);
  const store = new Map([['latech-arcade-sound', 'off']]);
  const events: string[] = [];
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { addEventListener: (event: string) => events.push(event) } });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => store.get(key), setItem: (key: string, value: string) => store.set(key, value) } });
  let updates = 0;
  const unsubscribe = subscribeArcadeSound(() => updates++);
  try {
    initializeArcadeSound(); initializeArcadeSound();
    assert.equal(arcadeSoundEnabled(), false);
    assert.deepEqual(events, ['pointerdown', 'keydown']);
    assert.equal(updates, 1);
    assert.equal(await toggleArcadeSound(), true);
    assert.equal(store.get('latech-arcade-sound'), 'on');
    assert.equal(await toggleArcadeSound(), false);
    assert.equal(store.get('latech-arcade-sound'), 'off');
    assert.equal(updates, 3);
  } finally {
    unsubscribe();
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow); else Reflect.deleteProperty(globalThis, 'window');
    if (previousStorage) Object.defineProperty(globalThis, 'localStorage', previousStorage); else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});
