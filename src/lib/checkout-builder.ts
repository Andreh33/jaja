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
  priceId: string;
};

function priceIdFor(item: CatalogItem): string {
  const prices = getCurrentPrices();
  for (const key in CATALOG) {
    const k = key as keyof typeof CATALOG;
    if (CATALOG[k].id === item.id) return prices[k as keyof typeof prices].priceId;
  }
  throw new Error(`No Stripe priceId mapped for catalog item ${item.id}`);
}

function resolve(item: CatalogItem, quantity = 1): ResolvedItem {
  return { item, quantity, priceId: priceIdFor(item) };
}

/**
 * Convierte la selección del wizard en items resueltos con priceId.
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
    ...recurring.map((r) => ({ price: r.priceId, quantity: r.quantity })),
    ...oneTime.map((r) => ({ price: r.priceId, quantity: r.quantity })),
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
