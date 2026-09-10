import { z } from 'zod';
import { slugify } from './slug';
import { isSafeContentUrl } from './content-url';

export const postInputSchema = z.object({
  id: z.string().max(100).optional(),
  slug: z.string().max(160).optional(),
  title: z.string().trim().min(2).max(180),
  excerpt: z.string().trim().max(600).optional(),
  content: z.string().min(10).max(200000),
  category: z.string().trim().max(80).optional(),
  cover: z.string().max(2000).refine(value => !value || isSafeContentUrl(value, true), 'La portada debe ser una URL HTTPS o una ruta del sitio.').optional(),
  published: z.boolean().optional(),
});
export type PostInput = z.infer<typeof postInputSchema>;
export function resolvePostSlug(title: string, requested: string | undefined, previous?: { slug: string; published: boolean | null; publishedAt: Date | null }): { slug: string; error?: never } | { error: string; slug?: never } {
  if (previous) {
    if (requested !== undefined && requested !== previous.slug) return { error: 'Esta URL ya está guardada. Consérvala para no romper enlaces; un cambio necesita una redirección planificada.' };
    return { slug: previous.slug };
  }
  const slug = slugify(requested?.trim() || title);
  return slug ? { slug } : { error: 'Escribe una URL con letras o números.' };
}
export function isSlugConflict(error: unknown, depth = 0): boolean {
  if (!error || typeof error !== 'object' || depth > 3) return false;
  const value = error as { message?: unknown; cause?: unknown };
  return (typeof value.message === 'string' && /unique constraint failed:\s*posts\.slug/i.test(value.message)) || isSlugConflict(value.cause, depth + 1);
}
