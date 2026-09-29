import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createClient } from '@libsql/client';
import { correctSeoPosts, contentHash } from '../scripts/lib/seo-post-corrections';
import { sitemapUrls } from '../scripts/lib/indexnow-sitemap';
import { isOrganizationAuthor } from '../src/lib/seo';
import { editorialUpdate } from '../src/lib/editorial-dates';
import corrections from '../docs/seo/2026-09-29-post-corrections.json';

const before = 'Before content. '.repeat(10), after = 'Reviewed content. '.repeat(10);
const patch = { slug: 'public-post', beforeSha256: contentHash(before), content: after };
async function fixture() {
  const client = createClient({ url: ':memory:' });
  await client.executeMultiple("CREATE TABLE posts (slug TEXT PRIMARY KEY, content TEXT, published INTEGER, reading_minutes INTEGER, published_at INTEGER); ");
  await client.execute({ sql: 'INSERT INTO posts VALUES (?, ?, 1, 8, 1000)', args: ['public-post', before] });
  await client.execute({ sql: 'INSERT INTO posts VALUES (?, ?, 0, 8, 1000)', args: ['private-draft', before] });
  return client;
}
test('preview writes nothing; apply preserves publication date and drafts and is idempotent', async () => {
  const client = await fixture();
  try {
    assert.equal((await correctSeoPosts(client, [patch])).status, 'plan-no-writes');
    assert.equal((await client.execute("SELECT content FROM posts WHERE slug='public-post'")).rows[0].content, before);
    assert.equal((await correctSeoPosts(client, [patch], true)).changed.length, 1);
    const rows = (await client.execute('SELECT * FROM posts ORDER BY slug')).rows;
    assert.equal(rows[0].content, before); assert.equal(rows[1].content, after); assert.equal(rows[1].published_at, 1000);
    assert.equal((await correctSeoPosts(client, [patch], true)).alreadyCurrent, 1);
  } finally { client.close(); }
});
test('editorial drift or a missing published article aborts the whole correction', async () => {
  const client = await fixture();
  try {
    await assert.rejects(correctSeoPosts(client, [patch, { ...patch, slug: 'private-draft' }], true), /PUBLISHED_POST_MISSING/);
    assert.equal((await client.execute("SELECT content FROM posts WHERE slug='public-post'")).rows[0].content, before);
    await client.execute("UPDATE posts SET content='Changed by another editor' WHERE slug='public-post'");
    await assert.rejects(correctSeoPosts(client, [patch], true), /CONTENT_CHANGED/);
    assert.equal((await client.execute("SELECT content FROM posts WHERE slug='public-post'")).rows[0].content, 'Changed by another editor');
  } finally { client.close(); }
});
test('IndexNow uses current public canonical URLs and rejects wrong host or private URLs', () => {
  const xml = (urls: string[]) => `<urlset>${urls.map(url => `<url><loc>${url}</loc></url>`).join('')}</urlset>`;
  const host = 'https://serviciosonlineweb.com';
  assert.deepEqual(sitemapUrls(xml([host+'/blog/new',host+'/blog/new',host+'/tienda/web']),host),[host+'/blog/new',host+'/tienda/web']);
  for (const url of ['https://other.example/blog', host+'/admin',host+'/blog?a=b',host+'/cursos/a']) assert.throws(()=>sitemapUrls(xml([url]),host),/UNSAFE/);
  assert.throws(()=>sitemapUrls('<sitemapindex/>',host),/UNSUPPORTED/);
});
test('article authors distinguish Latech from people; modification date requires the reviewed content', () => {
  for (const name of ['Latech','Equipo Latech',null,'']) assert.equal(isOrganizationAuthor(name),true);
  assert.equal(isOrganizationAuthor('Andrés Rubio'),false);
  assert.equal(editorialUpdate(corrections[0])?.toISOString(),'2026-09-29T12:00:00.000Z');
  assert.equal(editorialUpdate({...corrections[0],content:'Unreviewed future revision'}),undefined);
});
