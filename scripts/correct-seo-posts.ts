import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { parse } from 'dotenv';
import { createClient } from '@libsql/client';
import { correctSeoPosts, type PostCorrection } from './lib/seo-post-corrections';

async function main() {
  const { values } = parseArgs({ options: {
    'env-file': { type: 'string' }, 'expected-host': { type: 'string' }, apply: { type: 'boolean', default: false },
  }, strict: true, allowPositionals: false });
  if (!values['env-file'] || !values['expected-host']) throw new Error('EXPLICIT_TARGET_REQUIRED');
  const env = parse(readFileSync(values['env-file'], 'utf8'));
  const url = new URL(env.TURSO_DATABASE_URL);
  if (url.protocol !== 'libsql:' || url.hostname !== values['expected-host'] || !env.TURSO_AUTH_TOKEN) throw new Error('TARGET_MISMATCH');
  const corrections = JSON.parse(readFileSync('docs/seo/2026-09-29-post-corrections.json', 'utf8')) as PostCorrection[];
  const client = createClient({ url: url.toString(), authToken: env.TURSO_AUTH_TOKEN });
  try { console.log(JSON.stringify(await correctSeoPosts(client, corrections, values.apply))); }
  finally { client.close(); }
}

main().catch(error => {
  const code = error instanceof Error && /^(EXPLICIT_TARGET_REQUIRED|TARGET_MISMATCH|INVALID_CORRECTION_SET|INVALID_CORRECTION|PUBLISHED_POST_MISSING:|CONTENT_CHANGED:|CONCURRENT_EDIT:)/.test(error.message) ? error.message : 'SEO_CORRECTION_STOPPED';
  console.error(code);
  process.exitCode = 1;
});
