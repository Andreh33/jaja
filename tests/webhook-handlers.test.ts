/**
 * Regression tests for the Stripe API 2026-04-22.dahlia event shapes.
 *
 * Two shapes coexist in webhook deliveries:
 *   - "Modern" (>= 2026-04-22.dahlia): invoice.parent.subscription_details.subscription
 *     and subscription.items.data[].current_period_*.
 *   - "Legacy" (< 2026-04-22): invoice.subscription and subscription.current_period_*.
 *
 * Stripe redelivers webhooks using the apiVersion of the original event,
 * so both shapes can hit our handlers in production. The helpers must
 * support both.
 *
 * Run: npx tsx --test tests/webhook-handlers.test.ts
 */

// El helper findCatalogItemByPriceId (usado vía buildCartItem*) llama a
// getCurrentPrices() que requiere STRIPE_SECRET_KEY. En el runner de tests
// no cargamos .env.local, así que aseguramos un dummy 'sk_test_*' antes
// de cualquier import que dispare la cadena.
process.env.STRIPE_SECRET_KEY ||= 'sk_test_dummy_for_tests';

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractInvoiceSubscriptionId,
  extractSubscriptionPeriods,
  extractSubscriptionCadence,
  buildCartItem,
  buildCartItemFromSubscriptionItem,
} from '../src/lib/stripe-shape-helpers';
import { STRIPE_PRICES } from '../src/config/stripe-prices';
import { CATALOG } from '../src/config/catalog';
import type Stripe from 'stripe';

const HOSTING_MONTHLY_PRICE = STRIPE_PRICES.test.hostingMonthly.priceId;
const HOSTING_MONTHLY_CATALOG = CATALOG.hostingMonthly.id;

// ---------------------------------------------------------------------------
// extractInvoiceSubscriptionId
// ---------------------------------------------------------------------------

describe('extractInvoiceSubscriptionId', () => {
  it('reads from invoice.parent.subscription_details.subscription (API 2026-04-22 shape)', () => {
    const invoice = {
      id: 'in_test_modern',
      parent: {
        type: 'subscription_details',
        quote_details: null,
        subscription_details: {
          subscription: 'sub_modern_123',
          metadata: {},
        },
      },
    } as unknown as Stripe.Invoice;
    assert.equal(extractInvoiceSubscriptionId(invoice), 'sub_modern_123');
  });

  it('reads from invoice.subscription (legacy root field) when parent is absent', () => {
    const invoice = {
      id: 'in_test_legacy',
      subscription: 'sub_legacy_456',
    } as unknown as Stripe.Invoice;
    assert.equal(extractInvoiceSubscriptionId(invoice), 'sub_legacy_456');
  });

  it('handles subscription as expanded object {id} in legacy shape', () => {
    const invoice = {
      id: 'in_test_legacy_expanded',
      subscription: { id: 'sub_legacy_789', object: 'subscription' },
    } as unknown as Stripe.Invoice;
    assert.equal(extractInvoiceSubscriptionId(invoice), 'sub_legacy_789');
  });

  it('handles subscription as expanded object {id} in modern shape', () => {
    const invoice = {
      id: 'in_test_modern_expanded',
      parent: {
        type: 'subscription_details',
        subscription_details: {
          subscription: { id: 'sub_modern_expanded', object: 'subscription' },
        },
      },
    } as unknown as Stripe.Invoice;
    assert.equal(extractInvoiceSubscriptionId(invoice), 'sub_modern_expanded');
  });

  it('prefers parent.subscription_details over root invoice.subscription when both are present', () => {
    const invoice = {
      id: 'in_test_both',
      parent: { type: 'subscription_details', subscription_details: { subscription: 'sub_from_parent' } },
      subscription: 'sub_from_root',
    } as unknown as Stripe.Invoice;
    assert.equal(extractInvoiceSubscriptionId(invoice), 'sub_from_parent');
  });

  it('returns null for invoice without subscription (one-shot ad-hoc invoice)', () => {
    const invoice = { id: 'in_test_oneshot' } as unknown as Stripe.Invoice;
    assert.equal(extractInvoiceSubscriptionId(invoice), null);
  });

  it('returns null when parent.subscription_details.subscription is null', () => {
    const invoice = {
      id: 'in_test_quote',
      parent: { type: 'quote_details', subscription_details: null, quote_details: { quote: 'qt_x' } },
    } as unknown as Stripe.Invoice;
    assert.equal(extractInvoiceSubscriptionId(invoice), null);
  });
});

