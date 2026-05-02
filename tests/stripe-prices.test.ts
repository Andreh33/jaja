/**
 * Tests del modo Stripe (test/live) y selección de precios por modo.
 *
 * Notas:
 *  - getStripeMode() acepta opcionalmente la clave como argumento — usado
 *    aquí para evitar depender de process.env.
 *  - getCurrentPrices() lee de process.env, así que se mockea STRIPE_SECRET_KEY
 *    antes de importar dinámicamente el módulo en cada test.
 *
 * Run: npm test
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getStripeMode } from '../src/lib/stripe';
import { STRIPE_PRICES } from '../src/config/stripe-prices';

describe('getStripeMode', () => {
  it("returns 'test' for sk_test_ keys", () => {
    assert.equal(getStripeMode('sk_test_abc123'), 'test');
    assert.equal(getStripeMode('sk_test_51TSOgU2YFBctOmUDxxxx'), 'test');
  });

  it("returns 'live' for sk_live_ keys", () => {
    assert.equal(getStripeMode('sk_live_abc123'), 'live');
    assert.equal(getStripeMode('sk_live_51TSOgU2YFBctOmUDxxxx'), 'live');
  });

  it('throws on missing key (empty string)', () => {
    assert.throws(() => getStripeMode(''), /missing or invalid/);
  });

  it("throws on key with unexpected prefix", () => {
    assert.throws(() => getStripeMode('rk_test_abc'), /missing or invalid/);
    assert.throws(() => getStripeMode('pk_test_abc'), /missing or invalid/);
    assert.throws(() => getStripeMode('sk_invalid_at_runtime'), /missing or invalid/);
  });
});

describe('STRIPE_PRICES dual structure', () => {
  it('exposes test and live sections', () => {
    assert.ok(STRIPE_PRICES.test, 'STRIPE_PRICES.test must exist');
    assert.ok(STRIPE_PRICES.live, 'STRIPE_PRICES.live must exist');
  });

  it('test section has populated IDs (sk_test_ workflow)', () => {
    const t = STRIPE_PRICES.test.hostingMonthly;
    assert.ok(t.priceId.startsWith('price_'), 'test priceId must look like a Stripe price id');
    assert.ok(t.productId.startsWith('prod_'), 'test productId must look like a Stripe product id');
  });

  it('test and live sections have the exact same catalog ids', () => {
    const testKeys = Object.keys(STRIPE_PRICES.test).sort();
    const liveKeys = Object.keys(STRIPE_PRICES.live).sort();
    assert.deepEqual(testKeys, liveKeys);
  });
});

describe('getCurrentPrices (via process.env)', () => {
  it("returns the test section when STRIPE_SECRET_KEY starts with sk_test_", async () => {
    const prev = process.env.STRIPE_SECRET_KEY;
    process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
    try {
      // Import dinámico para que el módulo lea el env actualizado en cada test.
      const { getCurrentPrices } = await import('../src/lib/stripe');
      const r = getCurrentPrices();
      assert.equal(r, STRIPE_PRICES.test);
    } finally {
      if (prev === undefined) delete process.env.STRIPE_SECRET_KEY;
      else process.env.STRIPE_SECRET_KEY = prev;
    }
  });

  it("returns the live section when STRIPE_SECRET_KEY starts with sk_live_", async () => {
    const prev = process.env.STRIPE_SECRET_KEY;
    process.env.STRIPE_SECRET_KEY = 'sk_live_dummy';
    try {
      const { getCurrentPrices } = await import('../src/lib/stripe');
      const r = getCurrentPrices();
      assert.equal(r, STRIPE_PRICES.live);
    } finally {
      if (prev === undefined) delete process.env.STRIPE_SECRET_KEY;
      else process.env.STRIPE_SECRET_KEY = prev;
    }
  });
});
