/** Local files only. Intentionally ignores all environment/database credentials. */
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createClient } from '@libsql/client';

async function main() {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args[0] && (!args[0].startsWith('file:') || args[0].includes('?') || args[0].includes('#')))) {
    throw new Error('Use a local file only: tsx scripts/prepare-escape-ranking.ts file:.local/qa.db');
  }
  const path = resolve(args[0]?.slice(5) || '.local/qa.db');
  mkdirSync(dirname(path), { recursive: true });
  const client = createClient({ url: `file:${path}` });
  try {
    await client.executeMultiple(readFileSync(new URL('./sql/escape-ranking-v2.sql', import.meta.url), 'utf8'));
    console.log('Escape v2 tables prepared in the selected local file. No external connection made.');
  } finally { client.close(); }
}
main().catch((error) => { console.error(error instanceof Error ? error.message : 'Local preparation failed'); process.exitCode = 1; });
