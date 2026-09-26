import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { defaultStudio, normalizeStudio, parseStudioHash, studioBrief, studioHash } from '../src/components/home/studio-model';
import { createStudioBodies, stepStudioBodies } from '../src/components/home/studio-physics';

describe('Latech Studio share and input model', () => {
  it('round trips a composition including Unicode without a server query', () => {
    const s = { ...defaultStudio, name: 'Café & diseño 🚀', direction: 'bold' as const, sector: 'Restauración' as const };
    const hash = studioHash(s);
    assert.ok(hash.startsWith('#studio='));
    assert.deepEqual(parseStudioHash(hash), s);
  });
  it('rejects malformed, unsupported and overlong links', () => {
    for (const hash of ['#other=1', '#studio=%', '#studio=null', '#studio={}', '#studio=[2,"x","x","x","x"]', '#studio=' + 'x'.repeat(901)]) assert.equal(parseStudioHash(hash), null);
  });
  it('normalizes untrusted values and limits name length', () => {
    assert.deepEqual(parseStudioHash('#studio=' + encodeURIComponent(JSON.stringify([1, { bad: true }, 'unknown', null, '__proto__']))), defaultStudio);
    assert.equal(normalizeStudio({ name: 'a'.repeat(100) }).name.length, 36);
    assert.equal(normalizeStudio({ name: ' Test\n\tbrand ' }).name, 'Testbrand');
  });
  it('creates a plain user-controlled brief without commercial claims', () => {
    const brief = studioBrief({ ...defaultStudio, name: 'Mi negocio' });
    assert.ok(brief.includes('Mi negocio')); assert.ok(brief.includes('Editorial'));
    assert.ok(!brief.includes('garantizado'));
  });
});

describe('Studio physics', () => {
  it('is deterministic and keeps every body inside the scene', () => {
    const bodies = createStudioBodies(300, 250);
    assert.deepEqual(bodies, createStudioBodies(300, 250));
    for (let i = 0; i < 3000; i++) stepStudioBodies(bodies, 300, 250, 1 / 60, true);
    for (const b of bodies) { assert.ok(b.x >= b.size * 1.8 && b.x <= 300 - b.size * 1.8); assert.ok(b.y >= b.size && b.y <= 250 - b.size); }
  });
  it('does not advance a held body or accept long suspended frames', () => {
    const bodies = createStudioBodies(600, 400), held = { ...bodies[0] };
    stepStudioBodies(bodies, 600, 400, 1000, false, 0);
    assert.deepEqual(bodies[0], held);
    const a = createStudioBodies(600, 400), b = createStudioBodies(600, 400);
    stepStudioBodies(a, 600, 400, 1000, true); stepStudioBodies(b, 600, 400, .034, true);
    assert.deepEqual(a, b);
  });
});
