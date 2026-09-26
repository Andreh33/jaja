import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import StudioBrowser from '../src/components/home/StudioBrowser';
import { studioBrowserProject } from '../src/components/home/studio-browser-model';
import { GET } from '../src/app/studio-browser/[project]/route';

const callbacks = { onClose() {}, onProject() {}, onExpand() {} };
const render = (project: number, active = true) => renderToStaticMarkup(createElement(StudioBrowser, { project, active, expanded: false, ...callbacks }));

describe('Studio project browser', () => {
  it('uses only the three curated destinations and safely handles invalid indices', () => {
    assert.equal(studioBrowserProject(0).hostname, 'monopatinmonkey.com');
    assert.equal(studioBrowserProject(2).hostname, 'frenchtacos.vercel.app');
    for (const index of [-1, 99, .5, Number.NaN]) assert.equal(studioBrowserProject(index).project.name, 'Monkey');
  });
  it('respects the known SAMEORIGIN policy without creating a broken iframe', () => {
    assert.equal(studioBrowserProject(1).embeddable, false);
    const html = render(1);
    assert.ok(!html.includes('<iframe'));
    assert.ok(html.includes('no permite abrirse dentro de otra'));
    assert.ok(html.includes('zonasport.vercel.app'));
  });
  it('loads a live frame only in the active instance, with top navigation blocked', () => {
    const html = render(0);
    assert.ok(html.includes('<iframe'));
    assert.ok(html.includes('title="Web de Monkey: navegación interactiva"'));
    assert.ok(html.includes('src="/studio-browser/monkey"'));
    assert.ok(!html.includes('target="_blank"'));
    assert.ok(!render(0, false).includes('<iframe'));
  });
  it('keeps return, reload and enlargement controls explicitly labelled without external navigation', () => {
    const html = render(2);
    for (const label of ['Volver a Latech Studio', 'Recargar el inicio de French Tacos', 'Ampliar navegador de proyectos']) assert.ok(html.includes(label));
    assert.ok(!html.includes('target="_blank"'));
  });
  it('restricts the frame shell to one exact project origin and disables popups/top navigation', async () => {
    for (const [slug, origin] of [['monkey', 'https://monopatinmonkey.com'], ['french-tacos', 'https://frenchtacos.vercel.app']]) {
      const response = await GET(new Request('https://example.com/'), { params: Promise.resolve({ project: slug }) });
      assert.equal(response.status, 200);
      assert.ok(response.headers.get('Content-Security-Policy')?.includes(`frame-src ${origin};`));
      const html = await response.text();
      assert.ok(html.includes('sandbox="allow-scripts allow-same-origin allow-forms"'));
      assert.ok(!html.includes('allow-popups'));
      assert.ok(!html.includes('allow-top-navigation'));
      assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, nofollow');
    }
  });
  it('never accepts arbitrary frame URLs or bypasses a project framing restriction', async () => {
    for (const [slug, status] of [['https://outside.example', 404], ['__proto__', 404], ['zona-sport', 403]] as const) {
      const response = await GET(new Request('https://example.com/'), { params: Promise.resolve({ project: slug }) });
      assert.equal(response.status, status);
    }
  });
});
