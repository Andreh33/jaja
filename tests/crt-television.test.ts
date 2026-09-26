import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import CrtTelevision from '../src/components/home/CrtTelevision';

const read = (name: string) => readFileSync(new URL(`../src/components/home/${name}`, import.meta.url), 'utf8');
const css = read('CrtTelevision.module.css');

describe('Desktop CRT television surround', () => {
  it('keeps one live child, not an image or duplicate responsive experience', () => {
    const html = renderToStaticMarkup(createElement(CrtTelevision, {
      paused: false, onNavigate() {}, onExpand() {},
    }, createElement('div', { 'data-test-live-screen': true }, 'Interactive Studio')));
    assert.equal((html.match(/data-test-live-screen/g) ?? []).length, 1);
    assert.match(html, /data-tube="true"/);
    assert.match(html, /aria-label="Efecto de tubo" aria-pressed="true"/);
    assert.match(html, /Canal 01: inicio de Latech Studio/);
    assert.match(html, /Canal 02: proyectos de Latech Studio/);
  });

  it('keeps mobile transparent and all decorative layers out of hit testing', () => {
    const mobile = css.slice(0, css.indexOf('@media(min-width:768px)'));
    assert.match(mobile, /\.television\{display:contents\}/);
    assert.match(mobile, /\.controls\{display:none\}/);
    assert.match(css, /\.glass\{display:block;position:absolute;pointer-events:none\}/);
    assert.match(css, /\.glass>span\{[^}]*pointer-events:none/);
    assert.match(read('Hero.module.css'), /\.copy\{[^}]*z-index:2/);
    assert.match(read('Hero.module.css'), /\.visual\{z-index:1\}/);
  });

  it('pauses analog motion, respects reduced motion and gives keyboard immediate feedback', () => {
    assert.match(css, /data-paused=true[^}]+animation-play-state:paused/);
    assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{\s*\.sweep\{animation:none;display:none\}/);
    assert.match(css, /data-keyboard=true[^}]+transition:none/);
    assert.doesNotMatch(css, /transition:all|@keyframes[^}]+(?:width|height|top|left):/);
  });

  it('routes physical channels through the live preview navigation and restores expansion focus', () => {
    const preview = read('HeroPreview.tsx');
    const hero = read('Hero.tsx');
    assert.match(preview, /useImperativeHandle\(navigationRef/);
    assert.match(preview, /studio\.setBrowsing\(false\);\s*navigate\(next, keyboardInput\)/);
    assert.match(hero, /previewRef\.current\?\.navigate\(page, keyboard\)/);
    assert.match(hero, /onCloseAutoFocus=/);
    assert.match(hero, /trigger\.focus\(\{ preventScroll: true \}\)/);
  });
});
