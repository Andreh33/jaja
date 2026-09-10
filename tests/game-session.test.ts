import test from 'node:test';
import assert from 'node:assert/strict';
import { createGameSession, suspendGames, type PauseReason } from '../src/components/home/playground/game-session';

/** Small DOM scheduler harness exercises ownership and actual RAF cancellation. */
test('manual, visibility, viewport and focus pauses remain independent; one RAF owner; disposal cleans up', () => {
  const prior = Object.fromEntries(['document', 'window', 'requestAnimationFrame', 'cancelAnimationFrame', 'IntersectionObserver'].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const frames = new Map<number, FrameRequestCallback>();
  const observers: { notify: (visible: boolean) => void; disconnected: boolean }[] = [];
  let frameId = 0;
  const doc = new EventTarget() as EventTarget & { hidden: boolean; activeElement: unknown };
  doc.hidden = false;
  const win = new EventTarget() as EventTarget & { innerHeight: number }; win.innerHeight = 800;
  class Element extends EventTarget {
    getBoundingClientRect() { return { top: 100, bottom: 500 }; }
    contains(node: unknown) { return node === this; }
  }
  class Observer {
    entry: { notify: (visible: boolean) => void; disconnected: boolean };
    constructor(callback: IntersectionObserverCallback) { this.entry = { notify: (visible) => callback([{ isIntersecting: visible } as IntersectionObserverEntry], this as unknown as IntersectionObserver), disconnected: false }; observers.push(this.entry); }
    observe() {}
    disconnect() { this.entry.disconnected = true; }
  }
  Object.defineProperties(globalThis, {
    document: { value: doc, configurable: true }, window: { value: win, configurable: true },
    requestAnimationFrame: { value: (callback: FrameRequestCallback) => { frames.set(++frameId, callback); return frameId; }, configurable: true },
    cancelAnimationFrame: { value: (id: number) => { frames.delete(id); }, configurable: true },
    IntersectionObserver: { value: Observer, configurable: true },
  });
  const tick = (time: number) => { const queue = [...frames.values()]; frames.clear(); queue.forEach((frame) => frame(time)); };
  const elementA = new Element(), elementB = new Element(); doc.activeElement = elementA;
  let reasonsA: PauseReason[] = [], reasonsB: PauseReason[] = []; const deltas: number[] = [];
  const a = createGameSession({ element: elementA as unknown as HTMLElement, onFrame: (_time, dt) => deltas.push(dt), onPause: (r) => { reasonsA = r; } });
  const b = createGameSession({ element: elementB as unknown as HTMLElement, onFrame: () => {}, onPause: (r) => { reasonsB = r; } });
  try {
    assert.equal(frames.size, 0);
    a.play(); assert.equal(a.canPlay(), true); assert.equal(frames.size, 1);
    tick(1000); tick(1016); assert.deepEqual(deltas, [0, .016]);
    a.pause(); assert.equal(frames.size, 0);
    doc.hidden = true; doc.dispatchEvent(new Event('visibilitychange'));
    observers[0].notify(false);
    assert.deepEqual(new Set(reasonsA), new Set(['manual', 'hidden', 'viewport']));
    doc.hidden = false; doc.dispatchEvent(new Event('visibilitychange')); observers[0].notify(true);
    assert.deepEqual(reasonsA, ['manual']); assert.equal(frames.size, 0);
    a.play(); tick(90000); assert.equal(deltas.at(-1), 0, 'resume does not apply hidden elapsed time');
    b.play(); assert.equal(a.canPlay(), false); assert.deepEqual(reasonsA, ['inactive']); assert.equal(b.canPlay(), true); assert.equal(frames.size, 1);
    b.pause(); doc.hidden = true; doc.dispatchEvent(new Event('visibilitychange')); doc.hidden = false; doc.dispatchEvent(new Event('visibilitychange'));
    assert.deepEqual(reasonsB, ['manual']); assert.equal(b.canPlay(), false);
    a.play(); win.dispatchEvent(new Event('blur')); assert.deepEqual(reasonsA, ['focus']); assert.equal(frames.size, 0);
    elementA.dispatchEvent(new Event('focusin')); assert.equal(a.canPlay(), false, 'focusing Resume must not remove its own overlay before click');
    a.play(); assert.equal(a.canPlay(), true);
    suspendGames(); assert.equal(a.canPlay(), false); assert.equal(b.canPlay(), false); assert.equal(frames.size, 0);
    a.play(); a.dispose(); assert.equal(frames.size, 0); assert.equal(observers[0].disconnected, true);
    doc.hidden = true; doc.dispatchEvent(new Event('visibilitychange')); a.play(); assert.equal(frames.size, 0);
  } finally {
    a.dispose(); b.dispose(); suspendGames();
    for (const [key, descriptor] of Object.entries(prior)) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); }
  }
});
