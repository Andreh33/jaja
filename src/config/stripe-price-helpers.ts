import { CATALOG, type CatalogItem } from './catalog';
import { getCurrentPrices } from '@/lib/stripe';

/**
 * Lookup inverso priceId → item del catálogo.
 * Útil en el webhook al reconstruir el carrito desde line_items de Stripe.
 *
 * Usa el mapa correspondiente al modo activo (test/live) — un priceId
 * de TEST nunca debería llegar a un webhook de LIVE y viceversa, así que
 * mirar solo el mapa del modo actual es seguro y reduce falsos positivos.
 */
export function findCatalogItemByPriceId(priceId: string): CatalogItem | null {
  const prices = getCurrentPrices();
  for (const key in prices) {
    const k = key as keyof typeof prices;
    if (prices[k].priceId === priceId) {
      return CATALOG[k as keyof typeof CATALOG];
    }
  }
  return null;
}

/**
 * Lookup directo: dado un catalogId (snake_case, ej. 'hosting_monthly'),
 * devuelve { productId, priceId } del modo activo.
 */
export function getStripeIdsByCatalogId(catalogId: string): { productId: string; priceId: string } | null {
  const prices = getCurrentPrices();
  for (const key in CATALOG) {
    const k = key as keyof typeof CATALOG;
    if (CATALOG[k].id === catalogId) {
      return prices[k as keyof typeof prices];
    }
  }
  return null;
}
