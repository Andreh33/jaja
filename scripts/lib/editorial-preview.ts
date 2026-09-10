import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { QaPublicPost } from './qa-database-initializer';

const CATEGORIES = new Set(['Diseño Web', 'Tiendas Online', 'IA', 'SEO', 'Tutoriales']);
const KEYS = new Set(['tipo', 'estado', 'slug', 'slug_propuesto', 'titulo', 'descripcion', 'categoria', 'fuentes_revisadas']);
const GROUPS = { actualizaciones: ['actualizacion', 8], nuevos: ['nuevo', 4], casos: ['caso_propio', 2] } as const;
const START = '<!-- CUERPO -->';
const END = '<!-- FIN_CUERPO -->';
const fail = (message: string): never => { throw new Error(`Editorial preview: ${message}`); };
export type EditorialPiece = { kind: 'actualizacion' | 'nuevo' | 'caso_propio'; post: QaPublicPost };

/** Reads this package's small, single-line metadata format. It does not execute YAML or Markdown. */
export function parseEditorialPiece(source: string, name = 'document'): EditorialPiece {
  if (source.length > 100_000) fail(`${name}: document exceeds the allowed size.`);
  const text = source.replace(/\r\n/g, '\n');
  const match = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(text);
  if (!match) fail(`${name}: missing metadata block.`);
  const fields: Record<string, string> = Object.create(null);
  for (const line of match![1].split('\n')) {
    const entry = /^([a-z_]+): ([^\n]+)$/.exec(line);
    if (!entry || !KEYS.has(entry[1]) || Object.hasOwn(fields, entry[1])) fail(`${name}: unsupported or repeated metadata key.`);
    const value = entry![2].trim();
    if (!value || /[\u0000-\u001f\u007f]/.test(value)) fail(`${name}: invalid metadata value.`);
    fields[entry![1]] = value;
  }
  const kind = fields.tipo;
  if (!['actualizacion', 'nuevo', 'caso_propio'].includes(kind)) fail(`${name}: unknown piece type.`);
  if (fields.estado !== 'borrador_local_no_publicado') fail(`${name}: expected an unpublished local draft.`);
  const slug = kind === 'actualizacion' ? fields.slug : fields.slug_propuesto;
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 160) fail(`${name}: invalid slug.`);
  if (kind === 'actualizacion' ? fields.slug_propuesto : fields.slug) fail(`${name}: mixed existing and proposed slug.`);
  if (!fields.titulo || fields.titulo.length > 180 || !fields.descripcion || fields.descripcion.length > 600) fail(`${name}: invalid title or description.`);
  if (!CATEGORIES.has(fields.categoria)) fail(`${name}: unknown category.`);
  if (fields.fuentes_revisadas && !/^\d{4}-\d{2}-\d{2}$/.test(fields.fuentes_revisadas)) fail(`${name}: invalid source review date.`);
  if (text.split(START).length !== 2 || text.split(END).length !== 2) fail(`${name}: expected one pair of body markers.`);
  const start = text.indexOf(START), end = text.indexOf(END);
  if (start < match![0].length || end <= start) fail(`${name}: body markers out of order.`);
  const rawBody = text.slice(start + START.length, end).trim();
  const firstHeading = /^# ([^\n]+)(?:\n|$)/.exec(rawBody);
  if (!firstHeading || firstHeading[1] !== fields.titulo) fail(`${name}: body title must match metadata.`);
  const content = rawBody.slice(firstHeading![0].length).trim();
  if (content.length < 100 || /^(?:---|tipo:|estado:|Nota editorial:|# )/m.test(content)) fail(`${name}: invalid body or leaked editorial metadata.`);
  return {
    kind: kind as EditorialPiece['kind'],
    post: { slug, title: fields.titulo, excerpt: fields.descripcion, category: fields.categoria, content, author: 'Latech', readingMinutes: Math.max(1, Math.ceil(content.split(/\s+/).length / 200)) },
  };
}

/** Opt-in fixture transformation only. No environment loading, DB access, dates or publication actions. */
export function loadEditorialPreview(basePosts: QaPublicPost[], projectRoot: string): QaPublicPost[] {
  const baseSlugs = new Set(basePosts.map(post => post.slug));
  if (basePosts.length !== 76 || baseSlugs.size !== 76) fail('expected 76 unique historical posts.');
  const pieces: EditorialPiece[] = [];
  for (const [directory, [kind, count]] of Object.entries(GROUPS)) {
    const folder = join(projectRoot, 'docs', 'editorial', directory);
    const files = readdirSync(folder, { withFileTypes: true }).filter(entry => entry.isFile() && entry.name.endsWith('.md')).sort((a, b) => a.name.localeCompare(b.name));
    if (files.length !== count) fail(`${directory}: expected ${count} Markdown documents.`);
    for (const file of files) {
      const piece = parseEditorialPiece(readFileSync(join(folder, file.name), 'utf8'), `${directory}/${file.name}`);
      if (piece.kind !== kind) fail(`${directory}/${file.name}: piece type does not match its directory.`);
      pieces.push(piece);
    }
  }
  const unique = new Set<string>();
  const replacements = new Map<string, QaPublicPost>();
  const additions: QaPublicPost[] = [];
  for (const piece of pieces) {
    const { slug } = piece.post;
    if (unique.has(slug)) fail('duplicate editorial slug.');
    unique.add(slug);
    if (piece.kind === 'actualizacion') {
      if (!baseSlugs.has(slug)) fail(`replacement URL missing from the historical fixture: ${slug}.`);
      replacements.set(slug, piece.post);
    } else {
      if (baseSlugs.has(slug)) fail(`new slug collides with a historical URL: ${slug}.`);
      additions.push(piece.post);
    }
  }
  if (replacements.size !== 8 || additions.length !== 6) fail('expected eight replacements and six additions.');
  return [...basePosts.map(post => {
    const replacement = replacements.get(post.slug);
    return replacement ? { ...post, ...replacement, author: post.author ?? replacement.author } : { ...post };
  }), ...additions];
}
