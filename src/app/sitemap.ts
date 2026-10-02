import type { MetadataRoute } from 'next';
import { MYSTERIES } from '@/lib/lab-mysteries';
import { experiments } from './lab/_lib/experiments';
import { inArray } from 'drizzle-orm';
import { getAllPosts } from '@/lib/posts';
import { editorialUpdate } from '@/lib/editorial-dates';
import { db } from '@/lib/db';
import { jobOffers } from '../../drizzle/schema';
import { allLandings } from '@/content/local';
import { uniqueCategories, categorySlug } from '@/lib/blog-categories';

// Fecha REAL de la última actualización estructural del sitio (páginas fijas y
// landings). Estable entre despliegues: solo se sube cuando de verdad cambian.
// Usar `new Date()` marcaba TODO como modificado en cada build — una señal de
// frescura falsa que Google acaba ignorando, perdiendo el valor del lastmod.
const SITE_LAST_UPDATE = new Date('2026-07-08');
const RELEASE_UPDATE = new Date('2026-10-02');
const UPDATED_ROUTES = new Set(['', '/blog', '/proyectos', '/contacto']);
const SEO_UPDATED_ROUTES = new Set(['/tienda', '/tienda/web', '/tienda/online', '/tienda/agente-ia']);
export const revalidate = 900;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://serviciosonlineweb.com';
  const fixed = [
    '', '/sobre-nosotros', '/blog', '/tienda', '/tienda/web', '/tienda/online', '/tienda/agente-ia', '/proyectos', '/empleo', '/contacto', '/cobertura', '/terminos', '/privacidad',
  ];
  const fixedEntries: MetadataRoute.Sitemap = fixed.map((p) => ({
    url: `${base}${p}`,
    lastModified: SEO_UPDATED_ROUTES.has(p) ? new Date('2026-10-02') : UPDATED_ROUTES.has(p) ? RELEASE_UPDATE : SITE_LAST_UPDATE,
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
      ...((editorialUpdate(p) ?? p.publishedAt) ? { lastModified: editorialUpdate(p) ?? new Date(p.publishedAt!) } : {}),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    // Hubs de categoría del blog: rutas rastreables reales (/blog/categoria/*)
    // que agrupan sus posts. La biblioteca cambió en esta entrega; una publicación
    // posterior también actualiza el hub.
    const summaries = posts;
    categoryEntries = uniqueCategories(summaries).map((c) => {
      const latest = summaries
        .filter((p) => p.category === c && (editorialUpdate(p) ?? p.publishedAt))
        .reduce<Date | null>((acc, p) => {
          const d = editorialUpdate(p) ?? new Date(p.publishedAt as Date);
          return !acc || d > acc ? d : acc;
        }, null);
      return {
        url: `${base}/blog/categoria/${categorySlug(c)}`,
        lastModified: latest && latest > RELEASE_UPDATE ? latest : RELEASE_UPDATE,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      };
    });
    const latestPost = postEntries.reduce<Date | undefined>((latest, entry) => {
      const date = entry.lastModified ? new Date(entry.lastModified) : undefined;
      return date && (!latest || date > latest) ? date : latest;
    }, undefined);
    const blog = fixedEntries.find(entry => entry.url === `${base}/blog`);
    if (blog && latestPost && latestPost > RELEASE_UPDATE) blog.lastModified = latestPost;
  } catch {
    // A failed regeneration must not replace the last good sitemap with missing posts.
    throw new Error('SITEMAP_POSTS_UNAVAILABLE');
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
    throw new Error('SITEMAP_OFFERS_UNAVAILABLE');
  }

  const labEntries: MetadataRoute.Sitemap = [
    '/lab', ...experiments.map((experiment) => `/lab/${experiment.slug}`),
    '/lab/misterios', ...MYSTERIES.map((episode) => `/lab/misterios/${episode.slug}`),
    '/lab/trazo', '/briefing',
  ].map((path) => ({ url: `${base}${path}`, lastModified: RELEASE_UPDATE, changeFrequency: 'monthly' as const, priority: .6 }));
  return [...fixedEntries, ...landingEntries, ...categoryEntries, ...postEntries, ...offerEntries, ...labEntries];
}
