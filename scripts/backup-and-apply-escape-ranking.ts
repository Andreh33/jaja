/** Production operation: no target, secret or write permission is inferred. */
import { lstatSync, mkdirSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { parse as parseEnv } from 'dotenv';
import { backupAndApplyRanking, RankingReleaseError } from './lib/production-ranking-release';

function privateFile(filename: string) {
  const path = resolve(filename);
  const file = lstatSync(path);
  const parent = lstatSync(dirname(path));
  if (realpathSync(path) !== path || !file.isFile() || (file.mode & 0o777) !== 0o600 || file.size > 131072
    || (parent.mode & 0o777) !== 0o700 || (process.getuid && (file.uid !== process.getuid() || parent.uid !== process.getuid()))) {
    throw new RankingReleaseError('PRIVATE_FILE_REQUIRED', 'Use a file owned by the current user, mode 0600, inside a private 0700 directory, with no symlinks.');
  }
  return readFileSync(path, 'utf8');
}
async function main() {
  const { values } = parseArgs({ options: {
    'env-file': { type: 'string' }, 'credentials-file': { type: 'string' }, 'expected-host': { type: 'string' },
    'backup-dir': { type: 'string' }, 'apply-escape-ranking-v2': { type: 'boolean', default: false }, help: { type: 'boolean', default: false },
  }, strict: true, allowPositionals: false });
  if (values.help) {
    console.log('Required: --env-file <private-0600-file> OR --credentials-file <private-0600-json>, --expected-host <exact-host.turso.io>, --backup-dir <new-directory-inside-0700-parent>. Default: consistent backup and local restore verification only. Add --apply-escape-ranking-v2 to apply the pinned additive SQL after that backup succeeds. Never reads inherited environment variables or runs seeds.');
    return;
  }
  if ((!values['env-file'] && !values['credentials-file']) || (values['env-file'] && values['credentials-file']) || !values['expected-host'] || !values['backup-dir']) {
    throw new RankingReleaseError('EXPLICIT_ARGUMENTS_REQUIRED', 'Select exactly one private credentials file, an exact host and a new private backup directory; use --help.');
  }
  let databaseUrl: string;
  let authToken: string;
  if (values['env-file']) {
    const parsed = parseEnv(privateFile(values['env-file']));
    databaseUrl = parsed.TURSO_DATABASE_URL;
    authToken = parsed.TURSO_AUTH_TOKEN;
  } else {
    const data: unknown = JSON.parse(privateFile(values['credentials-file']!));
    if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).sort().join(',') !== 'authToken,databaseUrl'
      || !('databaseUrl' in data) || typeof data.databaseUrl !== 'string' || !('authToken' in data) || typeof data.authToken !== 'string') {
      throw new RankingReleaseError('INVALID_PRIVATE_JSON', 'The private JSON must contain only databaseUrl and authToken strings.');
    }
    ({ databaseUrl, authToken } = data);
  }
  const backupDirectory = resolve(values['backup-dir']);
  const parent = lstatSync(dirname(backupDirectory));
  if (realpathSync(dirname(backupDirectory)) !== dirname(backupDirectory) || !parent.isDirectory() || (parent.mode & 0o777) !== 0o700
    || (process.getuid && parent.uid !== process.getuid())) {
    throw new RankingReleaseError('PRIVATE_DIRECTORY_REQUIRED', 'The backup parent must be a real directory owned by the current user with mode 0700.');
  }
  mkdirSync(backupDirectory, { mode: 0o700 }); // Fails if it already exists; never overwrites a backup.
  const sql = readFileSync(new URL('./sql/escape-ranking-v2.sql', import.meta.url), 'utf8');
  const result = await backupAndApplyRanking({ expectedHost: values['expected-host'], databaseUrl, authToken }, sql, backupDirectory, values['apply-escape-ranking-v2']);
  console.log(JSON.stringify({ backupVerified: result.backupVerified, snapshotSha256: result.backupSha256, tables: result.tables,
    migration: result.applied ? 'commit-confirmed' : 'not-requested', addedObjects: result.addedObjects ?? 0 }));
}
main().catch((error) => {
  console.error(error instanceof RankingReleaseError ? `${error.code}: ${error.message}` : 'RANKING_RELEASE_FAILED: Check explicit arguments and private file permissions. No raw secret, path or server error is logged.');
  process.exitCode = 1;
});