// ---------------------------------------------------------------------------
// extractSubscriptionPeriods
// ---------------------------------------------------------------------------

describe('extractSubscriptionPeriods', () => {
  it('reads periods from items.data[0] (API 2026-04-22 shape)', () => {
    const sub = {
      id: 'sub_modern',
      items: {
        data: [
          { id: 'si_1', current_period_start: 1777678367, current_period_end: 1780356767 },
        ],
      },
    } as unknown as Stripe.Subscription;
    const r = extractSubscriptionPeriods(sub);
    assert.equal(r.start, 1777678367);
    assert.equal(r.end, 1780356767);
  });

  it('reads periods from root (legacy shape) when items.data is absent or has no period fields', () => {
    const sub = {
      id: 'sub_legacy',
      current_period_start: 1700000000,
      current_period_end: 1702592000,
      items: { data: [{ id: 'si_no_period' }] },
    } as unknown as Stripe.Subscription;
    const r = extractSubscriptionPeriods(sub);
    assert.equal(r.start, 1700000000);
    assert.equal(r.end, 1702592000);
  });

  it('prefers items.data[0] when both shapes are present', () => {
    const sub = {
      id: 'sub_both',
      current_period_start: 1000000000,
      current_period_end: 1002592000,
      items: {
        data: [
          { id: 'si_1', current_period_start: 2000000000, current_period_end: 2002592000 },
        ],
      },
    } as unknown as Stripe.Subscription;
    const r = extractSubscriptionPeriods(sub);
    assert.equal(r.start, 2000000000);
    assert.equal(r.end, 2002592000);
  });

  it('returns nulls when no period info is present anywhere', () => {
    const sub = {
      id: 'sub_empty',
      items: { data: [] },
    } as unknown as Stripe.Subscription;
    const r = extractSubscriptionPeriods(sub);
    assert.equal(r.start, null);
    assert.equal(r.end, null);
  });

  it('handles missing items field defensively', () => {
    const sub = {
      id: 'sub_no_items',
      current_period_start: 1500000000,
      current_period_end: 1502592000,
    } as unknown as Stripe.Subscription;
    const r = extractSubscriptionPeriods(sub);
    assert.equal(r.start, 1500000000);
    assert.equal(r.end, 1502592000);
  });
});

// ---------------------------------------------------------------------------
// extractSubscriptionCadence
// ---------------------------------------------------------------------------

describe('extractSubscriptionCadence', () => {
  it("returns 'monthly' when items.data[0].price.recurring.interval === 'month'", () => {
    const sub = {
      id: 'sub_monthly',
      items: { data: [{ price: { recurring: { interval: 'month' } } }] },
    } as unknown as Stripe.Subscription;
    assert.equal(extractSubscriptionCadence(sub), 'monthly');
  });

  it("returns 'yearly' when items.data[0].price.recurring.interval === 'year'", () => {
    const sub = {
      id: 'sub_yearly',
      items: { data: [{ price: { recurring: { interval: 'year' } } }] },
    } as unknown as Stripe.Subscription;
    assert.equal(extractSubscriptionCadence(sub), 'yearly');
  });

  it("returns 'unknown' when items.data is empty", () => {
    const sub = {
      id: 'sub_no_items',
      items: { data: [] },
    } as unknown as Stripe.Subscription;
    assert.equal(extractSubscriptionCadence(sub), 'unknown');
  });

  it("returns 'unknown' when items.data[0].price.recurring is null", () => {
    const sub = {
      id: 'sub_no_recurring',
      items: { data: [{ price: { recurring: null } }] },
    } as unknown as Stripe.Subscription;
    assert.equal(extractSubscriptionCadence(sub), 'unknown');
  });

  it("returns 'unknown' for unsupported intervals like 'week' or 'day'", () => {
    const week = {
      id: 'sub_weekly',
      items: { data: [{ price: { recurring: { interval: 'week' } } }] },
    } as unknown as Stripe.Subscription;
    assert.equal(extractSubscriptionCadence(week), 'unknown');
  });
});

