import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = (file: string) => readFileSync(new URL(`../src/components/${file}`, import.meta.url), 'utf8');

describe('Home brand and Studio sizing', () => {
  it('uses the exact company motto while keeping the service-led page heading', () => {
    const hero = source('home/Hero.tsx');
    assert.match(hero, /Tu imaginación es nuestro límite\./);
    assert.doesNotMatch(hero, /Tu próxima ventaja empieza aquí/);
    assert.match(hero, /<h1 id="hero-title"/);
    assert.match(hero, /Diseño web\./);
  });

  it('shares the embedded viewport height with the contained project browser', () => {
    const preview = source('home/HeroPreview.module.css');
    const browser = source('home/StudioBrowser.module.css');
    assert.match(preview, /\.screen\{[^}]*height:var\(--studio-screen-height\)/);
    assert.match(browser, /height:calc\(var\(--studio-screen-height\) \+ var\(--studio-nav-height\)\)/);
    assert.match(preview, /data-expanded=true[^}]*--studio-screen-height:min\(740px,calc\(100dvh - 190px\)\)/);
  });

  it('reduces only mobile menu background alpha, leaving the whole panel opaque', () => {
    const nav = source('layout/Navbar.module.css');
    const mobile = nav.slice(nav.indexOf('@media (max-width: 767px)'));
    assert.match(mobile, /\.surface \{ background: rgb\(3 10 21 \/ \.837\)/);
    assert.match(mobile, /\.panel \{[^}]*background: rgb\(5 14 27 \/ \.9\)/);
    assert.doesNotMatch(mobile, /\.panel \{[^}]*\bopacity:/);
  });
});
