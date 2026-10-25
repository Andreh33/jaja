import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { scrollRemoteView } from '../src/lib/tv-remote-view';

const root = fileURLToPath(new URL('../src/', import.meta.url));
const read = (path: string) => readFileSync(join(root, path), 'utf8');

function filesIn(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap(entry => {
    const file = join(path, entry.name);
    return entry.isDirectory() ? filesIn(file) : /\.(css|tsx?)$/.test(entry.name) ? [file] : [];
  });
}

describe('Public full-motion experience', () => {
  it('does not automatically disable public effects from the system motion preference', () => {
    const files = ['components/home', 'components/effects', 'components/arcade', 'components/layout', 'app/(es)/lab']
      .flatMap(path => filesIn(join(root, path)));
    files.push(join(root, 'app/globals.css'), join(root, 'app/blue-experience.css'), join(root, 'lib/tv-remote-view.ts'));
    for (const file of files) {
      assert.doesNotMatch(readFileSync(file, 'utf8'), /prefers-reduced-motion|useReducedMotion|motion-reduce:|motion-safe:/, file);
    }
    assert.match(read('components/effects/NumberFlow.tsx'), /respectMotionPreference=\{false\}/);
  });

  it('preserves explicit pause, visibility, data-saving and touch safeguards', () => {
    assert.match(read('components/home/Hero.tsx'), /setPulsePaused\(value => !value\)/);
    assert.match(read('components/home/ServerAtmosphere.tsx'), /inView && !document.hidden && !pauseRequested.current && !connection\?\.saveData/);
    assert.match(read('components/home/StudioGravity.tsx'), /if \(!active \|\| !visible \|\| paused\) return/);
    assert.match(read('components/home/playground/EscapeGame.tsx'), /reduceRef.current = lowEffects/);
    assert.match(read('components/effects/MagneticButton.tsx'), /\(hover: hover\) and \(pointer: fine\)/);
  });

  it('smoothly scrolls the correct surface even when the OS requests reduced motion', () => {
    const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
    const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
    const pageCalls: ScrollToOptions[] = [];
    const studioCalls: ScrollToOptions[] = [];
    Object.defineProperty(globalThis, 'window', { configurable: true, value: {
      innerHeight: 1000,
      matchMedia: () => ({ matches: true }),
      scrollBy: (options: ScrollToOptions) => pageCalls.push(options),
    } });
    Object.defineProperty(globalThis, 'document', { configurable: true, value: {
      querySelector: () => ({ querySelector: () => ({ clientHeight: 500, scrollBy: (options: ScrollToOptions) => studioCalls.push(options) }) }),
    } });
    try {
      scrollRemoteView(1, false);
      scrollRemoteView(-1, true);
      assert.deepEqual(pageCalls, [{ top: 720, behavior: 'smooth' }]);
      assert.deepEqual(studioCalls, [{ top: -360, behavior: 'smooth' }]);
    } finally {
      if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
      else Reflect.deleteProperty(globalThis, 'window');
      if (previousDocument) Object.defineProperty(globalThis, 'document', previousDocument);
      else Reflect.deleteProperty(globalThis, 'document');
    }
  });
});
