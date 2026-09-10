import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEditorialPreview, parseEditorialPiece } from '../scripts/lib/editorial-preview';
import { publicQaPosts } from '../scripts/lib/public-qa-posts';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sample = readFileSync(join(projectRoot, 'docs/editorial/actualizaciones/01-precio-web.md'), 'utf8');

describe('explicit local editorial preview', () => {
  it('imports only the body and approved fields, removing the duplicate H1', () => {
    const piece = parseEditorialPiece(sample);
    assert.equal(piece.kind, 'actualizacion');
    assert.equal(piece.post.slug, 'cuanto-cuesta-pagina-web-espana');
    assert.ok(piece.post.title.includes(':'));
    assert.ok(piece.post.content.includes('| Creación | 600 € |'));
    assert.ok(!/^# /m.test(piece.post.content));
    assert.ok(!piece.post.content.includes('Nota editorial:'));
    assert.deepEqual(Object.keys(piece.post).sort(), ['author', 'category', 'content', 'excerpt', 'readingMinutes', 'slug', 'title']);
  });

  it('changes exactly eight historical posts and adds six without mutating the 76 originals', () => {
    const before = JSON.stringify(publicQaPosts);
    const result = loadEditorialPreview(publicQaPosts, projectRoot);
    assert.equal(result.length, 82);
    assert.equal(new Set(result.map(post => post.slug)).size, 82);
    assert.equal(JSON.stringify(publicQaPosts), before);
    assert.deepEqual(result.slice(0, 76).map(post => post.slug), publicQaPosts.map(post => post.slug));
    assert.equal(result.slice(0, 76).filter((post, index) => post.content !== publicQaPosts[index].content).length, 8);
    for (const post of result) {
      assert.ok(!post.content.includes('<!-- CUERPO -->'));
      assert.ok(!Object.hasOwn(post, 'publishedAt'));
      assert.ok(!Object.hasOwn(post, 'published'));
    }
    assert.ok(result.find(post => post.slug === 'caso-latech-calculadora-presupuesto-whatsapp')?.content.includes('nuestro propio sitio'));
  });

  it('rejects unsupported metadata, duplicate keys, unsafe slugs and unknown categories', () => {
    for (const text of [
      sample.replace('tipo: actualizacion', 'tipo: actualizacion\npassword: ignored'),
      sample.replace('tipo: actualizacion', 'tipo: actualizacion\ntipo: nuevo'),
      sample.replace('slug: cuanto-cuesta-pagina-web-espana', 'slug: ../../admin'),
      sample.replace('categoria: Diseño Web', 'categoria: Nonexistent'),
      sample.replace('estado: borrador_local_no_publicado', 'estado: published'),
    ]) assert.throws(() => parseEditorialPiece(text), /^Error: Editorial preview:/);
  });

  it('rejects missing, repeated or inverted markers and mismatched body titles', () => {
    for (const text of [
      sample.replace('<!-- CUERPO -->', ''),
      sample + '\n<!-- FIN_CUERPO -->',
      sample.replace('<!-- CUERPO -->', '__QA_MARKER__').replace('<!-- FIN_CUERPO -->', '<!-- CUERPO -->').replace('__QA_MARKER__', '<!-- FIN_CUERPO -->'),
      sample.replace('# Cuánto cuesta una página web:', '# Otro título:'),
      sample.replace('## Un ejemplo que puedas comprobar', 'Nota editorial: no publicar'),
    ]) assert.throws(() => parseEditorialPiece(text), /^Error: Editorial preview:/);
  });

  it('requires the complete unique historical fixture and detects new URL collisions', () => {
    assert.throws(() => loadEditorialPreview(publicQaPosts.slice(1), projectRoot), /76 unique/);
    assert.throws(() => loadEditorialPreview([...publicQaPosts.slice(1), publicQaPosts[1]], projectRoot), /76 unique/);
    const colliding = publicQaPosts.map(post => ({ ...post }));
    const unchanged = loadEditorialPreview(publicQaPosts, projectRoot).slice(0, 76).findIndex((post, index) => post.content === publicQaPosts[index].content);
    colliding[unchanged].slug = 'convertir-dibujo-en-nivel-latech-lab';
    assert.throws(() => loadEditorialPreview(colliding, projectRoot), /new slug collides/);
  });

  it('detects duplicate editorial destinations and an incomplete package before returning data', () => {
    const root = mkdtempSync(join(tmpdir(), 'latech-editorial-test-'));
    try {
      cpSync(join(projectRoot, 'docs/editorial'), join(root, 'docs/editorial'), { recursive: true });
      const file = join(root, 'docs/editorial/nuevos/02-tres-misterios.md');
      writeFileSync(file, readFileSync(file, 'utf8').replace('slug_propuesto: tres-pruebas-reservas-carrito-buscador', 'slug_propuesto: convertir-dibujo-en-nivel-latech-lab'));
      assert.throws(() => loadEditorialPreview(publicQaPosts, root), /duplicate editorial slug/);
      rmSync(file);
      assert.throws(() => loadEditorialPreview(publicQaPosts, root), /expected 4 Markdown/);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
});
