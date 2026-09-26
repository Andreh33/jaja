import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { serverVideoSource } from '../src/components/home/server-atmosphere';
import { crtChannel } from '../src/components/home/crt-channel';
import { studioPages } from '../src/components/home/studio-model';

describe('Server atmosphere and CRT channel lighting', () => {
  it('serves a device-appropriate film and never forces video on reduced motion or data saving', () => {
    assert.match(serverVideoSource(390, 3)!, /720/);
    assert.match(serverVideoSource(1600, 1)!, /1080/);
    assert.match(serverVideoSource(1600, 2)!, /4k/);
    assert.match(serverVideoSource(3840, 1)!, /4k/);
    assert.equal(serverVideoSource(3840, 1, true), null);
    assert.equal(serverVideoSource(3840, 1, false, true), null);
  });

  it('maps every Studio page and contained project to its own actual channel', () => {
    studioPages.forEach((page, index) => {
      const channel = crtChannel(page.id);
      assert.equal(channel.number, `CH ${String(index + 1).padStart(2, '0')}`);
      assert.equal(channel.label, page.label);
    });
    assert.equal(crtChannel('home').tone, 'blue');
    assert.equal(crtChannel('projects').tone, 'cyan');
    assert.equal(crtChannel('play').tone, 'green');
    assert.equal(crtChannel('create', false, 0, 'orange').tone, 'amber');
    assert.equal(crtChannel('projects', true, 0).label, 'Monkey');
    assert.equal(crtChannel('projects', true, 1).tone, 'cyan');
    assert.equal(crtChannel('projects', true, 2).label, 'French Tacos');
  });

  it('preserves the existing animated layers and exact requested film opacity', () => {
    const read = (path: string) => readFileSync(new URL(`../src/components/home/${path}`, import.meta.url), 'utf8');
    assert.match(read('ServerAtmosphere.module.css'), /\.film\{[^}]*opacity:\.27/);
    assert.match(read('ServerAtmosphere.module.css'), /z-index:-3/);
    assert.match(read('Hero.tsx'), /<PulseGrid paused=/);
    assert.match(read('Hero.tsx'), /transform: lightTransform/);
    assert.match(read('Hero.tsx'), /transform: backgroundTransform/);
    assert.match(read('ServerAtmosphere.tsx'), /document\.hidden/);
    assert.match(read('ServerAtmosphere.tsx'), /IntersectionObserver/);
    assert.match(read('ServerAtmosphere.tsx'), /muted loop playsInline preload="metadata"/);
  });
});