// ---------------------------------------------------------------------------
// buildCartItem
// ---------------------------------------------------------------------------

describe('buildCartItem', () => {
  it('returns CartLine with all 3 fields when priceId is in catalog', () => {
    const r = buildCartItem({
      priceId: HOSTING_MONTHLY_PRICE,
      quantity: 1,
      amountSubtotal: 6000,
    });
    assert.notEqual(r, null);
    assert.deepEqual(r, {
      catalog_id: HOSTING_MONTHLY_CATALOG,
      quantity: 1,
      amount_subtotal: 6000,
    });
  });

  it('returns null when priceId is unknown', () => {
    const r = buildCartItem({
      priceId: 'price_does_not_exist_xyz',
      quantity: 1,
      amountSubtotal: 1000,
    });
    assert.equal(r, null);
  });

  it('multiplies quantity into amountSubtotal as caller passes it (no implicit math)', () => {
    const r = buildCartItem({
      priceId: HOSTING_MONTHLY_PRICE,
      quantity: 3,
      amountSubtotal: 18000,
    });
    assert.equal(r?.quantity, 3);
    assert.equal(r?.amount_subtotal, 18000);
  });
});

// ---------------------------------------------------------------------------
// buildCartItemFromSubscriptionItem
// ---------------------------------------------------------------------------

describe('buildCartItemFromSubscriptionItem', () => {
  it('produces same shape as buildCartItem with amount_subtotal = unit_amount * quantity', () => {
    const item = {
      id: 'si_test',
      price: { id: HOSTING_MONTHLY_PRICE, unit_amount: 6000 },
      quantity: 1,
    } as unknown as Stripe.SubscriptionItem;
    const r = buildCartItemFromSubscriptionItem(item);
    assert.deepEqual(r, {
      catalog_id: HOSTING_MONTHLY_CATALOG,
      quantity: 1,
      amount_subtotal: 6000,
    });
  });

  it('multiplies unit_amount by quantity', () => {
    const item = {
      id: 'si_qty4',
      price: { id: HOSTING_MONTHLY_PRICE, unit_amount: 6000 },
      quantity: 4,
    } as unknown as Stripe.SubscriptionItem;
    const r = buildCartItemFromSubscriptionItem(item);
    assert.equal(r?.quantity, 4);
    assert.equal(r?.amount_subtotal, 24000);
  });

  it('treats missing unit_amount as 0', () => {
    const item = {
      id: 'si_no_unit',
      price: { id: HOSTING_MONTHLY_PRICE },
      quantity: 2,
    } as unknown as Stripe.SubscriptionItem;
    const r = buildCartItemFromSubscriptionItem(item);
    assert.equal(r?.amount_subtotal, 0);
  });

  it('returns null when price.id is missing', () => {
    const item = {
      id: 'si_no_price',
      price: null,
      quantity: 1,
    } as unknown as Stripe.SubscriptionItem;
    assert.equal(buildCartItemFromSubscriptionItem(item), null);
  });

  it('returns null when priceId is unknown to catalog', () => {
    const item = {
      id: 'si_unknown',
      price: { id: 'price_unknown_xyz', unit_amount: 1000 },
      quantity: 1,
    } as unknown as Stripe.SubscriptionItem;
    assert.equal(buildCartItemFromSubscriptionItem(item), null);
  });
});
