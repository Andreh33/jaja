import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Client, Transaction } from '@libsql/client';
import { z } from 'zod';
import { loadEditorialPreview } from './editorial-preview';
import { publicQaPosts } from './public-qa-posts';

const editableKeys = ['title', 'excerpt', 'content', 'category', 'readingMinutes'] as const;
const digestSchema = z.string().regex(/^[a-f0-9]{64}$/);
const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160);
const rowSchema = z.object({
  id: z.string().min(1), slug: slugSchema, title: z.string(), excerpt: z.string().nullable(),
  content: z.string(), cover: z.string().nullable(), category: z.string().nullable(), author: z.string().nullable(),
  published: z.number().int(), publishedAt: z.number().int().nullable(), readingMinutes: z.number().int().nullable(),
}).strict();
export type EditorialRow = z.infer<typeof rowSchema>;
type EditablePost = Omit<EditorialRow, 'id' | 'published' | 'publishedAt'>;
const manifestSchema = z.object({
  version: z.literal(1), auditedAt: z.literal('2026-09-10'), approvedPackageSha256: digestSchema,
  baseline: z.array(z.object({
    slug: slugSchema, fields: z.object({ title: digestSchema, excerpt: digestSchema, content: digestSchema, category: digestSchema, readingMinutes: digestSchema }).strict(),
    auditHtmlSha256: digestSchema, renderedBodySha256: digestSchema,
  }).strict()).length(8),
}).strict();
export type EditorialPackage = {
  digest: string; baselineDigest: string; updates: EditablePost[]; additions: EditablePost[];
  baseline: z.infer<typeof manifestSchema>['baseline'];
};
const snapshotSchema = z.object({
  version: z.literal(1), createdAt: z.string().datetime(), targetDigest: digestSchema,
  packageDigest: digestSchema, baselineDigest: digestSchema, rows: z.array(rowSchema).length(8),
}).strict();
export type EditorialSnapshot = z.infer<typeof snapshotSchema>;
export type EditorialReceipt = {
  version: 1; status: 'prepared-before-write'; snapshotDigest: string; targetDigest: string; packageDigest: string;
  preparedAt: string; expectedRows: EditorialRow[]; affectedPaths: string[];
};
type DbReader = Pick<Client, 'execute'> | Pick<Transaction, 'execute'>;
export class EditorialPublicationError extends Error {
  constructor(public code: string, public conflicts: { slug: string; fields: string[] }[] = []) { super(code); }
}
export const editorialDigest = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const fail = (code: string, conflicts?: EditorialPublicationError['conflicts']): never => { throw new EditorialPublicationError(code, conflicts); };
const sortRows = <T extends { slug: string }>(rows: T[]) => [...rows].sort((a, b) => a.slug.localeCompare(b.slug));

/** Explicit credentials only; inherited environment and masked Vercel values are not accepted. */
export function validateEditorialTarget(values: Record<string, string>, expectedHost: string) {
  if (Object.keys(values).length !== 2 || !Object.hasOwn(values, 'TURSO_DATABASE_URL') || !Object.hasOwn(values, 'TURSO_AUTH_TOKEN')) fail('CREDENTIAL_KEYS_MISMATCH');
  let url: URL;
  try { url = new URL(values.TURSO_DATABASE_URL); } catch { return fail('INVALID_DATABASE_TARGET'); }
  if (!/^[a-z0-9.-]+\.turso\.io$/.test(expectedHost) || url.protocol !== 'libsql:' || url.hostname !== expectedHost
    || url.port || url.username || url.password || (url.pathname !== '' && url.pathname !== '/') || url.search || url.hash) fail('DATABASE_HOST_MISMATCH');
  const authToken = values.TURSO_AUTH_TOKEN;
  if (authToken.length < 20 || authToken.length > 8192 || /\s|\[|\]|<|>/.test(authToken) || /sensitive|redacted|placeholder/i.test(authToken)) fail('INVALID_DATABASE_CREDENTIAL');
  return { url: url.href, authToken };
}

