/** Reproducible QA database. Never reads credentials or connects to Turso. */
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { posts } from '../drizzle/schema';
import { publicQaPosts } from './lib/public-qa-posts';
import { loadEditorialPreview } from './lib/editorial-preview';

async function main() {
  const { values } = parseArgs({ options: { 'editorial-preview': { type: 'boolean', default: false }, help: { type: 'boolean', default: false } }, allowPositionals: false, strict: true });
  if (values.help) {
    console.log('Local file-only QA fixture: 76 historical public posts by default. Optional --editorial-preview applies 8 editorial replacements and 6 additions to .local/qa.db only. Existing dates are preserved; no customer accounts or external services.');
    return;
  }
  const selectedPosts = values['editorial-preview'] ? loadEditorialPreview(publicQaPosts, process.cwd()) : publicQaPosts;
  const historical = new Map(publicQaPosts.map(post => [post.slug, post]));
  const changedSlugs = new Set(selectedPosts.filter(post => JSON.stringify(post) !== JSON.stringify(historical.get(post.slug))).map(post => post.slug));
  const directory = resolve('.local');
  mkdirSync(directory, { recursive: true });
  const databasePath = resolve(directory, 'qa.db');
  const fresh = !existsSync(databasePath);
  const client = createClient({ url: `file:${databasePath}` });
  try {
    if (fresh) {
      const sql = execFileSync(process.execPath, [
        'node_modules/drizzle-kit/bin.cjs', 'export', '--dialect', 'sqlite', '--schema', './drizzle/schema.ts',
      ], { encoding: 'utf8' });
      await client.executeMultiple(sql);
    }
    const database = drizzle(client);
    for (const post of selectedPosts) {
      const insert = database.insert(posts).values({
        ...post, id: `qa-${post.slug}`, published: true,
        // New unpublished editorial previews have no historical publication date.
        publishedAt: historical.has(post.slug) ? new Date('2026-07-01T12:00:00Z') : null,
      });
      if (values['editorial-preview'] && changedSlugs.has(post.slug)) {
        // Only the 14 opted-in pieces are updated. Never overwrite ID/date or
        // other historical posts, and never turn a normal prepare into a reset.
        await insert.onConflictDoUpdate({ target: posts.slug, set: { ...post, published: true } });
      } else {
        await insert.onConflictDoNothing();
      }
    }
    await database.insert(posts).values({
      id: 'qa-private-draft', slug: 'qa-private-draft', title: 'QA private draft',
      content: 'This unpublished fixture must never appear publicly.', published: false,
    }).onConflictDoNothing();
    // Do not overwrite an existing developer configuration.
    if (!existsSync('.env.local')) {
      writeFileSync('.env.local', [
        `TURSO_DATABASE_URL=file:${databasePath}`,
        'TURSO_AUTH_TOKEN=',
        'AUTH_SECRET=local-qa-only-not-a-production-secret-2026',
        'AUTH_TRUST_HOST=true',
        'NEXTAUTH_URL=http://localhost:3010',
        'NEXT_PUBLIC_APP_URL=http://localhost:3010',
        'NEXT_PUBLIC_WHATSAPP_NUMBER=34684739091',
        'WHATSAPP_NUMBER=34684739091',
        '',
      ].join('\n'), { mode: 0o600 });
    }
    console.log(`Local QA database ready: ${databasePath}. Dataset: ${selectedPosts.length} public posts${values['editorial-preview'] ? ' (editorial preview explicitly enabled)' : ' (historical defaults)'}. No external services contacted.`);
  } finally {
    client.close();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
