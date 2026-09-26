import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import StudioActivate from '../src/components/home/StudioActivate';
import { activationBusinesses, activationConcepts, activationProducts, activationReducer as reduce, activationTotal, initialActivation, type ActivationBusiness } from '../src/components/home/activation-model';

const enter = (business: ActivationBusiness) => reduce(reduce(reduce(initialActivation, { type: 'business', value: business }), { type: 'progress', value: 100 }), { type: 'explore' });
const html = (business: ActivationBusiness, exploring = false) => renderToStaticMarkup(createElement(StudioActivate, { state: exploring ? enter(business) : { ...initialActivation, business }, dispatch() {}, active: true, viewport: { current: null }, onInterest() {} }));

describe('Activa Latech transformation', () => {
  it('bounds progress, rejects non-finite values and only unlocks a completed transformation', () => {
    assert.equal(reduce(initialActivation, { type: 'explore' }), initialActivation);
    for (const value of [NaN, Infinity, -Infinity]) assert.equal(reduce(initialActivation, { type: 'progress', value }), initialActivation);
    assert.equal(reduce(initialActivation, { type: 'progress', value: -4 }).progress, 0);
    assert.equal(reduce(initialActivation, { type: 'progress', value: 110 }).progress, 100);
    const state = enter('shop');
    assert.equal(state.exploring, true);
    assert.equal(reduce(state, { type: 'progress', value: 80 }).exploring, false);
    assert.equal(reduce(state, { type: 'compare' }).progress, 100);
  });
  it('keeps each business inside its own routes and resets only when choosing another business', () => {
    const shop = reduce(enter('shop'), { type: 'quantity', id: 'arc', delta: 1 });
    assert.equal(reduce(shop, { type: 'business', value: 'shop' }), shop);
    assert.equal(reduce(shop, { type: 'view', value: 'booking' }), shop);
    assert.equal(reduce(enter('restaurant'), { type: 'view', value: 'bag' }).view, 'home');
    const switched = reduce(shop, { type: 'business', value: 'company' });
    assert.equal(switched.exploring, false); assert.deepEqual(switched.bag, {}); assert.equal(switched.progress, 100);
  });
  it('uses bounded integer quantities and exact catalogue prices without accepting foreign product IDs', () => {
    let state = enter('shop');
    assert.equal(reduce(state, { type: 'quantity', id: '__proto__', delta: 1 }), state);
    assert.equal(reduce(state, { type: 'quantity', id: 'arc', delta: .5 }), state);
    state = reduce(state, { type: 'quantity', id: 'arc', delta: 20 });
    assert.equal(state.bag.arc, 9); assert.equal(activationTotal(state.bag), 9 * 8900);
    state = reduce(state, { type: 'quantity', id: 'vase', delta: 2 });
    assert.equal(activationTotal(state.bag), 9 * 8900 + 2 * 4200);
    state = reduce(state, { type: 'quantity', id: 'arc', delta: -30 });
    assert.equal(state.bag.arc, undefined);
    assert.equal(activationTotal({ arc: NaN, vase: Infinity, bowl: -5, unknown: 4 }), 0);
  });
  it('lets every catalogue item open a real detail state and prevents empty checkout confirmation', () => {
    for (const item of activationProducts) assert.equal(reduce(enter('shop'), { type: 'product', value: item.id }).product, item.id);
    const empty = reduce(enter('shop'), { type: 'view', value: 'bag' });
    assert.equal(reduce(empty, { type: 'confirm' }).confirmed, false);
    const full = reduce(empty, { type: 'quantity', id: 'bowl', delta: 1 });
    assert.equal(reduce(full, { type: 'confirm' }).confirmed, true);
  });
  it('validates booking choices and resets a previous confirmation when the visitor edits', () => {
    let state = reduce(enter('restaurant'), { type: 'view', value: 'booking' });
    assert.equal(reduce(state, { type: 'booking', field: 'day', value: 'invented' }), state);
    assert.equal(reduce(state, { type: 'booking', field: 'guests', value: 100 }), state);
    state = reduce(state, { type: 'booking', field: 'guests', value: 4 });
    state = reduce(state, { type: 'confirm' });
    assert.equal(state.confirmed, true); assert.equal(state.guests, 4);
    state = reduce(state, { type: 'booking', field: 'time', value: '14:30' });
    assert.equal(state.confirmed, false);
  });
  it('supports a company inquiry without accepting arbitrary fields', () => {
    let state = reduce(enter('company'), { type: 'view', value: 'services' });
    assert.equal(reduce(state, { type: 'service', value: 'unknown' }), state);
    state = reduce(state, { type: 'service', value: 'Mi negocio' });
    assert.equal(reduce(state, { type: 'confirm' }).confirmed, true);
  });
  it('renders an accessible native comparison control and distinct original artwork for all three concepts', () => {
    for (const business of activationBusinesses) {
      const markup = html(business);
      assert.ok(markup.includes('type="range"')); assert.ok(markup.includes('aria-label="Transformar el diseño"'));
      assert.ok(markup.includes('CONCEPTO FICTICIO')); assert.ok(markup.includes(activationConcepts[business].brand));
      assert.ok(markup.includes('clip-path:inset(0 65% 0 0)'));
      const ids = [...markup.matchAll(/id="([^"]+)"/g)].map(match => match[1]);
      assert.equal(new Set(ids).size, ids.length);
    }
  });
  it('renders the navigable experience instead of the range once entered, with no external navigation or form', () => {
    for (const business of activationBusinesses) {
      const markup = html(business, true);
      assert.ok(!markup.includes('type="range"'));
      assert.ok(markup.includes(`Navegación de ${activationConcepts[business].brand}`));
      assert.ok(!/<(?:a|form|iframe)\b/.test(markup));
      assert.ok(markup.includes('NO ES UN NEGOCIO REAL'));
    }
    const source = readFileSync(new URL('../src/components/home/StudioActivate.tsx', import.meta.url), 'utf8');
    assert.ok(!/\b(fetch|XMLHttpRequest|localStorage|sessionStorage|sendBeacon)\b/.test(source));
  });
});
