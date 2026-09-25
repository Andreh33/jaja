import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../src/config/catalog';
import { STRIPE_PRICES } from '../src/config/stripe-prices';

type CheckoutLine = {
  price?: string;
  price_data?: {
    currency: string;
    product?: string;
    unit_amount?: number;
  };
  quantity?: number;
  metadata?: Record<string, string>;
};

async function build(webPagesOver8: boolean) {
  process.env.STRIPE_SECRET_KEY = 'sk_test_dummy_for_checkout_builder_tests';
  const { buildCheckoutSessionParams } = await import('../src/lib/checkout-builder');
  return buildCheckoutSessionParams({
    selection: {
      webPagesOver8,
      hostingCadence: 'monthly',
      tienda: false,
      social: false,
      aiAgent: 'none',
      blogPosts: 0,
      logo: false,
    },
    stripeCustomerId: 'cus_test',
    successUrl: 'https://example.test/success',
    cancelUrl: 'https://example.test/cancel',
    metadata: { flow: 'test' },
  });
}

describe('checkout builder web price contract', () => {
  for (const variant of [
    {
      label: 'hasta 8 páginas',
      over8: false,
      item: CATALOG.webCreationLe8,
      productId: STRIPE_PRICES.test.webCreationLe8.productId,
    },
    {
      label: 'más de 8 páginas',
      over8: true,
      item: CATALOG.webCreationGt8,
      productId: STRIPE_PRICES.test.webCreationGt8.productId,
    },
  ]) {
    it(`charges exactly 800 EUR inline for ${variant.label}`, async () => {
      const params = await build(variant.over8);
      const lines = params.line_items as CheckoutLine[];
      const web = lines.find((line) => line.metadata?.catalog_id === variant.item.id);

      assert.equal(params.mode, 'subscription');
      assert.equal(variant.item.amount, 80000);
      assert.ok(web);
      assert.equal(web.price, undefined);
      assert.deepEqual(web.price_data, {
        currency: 'eur',
        product: variant.productId,
        unit_amount: 80000,
      });
      assert.equal(web.quantity, 1);
    });
  }

  it('keeps recurring products on their stable Stripe Price IDs', async () => {
    const params = await build(false);
    const lines = params.line_items as CheckoutLine[];
    const hosting = lines.find(
      (line) => line.metadata?.catalog_id === CATALOG.hostingMonthly.id,
    );

    assert.ok(hosting);
    assert.equal(hosting.price, STRIPE_PRICES.test.hostingMonthly.priceId);
    assert.equal(hosting.price_data, undefined);
  });
});
