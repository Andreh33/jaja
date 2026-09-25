import type Stripe from 'stripe';
import {
  CATALOG,
  type Cadence,
  type CatalogItem,
  pickAiPhone,
  pickAiWeb,
  pickBlogPost,
  pickHosting,
  pickSocial,
  pickTienda,
  pickWebCreation,
} from '@/config/catalog';
import { getCurrentPrices } from '@/lib/stripe';

/**
 * Selección serializada del wizard (lo que llega al endpoint /api/checkout).
 */
export type WizardSelection = {
  webPagesOver8: boolean;
  hostingCadence: Cadence;
  tienda: boolean;
  social: boolean;
  aiAgent: 'none' | 'web' | 'phone';
  blogPosts: number;
  logo: boolean;
};

type ResolvedItem = {
  item: CatalogItem;
  quantity: number;
  productId: string;
  priceId: string;
};

function stripeIdsFor(item: CatalogItem): { productId: string; priceId: string } {
  const prices = getCurrentPrices();
  for (const key in CATALOG) {
    const k = key as keyof typeof CATALOG;
    if (CATALOG[k].id === item.id) {
      const ids = prices[k as keyof typeof prices];
      if (!ids.productId || !ids.priceId) {
        throw new Error(`Incomplete Stripe mapping for catalog item ${item.id}`);
      }
      return ids;
    }
  }
  throw new Error(`No Stripe mapping for catalog item ${item.id}`);
}

function resolve(item: CatalogItem, quantity = 1): ResolvedItem {
  return { item, quantity, ...stripeIdsFor(item) };
}

function isWebCreation(item: CatalogItem): boolean {
  return item.id === CATALOG.webCreationLe8.id || item.id === CATALOG.webCreationGt8.id;
}

function toCheckoutLineItem(
  resolved: ResolvedItem,
): Stripe.Checkout.SessionCreateParams.LineItem {
  const common = {
    quantity: resolved.quantity,
    metadata: { catalog_id: resolved.item.id },
  };

  // Los IDs de Price existentes conservan los importes históricos. Para las
  // dos variantes web creamos el Price inline desde el catálogo actual, unido
  // al Product ya existente; así Checkout cobra exactamente 800 € sin tocar
  // ni archivar precios previos en Stripe.
  if (isWebCreation(resolved.item)) {
    return {
      ...common,
      price_data: {
        currency: resolved.item.currency,
        product: resolved.productId,
        unit_amount: resolved.item.amount,
      },
    };
  }

  return { ...common, price: resolved.priceId };
}

/**
 * Convierte la selección del wizard en items resueltos con IDs de Stripe.
 * Devuelve oneTime / recurring por separado para construir la session correctamente.
 */
export function resolveSelection(s: WizardSelection): {
  oneTime: ResolvedItem[];
  recurring: ResolvedItem[];
  cadence: Cadence;
} {
  const cadence = s.hostingCadence;
  const oneTime: ResolvedItem[] = [];
  const recurring: ResolvedItem[] = [];

  // Web (forzado).
  oneTime.push(resolve(pickWebCreation(s.webPagesOver8)));

  // Hosting (forzado).
  recurring.push(resolve(pickHosting(cadence)));

  if (s.tienda) recurring.push(resolve(pickTienda(cadence)));
  if (s.social) recurring.push(resolve(pickSocial(cadence)));
  if (s.aiAgent === 'web') recurring.push(resolve(pickAiWeb(cadence)));
  if (s.aiAgent === 'phone') recurring.push(resolve(pickAiPhone(cadence)));

  // Blog: 0 → no se añade.
  if (s.blogPosts > 0) {
    recurring.push(resolve(pickBlogPost(cadence), s.blogPosts));
  }

  // Logo (one-time opcional).
  if (s.logo) oneTime.push(resolve(CATALOG.logo));

  return { oneTime, recurring, cadence };
}

/**
 * Construye los parámetros de stripe.checkout.sessions.create.
 *
 * Estrategia (recomendada por Stripe):
 * - Si hay items recurring → mode 'subscription'. Mezclamos one-time y recurring
 *   en line_items: Stripe Checkout reconoce los prices one-time y los cobra en la
 *   primera invoice de la suscripción (no requiere add_invoice_items, que de hecho
 *   no está expuesto en Checkout.Session).
 * - Si solo hay one-time → mode 'payment'. (Caso defensivo: con el wizard actual
 *   hosting es forzado, así que siempre hay recurring; este endpoint se reusa
 *   también desde /api/checkout/seo donde sí puede ser puro one-time.)
 */
export function buildCheckoutSessionParams(args: {
  selection: WizardSelection;
  stripeCustomerId: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}): Stripe.Checkout.SessionCreateParams {
  const { oneTime, recurring } = resolveSelection(args.selection);
  const allLineItems = [
    ...recurring.map(toCheckoutLineItem),
    ...oneTime.map(toCheckoutLineItem),
  ];

  if (recurring.length > 0) {
    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      customer: args.stripeCustomerId,
      line_items: allLineItems,
      subscription_data: {
        metadata: args.metadata,
      },
      payment_method_types: ['card'],
      success_url: args.successUrl,
      cancel_url: args.cancelUrl,
      metadata: args.metadata,
    };
    return params;
  }

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    customer: args.stripeCustomerId,
    line_items: allLineItems,
    payment_method_types: ['card'],
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
    metadata: args.metadata,
  };
  return params;
}
