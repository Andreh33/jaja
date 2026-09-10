import { and, eq } from 'drizzle-orm';
import { posts } from '../../drizzle/schema';
import type { db } from './db';

// This public query is also used by metadata and OG images. Admin preview
// must use a separate, authenticated query, never a public flag or query param.
export async function findPublishedPostBySlug(database: Pick<typeof db, 'select'>, slug: string) {
  const result = await database.select().from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.published, true)))
    .limit(1);
  return result[0] ?? null;
}
