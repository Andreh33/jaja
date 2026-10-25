import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { test } from 'node:test';
import InternationalPage from '../src/components/international/InternationalPage';
import { selectGuides } from '../src/components/international/related-guides';
import { projects } from '../src/lib/projects';
import { dictionaries, locales, articlePath, seoLanguage, articleDate, INTERNATIONAL_UPDATE_DATE, type ResolvedPage } from '../src/lib/international';

function render(locale: typeof locales[number], page: ResolvedPage) {
  return renderToStaticMarkup(createElement(InternationalPage, { locale, page }));
}

function anchors(html: string) {
  return Array.from(html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g), match => ({
    href: /\bhref="([^"]*)"/.exec(match[1])?.[1],
    language: /\bhrefLang="([^"]*)"/i.exec(match[1])?.[1],
    content: match[2],
  }));
}

test('every localized home and portfolio renders all thirteen real projects as image and text links', () => {
  assert.equal(projects.length, 13);
  for (const locale of locales) {
    for (const key of ['home', 'projects'] as const) {
      const html = render(locale, { key });
      const links = anchors(html);
      const portfolio = links.filter(link => projects.some(project => project.url === link.href));
      assert.equal(new Set(portfolio.map(link => link.href)).size, 13, `${locale}/${key}: incomplete portfolio`);
      for (const project of projects) {
        const link = portfolio.find(link => link.href === project.url && link.content.includes('<h3>'));
        assert.ok(link, `${locale}/${key}: missing text link for ${project.name}`);
        assert.ok(link.content.includes('<img '), `${locale}/${key}: missing image for ${project.name}`);
      }
      assert.ok(!html.includes('mailto:'), `${locale}/${key}: unexpected email contact`);
      assert.ok(links.some(link => link.href?.startsWith('https://wa.me/34684739091')), `${locale}/${key}: missing WhatsApp`);
      assert.ok(links.some(link => link.href === 'tel:+34684739091'), `${locale}/${key}: missing telephone`);
    }
  }
});

test('article language navigation renders only existing translations of the old AI topic', () => {
  const article = dictionaries.en.articles.find(article => article.id === 'ai-automation');
  assert.ok(article);
  const html = render('en', { key: 'article', article });
  const languageMenus = Array.from(html.matchAll(/<nav\b[^>]*class="intl-languages"[^>]*>([\s\S]*?)<\/nav>/g), match => match[1]).join('');
  const links = anchors(languageMenus).filter(link => link.language);
  for (const locale of locales) {
    const available = dictionaries[locale].articles.some(candidate => candidate.id === article.id);
    const translation = links.filter(link => link.language === seoLanguage(locale));
    if (available) {
      assert.ok(translation.some(link => link.href === articlePath(locale, article.id)), `${locale}: missing translated article`);
    } else {
      assert.equal(translation.length, 0, `${locale}: dead article translation`);
    }
  }
  assert.ok(!links.some(link => link.href?.includes('undefined')));
});


test('home and commercial journeys prioritize useful SEO guides as their translations become available', () => {
  const expected: Record<string, string[]> = {
    home: ['seo-audit', 'seo-titles-clicks', 'conversion-landing'],
    web: ['seo-audit', 'search-intent', 'technical-indexing'],
    shop: ['online-store', 'image-seo', 'conversion-landing'],
  };
  for (const locale of locales) {
    for (const [context, priorities] of Object.entries(expected)) {
      const selected = selectGuides(dictionaries[locale].articles, context);
      const availablePriorities = priorities.filter(id => dictionaries[locale].articles.some(article => article.id === id));
      assert.deepEqual(selected.slice(0, availablePriorities.length).map(article => article.id), availablePriorities);
      assert.equal(selected.length, Math.min(3, dictionaries[locale].articles.filter(article => article.id !== 'ai-automation').length));
      const html = render(locale, { key: context === 'home' ? 'home' : context as 'web' | 'shop' });
      for (const article of selected) assert.ok(anchors(html).some(link => link.href === articlePath(locale, article.id)), `${locale}/${context}: guide not linked`);
    }
  }
});

test('related guides exclude the current article and stay valid when only some translations exist', () => {
  const partial = [{ id: 'seo-audit' }, { id: 'website-leads' }, { id: 'technical-indexing' }];
  assert.deepEqual(selectGuides(partial, 'seo-audit', 'seo-audit').map(article => article.id), ['technical-indexing', 'website-leads']);
  assert.deepEqual(selectGuides([], 'home'), []);
  for (const locale of locales) {
    const articles = dictionaries[locale].articles;
    const linked = new Set(['home', 'web', 'shop', ...articles.map(article => article.id)].flatMap(context => selectGuides(articles, context, context).map(article => article.id)));
    for (const id of ['seo-audit', 'search-intent', 'service-pages', 'seo-titles-clicks', 'search-console-leads', 'technical-indexing', 'content-clusters', 'image-seo', 'conversion-landing', 'seo-content-maintenance']) {
      if (articles.some(article => article.id === id)) assert.ok(linked.has(id), `${locale}: orphan guide ${id}`);
    }
  }
});


test('visible article publication dates match JSON-LD for legacy and expansion editions', () => {
  for (const [locale, id] of [['en', 'website-leads'], ['en', 'seo-audit'], ['us', 'website-leads']] as const) {
    const article = dictionaries[locale].articles.find(article => article.id === id);
    assert.ok(article);
    const html = render(locale, { key: 'article', article });
    const published = articleDate(locale, id);
    assert.ok(html.includes(`<time dateTime="${published}">`), `${locale}/${id}: visible date`);
    assert.ok(html.includes(`"datePublished":"${published}"`), `${locale}/${id}: structured publication date`);
    assert.ok(html.includes(`"dateModified":"${INTERNATIONAL_UPDATE_DATE}"`), `${locale}/${id}: structured update date`);
  }
});
