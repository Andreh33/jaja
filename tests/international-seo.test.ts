import assert from 'node:assert/strict';
import { test } from 'node:test';
import { locales, dictionaries, pagePath, resolvePage, equivalents, internationalSitemap, spanishArticles, articlePath } from '../src/lib/international';
import { measurementPath, sanitizeMeasurementUrl, commercialDestination } from '../src/lib/measurement';
import { articleRegistry } from '../src/lib/international-routes';

test('six complete dictionaries contain nine substantive, equivalent editorial topics each', () => {
  assert.deepEqual(locales, ['es', 'en', 'fr', 'de', 'pt', 'it']);
  for (const locale of locales) {
    const d = dictionaries[locale];
    assert.equal(d.code, locale);
    assert.equal(d.articles.length, 9);
    assert.equal(new Set(d.articles.map(a => a.slug)).size, 9);
    assert.equal(d.services.length, 3);
    assert.deepEqual(d.articles.map(a => a.id), dictionaries.es.articles.map(a => a.id));
    for (const article of d.articles) {
      assert.match(article.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      const words = [...article.intro, ...article.sections.flatMap(s => s.paragraphs), ...article.checklist, article.conclusion].join(' ').split(/\s+/).length;
      assert.ok(words >= 500, `${locale}/${article.slug} has only ${words} words`);
      assert.ok(article.sections.length >= 6);
      assert.equal(articleRegistry.find(a => a.id === article.id)?.slugs[locale], article.slug);
    }
  }
  assert.equal(spanishArticles.length, 9);
});

test('routes, reciprocals and canonicals resolve only existing translations', () => {
  for (const locale of locales) {
    for (const key of ['home', 'services', 'web', 'shop', 'ai', 'about', 'projects', 'contact', 'blog'] as const) {
      const path = pagePath(locale, key);
      if (locale !== 'es') assert.equal(resolvePage(locale, path.split('/').slice(2))?.key, key);
      const urls = equivalents(key);
      assert.equal(urls[locale], `https://serviciosonlineweb.com${path}`);
      assert.equal(urls['x-default'], urls.es);
    }
    for (const a of dictionaries[locale].articles) {
      const urls = equivalents('article', a.id);
      assert.equal(urls[locale], `https://serviciosonlineweb.com${articlePath(locale, a.id)}`);
      assert.equal(Object.keys(urls).length, 7);
    }
  }
  assert.equal(resolvePage('xx', []), null);
  assert.equal(resolvePage('en', ['blog', 'not-a-real-article']), null);
  assert.equal(resolvePage('fr', ['contact', 'unexpected']), null);
  assert.deepEqual(equivalents('article', 'unknown-topic'), {});
});

test('international sitemap has only live unique routes and reciprocal alternates', () => {
  const entries = internationalSitemap();
  assert.equal(entries.length, 5 * (9 + 9));
  assert.equal(new Set(entries.map(e => e.url)).size, entries.length);
  for (const entry of entries) {
    const url = new URL(entry.url);
    assert.ok(resolvePage(url.pathname.split('/')[1], url.pathname.split('/').slice(2)));
    assert.equal(Object.keys(entry.alternates!.languages!).length, 7);
  }
});

test('localized conversion measurement preserves language while stripping private/query data', () => {
  assert.equal(measurementPath('/fr/contact'), '/fr/contact');
  assert.equal(commercialDestination('/de/leistungen/webdesign', 'https://serviciosonlineweb.com'), '/de/leistungen/webdesign');
  assert.equal(sanitizeMeasurementUrl('https://serviciosonlineweb.com/fr/contact?phone=123#private'), 'https://serviciosonlineweb.com/fr/contact');
  assert.equal(measurementPath('/admin'), null);
  assert.equal(measurementPath('/en/admin'), null);
  assert.equal(sanitizeMeasurementUrl('https://serviciosonlineweb.com/fr/blog/nom-client-confidentiel?email=private'), 'https://serviciosonlineweb.com/otra-pagina-publica');
});
