import type { Client, Transaction } from '@libsql/client';
import { z } from 'zod';

export class QaInitializationError extends Error {
  constructor(public code: string, message: string) { super(message); }
}
export type QaTarget = {
  databaseName: string; expectedHost: string; databaseUrl: string; authToken: string; applyNewQaDatabase: boolean;
};

/** Fails before a client exists. No environment variables or implicit targets. */
export function validateQaTarget(target: QaTarget): { url: string; authToken: string } {
  if (target.applyNewQaDatabase !== true) throw new QaInitializationError('EXPLICIT_APPLY_REQUIRED', 'Pass --apply-new-qa-database only after authorization for this new QA resource.');
  if (!/^latech-qa-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(target.databaseName) || target.databaseName.length > 48) {
    throw new QaInitializationError('INVALID_QA_NAME', 'The database name must start with latech-qa- and identify the newly provisioned resource.');
  }
  let url: URL;
  try { url = new URL(target.databaseUrl); }
  catch { throw new QaInitializationError('INVALID_TARGET', 'The credentials file must contain a valid QA database URL.'); }
  const validHost = /^[a-z0-9]+(?:-[a-z0-9]+)*\.turso\.io$/;
  if (!validHost.test(target.expectedHost) || !target.expectedHost.startsWith(`${target.databaseName}-`)
    || url.protocol !== 'libsql:' || url.hostname !== target.expectedHost || url.port || url.username || url.password
    || (url.pathname !== '' && url.pathname !== '/') || url.search || url.hash) {
    throw new QaInitializationError('TARGET_MISMATCH', 'The URL must match the explicit host of the new latech-qa- Turso resource, without credentials, port, query or extra path.');
  }
  if (typeof target.authToken !== 'string' || target.authToken.length < 20 || target.authToken.length > 8192 || /\s/.test(target.authToken)) {
    throw new QaInitializationError('INVALID_CREDENTIAL', 'A nonempty QA database token is required in the private credentials file.');
  }
  return { url: url.href, authToken: target.authToken };
}

const publicPostSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(200),
  title: z.string().min(1).max(500), content: z.string().min(1).max(2_000_000),
  excerpt: z.string().max(5000).optional(), cover: z.string().max(2000).optional(),
  category: z.string().max(120).optional(), author: z.string().max(120).optional(),
  readingMinutes: z.number().int().min(1).max(120).optional(),
}).strict();
export type QaPublicPost = z.infer<typeof publicPostSchema>;

/** Exported Drizzle DDL may create tables/indexes, never commit or mutate data. */
export function validateQaSchemaSql(sql: string): void {
  const withoutQuotedValues = sql.replace(/'(?:''|[^'])*'|"(?:""|[^"])*"|`(?:``|[^`])*`|--[^\n]*|\/\*[\s\S]*?\*\//g, ' ');
  const statements = withoutQuotedValues.split(';').map((statement) => statement.trim()).filter(Boolean);
  if (!statements.length || statements.some((statement) => !/^CREATE\s+(?:TABLE|(?:UNIQUE\s+)?INDEX)\s/i.test(statement))) {
    throw new QaInitializationError('UNSAFE_SCHEMA_SQL', 'Only CREATE TABLE/INDEX statements from the current Drizzle export are accepted.');
  }
}

type QaClient = Pick<Client, 'transaction' | 'close'>;
type QaConnector = (credentials: { url: string; authToken: string }) => QaClient;
const REQUIRED_TABLES = ['users', 'posts', 'orders', 'contact_messages', 'escape_runs', 'escape_results'];

/**
 * A write transaction locks before checking emptiness, so another initializer
 * cannot slip a schema or row between the check and the first CREATE.
 */
export async function initializeNewQaDatabase(
  target: QaTarget,
  schemaSql: string,
  inputPosts: readonly unknown[],
  connect: QaConnector,
  now = Date.now(),
) {
  const credentials = validateQaTarget(target);
  validateQaSchemaSql(schemaSql);
  const parsed = z.array(publicPostSchema).min(1).max(500).safeParse(inputPosts);
  if (!parsed.success || (parsed.success && new Set(parsed.data.map((post) => post.slug)).size !== parsed.data.length)) {
    throw new QaInitializationError('INVALID_PUBLIC_SEEDS', 'Public post seeds must be valid and have unique slugs. No connection was opened.');
  }
  const posts = parsed.data;
  const client = connect(credentials);
  let tx: Transaction | undefined;
  let phase: 'verification' | 'writing' | 'commit' = 'verification';
  try {
    tx = await client.transaction('write');
    const existing = await tx.execute("SELECT name FROM sqlite_schema WHERE name NOT LIKE 'sqlite_%' AND type IN ('table', 'view', 'trigger', 'index') LIMIT 1");
    if (existing.rows.length) throw new QaInitializationError('DATABASE_NOT_EMPTY', 'Refusing to initialize: the target already contains schema objects, even if its tables have no rows.');
    phase = 'writing';
    await tx.executeMultiple(schemaSql);
    const tables = await tx.execute("SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%'");
    const tableNames = new Set(tables.rows.map((row) => String(row.name)));
    if (!REQUIRED_TABLES.every((name) => tableNames.has(name))) throw new QaInitializationError('INCOMPLETE_SCHEMA', 'The export does not include the required application and ranking tables.');
    await tx.batch(posts.map((post) => ({
      sql: 'INSERT INTO posts (id, slug, title, excerpt, content, cover, category, author, published, published_at, reading_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)',
      args: [`qa-post-${post.slug}`, post.slug, post.title, post.excerpt ?? null, post.content, post.cover ?? null, post.category ?? null, post.author ?? 'Equipo Latech', Math.floor(now / 1000), post.readingMinutes ?? 5],
    })));
    const checks = await tx.batch([
      'SELECT COUNT(*) AS count FROM posts WHERE published = 1',
      'SELECT COUNT(*) AS count FROM users',
      'SELECT COUNT(*) AS count FROM orders',
      'SELECT COUNT(*) AS count FROM contact_messages',
    ]);
    if (Number(checks[0].rows[0]?.count) !== posts.length || checks.slice(1).some((check) => Number(check.rows[0]?.count) !== 0)) {
      throw new QaInitializationError('POSTCONDITION_FAILED', 'The initialized database does not match the expected public-post-only QA dataset.');
    }
    phase = 'commit';
    await tx.commit();
    return { tables: tableNames.size, publicPosts: posts.length, accountsCreated: 0 };
  } catch (error) {
    let rollbackUncertain = false;
    if (tx && !tx.closed) {
      try { await tx.rollback(); } catch { rollbackUncertain = true; }
    }
    if (phase === 'commit' || rollbackUncertain) {
      throw new QaInitializationError('COMMIT_STATUS_UNKNOWN', 'The transaction outcome is uncertain. Do not retry blindly; inspect only the new QA database schema/counts first.');
    }
    if (error instanceof QaInitializationError) throw error;
    throw new QaInitializationError('INITIALIZATION_FAILED', 'QA initialization failed before a confirmed commit. No credentials or server error details are logged; inspect the target before retrying.');
  } finally {
    tx?.close();
    client.close();
  }
}
