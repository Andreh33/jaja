import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/components/effects/IntroCinematic.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/components/effects/IntroCinematic.module.css', import.meta.url), 'utf8');

describe('First-visit brand opening', () => {
  it('keeps the mobile duration and bounds real preloading with a fail-safe', () => {
    assert.match(source, /const OPENING_DURATION_MS = 2500;/);
    assert.match(source, /const PRELOAD_DEADLINE_MS = 4200;/);
    assert.match(source, /setTimeout\(dismiss, PRELOAD_DEADLINE_MS \+ OPENING_DURATION_MS \+ 300\)/);
    assert.match(source, /if \(!show\) return;/);
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

  it('uses resource completion, not a fictional progress timer', () => {
    assert.match(source, /document\.fonts\.ready/);
    assert.match(source, /image\.decode\(\)/);
    assert.match(source, /const initialResources = \[\.\.\.warmImages, fonts\]/);
    assert.match(source, /Promise\.allSettled\(initialResources\)/);
    assert.match(source, /new URL\(url, location\.href\)\.origin === location\.origin/);
    assert.doesNotMatch(source, /setInterval/);
  });

  it('reveals the new atmosphere without waiting for the whole film', () => {
    assert.match(source, /SERVER_POSTER/);
    assert.match(source, /video\.readyState >= 2/);
    assert.match(source, /setTimeout\(finish, 1200\)/);
    assert.match(source, /dataset\.brandOpening = 'loading'/);
    assert.match(source, /dataset\.brandOpening = 'revealing'/);
    assert.match(source, /delete document\.documentElement\.dataset\.brandOpening/);
    assert.match(source, /mediaCleanup\.forEach/);
    assert.doesNotMatch(source, /canplaythrough/);
  });

  it('projects the desktop logo into the real television and preserves mobile curtains', () => {
    assert.match(source, /desktop \? \['camera'\] : \['left', 'right'\]/);
    assert.match(source, /\[data-crt-corner\]/);
    assert.match(source, /crtCameraFrames\(window\.innerWidth, window\.innerHeight, corners\)/);
    assert.match(source, /animations\.forEach\(animation => animation\.cancel\(\)\)/);
    assert.match(source, /window\.addEventListener\('resize', onResize\)/);
  });
});
