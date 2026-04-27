import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/posts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://latech.es';
  const fixed = [
    '', '/sobre-nosotros', '/blog', '/tienda', '/tienda/web', '/tienda/online', '/tienda/agente-ia', '/contacto', '/terminos', '/privacidad',
  ];
  const fixedEntries: MetadataRoute.Sitemap = fixed.map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1.0 : 0.7,
  }));
  try {
    const posts = await getAllPosts();
    const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
    return [...fixedEntries, ...postEntries];
  } catch {
    return fixedEntries;
  }
}
