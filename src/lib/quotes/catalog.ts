import { CATALOG, formatEUR } from '@/config/catalog';

/** Public quotation prices. Never used to charge or change existing subscriptions. */
export const QUOTE_CATALOG = {
  creation: { id: 'quote_web_creation', name: 'Creación de la web', amount: 60000 },
  maintenance: { id: 'quote_maintenance', name: 'Hosting y mantenimiento web', amount: 6000 },
  shop: { id: 'quote_shop', name: 'Tienda online', amount: 2000 },
  social: { id: 'quote_social', name: 'Gestión de redes sociales', amount: CATALOG.socialMedia.amount },
  aiWeb: { id: 'quote_ai_web', name: 'Agente IA en la web', amount: CATALOG.aiWeb.amount },
  aiPhone: { id: 'quote_ai_phone', name: 'Agente IA por teléfono', amount: CATALOG.aiPhone.amount },
  blogPost: { id: 'quote_blog_post', name: 'Artículo de blog al mes', amount: CATALOG.blogPost.amount },
  logo: { id: 'quote_logo', name: 'Diseño de logo', amount: CATALOG.logo.amount },
  seoHour: { id: 'quote_seo_hour', name: 'Hora de SEO', amount: CATALOG.seoHour.amount },
} as const;

export type QuoteItem = (typeof QUOTE_CATALOG)[keyof typeof QUOTE_CATALOG];
export const QUOTE_TAX_LABEL = 'IVA no incluido';
export const QUOTE_WHATSAPP_NUMBER = '34684739091';
export { formatEUR };
