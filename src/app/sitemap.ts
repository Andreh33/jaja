import type { MetadataRoute } from 'next';
import { inArray } from 'drizzle-orm';
import { getAllPosts } from '@/lib/posts';
import { db } from '@/lib/db';
import { jobOffers } from '../../drizzle/schema';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://serviciosonlineweb.com';
  const fixed = [
    '', '/sobre-nosotros', '/blog', '/tienda', '/tienda/web', '/tienda/online', '/tienda/agente-ia', '/proyectos', '/empleo', '/contacto', '/terminos', '/privacidad',
  ];
  const fixedEntries: MetadataRoute.Sitemap = fixed.map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1.0 : 0.7,
  }));

  let postEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await getAllPosts();
    postEntries = posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
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
      lastModified: o.publishedAt ? new Date(o.publishedAt * 1000) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch {
    // job_offers query failed — continue with the rest
  }

  return [...fixedEntries, ...postEntries, ...offerEntries];
}
