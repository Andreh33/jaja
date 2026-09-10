import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import * as schema from '../drizzle/schema';
import { renderArticle, renderMarkdown, extractHeadings } from '../src/lib/markdown';
import { blogHref, paginateBlog, readBlogSearch, filterBlogPosts } from '../src/lib/blog-library';
import type { PostSummary } from '../src/lib/posts';
import { postInputSchema, resolvePostSlug, isSlugConflict } from '../src/lib/post-validation';
import { writePost } from '../src/lib/post-write';
import { findPublishedPostBySlug } from '../src/lib/post-queries';

const post = (id: number): PostSummary => ({ id: String(id), slug: `articulo-${id}`, title: id % 2 ? 'Diseño de clínicas' : 'Automatización de reservas', excerpt: 'Guía de negocio', category: id % 2 ? 'Diseño Web' : 'IA', cover: null, author: 'Latech', publishedAt: null, readingMinutes: 3 });
describe('blog discovery', () => {
  it('searches accents and combines terms with a category', () => {
    const posts = Array.from({ length: 76 }, (_, i) => post(i));
    assert.equal(filterBlogPosts(posts, 'diseno clinicas').length, 38);
    assert.equal(filterBlogPosts(posts, 'GUÍA automatizacion', 'IA').length, 38);
    assert.equal(filterBlogPosts(posts, 'reservas', 'Diseño Web').length, 0);
  });
  it('paginates all 76 entries without duplicates or omissions', () => {
    const posts = Array.from({ length: 76 }, (_, i) => post(i));
    const result = Array.from({ length: 7 }, (_, i) => paginateBlog(posts, '', i + 1));
    assert.deepEqual(result.map(r => r.posts.length), [12, 12, 12, 12, 12, 12, 4]);
    assert.equal(new Set(result.flatMap(r => r.posts.map(p => p.id))).size, 76);
    assert.equal(paginateBlog(posts, '', 8).outOfRange, true);
    assert.equal(paginateBlog([], '', 1).outOfRange, false);
  });
  it('keeps filters in ordinary navigable URLs and bounds malformed search', () => {
    assert.equal(blogHref('/blog/categoria/ia', 'diseño & SEO', 2), '/blog/categoria/ia?q=dise%C3%B1o+%26+SEO&page=2');
    assert.deepEqual(readBlogSearch({ q: ['  diseño  ', 'other'], page: '-2' }), { query: 'diseño', page: 1 });
    assert.equal(readBlogSearch({ q: 'a'.repeat(500), page: '1e6' }).query.length, 120);
    assert.equal(readBlogSearch({ page: 'Infinity' }).page, 1);
  });
});

