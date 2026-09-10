import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import * as schema from '../drizzle/schema';
import { findPublishedPostBySlug } from '../src/lib/post-queries';
import { invalidatePostCache } from '../src/lib/post-revalidation';
import { isSameOriginMutation } from '../src/lib/request-origin';

describe('public blog boundary', () => {
  it('rejects cross-origin or opaque-origin cookie mutations', () => {
    for (const origin of ['https://evil.example', 'null', 'invalid', '']) {
      const request = new Request('https://serviciosonlineweb.com/api/posts', { method: 'POST', headers: origin ? { origin } : {} });
      assert.equal(isSameOriginMutation(request), false);
    }
    assert.equal(isSameOriginMutation(new Request('http://localhost:3000/api/posts', { method: 'POST', headers: { origin: 'http://localhost:3000' } })), true);
    assert.equal(isSameOriginMutation(new Request('https://serviciosonlineweb.com/api/posts', { method: 'PUT', headers: { origin: 'https://serviciosonlineweb.com' } })), true);
  });
  it('hides drafts and exposes only the published state using a real isolated database', async () => {
    const client = createClient({ url: 'file::memory:' });
    const database = drizzle(client, { schema });
    try {
      await client.execute('CREATE TABLE posts (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, excerpt TEXT, content TEXT NOT NULL, cover TEXT, category TEXT, author TEXT, published INTEGER, published_at INTEGER, reading_minutes INTEGER)');
      await database.insert(schema.posts).values({ id: 'draft', slug: 'private-draft', title: 'Private title', content: 'Private content', published: false });
      assert.equal(await findPublishedPostBySlug(database, 'private-draft'), null);
      assert.equal(await findPublishedPostBySlug(database, 'missing'), null);
      assert.equal(await findPublishedPostBySlug(database, "' OR 1=1 --"), null);
      await database.update(schema.posts).set({ published: true }).where(eq(schema.posts.id, 'draft'));
      assert.equal((await findPublishedPostBySlug(database, 'private-draft'))?.title, 'Private title');
      await database.update(schema.posts).set({ published: false }).where(eq(schema.posts.id, 'draft'));
      assert.equal(await findPublishedPostBySlug(database, 'private-draft'), null);
    } finally { client.close(); }
  });

  it('invalidates old and new article/OG paths, related cards, category hubs and sitemap', () => {
    const calls: [string, ('page' | 'layout')?][] = [];
    invalidatePostCache((path, type) => calls.push([path, type]), 'old-slug', 'new-slug', 'old-slug');
    for (const path of ['/blog', '/sitemap.xml', '/blog/old-slug', '/blog/new-slug', '/blog/old-slug/opengraph-image', '/blog/new-slug/opengraph-image']) {
      assert.equal(calls.filter(([value]) => value === path).length, 1);
    }
    assert.ok(calls.some(([path, type]) => path === '/blog/[slug]' && type === 'page'));
    assert.ok(calls.some(([path, type]) => path === '/blog/categoria/[categoria]' && type === 'page'));
  });
});
