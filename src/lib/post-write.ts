import { eq } from 'drizzle-orm';
import { posts } from '../../drizzle/schema';
import type { db } from './db';
import type { PostInput } from './post-validation';
import { resolvePostSlug, isSlugConflict } from './post-validation';
import { readingTime } from './utils';

type Database = Pick<typeof db, 'select' | 'insert' | 'update'>;
type WriteResult = { ok: true; id: string; slug: string; published: boolean; previousSlug?: string } | { ok: false; status: number; error: string };
export async function writePost(database: Database, data: PostInput, update = false): Promise<WriteResult> {
  const [previous] = update && data.id ? await database.select().from(posts).where(eq(posts.id, data.id)).limit(1) : [];
  if (update && !previous) return { ok: false, status: 404, error: 'Artículo no encontrado.' };
  const resolved = resolvePostSlug(data.title, data.slug, previous);
  if (resolved.error) return { ok: false, status: 400, error: resolved.error };
  const slug = resolved.slug!;
  const [collision] = await database.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug)).limit(1);
  if (collision && collision.id !== previous?.id) return { ok: false, status: 409, error: 'Esa URL ya pertenece a otro artículo. Elige una diferente.' };
  const published = data.published ?? previous?.published ?? false;
  const values = {
    slug, title: data.title, excerpt: data.excerpt || null, content: data.content,
    category: data.category || null, cover: data.cover || null,
    readingMinutes: readingTime(data.content), published,
    // Without publication history, an existing NULL may belong to a previously published article.
    // Preserve unknown dates instead of inventing a date during a later publication.
    publishedAt: previous
      ? previous.publishedAt
      : published ? new Date() : null,
  };
  try {
    if (previous) {
      const [updated] = await database.update(posts).set(values).where(eq(posts.id, previous.id)).returning({ id: posts.id });
      if (!updated) return { ok: false, status: 404, error: 'El artículo ya no existe. Tu contenido sigue en el editor.' };
      return { ok: true, id: previous.id, slug, published, previousSlug: previous.slug };
    }
    const [created] = await database.insert(posts).values({ ...values, author: 'Equipo Latech' }).returning({ id: posts.id });
    return { ok: true, id: created.id, slug, published };
  } catch (error) {
    if (isSlugConflict(error)) return { ok: false, status: 409, error: 'Esa URL acaba de usarse en otro artículo. Elige una diferente.' };
    return { ok: false, status: 500, error: 'No se pudo guardar el artículo. Tu contenido sigue en el editor.' };
  }
}
