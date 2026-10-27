import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { projects } from '../src/lib/projects';
import { tvProjects, isTvChannel } from '../src/lib/tv-channels';
import { featuredProjects } from '../src/components/home/featured-projects';
import { GET } from '../src/app/(es)/studio-browser/[project]/route';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SelectedProjects from '../src/components/home/SelectedProjects';

const removed = ['fulldip-sur', 'sear', 'the-boat-house', 'autoselect-sevilla',
  'pruden-hijos', 'meson-casa-andres', 'industrial-fighters', 'proyecto-1',
  'french-tacos', 'el-refugio-de-a-cabana', 'maison-noir'];

describe('Public project selection', () => {
  it('keeps custom-domain projects and the explicitly requested school and Zona Sport', () => {
    assert.deepEqual(projects.map(project => project.id), [
      'colegio-santo-tomas', 'granja-orea', 'f5-arquitectos', 'quality-homes', 'megias-frutas',
      'zonasport', 'panelex', 'monopatinmonkey', 'toldos-noa',
      'autoescuela-agora', 'precios-locos', 'los-leones-nuptiae', 'my-special-hair', 'gigantes-street-food',
    ]);
    assert.deepEqual(projects.filter(project => new URL(project.url).hostname.endsWith('.vercel.app'))
      .map(project => project.id).sort(), ['zonasport']);
    assert.equal(projects.find(project => project.id === 'megias-frutas')?.url, 'https://frutasmegias.com/');
    assert.equal(new Set(projects.map(project => project.id)).size, projects.length);
  });

  it('shows GIGANTES in the Spanish home archive while preserving the three highlights', () => {
    const html = renderToStaticMarkup(createElement(SelectedProjects));
    assert.ok(html.includes('https://gigantesstreetfood.com/'));
    assert.ok(html.includes('GIGANTES Street Food'));
    assert.ok(html.includes('gigantes-street-food.webp'));
    assert.equal(featuredProjects.length, 3);
  });

  it('shows the school in the portfolio without opening a blocked TV frame', async () => {
    const school = projects.find(project => project.id === 'colegio-santo-tomas');
    assert.equal(school?.name, 'Colegio Santo Tomás');
    assert.equal(school?.url, 'https://colegiosantotomas.es/');
    assert.equal(isTvChannel('colegio-santo-tomas'), false);
    assert.ok(!tvProjects.some(project => project.id === school?.id));
    const response = await GET(new Request('https://example.com/'), {
      params: Promise.resolve({ project: 'colegio-santo-tomas' }),
    });
    assert.equal(response.status, 404);
  });

  it('keeps three home highlights with valid catalog links and existing images', () => {
    assert.equal(featuredProjects.length, 3);
    assert.deepEqual(featuredProjects.map(project => project.name), ['Monkey', 'Zona Sport', 'Frutas Megías']);
    for (const project of [...projects, ...featuredProjects]) {
      assert.ok(projects.some(entry => entry.url === project.url), project.url);
      assert.ok(existsSync(new URL(`../public${project.image}`, import.meta.url)), project.image);
    }
    assert.ok(tvProjects.every(project => projects.some(entry => entry.id === project.id)));
  });

  it('removes retired projects from the catalog, TV guide and direct frame routes', async () => {
    for (const id of removed) {
      assert.ok(!projects.some(project => project.id === id), id);
      assert.equal(isTvChannel(id), false, id);
      const response = await GET(new Request('https://example.com/'), { params: Promise.resolve({ project: id }) });
      assert.equal(response.status, 404, id);
    }
  });
});
