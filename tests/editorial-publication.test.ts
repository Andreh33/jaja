import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createClient } from '@libsql/client';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicQaPosts } from '../scripts/lib/public-qa-posts';
import {
  applyEditorialPublication, editorialDigest, EditorialPublicationError, loadEditorialPublication,
  planEditorialPublication, validateEditorialTarget, verifyEditorialReceipt, type EditorialReceipt, type EditorialRow,
} from '../scripts/lib/editorial-publication';

const bundle = loadEditorialPublication(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const target = editorialDigest('isolated-memory-test');
const rejectsCode = (code: string) => (error: unknown) => error instanceof EditorialPublicationError && error.code === code;
async function fixture() {
  // A real temporary file survives libSQL releasing its transaction connection.
  const directory = mkdtempSync(join(tmpdir(), 'latech-editorial-publication-'));
  const client = createClient({ url: `file:${join(directory, 'fixture.db')}` });
  const close = client.close.bind(client);
  client.close = () => { close(); rmSync(directory, { recursive: true, force: true }); };
  await client.execute('CREATE TABLE posts (id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, excerpt TEXT, content TEXT NOT NULL, cover TEXT, category TEXT, author TEXT, published INTEGER, published_at INTEGER, reading_minutes INTEGER)');
  for (const [index, entry] of bundle.baseline.entries()) {
    const post = publicQaPosts.find(post => post.slug === entry.slug)!;
    await client.execute({ sql: 'INSERT INTO posts VALUES (?,?,?,?,?,?,?,?,?,?,?)', args: [
      `historical-${index}`, post.slug, post.title, post.excerpt ?? null, post.content, 'preserved-cover.svg', post.category ?? null,
      'Preserved author', 1, index === 0 ? null : 1700000000 + index, post.readingMinutes ?? null,
    ] });
  }
  await client.execute("INSERT INTO posts VALUES ('unrelated', 'unrelated-private-draft', 'Private draft', NULL, 'Do not modify', NULL, NULL, 'Private author', 0, NULL, NULL)");
  return client;
}

describe('approved editorial publication boundary', () => {
  it('requires explicit credentials matching the exact remote host and rejects placeholders or unrelated keys', () => {
    const host = 'editorial-fixture.example.turso.io';
    const values = { TURSO_DATABASE_URL: `libsql://${host}`, TURSO_AUTH_TOKEN: 'fixture-only-token-with-enough-length' };
    assert.equal(validateEditorialTarget(values, host).url, `libsql://${host}`);
    for (const changed of [
      { ...values, TURSO_AUTH_TOKEN: '[SENSITIVE]' },
      { ...values, TURSO_DATABASE_URL: 'libsql://another.example.turso.io' },
      { ...values, TURSO_DATABASE_URL: `libsql://${host}?authToken=not-allowed` },
      { ...values, TURSO_DATABASE_URL: 'file:qa.db' },
      { ...values, AUTH_SECRET: 'unrelated' },
    ]) assert.throws(() => validateEditorialTarget(changed, host), EditorialPublicationError);
  });
  it('loads precisely eight audited updates and six approved additions, never the QA dataset', () => {
    assert.equal(bundle.updates.length, 8);
    assert.equal(bundle.additions.length, 6);
    assert.equal(new Set([...bundle.updates, ...bundle.additions].map(post => post.slug)).size, 14);
    assert.ok(bundle.updates.every(post => !post.content.includes('Nota editorial:') && !/^# /m.test(post.content)));
  });

  it('plans without writing, then preserves existing identity, author, cover and known/null dates while inserting six with the actual date', async () => {
    const client = await fixture();
    try {
      const before = (await client.execute('SELECT * FROM posts ORDER BY id')).rows;
      const snapshot = await planEditorialPublication(client, bundle, target);
      assert.deepEqual((await client.execute('SELECT * FROM posts ORDER BY id')).rows, before);
      let receipt: EditorialReceipt | undefined;
      const started = Math.floor(Date.now() / 1000);
      await applyEditorialPublication(client, bundle, snapshot, target, value => { receipt = value; });
      assert.ok(receipt);
      assert.equal(await verifyEditorialReceipt(client, bundle, receipt, target), true);
      assert.equal((await client.execute('SELECT COUNT(*) AS count FROM posts')).rows[0].count, 15);
      assert.deepEqual((await client.execute("SELECT * FROM posts WHERE id='unrelated'")).rows[0], before.find(row => row.id === 'unrelated'));
      for (const old of snapshot.rows) {
        const current: EditorialRow = receipt.expectedRows.find(row => row.slug === old.slug)!;
        for (const field of ['id', 'author', 'cover', 'publishedAt', 'published'] as const) assert.equal(current[field], old[field]);
        assert.notEqual(current.content, old.content);
      }
      for (const post of bundle.additions) {
        const added: EditorialRow = receipt.expectedRows.find(row => row.slug === post.slug)!;
        assert.ok(added.publishedAt! >= started && added.publishedAt! <= Math.floor(Date.now() / 1000));
        assert.equal(added.published, 1);
        assert.equal(added.author, 'Latech');
      }
      await assert.rejects(applyEditorialPublication(client, bundle, snapshot, target, () => {}), rejectsCode('DATABASE_CHANGED_SINCE_PLAN'));
      assert.equal(await verifyEditorialReceipt(client, bundle, receipt, target), true);
    } finally { client.close(); }
  });

  it('rejects audited content drift and new-slug collisions including unpublished posts', async () => {
    const client = await fixture();
    try {
      await client.execute({ sql: 'UPDATE posts SET content=? WHERE slug=?', args: ['Changed by another editor', bundle.updates[0].slug] });
      await assert.rejects(planEditorialPublication(client, bundle, target), error => {
        assert.ok(error instanceof EditorialPublicationError);
        assert.equal(error.code, 'BASELINE_CONFLICT');
        assert.ok(error.conflicts.some(conflict => conflict.fields.includes('content')));
        return true;
      });
      await client.execute({ sql: "UPDATE posts SET slug=? WHERE id='unrelated'", args: [bundle.additions[0].slug] });
      await assert.rejects(planEditorialPublication(client, bundle, target), error => error instanceof EditorialPublicationError && error.conflicts.some(conflict => conflict.fields.includes('new-slug-collision')));
    } finally { client.close(); }
  });

  it('aborts if any protected field changes after the snapshot, before the first update', async () => {
    const client = await fixture();
    try {
      const snapshot = await planEditorialPublication(client, bundle, target);
      await client.execute({ sql: 'UPDATE posts SET author=? WHERE slug=?', args: ['New author decision', bundle.updates[0].slug] });
      const before = (await client.execute('SELECT * FROM posts ORDER BY id')).rows;
      let savedReceipt = false;
      await assert.rejects(applyEditorialPublication(client, bundle, snapshot, target, () => { savedReceipt = true; }), rejectsCode('DATABASE_CHANGED_SINCE_PLAN'));
      assert.equal(savedReceipt, false);
      assert.deepEqual((await client.execute('SELECT * FROM posts ORDER BY id')).rows, before);
    } finally { client.close(); }
  });

  it('rolls back all eight updates if a later insert fails', async () => {
    const client = await fixture();
    try {
      await client.execute({ sql: "UPDATE posts SET title=? WHERE id='unrelated'", args: [bundle.additions[0].title] });
      await client.execute('CREATE UNIQUE INDEX fixture_unique_title ON posts(title)');
      const snapshot = await planEditorialPublication(client, bundle, target);
      const before = (await client.execute('SELECT * FROM posts ORDER BY id')).rows;
      let receipt: EditorialReceipt | undefined;
      await assert.rejects(applyEditorialPublication(client, bundle, snapshot, target, value => { receipt = value; }), rejectsCode('WRITE_ABORTED'));
      assert.ok(receipt);
      assert.deepEqual((await client.execute('SELECT * FROM posts ORDER BY id')).rows, before);
      assert.equal(await verifyEditorialReceipt(client, bundle, receipt, target), false);
    } finally { client.close(); }
  });

  it('refuses another database, malformed snapshot and failure to persist the receipt without changing rows', async () => {
    const client = await fixture();
    try {
      const snapshot = await planEditorialPublication(client, bundle, target);
      const before = (await client.execute('SELECT * FROM posts ORDER BY id')).rows;
      await assert.rejects(applyEditorialPublication(client, bundle, snapshot, editorialDigest('other-db'), () => {}), rejectsCode('TARGET_CHANGED'));
      await assert.rejects(applyEditorialPublication(client, bundle, { ...snapshot, rows: [] }, target, () => {}), rejectsCode('INVALID_SNAPSHOT'));
      await assert.rejects(applyEditorialPublication(client, bundle, snapshot, target, () => { throw new Error('disk full'); }), rejectsCode('VERIFICATION_ABORTED'));
      assert.deepEqual((await client.execute('SELECT * FROM posts ORDER BY id')).rows, before);
    } finally { client.close(); }
  });
});
