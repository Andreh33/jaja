/**
 * Tests de la lógica pura del emergente de instalación PWA.
 *
 * Run: npm test
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  shouldShowPrompt,
  detectPlatform,
  DISMISS_COOLDOWN_MS,
  type PromptEligibility,
} from '../src/lib/install-prompt';

const base: PromptEligibility = {
  installed: false,
  platform: 'chromium',
  hasDeferredPrompt: true,
  lastDismissedAt: null,
  now: 1_000_000_000_000,
};

describe('shouldShowPrompt', () => {
  it('no se muestra si la app ya está instalada', () => {
    assert.equal(shouldShowPrompt({ ...base, installed: true }), false);
  });

  it('no se muestra en plataforma no soportada', () => {
    assert.equal(shouldShowPrompt({ ...base, platform: 'unsupported' }), false);
  });

  it('Chromium con beforeinstallprompt capturado → se muestra', () => {
    assert.equal(shouldShowPrompt({ ...base, platform: 'chromium', hasDeferredPrompt: true }), true);
  });

  it('Chromium SIN beforeinstallprompt → no se muestra (no hay 1 clic)', () => {
    assert.equal(shouldShowPrompt({ ...base, platform: 'chromium', hasDeferredPrompt: false }), false);
  });

  it('iOS se muestra aunque no haya beforeinstallprompt (instrucciones)', () => {
    assert.equal(shouldShowPrompt({ ...base, platform: 'ios', hasDeferredPrompt: false }), true);
  });

  it('no se muestra si se cerró hace menos del cooldown', () => {
    const now = base.now;
    assert.equal(
      shouldShowPrompt({ ...base, platform: 'ios', lastDismissedAt: now - (DISMISS_COOLDOWN_MS - 1), now }),
      false,
    );
  });

  it('se vuelve a mostrar pasado el cooldown', () => {
    const now = base.now;
    assert.equal(
      shouldShowPrompt({ ...base, platform: 'ios', lastDismissedAt: now - (DISMISS_COOLDOWN_MS + 1), now }),
      true,
    );
  });

  it('instalada tiene prioridad sobre todo lo demás', () => {
    assert.equal(
      shouldShowPrompt({ ...base, installed: true, platform: 'ios', lastDismissedAt: null }),
      false,
    );
  });
});

describe('detectPlatform', () => {
  it('detecta iOS por user-agent', () => {
    const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15';
    const ipad = 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15';
    assert.equal(detectPlatform(iphone), 'ios');
    assert.equal(detectPlatform(ipad), 'ios');
  });

  it('trata el resto como chromium', () => {
    const android = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120';
    const desktop = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120';
    assert.equal(detectPlatform(android), 'chromium');
    assert.equal(detectPlatform(desktop), 'chromium');
  });
});
