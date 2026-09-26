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

  it('hides the two secondary labels only on desktop without removing the pulse control', () => {
    const hero = source('home/Hero.tsx');
    const css = source('home/Hero.module.css');
    assert.match(hero, /className=\{styles\.desktopHidden\}>ESTUDIO DIGITAL INDEPENDIENTE/);
    assert.match(hero, /className=\{styles\.desktopHidden\}>LA MISMA MARCA\. OTRO MUNDO\./);
    assert.match(css, /@media\(min-width:768px\)\{\s*\.desktopHidden\{display:none\}/);
    assert.match(hero, /className=\{styles\.pulseControl\}/);
    assert.match(css, /\.copy\{container-type:inline-size\}/);
    assert.match(css, /font-size:clamp\(84px,22cqw,180px\)/);
  });

  it('reduces only mobile menu background alpha, leaving the whole panel opaque', () => {
    const nav = source('layout/Navbar.module.css');
    const mobile = nav.slice(nav.indexOf('@media (max-width: 767px)'));
    assert.match(mobile, /\.surface \{ background: rgb\(3 10 21 \/ \.837\)/);
    assert.match(mobile, /\.panel \{[^}]*background: rgb\(5 14 27 \/ \.9\)/);
    assert.doesNotMatch(mobile, /\.panel \{[^}]*\bopacity:/);
  });

  it('insets the laptop composition and sizes it against available height', () => {
    const hero = source('home/Hero.module.css');
    const preview = source('home/HeroPreview.module.css');
    assert.match(hero, /width:min\(1680px,calc\(100% - clamp\(128px,13vw,240px\)\)\)/);
    assert.match(hero, /@media\(min-width:1101px\) and \(max-width:1700px\) and \(max-height:950px\)/);
    assert.match(preview, /--studio-screen-height:clamp\(390px,calc\(100svh - 380px\),500px\)/);
  });
});
