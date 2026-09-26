import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/components/effects/IntroCinematic.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/components/effects/IntroCinematic.module.css', import.meta.url), 'utf8');

describe('First-visit brand opening', () => {
  it('adds exactly one second and shares its duration with the fail-safe', () => {
    assert.match(source, /const OPENING_DURATION_MS = 2500;/);
    assert.match(source, /setTimeout\(dismiss, OPENING_DURATION_MS \+ 300\)/);
    assert.match(source, /if \(!show\) return;\s*const timeout = setTimeout/);
    assert.match(source, /'--opening-duration': `\$\{OPENING_DURATION_MS\}ms`/);
    assert.match(css, /animation-duration:var\(--opening-duration\)/);
  });

  it('keeps the real logo and motto, with a logo-shaped shine instead of a replacement asset', () => {
    assert.match(source, /src="\/brand\/latech-logo.webp"/);
    assert.match(source, /Tu imaginación es nuestro límite\./);
    assert.match(css, /mask:url\('\/brand\/latech-logo.webp'\)/);
    assert.match(css, /\.halo\{/);
    assert.match(css, /\.flare\{/);
  });

  it('retains skipping, first-visit storage and anchored-navigation guards', () => {
    assert.match(source, /window.location.hash \|\| window.scrollY > 20/);
    assert.match(source, /sessionStorage.getItem\(SEEN_KEY\)/);
    assert.match(source, /<Dialog.Close className=\{styles.skip\}>Saltar entrada/);
    assert.match(source, /event.target === event.currentTarget/);
  });

  it('shows this one-time opening under reduced motion as explicitly requested', () => {
    assert.doesNotMatch(source, /prefers-reduced-motion/);
    assert.doesNotMatch(css, /\.opening\{display:none\}/);
    assert.match(css, /\.opening \.curtain\{animation-duration:var\(--opening-duration\)!important\}/);
  });
});
