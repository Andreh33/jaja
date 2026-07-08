import { slugify } from './slug';
import type { PostSummary } from './posts';

/** Slug de URL para una categoría del blog ('Diseño Web' -> 'diseno-web'). */
export function categorySlug(category: string): string {
  return slugify(category);
}

/** Categorías únicas (con posts publicados), en orden estable. */
export function uniqueCategories(posts: PostSummary[]): string[] {
  return Array.from(new Set(posts.map((p) => p.category).filter(Boolean) as string[]));
}

/** Resuelve el nombre real de la categoría a partir de su slug de URL. */
export function categoryFromSlug(posts: PostSummary[], slug: string): string | undefined {
  return uniqueCategories(posts).find((c) => categorySlug(c) === slug);
}

/** Descripciones para las páginas hub de categoría (meta + intro). */
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'Diseño Web':
    'Guías de diseño web para pymes: qué contratar, cuánto cuesta, errores que espantan clientes y cómo tener una web que convierte.',
  'Tiendas Online':
    'Todo sobre e-commerce para pymes: montar tu tienda online, pasarelas de pago, logística y cómo vender más sin depender de marketplaces.',
  IA: 'Agentes de IA y automatización con n8n para pymes: recepcionistas virtuales, chatbots, flujos de trabajo y casos reales.',
  SEO: 'SEO local y técnico explicado para negocios: aparecer en Google, Search Console, palabras clave y posicionamiento que trae clientes.',
  Tutoriales:
    'Tutoriales paso a paso sobre webs, dominios, herramientas y tecnología aplicada a tu negocio.',
};
