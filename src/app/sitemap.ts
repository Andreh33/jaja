import type { MetadataRoute } from 'next';
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://serviciosonlineweb.com';
  const fixed = [
    '', '/sobre-nosotros', '/blog', '/tienda', '/tienda/web', '/tienda/online', '/tienda/agente-ia', '/tienda/calculadora', '/proyectos', '/empleo', '/contacto', '/cobertura', '/terminos', '/privacidad',
  ];
  const fixedEntries: MetadataRoute.Sitemap = fixed.map((p) => ({
    url: `${base}${p}`,
    lastModified: SITE_LAST_UPDATE,
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1.0 : 0.7,
  }));

  const landingEntries: MetadataRoute.Sitemap = allLandings().map((l) => ({
    url: `${base}/${l.service}/${l.citySlug}`,
    lastModified: new Date(l.updatedAt ?? SITE_LAST_UPDATE),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // lastmod REAL por-URL en los posts: la fecha de publicación, no la de build.
  let postEntries: MetadataRoute.Sitemap = [];
  let categoryEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await getAllPosts();
    postEntries = posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.publishedAt ? new Date(p.publishedAt) : SITE_LAST_UPDATE,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    // Hubs de categoría del blog: rutas rastreables reales (/blog/categoria/*)
    // que agrupan sus posts. lastmod = post más reciente de la categoría.
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
        lastModified: latest ?? SITE_LAST_UPDATE,
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
      lastModified: o.publishedAt ? new Date(o.publishedAt * 1000) : SITE_LAST_UPDATE,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch {
    // job_offers query failed — continue with the rest
  }

  return [...fixedEntries, ...landingEntries, ...categoryEntries, ...postEntries, ...offerEntries];
}
