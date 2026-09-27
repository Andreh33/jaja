import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SERVER_POSTER, serverVideoSource } from '../src/components/home/server-atmosphere';
import { crtChannel } from '../src/components/home/crt-channel';
import { studioPages } from '../src/components/home/studio-model';

describe('Server atmosphere and CRT channel lighting', () => {
  it('serves a device-appropriate film and never forces video on reduced motion or data saving', () => {
    assert.match(serverVideoSource(390)!, /mirrored-720/);
    assert.match(serverVideoSource(767)!, /mirrored-720/);
    assert.match(serverVideoSource(768)!, /mirrored-1080/);
    assert.match(serverVideoSource(1600)!, /mirrored-1080/);
    assert.match(serverVideoSource(3840)!, /mirrored-1080/);
    assert.equal(serverVideoSource(3840, true), null);
    assert.equal(serverVideoSource(3840, false, true), null);
  });

  it('maps every Studio page and contained project to its own actual channel', () => {
    studioPages.forEach((page) => {
      const channel = crtChannel(page.id);
      assert.equal(channel.number, 'CH 00');
      assert.equal(channel.label, page.label);
    });
    assert.equal(crtChannel('home').tone, 'blue');
    assert.equal(crtChannel('projects').tone, 'cyan');
    assert.equal(crtChannel('play').tone, 'green');
    assert.equal(crtChannel('create', false, 0, 'orange').tone, 'amber');
    assert.equal(crtChannel('projects', true, 0).label, 'Monopatín Monkey');
    assert.equal(crtChannel('projects', true, 1).tone, 'green');
    assert.equal(crtChannel('projects', true, 1).label, 'CLM French Tacos');
  });

  it('preserves the existing animated layers and exact requested film opacity', () => {
    const read = (path: string) => readFileSync(new URL(`../src/components/home/${path}`, import.meta.url), 'utf8');
    assert.match(read('ServerAtmosphere.module.css'), /\.film\{[^}]*opacity:\.37/);
    assert.ok(read('ServerAtmosphere.module.css').includes(SERVER_POSTER));
    for (const path of [SERVER_POSTER, serverVideoSource(390)!, serverVideoSource(1600)!]) {
      assert.ok(readFileSync(new URL(`../public${path}`, import.meta.url)).length > 0);
    }
    assert.match(read('ServerAtmosphere.module.css'), /z-index:-3/);
    assert.match(read('Hero.tsx'), /<PulseGrid paused=/);
    assert.match(read('Hero.tsx'), /transform: lightTransform/);
    assert.match(read('Hero.tsx'), /transform: backgroundTransform/);
    assert.match(read('ServerAtmosphere.tsx'), /document\.hidden/);
    assert.match(read('ServerAtmosphere.tsx'), /IntersectionObserver/);
    assert.match(read('ServerAtmosphere.tsx'), /muted loop playsInline preload="metadata"/);
  });
});
