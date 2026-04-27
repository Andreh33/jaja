import { db } from './db';
import { posts } from '../../drizzle/schema';
import { desc, eq } from 'drizzle-orm';

export async function getAllPosts() {
  return db.select().from(posts).where(eq(posts.published, true)).orderBy(desc(posts.publishedAt));
}

export async function getPostBySlug(slug: string) {
  const r = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
  return r[0] || null;
}
