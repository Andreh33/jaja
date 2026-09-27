let context: AudioContext | null = null;
let enabled = true;
let initialized = false;
let last = 0;
const listeners = new Set<() => void>();
const STORAGE = 'latech-arcade-sound';
export function arcadeSoundEnabled() { return enabled; }
export function subscribeArcadeSound(callback: () => void) { listeners.add(callback); return () => listeners.delete(callback); }
export async function unlockArcadeSound() {
  if (!enabled) return;
  try { context ??= new AudioContext(); if (context.state === 'suspended') await context.resume(); } catch { /* Retry on the next user gesture. */ }
}
/** Autoplay-safe: enabled by default, unlocked only by a real local gesture. */
export function initializeArcadeSound() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  try { enabled = localStorage.getItem(STORAGE) !== 'off'; } catch { /* Default remains on. */ }
  listeners.forEach(fn => fn());
  window.addEventListener('pointerdown', () => { void unlockArcadeSound(); }, { passive: true });
  window.addEventListener('keydown', () => { void unlockArcadeSound(); });
}
export async function toggleArcadeSound() {
  enabled = !enabled;
  try { localStorage.setItem(STORAGE, enabled ? 'on' : 'off'); } catch { /* In-memory preference works. */ }
  listeners.forEach(fn => fn());
  if (enabled) { await unlockArcadeSound(); playArcadeSound('select'); }
  return enabled;
}
export function playArcadeSound(kind: string) {
  if (!enabled || !context || context.state !== 'running' || document.hidden) return;
  const now = context.currentTime; if (now - last < .028) return; last = now;
  const settings: Record<string, [number, number, number]> = { jump:[280,650,.12],coin:[880,1320,.1],hit:[130,55,.13],checkpoint:[520,1040,.26],power:[440,990,.3],finish:[660,1320,.4],select:[240,320,.06],block:[300,180,.08],build:[380,220,.07],break:[180,65,.1],dash:[420,95,.12],parry:[1200,600,.18],scan:[500,1000,.3] };
  const [from,to,duration] = settings[kind] ?? settings.select;
  const tone = context.createOscillator(), gain = context.createGain();
  tone.type = ['hit','break'].includes(kind) ? 'sawtooth' : 'triangle';
  tone.frequency.setValueAtTime(from,now); tone.frequency.exponentialRampToValueAtTime(to,now+duration);
  gain.gain.setValueAtTime(.001,now); gain.gain.linearRampToValueAtTime(kind==='hit'?.04:.055,now+.008); gain.gain.exponentialRampToValueAtTime(.001,now+duration);
  tone.connect(gain); gain.connect(context.destination); tone.start(now); tone.stop(now+duration+.01);
  tone.onended=()=>{tone.disconnect();gain.disconnect();};
}
