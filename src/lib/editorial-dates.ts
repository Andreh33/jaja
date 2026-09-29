import { createHash } from 'node:crypto';
import updates from '@/content/editorial-updates.json';

/** A reviewed date applies only while the corresponding article body is actually published. */
export function editorialUpdate(post: { slug: string; content: string }): Date | undefined {
  const update = (updates as Record<string, { sha256: string; date: string }>)[post.slug];
  if (!update || createHash('sha256').update(post.content).digest('hex') !== update.sha256) return undefined;
  return new Date(`${update.date}T12:00:00Z`);
}