describe('safe, consistent article rendering', () => {
  it('renders headings, tables, fenced code, images, nested lists and inline code', () => {
    const md = '# Cabecera\n\n## Diseño **claro**\n\n| Campo | Valor |\n| --- | --- |\n| Web | Sí |\n\n```html\n<script>alert(1)</script>\n## no es un título\n```\n\n![Diagrama de reservas](/imagenes/reservas.webp)\n\n- Uno\n  - Dos\n\n`**literal**`';
    const { html, headings } = renderArticle(md);
    assert.ok(!html.includes('<h1')); assert.match(html, /<table>/); assert.match(html, /<pre><code class="language-html">/);
    assert.ok(html.includes('&lt;script&gt;')); assert.ok(!html.includes('<script>'));
    assert.match(html, /alt="Diagrama de reservas"/); assert.match(html, /loading="lazy"/); assert.match(html, /<code>\*\*literal\*\*<\/code>/);
    assert.deepEqual(headings.map(h => h.id), ['cabecera', 'diseno-claro']);
    assert.deepEqual(extractHeadings(md), headings);
  });
  it('assigns deterministic unique anchors including already suffixed headings', () => {
    const { html, headings } = renderArticle('## Revisión\n## Revisión\n### Revisión-2\n## 👋\n## 👋');
    assert.equal(new Set(headings.map(h => h.id)).size, 5);
    for (const heading of headings) assert.ok(html.includes(`id="${heading.id}"`));
    assert.deepEqual(headings, extractHeadings('## Revisión\n## Revisión\n### Revisión-2\n## 👋\n## 👋'));
  });
  it('never emits raw HTML or active unsafe link/image URLs', () => {
    const md = '<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[evil](javascript:alert(1))\n\n[encoded](javascript&#58;alert(1))\n\n![evil](data:image/svg+xml,test)\n\n![tracking](http://example.test/img.png)\n\n[relative](//evil.example)';
    const html = renderMarkdown(md);
    assert.doesNotMatch(html, /<script|<img|href="(?:javascript:|data:|\/\/)/i);
    const safe = renderMarkdown('[Google](https://developers.google.com/search) [Contacto](/contacto)');
    assert.match(safe, /href="https:\/\/developers.google.com\/search"/); assert.match(safe, /href="\/contacto"/);
  });
});

describe('editor URL and publishing rules', () => {
  it('normalizes new slugs while preserving published URLs exactly', () => {
    assert.deepEqual(resolvePostSlug('Guía de Diseño ¡Útil!', undefined), { slug: 'guia-de-diseno-util' });
    assert.ok(resolvePostSlug('🙂🙂', undefined).error);
    const previous = { slug: 'existing-url', published: true, publishedAt: null };
    assert.deepEqual(resolvePostSlug('Renamed title', undefined, previous), { slug: 'existing-url' });
    assert.ok(resolvePostSlug('Renamed title', 'different', previous).error);
  });
  it('validates cover URLs, sizes and malformed input without trusting client reading times', () => {
    assert.equal(postInputSchema.safeParse({ title: 'Okay', content: 'A valid article', cover: 'javascript:alert(1)' }).success, false);
    assert.equal(postInputSchema.safeParse({ title: 'Okay', content: 'A valid article', cover: 'https://example.test/image.webp' }).success, true);
    assert.equal(postInputSchema.safeParse(null).success, false);
    assert.equal(isSlugConflict({ cause: { message: 'UNIQUE constraint failed: posts.slug' } }), true);
  });
  it('saves private drafts, handles collisions and missing posts, and preserves publication dates', async () => {
    const client = createClient({ url: 'file::memory:' }); const db = drizzle(client, { schema });
    try {
      await client.execute('CREATE TABLE posts (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, excerpt TEXT, content TEXT NOT NULL, cover TEXT, category TEXT, author TEXT, published INTEGER, published_at INTEGER, reading_minutes INTEGER)');
      const input = { title: 'Guía de reservas', content: 'Contenido de prueba para una guía real.', slug: 'guia-reservas', published: false };
      const draft = await writePost(db, input); assert.equal(draft.ok, true); if (!draft.ok) return;
      assert.equal(await findPublishedPostBySlug(db, draft.slug), null);
      let [row] = await db.select().from(schema.posts).where(eq(schema.posts.id, draft.id)); assert.equal(row.publishedAt, null);
      const collision = await writePost(db, input); assert.equal(collision.ok, false); if (!collision.ok) assert.equal(collision.status, 409);
      const missing = await writePost(db, { ...input, id: 'missing' }, true); assert.equal(missing.ok, false); if (!missing.ok) assert.equal(missing.status, 404);
      const published = await writePost(db, { ...input, id: draft.id, published: true }, true); assert.equal(published.ok, true);
      [row] = await db.select().from(schema.posts).where(eq(schema.posts.id, draft.id)); const date = row.publishedAt; assert.equal(date, null, 'without publication history an existing unknown date stays unknown');
      const renamed = await writePost(db, { ...input, id: draft.id, title: 'Título actualizado', slug: 'different', published: true }, true); assert.equal(renamed.ok, false);
      await writePost(db, { ...input, id: draft.id, title: 'Título actualizado', published: true }, true);
      [row] = await db.select().from(schema.posts).where(eq(schema.posts.id, draft.id)); assert.equal(row.publishedAt, date);
      await db.update(schema.posts).set({ publishedAt: null }).where(eq(schema.posts.id, draft.id));
      await writePost(db, { ...input, id: draft.id, published: true }, true);
      [row] = await db.select().from(schema.posts).where(eq(schema.posts.id, draft.id)); assert.equal(row.publishedAt, null, 'unknown historical publication date stays unknown');
      await writePost(db, { ...input, id: draft.id, published: false }, true);
      const changedAfterWithdrawal = await writePost(db, { ...input, id: draft.id, slug: 'changed-after-withdrawal', published: true }, true);
      assert.equal(changedAfterWithdrawal.ok, false, 'withdrawing cannot unlock a saved URL');
      await writePost(db, { ...input, id: draft.id, published: true }, true);
      [row] = await db.select().from(schema.posts).where(eq(schema.posts.id, draft.id));
      assert.equal(row.publishedAt, null, 'withdrawing cannot erase the unknown-date rule');
      const direct = await writePost(db, { ...input, slug: 'direct-publication', published: true });
      assert.equal(direct.ok, true);
      if (direct.ok) {
        const [directRow] = await db.select().from(schema.posts).where(eq(schema.posts.id, direct.id));
        assert.ok(directRow.publishedAt);
        await writePost(db, { ...input, id: direct.id, slug: direct.slug, published: true }, true);
        const [edited] = await db.select().from(schema.posts).where(eq(schema.posts.id, direct.id));
        assert.equal(edited.publishedAt?.getTime(), directRow.publishedAt?.getTime());
      }
    } finally { client.close(); }
  });
});
