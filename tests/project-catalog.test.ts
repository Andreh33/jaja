import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { projects } from '../src/lib/projects';
import { tvProjects, isTvChannel } from '../src/lib/tv-channels';
import { featuredProjects } from '../src/components/home/featured-projects';
import { GET } from '../src/app/studio-browser/[project]/route';

const removed = ['fulldip-sur', 'sear', 'the-boat-house', 'autoselect-sevilla',
  'pruden-hijos', 'meson-casa-andres', 'industrial-fighters', 'proyecto-1',
  'french-tacos', 'el-refugio-de-a-cabana', 'maison-noir'];

describe('Public project selection', () => {
  it('keeps custom-domain projects plus the two explicitly requested exceptions', () => {
    assert.deepEqual(projects.map(project => project.id), [
      'granja-orea', 'f5-arquitectos', 'quality-homes', 'megias-frutas',
      'zonasport', 'panelex', 'monopatinmonkey', 'toldos-noa',
    ]);
    assert.deepEqual(projects.filter(project => new URL(project.url).hostname.endsWith('.vercel.app'))
      .map(project => project.id).sort(), ['zonasport']);
    assert.equal(projects.find(project => project.id === 'megias-frutas')?.url, 'https://frutasmegias.com/');
    assert.equal(new Set(projects.map(project => project.id)).size, projects.length);
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
