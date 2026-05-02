/**
 * ASCII slug a partir de texto libre. Para URLs públicas tipo
 * /empleo/[slug]. Idempotente (slugify(slugify(x)) === slugify(x)).
 *
 * Reglas:
 *   - lowercase
 *   - quita acentos (NFD + drop combining marks)
 *   - cualquier secuencia de non-alphanum → un único guion
 *   - recorta guiones inicio/final
 *   - trunca a 80 chars (suficiente para SEO, evita slugs gigantes)
 */
export function slugify(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/^-+|-+$/g, '');
}
