/** Synthesized sound effects with one disposable audio context per game. */
export function createEscapeAudio(isMuted: () => boolean) {
// ---------- AUDIO (sintetizado, sin assets) ----------
type AC = AudioContext & { _master?: GainNode };
let actx: AC | null = null;
const ensureAudio = () => {
  if (isMuted()) return;
  if (!actx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    actx = new Ctor() as AC;
    const m = actx.createGain(); m.gain.value = 0.32; m.connect(actx.destination); actx._master = m;
  }
  if (actx.state === 'suspended') void actx.resume().catch(() => {});
};
const tone = (f1: number, f2: number | null, dur: number, type: OscillatorType, gain: number, delay = 0) => {
  if (isMuted() || !actx?._master) return;
  const t0 = actx.currentTime + delay;
  const o = actx.createOscillator(); const gn = actx.createGain();
  o.type = type; o.frequency.setValueAtTime(f1, t0);
  if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(1, f2), t0 + dur);
  gn.gain.setValueAtTime(gain, t0); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(gn); gn.connect(actx._master); o.start(t0); o.stop(t0 + dur + 0.02);
};
const noise = (dur: number, gain: number, type: BiquadFilterType, freq: number, delay = 0) => {
  if (isMuted() || !actx?._master) return;
  const t0 = actx.currentTime + delay;
  const n = actx.createBufferSource();
  const buf = actx.createBuffer(1, Math.floor(actx.sampleRate * dur), actx.sampleRate);
  const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  n.buffer = buf;
  const f = actx.createBiquadFilter(); f.type = type; f.frequency.value = freq;
  const gn = actx.createGain(); gn.gain.setValueAtTime(gain, t0); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  n.connect(f); f.connect(gn); gn.connect(actx._master); n.start(t0); n.stop(t0 + dur + 0.02);
};
const sJump = () => tone(420, 760, 0.15, 'sine', 0.22);
const sLand = () => tone(180, 80, 0.1, 'sine', 0.12);
const sPunch = () => { tone(95, 38, 0.28, 'sine', 0.5); noise(0.16, 0.42, 'lowpass', 900); };
const sGlass = () => { noise(0.45, 0.32, 'highpass', 2600); for (let i = 0; i < 5; i++) tone(1200 + Math.random() * 2000, null, 0.1, 'triangle', 0.1, 0.02 + i * 0.05); };
const sStomp = () => { tone(240, 70, 0.12, 'square', 0.28); tone(900, 1500, 0.1, 'sine', 0.16, 0.07); };
const sShoot = () => tone(320, 150, 0.1, 'square', 0.13);
const sBossHit = () => { tone(150, 55, 0.2, 'sawtooth', 0.4); noise(0.12, 0.22, 'bandpass', 700); };
const sBossDead = () => { tone(320, 38, 0.7, 'sawtooth', 0.5); noise(0.6, 0.4, 'lowpass', 1200); tone(180, 50, 0.8, 'square', 0.25, 0.1); };
const sBossIn = () => { tone(70, 130, 0.5, 'sawtooth', 0.35); };
const sOver = () => { tone(440, 130, 0.5, 'triangle', 0.3); tone(330, 90, 0.7, 'triangle', 0.25, 0.16); };
const sPickup = () => { tone(620, 1000, 0.1, 'sine', 0.2); tone(1000, 1500, 0.1, 'sine', 0.15, 0.08); };
const sShieldPop = () => { tone(720, 1500, 0.18, 'sine', 0.26); noise(0.1, 0.18, 'highpass', 3000); };
const sRevive = () => { tone(200, 520, 0.28, 'sawtooth', 0.3); tone(520, 800, 0.2, 'sine', 0.2, 0.12); };
const sMilestone = () => { [0, 0.09, 0.18].forEach((d, i) => tone(520 + i * 180, null, 0.14, 'triangle', 0.18, d)); };
const sDash = () => { tone(180, 900, 0.18, 'sawtooth', 0.3); noise(0.12, 0.2, 'highpass', 1800); };
const sFlip = () => { tone(600, 120, 0.3, 'sine', 0.3); tone(120, 600, 0.3, 'sine', 0.22, 0.12); };
const sThunder = () => { noise(0.55, 0.42, 'lowpass', 420); tone(64, 30, 0.6, 'sawtooth', 0.32); };
const sWeather = () => { tone(520, 760, 0.16, 'sine', 0.12); tone(760, 520, 0.14, 'sine', 0.08, 0.08); };
const sFall = () => { tone(420, 70, 0.5, 'sawtooth', 0.34); noise(0.2, 0.2, 'lowpass', 700, 0.05); };

  return { ensureAudio, sJump, sLand, sPunch, sGlass, sStomp, sShoot, sBossHit, sBossDead, sBossIn, sOver, sPickup, sShieldPop, sRevive, sMilestone, sDash, sFlip, sThunder, sWeather, sFall, suspend: () => { if (actx?.state === "running") void actx.suspend().catch(() => {}); }, dispose: () => { if (actx && actx.state !== "closed") void actx.close().catch(() => {}); } };
}