/** Fixed, audited package only. Never returns the other 68 historical articles. */
export function loadEditorialPublication(projectRoot: string): EditorialPackage {
  const manifest = manifestSchema.parse(JSON.parse(readFileSync(join(projectRoot, 'docs/editorial/publication-manifest.json'), 'utf8')));
  const source = new Map(publicQaPosts.map(post => [post.slug, post]));
  const transformed = loadEditorialPreview(publicQaPosts, projectRoot);
  const selected = transformed.filter(post => !source.has(post.slug) || source.get(post.slug)!.content !== post.content);
  const normalized = sortRows(selected.map(post => ({
    slug: post.slug, title: post.title, excerpt: post.excerpt ?? null, content: post.content, category: post.category ?? null,
    readingMinutes: post.readingMinutes ?? null, author: post.author ?? null, cover: post.cover ?? null,
  })));
  if (editorialDigest(normalized) !== manifest.approvedPackageSha256) fail('APPROVED_PACKAGE_CHANGED');
  const updateSlugs = new Set(manifest.baseline.map(entry => entry.slug));
  if (updateSlugs.size !== 8) fail('INVALID_BASELINE');
  for (const baseline of manifest.baseline) {
    const historical = source.get(baseline.slug);
    if (!historical || editableKeys.some(key => editorialDigest(historical[key] ?? null) !== baseline.fields[key])) fail('HISTORICAL_BASELINE_CHANGED');
  }
  const updates = normalized.filter(post => updateSlugs.has(post.slug));
  const additions = normalized.filter(post => !source.has(post.slug));
  if (updates.length !== 8 || additions.length !== 6 || normalized.length !== 14) fail('INVALID_APPROVED_SCOPE');
  return { digest: manifest.approvedPackageSha256, baselineDigest: editorialDigest(manifest.baseline), updates, additions, baseline: manifest.baseline };
}

const columns = 'id, slug, title, excerpt, content, cover, category, author, published, published_at AS publishedAt, reading_minutes AS readingMinutes';
async function readSelected(db: DbReader, bundle: EditorialPackage): Promise<EditorialRow[]> {
  const slugs = [...bundle.updates, ...bundle.additions].map(post => post.slug);
  const result = await db.execute({ sql: `SELECT ${columns} FROM posts WHERE slug IN (${slugs.map(() => '?').join(',')})`, args: slugs });
  const rows = result.rows.map(row => rowSchema.parse(Object.fromEntries(Object.keys(rowSchema.shape).map(key => [key, row[key]]))));
  if (new Set(rows.map(row => row.slug)).size !== rows.length) fail('DUPLICATE_DATABASE_SLUG');
  return sortRows(rows);
}
function validateBaseline(rows: EditorialRow[], bundle: EditorialPackage): void {
  const bySlug = new Map(rows.map(row => [row.slug, row]));
  const conflicts: EditorialPublicationError['conflicts'] = [];
  for (const expected of bundle.baseline) {
    const current = bySlug.get(expected.slug);
    const fields = !current ? ['missing'] : [
      ...(current.published === 1 ? [] : ['published']),
      ...editableKeys.filter(key => editorialDigest(current[key]) !== expected.fields[key]),
    ];
    if (fields.length) conflicts.push({ slug: expected.slug, fields });
  }
  for (const post of bundle.additions) if (bySlug.has(post.slug)) conflicts.push({ slug: post.slug, fields: ['new-slug-collision'] });
  if (conflicts.length) fail('BASELINE_CONFLICT', conflicts);
}
export async function planEditorialPublication(db: DbReader, bundle: EditorialPackage, targetDigest: string): Promise<EditorialSnapshot> {
  digestSchema.parse(targetDigest);
  const rows = await readSelected(db, bundle);
  validateBaseline(rows, bundle);
  return { version: 1, createdAt: new Date().toISOString(), targetDigest, packageDigest: bundle.digest, baselineDigest: bundle.baselineDigest, rows };
}
function validateSnapshot(input: unknown, bundle: EditorialPackage, targetDigest: string) {
  const parsed = snapshotSchema.safeParse(input);
  if (!parsed.success) return fail('INVALID_SNAPSHOT');
  const snapshot = parsed.data;
  if (snapshot.targetDigest !== targetDigest) fail('TARGET_CHANGED');
  if (snapshot.packageDigest !== bundle.digest || snapshot.baselineDigest !== bundle.baselineDigest) fail('PACKAGE_CHANGED_SINCE_PLAN');
  validateBaseline(snapshot.rows, bundle);
  return snapshot;
}
export function editorialAffectedPaths(bundle: EditorialPackage) {
  return ['/blog', '/blog/[slug]', '/blog/categoria/[categoria]', '/sitemap.xml',
    ...[...bundle.updates, ...bundle.additions].flatMap(post => [`/blog/${post.slug}`, `/blog/${post.slug}/opengraph-image`])];
}

