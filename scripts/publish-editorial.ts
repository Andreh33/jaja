/** Explicit production editorial package only. No implicit env loading or QA initialization. */
import { createClient } from '@libsql/client';
import { createHash } from 'node:crypto';
import { closeSync, fsyncSync, lstatSync, openSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parse } from 'dotenv';
import {
  applyEditorialPublication, editorialDigest, EditorialPublicationError, loadEditorialPublication,
  planEditorialPublication, validateEditorialTarget, verifyEditorialReceipt, type EditorialReceipt,
} from './lib/editorial-publication';

const fileHash = (text: string) => createHash('sha256').update(text).digest('hex');
function readPrivate(path: string): string {
  const info = lstatSync(path);
  if (!info.isFile() || info.isSymbolicLink() || realpathSync(path) !== resolve(path) || (info.mode & 0o777) !== 0o600 || info.size > 2_000_000) throw new EditorialPublicationError('PRIVATE_FILE_REQUIRED');
  return readFileSync(path, 'utf8');
}
function writePrivate(path: string, data: unknown) {
  const text = JSON.stringify(data, null, 2) + '\n';
  if (realpathSync(dirname(path)) !== dirname(path)) throw new EditorialPublicationError('SYMLINK_OUTPUT_REFUSED');
  const fd = openSync(path, 'wx', 0o600);
  try { writeFileSync(fd, text); fsyncSync(fd); } finally { closeSync(fd); }
  const directoryFd = openSync(dirname(path), 'r');
  try { fsyncSync(directoryFd); } finally { closeSync(directoryFd); }
  return fileHash(text);
}
async function main() {
  const [command, ...args] = process.argv.slice(2);
  const options = new Map<string, string>();
  for (let index = 0; index < args.length; index += 2) {
    const name = args[index], value = args[index + 1];
    if (!['--env-file', '--expected-host', '--snapshot', '--snapshot-sha256', '--receipt'].includes(name) || !value || value.startsWith('--') || options.has(name)) throw new EditorialPublicationError('INVALID_ARGUMENTS');
    options.set(name, value);
  }
  const actionOptions = command === 'plan' ? ['--snapshot'] : command === 'apply' ? ['--snapshot', '--snapshot-sha256', '--receipt'] : command === 'verify' ? ['--receipt'] : [];
  const required = ['--env-file', '--expected-host', ...actionOptions];
  if (!actionOptions.length || options.size !== required.length || required.some(name => !options.has(name))) throw new EditorialPublicationError('INVALID_ARGUMENTS');
  const { url, authToken } = validateEditorialTarget(parse(readPrivate(resolve(options.get('--env-file')!))), options.get('--expected-host')!);
  const targetDigest = editorialDigest(url);
  const bundle = loadEditorialPublication(process.cwd());
  const client = createClient({ url, authToken });
  try {
    if (command === 'plan') {
      const snapshot = await planEditorialPublication(client, bundle, targetDigest);
      const sha256 = writePrivate(resolve(options.get('--snapshot')!), snapshot);
      console.log(JSON.stringify({ status: 'plan-ready-no-database-writes', updates: 8, additions: 6, snapshotSha256: sha256, packageSha256: bundle.digest }));
    } else if (command === 'apply') {
      const text = readPrivate(resolve(options.get('--snapshot')!));
      if (fileHash(text) !== options.get('--snapshot-sha256')) throw new EditorialPublicationError('SNAPSHOT_HASH_MISMATCH');
      await applyEditorialPublication(client, bundle, JSON.parse(text), targetDigest, receipt => { writePrivate(resolve(options.get('--receipt')!), receipt); });
      console.log(JSON.stringify({ status: 'committed', updates: 8, additions: 6, next: 'Build and deploy the approved application to regenerate public blog, related articles, categories, OG and sitemap.' }));
    } else {
      const receipt = JSON.parse(readPrivate(resolve(options.get('--receipt')!))) as EditorialReceipt;
      const matches = await verifyEditorialReceipt(client, bundle, receipt, targetDigest);
      console.log(JSON.stringify({ status: matches ? 'all-14-posts-match-receipt' : 'receipt-does-not-match-current-database' }));
      if (!matches) process.exitCode = 1;
    }
  } finally { client.close(); }
}
main().catch(error => {
  // Driver errors can contain connection information. Never print raw errors.
  const failure = error instanceof EditorialPublicationError ? { code: error.code, conflicts: error.conflicts } : { code: 'EDITORIAL_PUBLICATION_STOPPED' };
  console.error(JSON.stringify(failure));
  process.exitCode = 1;
});
