import type { MetadataRoute } from 'next';
import { MYSTERIES } from '@/lib/lab-mysteries';
import { experiments } from './lab/_lib/experiments';
import { inArray } from 'drizzle-orm';
import { getAllPosts, getPostSummaries } from '@/lib/posts';
import { db } from '@/lib/db';
import { jobOffers } from '../../drizzle/schema';
import { allLandings } from '@/content/local';
import { uniqueCategories, categorySlug } from '@/lib/blog-categories';

// Fecha REAL de la última actualización estructural del sitio (páginas fijas y
// landings). Estable entre despliegues: solo se sube cuando de verdad cambian.
// Usar `new Date()` marcaba TODO como modificado en cada build — una señal de
// frescura falsa que Google acaba ignorando, perdiendo el valor del lastmod.
const SITE_LAST_UPDATE = new Date('2026-07-08');
const RELEASE_UPDATE = new Date('2026-09-10');
const UPDATED_ROUTES = new Set(['', '/blog', '/proyectos', '/contacto', '/tienda/calculadora']);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://serviciosonlineweb.com';
  const fixed = [
    '', '/sobre-nosotros', '/blog', '/tienda', '/tienda/web', '/tienda/online', '/tienda/agente-ia', '/tienda/calculadora', '/proyectos', '/empleo', '/contacto', '/cobertura', '/terminos', '/privacidad',
  ];
  const fixedEntries: MetadataRoute.Sitemap = fixed.map((p) => ({
    url: `${base}${p}`,
    lastModified: UPDATED_ROUTES.has(p) ? RELEASE_UPDATE : SITE_LAST_UPDATE,
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1.0 : 0.7,
  }));

  const landingEntries: MetadataRoute.Sitemap = allLandings().map((l) => ({
    url: `${base}/${l.service}/${l.citySlug}`,
    lastModified: new Date(l.updatedAt ?? SITE_LAST_UPDATE),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // No synthesize dates for legacy rows with an unknown publication date.
  let postEntries: MetadataRoute.Sitemap = [];
  let categoryEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await getAllPosts();
    postEntries = posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      ...(p.publishedAt ? { lastModified: new Date(p.publishedAt) } : {}),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    // Hubs de categoría del blog: rutas rastreables reales (/blog/categoria/*)
    // que agrupan sus posts. La biblioteca cambió en esta entrega; una publicación
    // posterior también actualiza el hub.
    const summaries = await getPostSummaries();
    categoryEntries = uniqueCategories(summaries).map((c) => {
      const latest = summaries
        .filter((p) => p.category === c && p.publishedAt)
        .reduce<Date | null>((acc, p) => {
          const d = new Date(p.publishedAt as Date);
          return !acc || d > acc ? d : acc;
        }, null);
      return {
        url: `${base}/blog/categoria/${categorySlug(c)}`,
        lastModified: latest && latest > RELEASE_UPDATE ? latest : RELEASE_UPDATE,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      };
    });
  } catch {
    // posts unavailable — continue with the rest
  }

  let offerEntries: MetadataRoute.Sitemap = [];
  try {
    const offers = await db
      .select()
      .from(jobOffers)
      .where(inArray(jobOffers.status, ['publicada', 'cerrada']));
    offerEntries = offers.map((o) => ({
      url: `${base}/empleo/${o.slug}`,
      ...(o.publishedAt ? { lastModified: new Date(o.publishedAt * 1000) } : {}),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch {
    // job_offers query failed — continue with the rest
  }

  const labEntries: MetadataRoute.Sitemap = [
    '/lab', ...experiments.map((experiment) => `/lab/${experiment.slug}`),
    '/lab/misterios', ...MYSTERIES.map((episode) => `/lab/misterios/${episode.slug}`),
    '/lab/trazo', '/briefing',
  ].map((path) => ({ url: `${base}${path}`, lastModified: RELEASE_UPDATE, changeFrequency: 'monthly' as const, priority: .6 }));
  return [...fixedEntries, ...landingEntries, ...categoryEntries, ...postEntries, ...offerEntries, ...labEntries];
}
