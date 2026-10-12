import { db } from './db';
import { posts } from '../../drizzle/schema';
import { desc, eq } from 'drizzle-orm';
import { findPublishedPostBySlug } from './post-queries';
import { octoberArticles } from '../content/editorial-october-2026';

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
  const existing = await db.select().from(posts).where(eq(posts.published, true)).orderBy(desc(posts.publishedAt));
  return [...existing, ...octoberArticles.filter(p => !existing.some(row => row.slug === p.slug))]
    .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
}

export async function getPostSummaries(): Promise<PostSummary[]> {
  const existing = await db
    .select(SUMMARY_COLUMNS)
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.publishedAt));
  const additions: PostSummary[] = octoberArticles
    .filter(p => !existing.some(row => row.slug === p.slug))
    .map(({ id, slug, title, excerpt, cover, category, author, publishedAt, readingMinutes }) =>
      ({ id, slug, title, excerpt, cover, category, author, publishedAt, readingMinutes }));
  return [...existing, ...additions]
    .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
}

export async function getPostBySlug(slug: string) {
  const existing = await findPublishedPostBySlug(db, slug);
  return existing ?? octoberArticles.find(post => post.slug === slug) ?? null;
}