/** Acquires the write lock before rechecking all 14 destinations. No partial import. */
export async function applyEditorialPublication(
  client: Pick<Client, 'transaction'>, bundle: EditorialPackage, input: unknown, targetDigest: string,
  persistReceipt: (receipt: EditorialReceipt) => void,
): Promise<EditorialReceipt> {
  const snapshot = validateSnapshot(input, bundle, targetDigest);
  let tx: Transaction | undefined;
  let phase: 'verification' | 'writing' | 'commit' = 'verification';
  try {
    tx = await client.transaction('write');
    const current = await readSelected(tx, bundle);
    if (editorialDigest(current) !== editorialDigest(sortRows(snapshot.rows))) fail('DATABASE_CHANGED_SINCE_PLAN');
    const triggers = await tx.execute("SELECT name FROM sqlite_master WHERE type = 'trigger' AND tbl_name = 'posts'");
    if (triggers.rows.length) fail('UNREVIEWED_POST_TRIGGERS');
    const now = new Date();
    const bySlug = new Map(current.map(row => [row.slug, row]));
    const expectedRows = sortRows([
      ...bundle.updates.map(post => {
        const old = bySlug.get(post.slug)!;
        return { ...old, ...Object.fromEntries(editableKeys.map(key => [key, post[key]])) } as EditorialRow;
      }),
      ...bundle.additions.map(post => ({ ...post, id: randomUUID(), published: 1, publishedAt: Math.floor(now.getTime() / 1000) })),
    ].map(row => rowSchema.parse(row)));
    const receipt: EditorialReceipt = {
      version: 1, status: 'prepared-before-write', snapshotDigest: editorialDigest(snapshot), targetDigest, packageDigest: bundle.digest,
      preparedAt: now.toISOString(), expectedRows, affectedPaths: editorialAffectedPaths(bundle),
    };
    // A durable receipt makes an uncertain COMMIT verifiable without retrying inserts.
    persistReceipt(receipt);
    phase = 'writing';
    for (const post of bundle.updates) {
      const old = bySlug.get(post.slug)!;
      const result = await tx.execute({
        sql: 'UPDATE posts SET title=?, excerpt=?, content=?, category=?, reading_minutes=? WHERE id=? AND slug=?',
        args: [post.title, post.excerpt, post.content, post.category, post.readingMinutes, old.id, old.slug],
      });
      if (result.rowsAffected !== 1) fail('UPDATE_COUNT_MISMATCH');
    }
    for (const post of expectedRows.filter(row => !bySlug.has(row.slug))) {
      const result = await tx.execute({
        sql: 'INSERT INTO posts (id,slug,title,excerpt,content,cover,category,author,published,published_at,reading_minutes) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        args: [post.id,post.slug,post.title,post.excerpt,post.content,post.cover,post.category,post.author,post.published,post.publishedAt,post.readingMinutes],
      });
      if (result.rowsAffected !== 1) fail('INSERT_COUNT_MISMATCH');
    }
    if (editorialDigest(await readSelected(tx, bundle)) !== editorialDigest(expectedRows)) fail('POST_WRITE_MISMATCH');
    phase = 'commit';
    await tx.commit();
    return receipt;
  } catch (error) {
    if (tx && !tx.closed) await tx.rollback().catch(() => {});
    if (phase === 'commit') return fail('COMMIT_UNCERTAIN_VERIFY_RECEIPT');
    if (error instanceof EditorialPublicationError) throw error;
    return fail(phase === 'writing' ? 'WRITE_ABORTED' : 'VERIFICATION_ABORTED');
  } finally { tx?.close(); }
}

export async function verifyEditorialReceipt(db: DbReader, bundle: EditorialPackage, receipt: EditorialReceipt, targetDigest: string) {
  if (receipt.version !== 1 || receipt.targetDigest !== targetDigest || receipt.packageDigest !== bundle.digest) fail('RECEIPT_TARGET_OR_PACKAGE_MISMATCH');
  const expected = z.array(rowSchema).length(14).parse(receipt.expectedRows);
  const actual = await readSelected(db, bundle);
  return editorialDigest(actual) === editorialDigest(sortRows(expected));
}
