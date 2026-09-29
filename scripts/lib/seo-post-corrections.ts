import { createHash } from 'node:crypto';
import type { Client } from '@libsql/client';

export type PostCorrection = { slug: string; beforeSha256: string; content: string };
export const contentHash = (content: string) => createHash('sha256').update(content).digest('hex');

/** Only published article bodies change. IDs, slugs, authors and publication dates stay intact. */
export async function correctSeoPosts(client: Client, corrections: PostCorrection[], apply = false) {
  if (!corrections.length || new Set(corrections.map(p => p.slug)).size !== corrections.length) {
    throw new Error('INVALID_CORRECTION_SET');
  }
  const tx = await client.transaction(apply ? 'write' : 'read');
  try {
    const updates: { correction: PostCorrection; before: string }[] = [];
    for (const correction of corrections) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(correction.slug) || !/^[a-f0-9]{64}$/.test(correction.beforeSha256) || correction.content.length < 100) {
        throw new Error('INVALID_CORRECTION');
      }
      const result = await tx.execute({ sql: 'SELECT content FROM posts WHERE slug = ? AND published = 1', args: [correction.slug] });
      if (result.rows.length !== 1) throw new Error(`PUBLISHED_POST_MISSING:${correction.slug}`);
      const before = String(result.rows[0].content);
      if (before === correction.content) continue;
      if (contentHash(before) !== correction.beforeSha256) throw new Error(`CONTENT_CHANGED:${correction.slug}`);
      updates.push({ correction, before });
    }
    if (apply) {
      for (const { correction, before } of updates) {
        const result = await tx.execute({
          sql: 'UPDATE posts SET content = ?, reading_minutes = ? WHERE slug = ? AND published = 1 AND content = ?',
          args: [correction.content, Math.max(1, Math.ceil(correction.content.trim().split(/\s+/).length / 200)), correction.slug, before],
        });
        if (result.rowsAffected !== 1) throw new Error(`CONCURRENT_EDIT:${correction.slug}`);
      }
      await tx.commit();
    } else {
      await tx.rollback();
    }
    return { status: apply ? 'applied' : 'plan-no-writes', changed: updates.map(p => p.correction.slug), alreadyCurrent: corrections.length - updates.length };
  } catch (error) {
    await tx.rollback();
    throw error;
  } finally {
    tx.close();
  }
}
