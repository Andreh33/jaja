import assert from 'node:assert/strict';
import { test } from 'node:test';
import { campaignArticles } from '../src/content/seo-campaign-20261015';
import { renderArticle } from '../src/lib/markdown';
import nextConfig from '../next.config';

test('campaign preparation links render the existing guide and briefing destinations', () => {
  const cases = [
    { slug: 'estructura-de-una-pagina-de-servicios', href: '/blog/crear-una-web-para-una-nueva-empresa-en-espana', anchor: 'guía para crear una web para una nueva empresa' },
    { slug: 'medir-resultados-despues-de-estrenar-web', href: '/briefing', anchor: 'preparación del proyecto' },
  ];
  for (const entry of cases) {
    const article = campaignArticles.find(article => article.slug === entry.slug);
    assert.ok(article);
    const { html } = renderArticle(article.content);
    assert.match(html, new RegExp(`href="https://serviciosonlineweb.com${entry.href}"[^>]*>${entry.anchor}</a>`));
    assert.ok(!html.includes('https://serviciosonlineweb.com/prepara-tu-proyecto'));
    assert.ok(!html.includes('https://serviciosonlineweb.com/blog/crear-web-nueva-empresa-espana'));
    if (entry.href.startsWith('/blog/')) {
      assert.ok(campaignArticles.some(article => `/blog/${article.slug}` === entry.href));
    }
  }
});

test('the new-company guide links remote collaboration context to the existing explanation', () => {
  const guide = campaignArticles.find(article => article.slug === 'crear-una-web-para-una-nueva-empresa-en-espana');
  assert.ok(guide);
  const { html } = renderArticle(guide.content);
  assert.match(html, /href="https:\/\/serviciosonlineweb.com\/blog\/trabajar-agencia-web-a-distancia"[^>]*>preparar un proyecto a distancia con documentos y revisiones compartidas<\/a>/);
});

test('only the two obsolete editorial addresses redirect permanently to their equivalents', async () => {
  const redirects = await nextConfig.redirects!();
  for (const [source, destination] of [
    ['/prepara-tu-proyecto', '/briefing'],
    ['/blog/crear-web-nueva-empresa-espana', '/blog/crear-una-web-para-una-nueva-empresa-en-espana'],
  ]) {
    assert.ok(redirects.some(rule => rule.source === source && rule.destination === destination && rule.permanent === true));
  }
  for (const source of ['/mes', '/manifest.webmanifest', '/pagina', '/empleo/prueba', '/diseno-web-restaurantes']) {
    assert.ok(!redirects.some(rule => rule.source === source));
  }
});
