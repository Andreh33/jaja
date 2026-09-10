/** Preparation only until invoked with an explicit, authorized new QA target. */
import { execFileSync } from 'node:child_process';
import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { createClient } from '@libsql/client';
import { initializeNewQaDatabase, QaInitializationError, validateQaTarget } from './lib/qa-database-initializer';
import { publicQaPosts } from './lib/public-qa-posts';
import { loadEditorialPreview } from './lib/editorial-preview';

function credentialsFromPrivateFile(filename: string): { databaseUrl: string; authToken: string } {
  try {
    const local = resolve('.local');
    const file = resolve(filename);
    if (!file.startsWith(`${local}${sep}`) || realpathSync(local) !== local || realpathSync(file) !== file) throw new Error();
    const stat = lstatSync(file);
    if (!stat.isFile() || (stat.mode & 0o077) !== 0 || stat.size > 16_384) throw new Error();
    execFileSync('git', ['check-ignore', '--quiet', file], { stdio: 'pipe' });
    const data: unknown = JSON.parse(readFileSync(file, 'utf8'));
    if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).sort().join(',') !== 'authToken,databaseUrl'
      || !('databaseUrl' in data) || typeof data.databaseUrl !== 'string' || !('authToken' in data) || typeof data.authToken !== 'string') throw new Error();
    return { databaseUrl: data.databaseUrl, authToken: data.authToken };
  } catch {
    throw new QaInitializationError('PRIVATE_FILE_REQUIRED', 'Use a git-ignored JSON file inside .local, without symlinks, mode 0600, containing only databaseUrl and authToken.');
  }
}

async function main() {
  const { values } = parseArgs({ options: {
    'apply-new-qa-database': { type: 'boolean', default: false },
    'database-name': { type: 'string' }, 'expected-host': { type: 'string' }, 'credentials-file': { type: 'string' },
    'editorial-preview': { type: 'boolean', default: false },
    help: { type: 'boolean', default: false },
  }, allowPositionals: false, strict: true });
  if (values.help) {
    console.log('Explicit initializer for a NEW EMPTY latech-qa- Turso database. Required: --apply-new-qa-database --database-name <new-resource-name> --expected-host <exact-new-host.turso.io> --credentials-file .local/preview-db.json. Creates schema and 76 historical public posts only. Optional --editorial-preview uses the 82-post review dataset instead. Never reads .env files or inherited database variables.');
    return;
  }
  if (!values['apply-new-qa-database'] || !values['database-name'] || !values['expected-host'] || !values['credentials-file']) {
    throw new QaInitializationError('EXPLICIT_APPLY_REQUIRED', 'No connection opened. All four explicit QA arguments are required; use --help.');
  }
  if (realpathSync(process.cwd()) !== realpathSync(fileURLToPath(new URL('../', import.meta.url)))) {
    throw new QaInitializationError('PROJECT_DIRECTORY_REQUIRED', 'Run this initializer from its own Latech repository root. No credentials read or connection opened.');
  }
  const selectedPosts = values['editorial-preview'] ? loadEditorialPreview(publicQaPosts, process.cwd()) : publicQaPosts;
  const target = {
    ...credentialsFromPrivateFile(values['credentials-file']), databaseName: values['database-name'],
    expectedHost: values['expected-host'], applyNewQaDatabase: values['apply-new-qa-database'],
  };
  validateQaTarget(target);
  let sql: string;
  try {
    sql = execFileSync(process.execPath, ['node_modules/drizzle-kit/bin.cjs', 'export', '--dialect', 'sqlite', '--schema', './drizzle/schema.ts'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch { throw new QaInitializationError('SCHEMA_EXPORT_FAILED', 'Could not export the current Drizzle schema. No database connection opened.'); }
  const result = await initializeNewQaDatabase(target, sql, selectedPosts, createClient);
  console.log(`New QA database initialized: ${result.tables} tables, ${result.publicPosts} public posts, no accounts or customer data. Credentials were not logged. Do not rerun this initializer on the same database.`);
}

main().catch((error) => {
  // Never print raw SDK, subprocess, JSON or argument errors: they may embed
  // credentials, a request URL or arbitrary command-line values.
  console.error(error instanceof QaInitializationError ? `${error.code}: ${error.message}` : 'QA_INITIALIZER_FAILED: Check the explicit arguments and the new QA target. No sensitive error details logged.');
  process.exitCode = 1;
});
