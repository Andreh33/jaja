/**
 * Catálogo único de productos y precios para la calculadora-wizard.
 * Fuente de verdad: cualquier UI o API debe leer de aquí.
 *
 * Reglas:
 * - Si el usuario elige hosting anual, todo lo recurrente que tenga versión
 *   anual se cobra anual. Si elige mensual, todo mensual.
 * - Los precios están en EUR, IVA incluido.
 * - El blog base es gratis (incluido con la web). El cargo aparece desde 1 post.
 */

export type Cadence = 'monthly' | 'yearly';

export type CatalogItem = {
  /** Identificador estable, también usado en Stripe metadata.catalog_id. */
  id: string;
  /** Nombre humano (mostrado en UI y como Product.name en Stripe). */
  name: string;
  /** Descripción corta para summary y Stripe Product.description. */
  description: string;
  /** Precio en céntimos (Stripe los maneja en la unidad mínima). */
  amount: number;
  currency: 'eur';
  /** Tipo: 'one_time' (pago único) o 'recurring' (suscripción). */
  type: 'one_time' | 'recurring';
  /** Para 'recurring': cadencia. */
  interval?: 'month' | 'year';
};

export const CATALOG = {
  webCreationLe8: {
    id: 'web_creation_le8',
    name: 'Creación de página web (hasta 8 páginas)',
    description: 'Desarrollo de página web profesional, hasta 8 páginas.',
    amount: 40000,
    currency: 'eur',
    type: 'one_time',
  },
  webCreationGt8: {
    id: 'web_creation_gt8',
    name: 'Creación de página web (más de 8 páginas)',
    description: 'Desarrollo de página web profesional, más de 8 páginas.',
    amount: 50000,
    currency: 'eur',
    type: 'one_time',
  },
  hostingMonthly: {
    id: 'hosting_monthly',
    name: 'Hosting + dominio + SEO básico (mensual)',
    description: 'Hosting profesional, dominio y SEO básico mensual.',
    amount: 6000,
    currency: 'eur',
    type: 'recurring',
    interval: 'month',
  },
  hostingYearly: {
    id: 'hosting_yearly',
    name: 'Hosting + dominio + SEO básico (anual)',
    description: 'Hosting profesional, dominio y SEO básico anual (equivale a 45€/mes).',
    amount: 54000,
    currency: 'eur',
    type: 'recurring',
    interval: 'year',
  },
  tiendaMonthly: {
    id: 'tienda_monthly',
    name: 'Tienda online (mensual)',
    description: 'Pasarela de pago, login de clientes, productos y carrito.',
    amount: 2000,
    currency: 'eur',
    type: 'recurring',
    interval: 'month',
  },
  tiendaYearlyWithHosting: {
    id: 'tienda_yearly_with_hosting',
    name: 'Tienda online (anual con hosting anual)',
    description: 'Tienda online con descuento por hosting anual (10€/mes equivalentes).',
    amount: 12000,
    currency: 'eur',
    type: 'recurring',
    interval: 'year',
  },
  socialMedia: {
    id: 'social_media',
    name: 'Gestión de redes sociales',
    description: '2-3 publicaciones por semana, gestión completa.',
    amount: 10000,
    currency: 'eur',
    type: 'recurring',
    interval: 'month',
  },
  socialMediaYearly: {
    id: 'social_media_yearly',
    name: 'Gestión de redes sociales (anual)',
    description: '2-3 publicaciones por semana, gestión completa, facturación anual.',
    amount: 120000,
    currency: 'eur',
    type: 'recurring',
    interval: 'year',
  },
  aiWeb: {
    id: 'ai_web',
    name: 'Agente IA en la web',
    description: 'Agente IA conversacional integrado en tu web.',
    amount: 15000,
    currency: 'eur',
    type: 'recurring',
    interval: 'month',
  },
  aiWebYearly: {
    id: 'ai_web_yearly',
    name: 'Agente IA en la web (anual)',
    description: 'Agente IA conversacional integrado en tu web, facturación anual.',
    amount: 180000,
    currency: 'eur',
    type: 'recurring',
    interval: 'year',
  },
  aiPhone: {
    id: 'ai_phone',
    name: 'Agente IA por teléfono (con número virtual)',
    description: 'Agente IA con número virtual incluido (provisión manual tras el primer pago).',
    amount: 20000,
    currency: 'eur',
    type: 'recurring',
    interval: 'month',
  },
  aiPhoneYearly: {
    id: 'ai_phone_yearly',
    name: 'Agente IA por teléfono (anual)',
    description: 'Agente IA con número virtual, facturación anual.',
    amount: 240000,
    currency: 'eur',
    type: 'recurring',
    interval: 'year',
  },
  blogPost: {
    id: 'blog_post',
    name: 'Post de blog',
    description: 'Post SEO mensual (cantidad variable).',
    amount: 300,
    currency: 'eur',
    type: 'recurring',
    interval: 'month',
  },
  blogPostYearly: {
    id: 'blog_post_yearly',
    name: 'Post de blog (anual)',
    description: 'Post SEO mensual, facturado anual (cantidad variable).',
    amount: 3600,
    currency: 'eur',
    type: 'recurring',
    interval: 'year',
  },
  logo: {
    id: 'logo',
    name: 'Logo profesional',
    description: 'Logo adaptado a la identidad de tu marca.',
    amount: 3000,
    currency: 'eur',
    type: 'one_time',
  },
  seoHour: {
    id: 'seo_hour',
    name: 'Hora de SEO',
    description: 'Mejora SEO para web existente (cantidad variable de horas).',
    amount: 2500,
    currency: 'eur',
    type: 'one_time',
  },
} satisfies Record<string, CatalogItem>;

export type CatalogId = keyof typeof CATALOG;

/**
 * Helpers para resolver qué item del catálogo aplica según la cadencia
 * elegida en el paso 2 (mensual / anual).
 */
export function pickHosting(cadence: Cadence): CatalogItem {
  return cadence === 'yearly' ? CATALOG.hostingYearly : CATALOG.hostingMonthly;
}

export function pickTienda(cadence: Cadence): CatalogItem {
  return cadence === 'yearly' ? CATALOG.tiendaYearlyWithHosting : CATALOG.tiendaMonthly;
}

export function pickSocial(cadence: Cadence): CatalogItem {
  return cadence === 'yearly' ? CATALOG.socialMediaYearly : CATALOG.socialMedia;
}

export function pickAiWeb(cadence: Cadence): CatalogItem {
  return cadence === 'yearly' ? CATALOG.aiWebYearly : CATALOG.aiWeb;
}

export function pickAiPhone(cadence: Cadence): CatalogItem {
  return cadence === 'yearly' ? CATALOG.aiPhoneYearly : CATALOG.aiPhone;
}

export function pickBlogPost(cadence: Cadence): CatalogItem {
  return cadence === 'yearly' ? CATALOG.blogPostYearly : CATALOG.blogPost;
}

export function pickWebCreation(over8: boolean): CatalogItem {
  return over8 ? CATALOG.webCreationGt8 : CATALOG.webCreationLe8;
}

/** Formatea céntimos como "1.234,56 €". */
export function formatEUR(cents: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
