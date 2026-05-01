import { CATALOG, type CatalogItem } from './catalog';
import { STRIPE_PRICES } from './stripe-prices';

/**
 * Lookup inverso priceId → item del catálogo.
 * Útil en el webhook al reconstruir el carrito desde line_items de Stripe.
 */
export function findCatalogItemByPriceId(priceId: string): CatalogItem | null {
  for (const key in STRIPE_PRICES) {
    const k = key as keyof typeof STRIPE_PRICES;
    if (STRIPE_PRICES[k].priceId === priceId) {
      return CATALOG[k as keyof typeof CATALOG];
    }
  }
  return null;
}

/**
 * Lookup directo: dado un catalogId (snake_case, ej. 'hosting_monthly'),
 * devuelve { productId, priceId }.
 */
export function getStripeIdsByCatalogId(catalogId: string): { productId: string; priceId: string } | null {
  for (const key in CATALOG) {
    const k = key as keyof typeof CATALOG;
    if (CATALOG[k].id === catalogId) {
      return STRIPE_PRICES[k as keyof typeof STRIPE_PRICES];
    }
  }
  return null;
}
