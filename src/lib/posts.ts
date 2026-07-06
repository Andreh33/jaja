import { db } from './db';
import { posts } from '../../drizzle/schema';
import { desc, eq } from 'drizzle-orm';

/**
 * Campos necesarios para listados y tarjetas (sin `content`).
 * Evita serializar el markdown completo de todos los posts en el HTML
 * del listado del blog (~870 KB → ~60 KB).
 */
const SUMMARY_COLUMNS = {
  id: posts.id,
  slug: posts.slug,
  title: posts.title,
  excerpt: posts.excerpt,
  cover: posts.cover,
  category: posts.category,
  author: posts.author,
  publishedAt: posts.publishedAt,
  readingMinutes: posts.readingMinutes,
} as const;

export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover: string | null;
  category: string | null;
  author: string | null;
  publishedAt: Date | null;
  readingMinutes: number | null;
};

export async function getAllPosts() {
  return db.select().from(posts).where(eq(posts.published, true)).orderBy(desc(posts.publishedAt));
}

export async function getPostSummaries(): Promise<PostSummary[]> {
  return db
    .select(SUMMARY_COLUMNS)
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.publishedAt));
}

export async function getPostBySlug(slug: string) {
  const r = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
  return r[0] || null;
}
