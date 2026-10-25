import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import originalRoutes from './fixtures/international-original-routes.json';
import { test } from 'node:test';
import { locales, dictionaries, pagePath, resolvePage, equivalents, internationalSitemap, spanishArticles, articlePath, seoLanguage, htmlLanguage, internationalMetadata, languageLinks, articleDate, INTERNATIONAL_UPDATE_DATE } from '../src/lib/international';
import { measurementPath, sanitizeMeasurementUrl, commercialDestination } from '../src/lib/measurement';
import { articleRegistry } from '../src/lib/international-routes';

test('thirteen complete dictionaries contain nineteen substantive articles each', () => {
  assert.deepEqual(locales, ['es', 'en', 'fr', 'de', 'pt', 'it', 'nl', 'pl', 'sv', 'da', 'ro', 'us', 'latam']);
  for (const locale of locales) {
    const d = dictionaries[locale];
    assert.equal(d.code, locale);
    assert.equal(d.articles.length, 19);
    assert.equal(new Set(d.articles.map(a => a.slug)).size, 19);
    assert.equal(d.services.length, 3);
    assert.equal(d.articles.some(a => a.id === 'ai-automation'), ['es', 'en', 'fr', 'de', 'pt', 'it'].includes(locale));
    assert.equal(d.articles.some(a => a.id === 'market-entry-seo'), ['nl', 'pl', 'sv', 'da', 'ro', 'us', 'latam'].includes(locale));
    for (const article of d.articles) {
      assert.match(article.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      const words = [...article.intro, ...article.sections.flatMap(s => s.paragraphs), ...article.checklist, article.conclusion].join(' ').split(/\s+/).length;
      assert.ok(words >= 500, `${locale}/${article.slug} has only ${words} words`);
      assert.ok(article.sections.length >= 6);
      assert.equal(articleRegistry.find(a => a.id === article.id)?.slugs[locale], article.slug);
    }
  }
  assert.equal(spanishArticles.length, 19);
});

test('routes, reciprocals and canonicals resolve only existing translations', () => {
  for (const locale of locales) {
    for (const key of ['home', 'services', 'web', 'shop', 'ai', 'about', 'projects', 'contact', 'blog'] as const) {
      const path = pagePath(locale, key);
      if (locale !== 'es') assert.equal(resolvePage(locale, path.split('/').slice(2))?.key, key);
      const urls = equivalents(key);
      assert.equal(urls[seoLanguage(locale)], `https://serviciosonlineweb.com${path}`);
      assert.equal(urls['x-default'], urls['es-ES']);
    }
    for (const a of dictionaries[locale].articles) {
      const urls = equivalents('article', a.id);
      assert.equal(urls[seoLanguage(locale)], `https://serviciosonlineweb.com${articlePath(locale, a.id)}`);
      assert.equal(Object.keys(urls).length, locales.filter(l => dictionaries[l].articles.some(other => other.id === a.id)).length + 1);
    }
  }
  assert.equal(resolvePage('xx', []), null);
  assert.equal(resolvePage('en', ['blog', 'not-a-real-article']), null);
  assert.equal(resolvePage('fr', ['contact', 'unexpected']), null);
  assert.deepEqual(equivalents('article', 'unknown-topic'), {});
});

test('international sitemap has only live unique routes and reciprocal alternates', () => {
  const entries = internationalSitemap();
  assert.equal(entries.length, 12 * (9 + 19));
  assert.equal(new Set(entries.map(e => e.url)).size, entries.length);
  for (const entry of entries) {
    const url = new URL(entry.url);
    assert.ok(resolvePage(url.pathname.split('/')[1], url.pathname.split('/').slice(2)));
    assert.equal(Object.keys(entry.alternates!.languages!).length >= 7, true);
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

test('regional languages and complete article pack remain valid', () => {
  assert.equal(htmlLanguage('es'), 'es-ES');
  assert.equal(htmlLanguage('us'), 'en-US');
  assert.equal(htmlLanguage('latam'), 'es-419');
  assert.equal(seoLanguage('latam'), 'es');
  assert.equal(locales.reduce((count, locale) => count + dictionaries[locale].articles.length, 0), 247);
  assert.equal(articleRegistry.length, 20);
  for (const locale of locales) {
    assert.equal(measurementPath(`/${locale}/dashboard/private`), null);
    assert.equal(measurementPath(`/${locale}/api/private`), null);
    assert.equal(sanitizeMeasurementUrl(`https://serviciosonlineweb.com/${locale}/api/private?email=private`), null);
    for (const a of dictionaries[locale].articles) {
      for (const [language, url] of Object.entries(equivalents('article', a.id))) {
        assert.ok(language === 'x-default' || /^[a-z]{2}(?:-[A-Z]{2})?$/.test(language));
        assert.ok(!url.includes('undefined'));
      }
    }
  }
});

test('existing article URLs and publication dates remain stable', () => {
  for (const original of originalRoutes) {
    for (const [locale, slug] of Object.entries(original.slugs)) {
      const d = dictionaries[locale as keyof typeof dictionaries];
      assert.equal(d.articles.find(a => a.id === original.id)?.slug, slug);
    }
  }
  for (const article of spanishArticles) {
    const original = originalRoutes.some(row => row.slugs.es === article.slug);
    assert.equal(article.publishedAt.toISOString(), original ? '2026-10-25T12:00:00.000Z' : '2026-10-26T00:00:00.000Z');
  }
});

test('editorial SEO and registries agree with all actual dictionaries', () => {
  for (const locale of locales) {
    const d = dictionaries[locale];
    assert.ok(d.pageSeo, `${locale}: missing pageSeo`);
    for (const key of ['home', 'services', 'web', 'shop', 'ai', 'about', 'projects', 'contact', 'blog'] as const) {
      const seo: { title: string; description: string } | undefined = d.pageSeo![key];
      assert.ok(seo?.title && seo.description, `${locale}/${key}: missing SEO copy`);
      const metadata = internationalMetadata(locale, { key });
      assert.equal(metadata.description, seo.description);
      assert.ok((metadata.title as { absolute: string }).absolute.startsWith(seo.title));
    }
    for (const item of articleRegistry) {
      assert.equal(item.slugs[locale], d.articles.find(a => a.id === item.id)?.slug);
    }
    for (const article of d.articles) {
      const links = languageLinks(articlePath(locale, article.id));
      assert.equal(links.length, locales.filter(l => dictionaries[l].articles.some(a => a.id === article.id)).length);
      assert.ok(links.every(link => !link.href.includes('undefined')));
    }
  }
  const market = equivalents('article', 'market-entry-seo');
  assert.equal(market['x-default'], market['en-US']);
  assert.equal(market['es-ES'], undefined);
});

test('source has no obsolete Latech contact email', () => {
  function walk(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(join(directory, entry.name)) : /\.(?:tsx?|json)$/.test(entry.name) ? [join(directory, entry.name)] : []);
  }
  const obsolete = new RegExp('info\\.?@' + 'latech\\.es', 'i');
  for (const file of walk('src')) assert.ok(!obsolete.test(readFileSync(file, 'utf8')), file);
});


test('original 54 publication dates remain stable and 193 expansion articles use the release day', () => {
  let originalCount = 0;
  let expansionCount = 0;
  assert.equal(INTERNATIONAL_UPDATE_DATE, '2026-10-26');
  for (const locale of locales) {
    for (const article of dictionaries[locale].articles) {
      const original = originalRoutes.some(row => row.id === article.id && locale in row.slugs);
      const expected = original ? '2026-10-25T12:00:00Z' : '2026-10-26';
      assert.equal(articleDate(locale, article.id), expected, `${locale}/${article.id}`);
      const metadata = internationalMetadata(locale, { key: 'article', article });
      assert.equal((metadata.openGraph as { publishedTime: string }).publishedTime, expected);
      assert.equal((metadata.openGraph as { modifiedTime: string }).modifiedTime, INTERNATIONAL_UPDATE_DATE);
      if (original) originalCount++; else expansionCount++;
    }
  }
  assert.equal(originalCount, 54);
  assert.equal(expansionCount, 193);
  assert.ok(internationalSitemap().every(entry => entry.lastModified === INTERNATIONAL_UPDATE_DATE));
});
