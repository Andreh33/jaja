'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Trophy, Volume2, VolumeX, Skull, Heart, Shield } from 'lucide-react';

type Obstacle = { node: HTMLElement; x: number; w: number; h: number; s: number; passed: boolean };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; r: number; sq?: boolean };
type Float = { x: number; y: number; vy: number; life: number; text: string; color: string; size: number };
type WEnemy = { x: number; dead: number; passed: boolean };
type Crack = { x1: number; y1: number; x2: number; y2: number; bx: number; by: number; bx2: number; by2: number; rx: number; ry: number };
type Proj = { x: number; y: number; rot: number };
type Pickup = { x: number; y: number; kind: 'shield' | 'heart'; ph: number };
type Boss = { state: 'enter' | 'idle' | 'telegraph' | 'dash' | 'low' | 'return' | 'dying'; x: number; y: number; baseX: number; baseY: number; hp: number; t: number; shootT: number; swoopT: number; phase: number; hitFlash: number; deadT: number };

const GROUND_RATIO = 0.56; // horizonte hacia el centro (antes pegado abajo)
const RUN_X = 160;
const GRAVITY = 2600;
const JUMP_V = -980;
const BUFFER = 0.15;
const COYOTE = 0.11;
const BEAN_HW = 18;  // medio ancho hitbox judía
const BEAN_H = 56;   // alto hitbox judía
const BOSS_SCORE = 18;
const BEST_KEY = 'latech-escape-best';
const RUNS_KEY = 'latech-escape-runs';
const DODGED_KEY = 'latech-escape-dodged';
const SKIN_KEY = 'latech-escape-skin';
const BOSSKILLS_KEY = 'latech-escape-bosskills';
const MODE_KEY = 'latech-escape-mode';

type Diff = { startSpeed: number; maxSpeed: number; accel: number; gapBase: number; bossAt: number; startLives: number; startShield: boolean; projSpeed: number; wTimer: number };
const DIFF: Record<'facil' | 'normal', Diff> = {
  facil: { startSpeed: 250, maxSpeed: 520, accel: 6.5, gapBase: 480, bossAt: 28, startLives: 1, startShield: true, projSpeed: 0.85, wTimer: 6.5 },
  normal: { startSpeed: 320, maxSpeed: 660, accel: 10, gapBase: 380, bossAt: 18, startLives: 0, startShield: false, projSpeed: 1.05, wTimer: 4.5 },
};

type Skin = { id: string; name: string; c0: string; c1: string; c2: string; aura: string };
const SKINS: Skin[] = [
  { id: 'default', name: 'Clásica', c0: '#C9A6FF', c1: '#8B5CF6', c2: '#5B21B6', aura: '139,92,246' },
  { id: 'dorada', name: 'Dorada', c0: '#FFE9A8', c1: '#FBBF24', c2: '#B45309', aura: '251,191,36' },
  { id: 'neon', name: 'Neón', c0: '#7DF9FF', c1: '#22D3EE', c2: '#9333EA', aura: '34,211,238' },
  { id: 'esmeralda', name: 'Esmeralda', c0: '#A7F3D0', c1: '#10B981', c2: '#065F46', aura: '16,185,129' },
];
type SkinStats = { best: number; runs: number; bossKills: number };
const skinUnlocked = (id: string, s: SkinStats) =>
  id === 'default' || (id === 'dorada' && s.best >= 15) || (id === 'neon' && s.runs >= 5) || (id === 'esmeralda' && s.bossKills >= 1);
const skinHint = (id: string) => id === 'dorada' ? 'récord ≥ 15' : id === 'neon' ? '5 partidas' : id === 'esmeralda' ? 'mata 1 jefe' : '';

const SELECTORS = ['.glass', '[class*="rounded-3xl"]', '[class*="rounded-2xl"]', '[class*="rounded-xl"]', 'article', '[class*="card"]', 'li[class*="rounded"]'];

export default function EscapeGame({ open, onClose }: { open: boolean; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  const [over, setOver] = useState(false);
  const [result, setResult] = useState({ score: 0, best: 0, record: false, killedBy: '' as string, runs: 0, dodged: 0 });
  const [hud, setHud] = useState({ lives: 0, shield: false });
  const hudRef = useRef(setHud);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  useEffect(() => { mutedRef.current = muted; }, [muted]);
  const resetRef = useRef<() => void>(() => {});
  const dashRef = useRef<() => void>(() => {});

  const [mode, setMode] = useState<'facil' | 'normal'>('facil');
  const modeRef = useRef<'facil' | 'normal'>('facil');
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { if (open) { const m = (localStorage.getItem(MODE_KEY) as 'facil' | 'normal') || 'facil'; queueMicrotask(() => setMode(m === 'normal' ? 'normal' : 'facil')); } }, [open]);
  const chooseMode = (m: 'facil' | 'normal') => { setMode(m); modeRef.current = m; localStorage.setItem(MODE_KEY, m); };

  const [skin, setSkin] = useState('default');
  const [unlocked, setUnlocked] = useState<string[]>(['default']);
  const skinRef = useRef('default');
  useEffect(() => { skinRef.current = skin; }, [skin]);
  // recalcula skins desbloqueadas al abrir (refleja progreso)
  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      const stats = { best: +(localStorage.getItem(BEST_KEY) || 0), runs: +(localStorage.getItem(RUNS_KEY) || 0), bossKills: +(localStorage.getItem(BOSSKILLS_KEY) || 0) };
      const un = SKINS.filter((s) => skinUnlocked(s.id, stats)).map((s) => s.id);
      setUnlocked(un);
      const saved = localStorage.getItem(SKIN_KEY) || 'default';
      setSkin(un.includes(saved) ? saved : 'default');
    });
  }, [open]);
  const chooseSkin = (id: string) => { setSkin(id); skinRef.current = id; localStorage.setItem(SKIN_KEY, id); };

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current!;
    const layer = layerRef.current!;
    const ctx = canvas.getContext('2d')!;
    (document.activeElement as HTMLElement | null)?.blur?.();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // el sitio oculta el cursor nativo (cursor personalizado que queda detrás del overlay);
    // mientras se juega, restauramos el cursor nativo para que se vea.
    const hadCustomCursor = document.body.classList.contains('has-custom-cursor');
    if (hadCustomCursor) document.body.classList.remove('has-custom-cursor');

    // ---------- AUDIO (sintetizado, sin assets) ----------
    type AC = AudioContext & { _master?: GainNode };
    let actx: AC | null = null;
    const ensureAudio = () => {
      if (mutedRef.current) return;
      if (!actx) {
        const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return;
        actx = new Ctor() as AC;
        const m = actx.createGain(); m.gain.value = 0.32; m.connect(actx.destination); actx._master = m;
      }
      if (actx.state === 'suspended') actx.resume();
    };
    const tone = (f1: number, f2: number | null, dur: number, type: OscillatorType, gain: number, delay = 0) => {
      if (mutedRef.current || !actx?._master) return;
      const t0 = actx.currentTime + delay;
      const o = actx.createOscillator(); const gn = actx.createGain();
      o.type = type; o.frequency.setValueAtTime(f1, t0);
      if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(1, f2), t0 + dur);
      gn.gain.setValueAtTime(gain, t0); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(gn); gn.connect(actx._master); o.start(t0); o.stop(t0 + dur + 0.02);
    };
    const noise = (dur: number, gain: number, type: BiquadFilterType, freq: number, delay = 0) => {
      if (mutedRef.current || !actx?._master) return;
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

    // ---------- origen: la tarjeta REAL del juego (acotado al viewport) ----------
    const vw0 = window.innerWidth, vh0 = window.innerHeight;
    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
    const oRect = document.querySelector<HTMLElement>('[data-escape-origin]')?.getBoundingClientRect();
    const ocx = oRect && oRect.width ? oRect.left + oRect.width / 2 : vw0 / 2;
    const ocy = oRect && oRect.width ? oRect.top + oRect.height / 2 : vh0 / 2;
    const obw = Math.min(oRect?.width || 360, vw0 * 0.72);
    const obh = Math.min(oRect?.height || 320, vh0 * 0.6);
    const ocxC = clamp(ocx, obw / 2 + 24, vw0 - obw / 2 - 24);
    const ocyC = clamp(ocy, obh / 2 + 70, vh0 - obh / 2 - 110);
    const origin = { x: ocxC, y: ocyC, w: obw, h: obh, left: ocxC - obw / 2, top: ocyC - obh / 2 };
    if (zoomRef.current) zoomRef.current.style.transformOrigin = `${origin.x}px ${origin.y}px`;

    // ---------- capturar componentes grandes ----------
    const templates: { el: HTMLElement; w: number; h: number }[] = [];
    {
      const seen = new Set<HTMLElement>();
      for (const sel of SELECTORS) {
        document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
          if (seen.has(el) || el.closest('.escape-overlay')) return;
          const r = el.getBoundingClientRect();
          const st = getComputedStyle(el);
          const visible = st.visibility !== 'hidden' && st.display !== 'none' && parseFloat(st.opacity || '1') > 0.5;
          if (visible && r.width >= 120 && r.width <= 520 && r.height >= 52 && r.height <= 440) { seen.add(el); templates.push({ el, w: Math.round(r.width), h: Math.round(r.height) }); }
        });
      }
      // baraja para variedad y limita
      for (let i = templates.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [templates[i], templates[j]] = [templates[j], templates[i]]; }
      templates.length = Math.min(templates.length, 18);
    }
    const FALLBACK = ['Tu tienda', 'Tu web', 'Servicios', 'Tarjeta'];

    // textos REALES de la página para el fondo parallax
    const texts: string[] = [];
    document.querySelectorAll<HTMLElement>('h1,h2,h3,strong,.text-gradient,[class*="font-display"]').forEach((el) => {
      if (el.closest('.escape-overlay')) return;
      const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (t.length >= 4 && t.length <= 26) texts.push(t);
    });
    const TEXT_POOL = ([...new Set(texts)].slice(0, 12));
    if (TEXT_POOL.length < 4) TEXT_POOL.push('Sin permanencia', '24-48h', 'Tu web', 'Diseño a medida');

    // fondo parallax: textos reales + siluetas de cards, 2 capas
    type BgItem = { x: number; y: number; par: number; kind: 'text' | 'rect'; text?: string; w: number; h: number; alpha: number; color: string };
    let bg: BgItem[] = [];
    const COLORS = ['139,92,246', '249,115,22', '251,191,36', '56,189,248'];
    const genBg = () => {
      bg = [];
      const n = 16;
      for (let i = 0; i < n; i++) {
        const par = i % 2 === 0 ? 0.14 : 0.32;
        const isText = Math.random() < 0.55 && TEXT_POOL.length;
        bg.push({
          x: Math.random() * (W * 2), y: 40 + Math.random() * (H * GROUND_RATIO - 90), par,
          kind: isText ? 'text' : 'rect',
          text: isText ? TEXT_POOL[Math.floor(Math.random() * TEXT_POOL.length)] : undefined,
          w: 60 + Math.random() * 150, h: 30 + Math.random() * 80,
          alpha: (par > 0.2 ? 0.1 : 0.06) + Math.random() * 0.04,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    };

    let W = 0, H = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      genBg();
    };
    resize();
    window.addEventListener('resize', resize);
    const groundY = () => Math.round(H * GROUND_RATIO);

    const g = {
      phase: 'wind' as 'wind' | 'launch' | 'playing' | 'over',
      introT: 0, fist: 0, punched: false,
      beanX: origin.x, y: origin.y, prevY: origin.y, vy: 0, onGround: false, jumpsLeft: 2, lastGround: -1, pressAt: -1,
      t: 0, speed: 360, dist: 0, score: 0, tmplIdx: 0,
      shake: 0, hitFlash: 0, whiteFlash: 0, invuln: 0, runPhase: 0, dustT: 0, slow: 0,
      wTimer: 4.5, wEnemy: null as WEnemy | null,
      cracks: [] as Crack[], crackT: 0, damage: 0,
      boss: null as Boss | null, bossAt: BOSS_SCORE, bossNum: 0, proj: [] as Proj[],
      lives: 0, shield: false, pickups: [] as Pickup[], pickupT: 6,
      dashT: 0, dashCd: 0, glitch: 0,
    };
    const syncHud = () => hudRef.current({ lives: g.lives, shield: g.shield });
    const applyDiff = () => { const c = DIFF[modeRef.current]; g.speed = c.startSpeed; g.bossAt = c.bossAt; g.lives = c.startLives; g.shield = c.startShield; g.wTimer = c.wTimer; syncHud(); };

    const obstacles: Obstacle[] = [];
    const particles: Particle[] = [];
    const floats: Float[] = [];
    let lastScore = 0;

    const burst = (x: number, y: number, n: number, colors: string[], spread = 1, square = false) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2; const v = (90 + Math.random() * 300) * spread; const life = 0.5 + Math.random() * 0.6;
        particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 140, life, max: life, color: colors[i % colors.length], r: 2 + Math.random() * 5, sq: square });
      }
    };
    const float = (x: number, y: number, text: string, color: string, size = 15) => floats.push({ x, y, vy: -52, life: 1.1, text, color, size });

    const makeFallback = (label: string): HTMLElement => {
      const n = document.createElement('div'); n.textContent = label; n.className = 'glass';
      n.style.cssText = 'display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:15px;border-radius:18px;';
      return n;
    };
    const spawn = () => {
      const gy = groundY();
      let node: HTMLElement, natW: number, natH: number;
      if (templates.length) { const tmpl = templates[g.tmplIdx % templates.length]; g.tmplIdx++; node = tmpl.el.cloneNode(true) as HTMLElement; natW = tmpl.w; natH = tmpl.h; }
      else { const label = FALLBACK[g.tmplIdx % FALLBACK.length]; g.tmplIdx++; node = makeFallback(label); natW = 200; natH = 110; }
      const s = Math.min(1, 190 / natH, 380 / natW); const w = natW * s, h = natH * s; const x = W + 50;
      // anula transiciones/animaciones del clon y sus hijos: si no, la transición CSS de transform
      // hace que el DIBUJO vaya con retraso respecto a la colisión (la card "se echa encima" y mata).
      node.querySelectorAll<HTMLElement>('*').forEach((el) => { el.style.transition = 'none'; el.style.animation = 'none'; el.style.transform = 'none'; });
      node.style.cssText += `position:absolute;left:0;top:${gy - natH}px;width:${natW}px;height:${natH}px;margin:0;pointer-events:none;overflow:hidden;box-sizing:border-box;transform-origin:left bottom;transform:translateX(${x}px) scale(${s});transition:none!important;animation:none!important;will-change:transform;box-shadow:0 16px 50px -10px rgba(139,92,246,0.6);`;
      layer.appendChild(node);
      obstacles.push({ node, x, w, h, s, passed: false });
    };

    const groundJump = () => { g.vy = JUMP_V; g.onGround = false; g.jumpsLeft = 1; g.pressAt = -1; burst(g.beanX, groundY() + 2, 8, ['rgba(255,255,255,0.6)']); sJump(); };
    const airJump = () => { g.vy = JUMP_V * 0.85; g.jumpsLeft = 0; g.pressAt = -1; burst(g.beanX, g.y - 22, 12, ['#C9A6FF']); sJump(); };
    const requestJump = () => {
      ensureAudio();
      if (g.phase !== 'playing') return;
      g.pressAt = g.t;
      const coyote = g.t - g.lastGround < COYOTE;
      if (g.onGround || coyote) groundJump();
      else if (g.jumpsLeft > 0) airJump();
    };
    // salto variable: soltar pronto = saltito; mantener = salto completo
    const cutJump = () => { if (g.vy < -260) g.vy *= 0.42; };
    // dash: ráfaga invencible que destroza lo que toque
    const requestDash = () => {
      ensureAudio();
      if (g.phase !== 'playing' || g.dashCd > 0) return;
      g.dashT = 0.3; g.dashCd = 2.4; g.invuln = Math.max(g.invuln, 0.34); g.shake = 0.25;
      burst(g.beanX, g.y - 26, 16, ['#C9A6FF', '#fff', '#38BDF8']); sDash();
    };

    const endGame = (killedBy: string) => {
      if (g.phase === 'over') return;
      g.phase = 'over'; g.shake = 0.6; g.hitFlash = 0.7;
      burst(g.beanX, g.y - 22, 30, ['#F97316', '#FB7185', '#FBBF24', '#fff']);
      sOver();
      const best0 = Number(localStorage.getItem(BEST_KEY) || 0);
      const record = g.score > best0;
      if (record) localStorage.setItem(BEST_KEY, String(g.score));
      const runs = Number(localStorage.getItem(RUNS_KEY) || 0) + 1; localStorage.setItem(RUNS_KEY, String(runs));
      const dodged = Number(localStorage.getItem(DODGED_KEY) || 0) + g.score; localStorage.setItem(DODGED_KEY, String(dodged));
      setResult({ score: g.score, best: Math.max(best0, g.score), record, killedBy, runs, dodged });
      const stats = { best: Math.max(best0, g.score), runs, bossKills: +(localStorage.getItem(BOSSKILLS_KEY) || 0) };
      setUnlocked(SKINS.filter((s) => skinUnlocked(s.id, stats)).map((s) => s.id));
      setOver(true);
    };

    // un golpe: primero escudo, luego vida extra, y si no, fin
    const takeHit = (by: string) => {
      if (g.phase !== 'playing' || g.invuln > 0) return;
      g.glitch = 1;
      if (g.shield) { g.shield = false; g.invuln = 1.0; g.shake = 0.32; burst(g.beanX, g.y - 24, 20, ['#38BDF8', '#fff']); float(g.beanX, g.y - 46, '¡escudo roto!', '#38BDF8'); sShieldPop(); syncHud(); return; }
      if (g.lives > 0) { g.lives -= 1; g.invuln = 1.3; g.shake = 0.45; g.hitFlash = 0.5; burst(g.beanX, g.y - 24, 24, ['#ef4444', '#fff', '#FB7185']); float(g.beanX, g.y - 46, '¡-1 vida!', '#FB7185'); sRevive(); syncHud(); return; }
      endGame(by);
    };

    const punchBox = () => {
      g.punched = true; g.shake = 0.6; g.hitFlash = 0.4; g.whiteFlash = 0.9; g.slow = 0.32; g.phase = 'launch'; g.vy = -1700; g.onGround = false;
      ensureAudio(); sPunch(); sGlass();
      burst(origin.x + 24, origin.y, 54, ['#8B5CF6', '#C084FC', '#F97316', '#FBBF24', '#ffffff'], 1.7, true);
      const cracks: Crack[] = []; const n = 13, len = Math.hypot(W, H);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
        const x2 = origin.x + Math.cos(a) * len, y2 = origin.y + Math.sin(a) * len;
        const bt = 0.3 + Math.random() * 0.4; const bx = origin.x + Math.cos(a) * len * bt, by = origin.y + Math.sin(a) * len * bt;
        const ba = a + (Math.random() - 0.5) * 0.9, bl = len * 0.3;
        const rr = 0.32 + Math.random() * 0.22; const rx = origin.x + Math.cos(a) * len * rr, ry = origin.y + Math.sin(a) * len * rr;
        cracks.push({ x1: origin.x, y1: origin.y, x2, y2, bx, by, bx2: bx + Math.cos(ba) * bl, by2: by + Math.sin(ba) * bl, rx, ry });
      }
      g.cracks = cracks; g.crackT = 0;
      // esquirlas de cristal cayendo
      burst(origin.x, origin.y, 30, ['rgba(255,255,255,0.85)', 'rgba(201,166,255,0.7)', 'rgba(56,189,248,0.6)'], 1.5, true);
    };

    const spawnBoss = () => {
      const gy = groundY();
      const hp = 3 + Math.min(3, g.bossNum); // cada jefe sucesivo aguanta más
      g.boss = { state: 'enter', x: W + 140, y: gy - 130, baseX: W * 0.72, baseY: gy - 130, hp, t: 0, shootT: 1.4, swoopT: 3.4, phase: 0, hitFlash: 0, deadT: 0 };
      // limpia tarjetas y W normal para el duelo
      for (const o of obstacles) o.node.remove(); obstacles.length = 0; g.wEnemy = null; g.proj.length = 0;
      // cinemática de entrada
      g.slow = 0.5; g.shake = 0.5; g.whiteFlash = 0.4;
      float(W * 0.55, gy - 230, g.bossNum === 0 ? '¡JEFE: WORDPRESS!' : `¡WORDPRESS ${6 + g.bossNum}.0!`, '#ef4444', 24);
      ensureAudio(); sBossIn();
    };
    const shootPlugin = () => { const b = g.boss!; const gy = groundY(); g.proj.push({ x: b.x - 30, y: gy - 26, rot: 0 }); sShoot(); };

    const resetGame = () => {
      for (const o of obstacles) o.node.remove(); obstacles.length = 0; particles.length = 0; floats.length = 0; g.proj.length = 0; g.pickups.length = 0;
      g.boss = null; g.wEnemy = null; g.pickupT = 6; g.bossNum = 0;
      g.phase = 'playing'; g.punched = true; g.beanX = RUN_X; g.y = groundY(); g.prevY = groundY(); g.vy = 0; g.onGround = true; g.jumpsLeft = 2;
      g.score = 0; g.dist = 0; g.invuln = 0.9; g.pressAt = -1;
      applyDiff(); setOver(false);
    };
    resetRef.current = resetGame;
    dashRef.current = requestDash;

    // ---------- dibujo ----------
    const drawBean = (x: number, y: number, big: boolean) => {
      const bw = 46, bh = 62; const airborne = !g.onGround; const gy = groundY();
      const sk = SKINS.find((s) => s.id === skinRef.current) || SKINS[0];
      if (g.phase === 'playing' && g.speed > 420) {
        const a = Math.min(0.22, (g.speed - 420) / 900);
        for (let i = 1; i <= 3; i++) { ctx.globalAlpha = a / i; ctx.fillStyle = i % 2 ? '#8B5CF6' : '#F97316'; ctx.beginPath(); ctx.roundRect(x - i * 14 - bw / 2, y - bh, bw, bh - 3, 19); ctx.fill(); }
        ctx.globalAlpha = 1;
      }
      const hgt = Math.max(0, gy - y);
      ctx.globalAlpha = Math.max(0.1, 0.38 - hgt / 600); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(x, gy + 8, 24, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      const aura = ctx.createRadialGradient(x, y - bh / 2, 4, x, y - bh / 2, bh * (big ? 1.4 : 1));
      aura.addColorStop(0, big ? 'rgba(249,115,22,0.4)' : `rgba(${sk.aura},0.32)`); aura.addColorStop(1, `rgba(${sk.aura},0)`);
      ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(x, y - bh / 2, bh * (big ? 1.4 : 1), 0, Math.PI * 2); ctx.fill();

      // aberración cromática del personaje (pantalla "rota")
      if (g.damage > 0.05) {
        const ca = g.damage * 3;
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.18 * g.damage;
        ctx.fillStyle = '#ff2d4d'; ctx.beginPath(); ctx.roundRect(x - bw / 2 - ca, y - bh, bw, bh - 3, 19); ctx.fill();
        ctx.fillStyle = '#2dd4ff'; ctx.beginPath(); ctx.roundRect(x - bw / 2 + ca, y - bh, bw, bh - 3, 19); ctx.fill();
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      }

      ctx.save(); ctx.translate(x, y);
      const squash = airborne ? Math.max(0.85, Math.min(1.15, 1 - g.vy / 3000)) : 1 + Math.sin(g.runPhase) * 0.05;
      ctx.scale(1 + (1 - squash) * 0.5, squash);
      ctx.fillStyle = '#4C1D95';
      for (const s of [-1, 1] as const) { const ph = g.runPhase + (s > 0 ? Math.PI : 0); const lift = airborne ? -5 : g.phase === 'playing' ? Math.max(0, Math.sin(ph)) * -7 : 0; ctx.beginPath(); ctx.ellipse(s * 9, -3 + lift, 7.5, 5, 0, 0, Math.PI * 2); ctx.fill(); }
      const body = ctx.createRadialGradient(-bw * 0.25, -bh * 0.8, 3, 0, -bh / 2, bh);
      body.addColorStop(0, sk.c0); body.addColorStop(0.45, sk.c1); body.addColorStop(1, sk.c2);
      const path = new Path2D(); path.roundRect(-bw / 2, -bh, bw, bh - 3, 19);
      ctx.fillStyle = body; ctx.fill(path); ctx.strokeStyle = 'rgba(20,8,40,0.9)'; ctx.lineWidth = 2; ctx.stroke(path);
      ctx.globalAlpha = 0.5; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(-bw * 0.2, -bh * 0.82, 7, 10, -0.5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      const fy = -bh + 17; const angry = big;
      for (const s of [-1, 1] as const) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(s * 8.5, fy, 5.5, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#1B1033'; ctx.beginPath(); ctx.arc(s * 8.5 + 1.4, fy + (airborne ? -1 : 0.6), 2.8, 0, Math.PI * 2); ctx.fill(); }
      if (angry) { ctx.strokeStyle = 'rgba(20,8,40,0.9)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; for (const s of [-1, 1] as const) { ctx.beginPath(); ctx.moveTo(s * 4, fy - 8); ctx.lineTo(s * 12, fy - 4); ctx.stroke(); } }
      ctx.fillStyle = 'rgba(255,77,157,0.35)'; for (const s of [-1, 1] as const) { ctx.beginPath(); ctx.ellipse(s * 12, fy + 8, 3.6, 2.2, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = '#1B1033'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
      if (airborne || angry) { ctx.fillStyle = '#2A123F'; ctx.beginPath(); ctx.ellipse(0, fy + 13, 4, 5, 0, 0, Math.PI * 2); ctx.fill(); }
      else { ctx.beginPath(); ctx.arc(0, fy + 8, 6, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); }
      ctx.restore();

      if (g.fist > 0.02 && (g.phase === 'wind' || g.phase === 'launch')) {
        const f = g.fist, thrust = g.punched ? 1 : 0; const fx = x + 22 + thrust * 34 + f * 14, fy2 = y - bh * 0.5, r = 11 + f * 30;
        ctx.save(); ctx.translate(fx, fy2);
        ctx.strokeStyle = '#6D28D9'; ctx.lineWidth = 6 + f * 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-24, 4); ctx.lineTo(-2, 0); ctx.stroke();
        const fg = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 2, 0, 0, r); fg.addColorStop(0, '#C9A6FF'); fg.addColorStop(1, '#7C3AED');
        ctx.fillStyle = fg; ctx.beginPath(); ctx.roundRect(-r, -r, r * 2, r * 2, r * 0.5); ctx.fill(); ctx.strokeStyle = 'rgba(20,8,40,0.9)'; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.strokeStyle = 'rgba(20,8,40,0.5)'; ctx.lineWidth = 1.5; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * r * 0.4, -r * 0.5); ctx.lineTo(i * r * 0.4, r * 0.2); ctx.stroke(); }
        ctx.restore();
      }
    };

    const drawBox = () => {
      const x = origin.left, y = origin.top, bw = origin.w, bh = origin.h; const j = g.fist > 0.6 ? (Math.random() - 0.5) * g.fist * 7 : 0;
      ctx.save(); ctx.translate(j, j);
      ctx.fillStyle = 'rgba(30,20,50,0.4)'; ctx.beginPath(); ctx.roundRect(x, y, bw, bh, 24); ctx.fill();
      const gr = ctx.createLinearGradient(x, 0, x + bw, 0); gr.addColorStop(0, '#8B5CF6'); gr.addColorStop(0.6, '#F97316'); gr.addColorStop(1, '#FBBF24');
      ctx.strokeStyle = gr; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(139,92,246,0.7)'; ctx.shadowBlur = 18; ctx.beginPath(); ctx.roundRect(x, y, bw, bh, 24); ctx.stroke(); ctx.shadowBlur = 0;
      if (g.fist > 0.7) { ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1.5; const cx = origin.x, cy = origin.y; for (let i = 0; i < 5; i++) { const a = i * 1.3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * bw * 0.4, cy + Math.sin(a) * bh * 0.4); ctx.stroke(); } }
      ctx.restore();
    };

    // insignia circular estilo logo de WordPress (azul WP + W blanca) con ojos de enemigo
    const drawWTile = (cx: number, cy: number, size: number, dead: number, eyes: boolean) => {
      ctx.save(); ctx.translate(cx, cy);
      if (dead > 0) ctx.scale(1 + dead * 0.4, Math.max(0.05, 1 - dead * 0.95));
      const r = size / 2;
      ctx.shadowColor = 'rgba(33,117,155,0.9)'; ctx.shadowBlur = size * 0.32;
      const tg = ctx.createRadialGradient(-r * 0.3, -r * 0.35, 2, 0, 0, r); tg.addColorStop(0, '#2a90bd'); tg.addColorStop(1, '#143f57');
      ctx.fillStyle = tg; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = size * 0.045; ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2); ctx.stroke();
      // W de WordPress
      const u = size * 0.26; ctx.strokeStyle = '#fff'; ctx.lineWidth = size * 0.1; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-u * 1.35, -u * 0.82); ctx.lineTo(-u * 0.62, u); ctx.lineTo(0, -u * 0.18); ctx.lineTo(u * 0.62, u); ctx.lineTo(u * 1.35, -u * 0.82); ctx.stroke();
      if (eyes && dead === 0) { ctx.fillStyle = '#ef4444'; for (const s of [-1, 1] as const) { ctx.beginPath(); ctx.arc(s * u * 0.55, -u * 1.2, size * 0.05, 0, Math.PI * 2); ctx.fill(); } }
      ctx.restore();
    };

    const drawBoss = (b: Boss) => {
      const flash = b.hitFlash > 0;
      ctx.save();
      if (flash) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = b.hitFlash; }
      drawWTile(b.x, b.y, 116, b.deadT, true);
      ctx.restore();
      if (b.state === 'telegraph') { // aura de aviso antes de embestir
        ctx.globalAlpha = 0.4 + 0.4 * Math.sin(b.t * 30); ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(b.x, b.y, 78, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
      }
      // corazones de vida
      if (b.deadT === 0) {
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = i < b.hp ? '#ef4444' : 'rgba(255,255,255,0.18)';
          const hx = b.x - 22 + i * 22, hy = b.y - 80;
          ctx.beginPath(); ctx.moveTo(hx, hy + 4); ctx.bezierCurveTo(hx, hy, hx - 8, hy, hx - 8, hy + 5); ctx.bezierCurveTo(hx - 8, hy + 10, hx, hy + 13, hx, hy + 16); ctx.bezierCurveTo(hx, hy + 13, hx + 8, hy + 10, hx + 8, hy + 5); ctx.bezierCurveTo(hx + 8, hy, hx, hy, hx, hy + 4); ctx.fill();
        }
      }
    };

    let raf = 0, last = 0;
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      let dt = Math.min((time - last) / 1000 || 0, 0.033); last = time;
      if (g.slow > 0) { g.slow -= dt; dt *= 0.35; }
      const active = g.phase !== 'over';
      if (active) g.t += dt;
      const gy = groundY();
      if (active) g.runPhase += dt * (g.speed / 30);

      if (active) {
        if (g.phase === 'wind') {
          g.introT += dt; g.fist = Math.min(1, g.introT / 0.85); g.beanX = origin.x; g.y = origin.y;
          if (g.introT >= 1.0 && !g.punched) punchBox();
        } else {
          g.vy += GRAVITY * dt; g.y += g.vy * dt;
          if (g.phase === 'launch') {
            g.beanX += (RUN_X - g.beanX) * Math.min(1, dt * 2.2);
            if (g.y >= gy && g.vy >= 0) { g.y = gy; g.vy = 0; g.onGround = true; g.jumpsLeft = 2; g.lastGround = g.t; g.phase = 'playing'; g.beanX = RUN_X; applyDiff(); burst(RUN_X, gy + 2, 16, ['#C9A6FF', '#fff']); sLand(); }
          }
          // en 'playing' el aterrizaje se resuelve tras calcular las plataformas (más abajo)
        }
      }

      if (g.phase === 'playing') {
        const cfg = DIFF[modeRef.current];
        g.speed = Math.min(g.speed + cfg.accel * dt, cfg.maxSpeed); g.dist += g.speed * dt;
        if (g.onGround) { g.dustT -= dt; if (g.dustT <= 0) { g.dustT = 0.1; particles.push({ x: g.beanX - 14, y: gy, vx: -50 - Math.random() * 50, vy: -20 - Math.random() * 30, life: 0.4, max: 0.4, color: 'rgba(201,166,255,0.5)', r: 2 + Math.random() * 2 }); } }
        // jefe
        if (!g.boss && g.score >= g.bossAt) spawnBoss();
        if (!g.boss) {
          const lastO = obstacles[obstacles.length - 1]; const gap = cfg.gapBase + g.speed * 0.5 + Math.random() * 240;
          if (!lastO || lastO.x < W - lastO.w - gap) spawn();
          g.wTimer -= dt; if (g.wTimer <= 0 && !g.wEnemy) { g.wEnemy = { x: W + 60, dead: 0, passed: false }; g.wTimer = 7 + Math.random() * 5; }
          g.pickupT -= dt; if (g.pickupT <= 0) { const kind: 'shield' | 'heart' = Math.random() < 0.68 ? 'shield' : 'heart'; g.pickups.push({ x: W + 40, y: groundY() - 100 - Math.random() * 80, kind, ph: Math.random() * 6.28 }); g.pickupT = 8 + Math.random() * 6; }
        }
        // hito cada 10 esquivados: sonido + glitch + texto
        if (Math.floor(g.score / 10) > Math.floor(lastScore / 10)) { sMilestone(); g.whiteFlash = Math.max(g.whiteFlash, 0.3); g.glitch = Math.max(g.glitch, 0.6); g.crackT = Math.min(g.crackT, 0.9); float(g.beanX, g.y - 64, `¡${g.score}!`, '#C9A6FF', 20); }
        lastScore = g.score;
      }

      g.invuln = Math.max(0, g.invuln - dt); g.shake = Math.max(0, g.shake - dt);
      g.hitFlash = Math.max(0, g.hitFlash - dt * 1.8); g.whiteFlash = Math.max(0, g.whiteFlash - dt * 2.4);
      g.dashCd = Math.max(0, g.dashCd - dt); g.glitch = Math.max(0, g.glitch - dt * 2.5);
      if (g.dashT > 0) { g.dashT = Math.max(0, g.dashT - dt); g.invuln = Math.max(g.invuln, 0.05); }
      if (g.crackT < 1) g.crackT = Math.min(1, g.crackT + dt * 5);
      if (g.punched) g.damage = Math.min(1, g.damage + dt * 1.5); // pantalla queda dañada

      const prevFeet = g.prevY;
      const bx0 = g.beanX - BEAN_HW, bx1 = g.beanX + BEAN_HW;
      let by0 = g.y - BEAN_H, by1 = g.y;
      let support = gy;

      if (active) for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i]; if (g.phase === 'playing') o.x -= g.speed * dt;
        // #11: el componente REACCIONA al acercarse (pulso + brillo)
        const near = g.phase === 'playing' && Math.abs((o.x + o.w / 2) - g.beanX) < 210;
        const pulse = near ? 1 + 0.04 * Math.abs(Math.sin(g.t * 16)) : 1;
        o.node.style.transform = `translateX(${o.x}px) scale(${o.s * pulse})`;
        o.node.style.boxShadow = near ? '0 0 42px 6px rgba(201,166,255,0.75)' : '0 16px 50px -10px rgba(139,92,246,0.6)';
        const oy0 = gy - o.h;
        // dash: arrasa lo que toque por delante
        if (g.phase === 'playing' && g.dashT > 0 && bx1 + 90 > o.x && bx0 < o.x + o.w && by1 > oy0 && by0 < gy) {
          burst(o.x + o.w / 2, gy - o.h / 2, 18, ['#C9A6FF', '#fff', '#FBBF24']); g.score++; g.glitch = Math.max(g.glitch, 0.45); o.node.remove(); obstacles.splice(i, 1); continue;
        }
        // aterrizar ENCIMA = seguro (plataforma); margen generoso en X
        const overTop = bx1 > o.x + 6 && bx0 < o.x + o.w - 6;
        if (g.phase === 'playing' && overTop && g.vy >= 0 && prevFeet <= oy0 + 8 && g.y >= oy0 - 2 && oy0 < support) support = oy0;
        // golpe LATERAL = muere, SOLO si venía por el lado (no desde arriba); hitbox al cuerpo con holgura
        if (g.phase === 'playing' && g.invuln <= 0 && bx1 > o.x + o.w * 0.18 && bx0 < o.x + o.w * 0.82 && by1 > oy0 + 14 && by0 < gy && prevFeet > oy0 + 8) takeHit('un componente');
        if (!o.passed && (o.x + o.w) < g.beanX) { o.passed = true; g.score++; }
        if (o.x < -o.w - 50) { o.node.remove(); obstacles.splice(i, 1); }
      }

      // aterrizaje de 'playing': suelo o encima de una card (plataforma)
      if (g.phase === 'playing') {
        if (g.y >= support) { const wasAir = !g.onGround; if (wasAir) { burst(g.beanX, support + 2, 6, ['rgba(255,255,255,0.5)']); sLand(); } g.y = support; g.vy = 0; g.onGround = true; g.jumpsLeft = 2; g.lastGround = g.t; if (wasAir && g.pressAt >= 0 && g.t - g.pressAt < BUFFER) groundJump(); }
        else g.onGround = false;
        by1 = g.y; by0 = g.y - BEAN_H; // recomputa caja tras aterrizar (para enemigos)
      }

      // W pequeña
      if (g.wEnemy && active) {
        const e = g.wEnemy;
        if (e.dead > 0) { e.dead += dt * 2.2; if (e.dead >= 1) g.wEnemy = null; }
        else { e.x -= g.speed * 1.18 * dt; const ew = 52, ex0 = e.x - ew / 2, ex1 = e.x + ew / 2, ey0 = gy - 56, ey1 = gy - 4;
          if (bx1 > ex0 && bx0 < ex1 && by1 > ey0 && by0 < ey1) { if (g.dashT > 0 || (g.vy > 0 && by1 < ey0 + 26)) { e.dead = 0.01; g.vy = g.dashT > 0 ? g.vy : -620; g.score += 5; burst(e.x, ey0 + 10, 22, ['#ef4444', '#fff', '#dbe2ef']); float(e.x, ey0, '+5 · ¡404!', '#FBBF24'); sStomp(); } else takeHit('la W'); }
          if (!e.passed && ex1 < g.beanX) { e.passed = true; g.score += 2; }
          if (e.x < -60) g.wEnemy = null;
        }
      }

      // ---- JEFE ----
      if (g.boss && active) {
        const b = g.boss; b.t += dt; b.hitFlash = Math.max(0, b.hitFlash - dt * 3);
        if (b.state === 'dying') { b.deadT += dt * 1.4; if (b.deadT >= 1) { g.boss = null; g.bossAt = g.score + 30; g.invuln = 0.5; } }
        else {
          if (b.state === 'enter') { b.x += (b.baseX - b.x) * Math.min(1, dt * 2.4); b.y = b.baseY + Math.sin(b.t * 2) * 8; if (Math.abs(b.x - b.baseX) < 8) { b.x = b.baseX; b.state = 'idle'; } }
          else if (b.state === 'idle') {
            const enraged = b.hp <= 1; const rage = enraged ? 0.6 : 1; // fase furia: más rápido
            b.x += (b.baseX - b.x) * Math.min(1, dt * 4); b.y = b.baseY + Math.sin(b.t * 2) * 12;
            b.shootT -= dt; if (b.shootT <= 0) { shootPlugin(); if (b.hp <= 2 && Math.random() < 0.5) g.proj.push({ x: b.x - 95, y: groundY() - 26, rot: 0 }); b.shootT = (1.4 + Math.random() * 0.8) * rage; }
            b.swoopT -= dt; if (b.swoopT <= 0) { b.state = 'telegraph'; b.phase = 0; }
          }
          else if (b.state === 'telegraph') { b.phase += dt; if (b.phase >= 0.45) { b.state = 'dash'; b.phase = 0; } }
          else if (b.state === 'dash') { b.phase = Math.min(1, b.phase + dt / 0.4); const tx = RUN_X + 60, ty = gy - 48; b.x = b.baseX + (tx - b.baseX) * b.phase; b.y = b.baseY + (ty - b.baseY) * b.phase; if (b.phase >= 1) { b.state = 'low'; b.phase = 0; } }
          else if (b.state === 'low') { b.phase += dt; b.y = gy - 48 + Math.sin(b.t * 8) * 3; if (b.phase >= 0.28) { b.state = 'return'; b.phase = 0; } }
          else if (b.state === 'return') { b.phase = Math.min(1, b.phase + dt / 0.55); b.x += (b.baseX - b.x) * 0.12; b.y += (b.baseY - b.y) * 0.12; if (b.phase >= 1) { b.state = 'idle'; b.swoopT = (3 + Math.random() * 1.5) * (b.hp <= 1 ? 0.6 : 1); b.shootT = Math.max(b.shootT, 0.7); } }

          // colisión jefe
          const bs = 116 * (1), ebx0 = b.x - bs * 0.4, ebx1 = b.x + bs * 0.4, eby0 = b.y - bs * 0.4, eby1 = b.y + bs * 0.4;
          if (bx1 > ebx0 && bx0 < ebx1 && by1 > eby0 && by0 < eby1) {
            const stomp = g.dashT > 0 || (g.vy > 0 && by1 < eby0 + 40);
            if (stomp) { b.hp -= 1; b.hitFlash = 1; g.vy = -700; g.shake = 0.35; burst(b.x, eby0 + 10, 24, ['#ef4444', '#fff', '#dbe2ef']); float(b.x, eby0, b.hp > 0 ? '¡toma!' : '¡404!', '#FBBF24', 18); sBossHit(); if (b.hp <= 0) { b.state = 'dying'; b.deadT = 0.01; g.score += 15; g.bossNum += 1; g.whiteFlash = 0.7; g.glitch = 1; g.slow = 0.4; localStorage.setItem(BOSSKILLS_KEY, String(+(localStorage.getItem(BOSSKILLS_KEY) || 0) + 1)); burst(b.x, b.y, 60, ['#ef4444', '#fff', '#dbe2ef', '#FBBF24'], 1.6, true); float(b.x, b.y - 40, '+15 · ¡WordPress eliminado!', '#FBBF24', 20); sBossDead(); } }
            else takeHit('el jefe WordPress');
          }
        }
      }

      // proyectiles "plugin"
      if (active) for (let i = g.proj.length - 1; i >= 0; i--) {
        const p = g.proj[i]; p.x -= (g.speed * 1.05 + 120) * DIFF[modeRef.current].projSpeed * dt; p.rot += dt * 6;
        const ph = 30, px0 = p.x - ph / 2, px1 = p.x + ph / 2, py0 = p.y - ph / 2, py1 = p.y + ph / 2;
        if (g.phase === 'playing' && g.invuln <= 0 && bx1 > px0 && bx0 < px1 && by1 > py0 && by0 < py1) takeHit('un plugin');
        if (p.x < -40) g.proj.splice(i, 1);
      }

      // recogibles: escudo y vida extra
      if (active) for (let i = g.pickups.length - 1; i >= 0; i--) {
        const p = g.pickups[i]; if (g.phase === 'playing') p.x -= g.speed * dt; p.ph += dt * 3;
        const dx = p.x - g.beanX, dy = (p.y + Math.sin(p.ph) * 5) - (g.y - 28);
        if (g.phase === 'playing' && dx * dx + dy * dy < 34 * 34) {
          if (p.kind === 'shield') { g.shield = true; float(p.x, p.y, '+ escudo', '#38BDF8'); } else { g.lives += 1; float(p.x, p.y, '+ vida', '#FB7185'); }
          sPickup(); syncHud(); g.pickups.splice(i, 1); continue;
        }
        if (p.x < -50) g.pickups.splice(i, 1);
      }

      if (active) {
        for (const p of particles) { p.vy += 1100 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
        for (let i = particles.length - 1; i >= 0; i--) if (particles[i].life <= 0) particles.splice(i, 1);
        for (const f of floats) { f.y += f.vy * dt; f.life -= dt; }
        for (let i = floats.length - 1; i >= 0; i--) if (floats[i].life <= 0) floats.splice(i, 1);
      }

      if (active) g.prevY = g.y;
      if (scoreRef.current) scoreRef.current.textContent = String(g.score);

      // ---------- render ----------
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      if (g.shake > 0) ctx.translate((Math.random() - 0.5) * g.shake * 34, (Math.random() - 0.5) * g.shake * 34);

      // fondo parallax: textos reales + siluetas de cards
      for (const it of bg) {
        let bx = it.x - g.dist * it.par; bx = ((bx % (W * 2)) + W * 2) % (W * 2) - 380;
        ctx.globalAlpha = it.alpha;
        if (it.kind === 'text' && it.text) { ctx.fillStyle = `rgb(${it.color})`; ctx.font = `800 ${Math.round(26 + it.par * 46)}px ui-sans-serif, system-ui, sans-serif`; ctx.fillText(it.text, bx, it.y); }
        else {
          // mini-card de fondo: contorno + cabecera + líneas (claramente decorativo)
          ctx.strokeStyle = `rgb(${it.color})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(bx, it.y, it.w, it.h, 9); ctx.stroke();
          ctx.fillStyle = `rgb(${it.color})`;
          ctx.beginPath(); ctx.roundRect(bx + 9, it.y + 9, it.w * 0.45, 6, 3); ctx.fill();
          for (let li = 0; li < 2 && it.y + 26 + li * 9 < it.y + it.h - 6; li++) { ctx.beginPath(); ctx.roundRect(bx + 9, it.y + 26 + li * 9, it.w - 18, 3, 2); ctx.fill(); }
        }
      }
      ctx.globalAlpha = 1;

      const grad = ctx.createLinearGradient(0, 0, W, 0); grad.addColorStop(0, '#8B5CF6'); grad.addColorStop(0.6, '#F97316'); grad.addColorStop(1, '#FBBF24');
      ctx.strokeStyle = grad; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(139,92,246,0.7)'; ctx.shadowBlur = 16; ctx.beginPath(); ctx.moveTo(0, gy + 1); ctx.lineTo(W, gy + 1); ctx.stroke(); ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
      for (let i = 0; i < 16; i++) { const lx = ((i * 160 - g.dist * 1.2) % (W + 80) + W + 80) % (W + 80) - 40; ctx.beginPath(); ctx.moveTo(lx, gy + 16); ctx.lineTo(lx + 34, gy + 16); ctx.stroke(); }

      if ((g.phase === 'wind' || g.phase === 'launch') && !g.punched) drawBox();
      if (g.wEnemy) drawWTile(g.wEnemy.x, gy - 30, 52, g.wEnemy.dead, true);
      if (g.boss) drawBoss(g.boss);

      // proyectiles
      for (const p of g.proj) {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.shadowColor = 'rgba(239,68,68,0.7)'; ctx.shadowBlur = 10;
        ctx.fillStyle = '#1f2a44'; ctx.beginPath(); ctx.roundRect(-15, -15, 30, 30, 7); ctx.fill(); ctx.shadowBlur = 0;
        ctx.fillStyle = '#9fb3d6'; ctx.font = '700 11px ui-sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('wp', 0, 1); ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
        ctx.restore();
      }

      // recogibles
      for (const p of g.pickups) {
        const oy = p.y + Math.sin(p.ph) * 5;
        ctx.save(); ctx.translate(p.x, oy);
        if (p.kind === 'shield') {
          ctx.shadowColor = 'rgba(56,189,248,0.9)'; ctx.shadowBlur = 16; ctx.fillStyle = '#38BDF8';
          ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(12, -7); ctx.lineTo(12, 3); ctx.quadraticCurveTo(12, 13, 0, 17); ctx.quadraticCurveTo(-12, 13, -12, 3); ctx.lineTo(-12, -7); ctx.closePath(); ctx.fill();
          ctx.shadowBlur = 0; ctx.fillStyle = '#06283a'; ctx.font = '700 13px ui-sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('✓', 0, 1); ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
        } else {
          ctx.shadowColor = 'rgba(251,113,133,0.9)'; ctx.shadowBlur = 16; ctx.fillStyle = '#FB7185';
          ctx.beginPath(); ctx.moveTo(0, 6); ctx.bezierCurveTo(0, -3, -13, -3, -13, 6); ctx.bezierCurveTo(-13, 14, 0, 18, 0, 22); ctx.bezierCurveTo(0, 18, 13, 14, 13, 6); ctx.bezierCurveTo(13, -3, 0, -3, 0, 6); ctx.fill(); ctx.shadowBlur = 0;
        }
        ctx.restore();
      }

      for (const p of particles) { ctx.globalAlpha = Math.max(0, p.life / p.max); ctx.fillStyle = p.color; if (p.sq) ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2); else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); } }
      ctx.globalAlpha = 1;

      const spot = ctx.createRadialGradient(g.beanX, g.y - 30, 12, g.beanX, g.y - 30, 320); spot.addColorStop(0, 'rgba(201,166,255,0.22)'); spot.addColorStop(1, 'rgba(201,166,255,0)');
      ctx.fillStyle = spot; ctx.fillRect(0, 0, W, H);
      // linterna: haz de luz hacia delante
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const beam = ctx.createLinearGradient(g.beanX, 0, g.beanX + 400, 0); beam.addColorStop(0, 'rgba(201,166,255,0.13)'); beam.addColorStop(1, 'rgba(201,166,255,0)');
      ctx.fillStyle = beam; ctx.beginPath(); ctx.moveTo(g.beanX, g.y - 30); ctx.lineTo(g.beanX + 400, g.y - 160); ctx.lineTo(g.beanX + 400, g.y + 70); ctx.closePath(); ctx.fill();
      ctx.restore();

      const beanAlpha = g.invuln > 0 && g.phase === 'playing' ? 0.45 + 0.55 * Math.abs(Math.sin(g.t * 24)) : 1;
      ctx.globalAlpha = beanAlpha; drawBean(g.beanX, Math.min(g.y, H + 80), g.phase === 'wind' || g.phase === 'launch'); ctx.globalAlpha = 1;

      // burbuja de escudo
      if (g.shield && g.phase !== 'over') {
        ctx.save(); ctx.globalAlpha = 0.4 + 0.18 * Math.sin(g.t * 5); ctx.strokeStyle = '#38BDF8'; ctx.lineWidth = 2.5;
        ctx.shadowColor = 'rgba(56,189,248,0.85)'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(g.beanX, g.y - 30, 42, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      }
      // estela de dash
      if (g.dashT > 0) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 7; i++) { ctx.globalAlpha = 0.18 * (g.dashT / 0.3); ctx.strokeStyle = i % 2 ? '#C9A6FF' : '#38BDF8'; ctx.lineWidth = 2; ctx.beginPath(); const yy = g.y - 8 - i * 7; ctx.moveTo(g.beanX - 10, yy); ctx.lineTo(g.beanX + 130, yy); ctx.stroke(); }
        ctx.restore();
      }

      // grietas: vivas al romper + residuales permanentes
      if (g.cracks.length) {
        const resid = Math.min(0.18, g.damage * 0.18);
        const liveAlpha = g.crackT < 1 ? 0.92 : resid;
        if (liveAlpha > 0.01) {
          const cs = g.cracks; ctx.lineCap = 'round';
          // refracción: traza cian ligeramente desplazada
          ctx.globalAlpha = liveAlpha * 0.5; ctx.strokeStyle = '#7df9ff'; ctx.lineWidth = 2.2;
          for (const c of cs) { ctx.beginPath(); ctx.moveTo(c.x1 + 1.6, c.y1); ctx.lineTo(c.x1 + 1.6 + (c.x2 - c.x1) * g.crackT, c.y1 + (c.y2 - c.y1) * g.crackT); ctx.stroke(); }
          // núcleo blanco + brillo
          ctx.globalAlpha = liveAlpha; ctx.strokeStyle = '#ffffff'; ctx.shadowColor = 'rgba(201,166,255,0.7)'; ctx.shadowBlur = 5;
          for (const c of cs) {
            ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(c.x1, c.y1); ctx.lineTo(c.x1 + (c.x2 - c.x1) * g.crackT, c.y1 + (c.y2 - c.y1) * g.crackT); ctx.stroke();
            ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(c.bx, c.by); ctx.lineTo(c.bx + (c.bx2 - c.bx) * g.crackT, c.by + (c.by2 - c.by) * g.crackT); ctx.stroke();
          }
          // telaraña de cristal: une puntos-anillo de grietas vecinas (polígonos)
          if (g.crackT > 0.5) {
            ctx.globalAlpha = liveAlpha * 0.7; ctx.lineWidth = 1.4; const k = Math.min(1, (g.crackT - 0.5) / 0.4);
            for (let i = 0; i < cs.length; i++) { const a = cs[i], b = cs[(i + 1) % cs.length]; ctx.beginPath(); ctx.moveTo(a.rx, a.ry); ctx.lineTo(a.rx + (b.rx - a.rx) * k, a.ry + (b.ry - a.ry) * k); ctx.stroke(); }
          }
          ctx.shadowBlur = 0; ctx.globalAlpha = 1;
        }
      }

      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      for (const f of floats) { ctx.globalAlpha = Math.min(1, f.life * 1.6); ctx.fillStyle = f.color; ctx.font = `700 ${f.size}px ui-monospace, monospace`; ctx.fillText(f.text, f.x, f.y); }
      ctx.globalAlpha = 1; ctx.textAlign = 'start';

      if (!active) { ctx.fillStyle = 'rgba(7,5,14,0.45)'; ctx.fillRect(0, 0, W, H); }

      ctx.restore();

      if (g.whiteFlash > 0) { ctx.globalAlpha = g.whiteFlash * 0.9; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      if (g.hitFlash > 0) { ctx.globalAlpha = g.hitFlash * 0.4; ctx.fillStyle = '#F97316'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }

      // glitch VHS: bandas horizontales desplazadas con tinte RGB
      if (g.glitch > 0.04) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const n = 2 + Math.floor(g.glitch * 5);
        for (let i = 0; i < n; i++) {
          const by = Math.random() * H, bh = 3 + Math.random() * 16, off = (Math.random() - 0.5) * 42 * g.glitch;
          try { ctx.drawImage(canvas, 0, Math.round(by * dpr), canvas.width, Math.max(1, Math.round(bh * dpr)), off, by, W, bh); } catch { /* noop */ }
          ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.22 * g.glitch; ctx.fillStyle = i % 2 ? '#ff003c' : '#00e5ff'; ctx.fillRect(off, by, W, bh);
          ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
        }
      }
    };
    raf = requestAnimationFrame((t) => { last = t; loop(t); });

    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') { e.preventDefault(); if (!e.repeat) requestJump(); }
      else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyD' || e.code === 'ArrowRight') { e.preventDefault(); requestDash(); }
      else if (e.code === 'Escape') onCloseRef.current();
    };
    const onKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') cutJump(); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    const onPointer = (e: PointerEvent) => { e.preventDefault(); requestJump(); };
    const onPointerUp = () => cutJump();
    canvas.addEventListener('pointerdown', onPointer);
    canvas.addEventListener('pointerup', onPointerUp);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('pointerdown', onPointer);
      canvas.removeEventListener('pointerup', onPointerUp);
      for (const o of obstacles) o.node.remove();
      actx?.close?.();
      document.body.style.overflow = prevOverflow;
      if (hadCustomCursor) document.body.classList.add('has-custom-cursor');
    };
  }, [open]);

  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="escape-overlay fixed inset-0 z-[9999]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <motion.div className="absolute inset-0" style={{ background: 'rgba(7,5,14,0.5)', backdropFilter: 'blur(6px)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} />
          <motion.div
            ref={zoomRef} className="absolute inset-0" style={{ touchAction: 'none' }}
            initial={{ scale: 0.12, opacity: 0, filter: 'blur(22px)' }} animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }} exit={{ scale: 0.12, opacity: 0, filter: 'blur(22px)' }}
            transition={{ type: 'spring', stiffness: 140, damping: 19 }}
          >
            <div ref={layerRef} className="absolute inset-0 overflow-hidden" />
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ cursor: 'crosshair' }} />
            {/* pantalla rota persistente: scanlines + viñeta */}
            <div className="pointer-events-none absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.13) 0px, rgba(0,0,0,0.13) 1px, transparent 1px, transparent 3px), radial-gradient(ellipse at center, transparent 62%, rgba(0,0,0,0.45) 100%)',
              mixBlendMode: 'multiply', opacity: 0.38,
            }} />
          </motion.div>

          <div className="pointer-events-none absolute left-1/2 top-5 -translate-x-1/2 flex flex-col items-center gap-2">
            {(hud.lives > 0 || hud.shield) && (
              <div className="flex items-center gap-2.5 rounded-full px-4 py-2"
                style={{ background: 'var(--bg-glass-strong)', border: '1px solid var(--border-subtle)', backdropFilter: 'blur(10px)' }}>
                {Array.from({ length: hud.lives }).map((_, i) => <Heart key={i} size={24} className="text-rose-400" fill="currentColor" />)}
                {hud.shield && <Shield size={24} className="text-sky-400" fill="currentColor" />}
              </div>
            )}
            <p className="font-mono text-sm text-white/85">esquivados · <span ref={scoreRef} style={{ color: '#FBBF24' }}>0</span></p>
            <p className="text-xs text-white/45">ESPACIO salta (mantén = más alto) · MAYÚS/D dash · pisa la W · ESC salir</p>
          </div>

          {/* selector de dificultad */}
          <button onClick={() => chooseMode(mode === 'facil' ? 'normal' : 'facil')}
            className="absolute left-6 top-[72px] z-[210] rounded-full px-3.5 py-1.5 text-xs font-semibold text-white/85 transition-transform hover:scale-105"
            style={{ background: 'var(--bg-glass-strong)', border: '1px solid var(--border-subtle)', backdropFilter: 'blur(8px)' }} aria-label="Cambiar dificultad">
            {mode === 'facil' ? '🌱 Fácil' : '🔥 Normal'}
          </button>

          {/* botón de dash (táctil) */}
          <button onClick={() => dashRef.current()} aria-label="Dash"
            className="absolute bottom-6 right-6 z-[210] inline-flex h-14 w-14 items-center justify-center rounded-full text-xs font-bold text-white transition-transform active:scale-90"
            style={{ background: 'linear-gradient(180deg, var(--purple-400), var(--purple-600))', boxShadow: '0 6px 24px var(--purple-glow)' }}>
            DASH
          </button>

          <motion.button onClick={() => setMuted((m) => !m)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="absolute left-6 top-6 z-[210] inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform hover:scale-110"
            style={{ background: 'var(--bg-glass-strong)', border: '1px solid var(--border-subtle)', backdropFilter: 'blur(8px)' }} aria-label={muted ? 'Activar sonido' : 'Silenciar'}>
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </motion.button>
          <motion.button onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="absolute right-6 top-6 z-[210] inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform hover:scale-110"
            style={{ background: 'var(--bg-glass-strong)', border: '1px solid var(--border-subtle)', backdropFilter: 'blur(8px)' }} aria-label="Salir del juego">
            <X size={18} />
          </motion.button>

          <AnimatePresence>
            {over && (
              <motion.div className="absolute inset-0 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div className="flex flex-col items-center gap-3 rounded-3xl px-10 py-9 text-center"
                  initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                  style={{ background: 'var(--bg-glass-strong)', border: '1px solid var(--border-subtle)', backdropFilter: 'blur(16px)', boxShadow: '0 30px 80px -20px rgba(0,0,0,0.7)' }}>
                  <Skull size={34} className="text-white/80" />
                  <p className="font-display text-3xl font-bold text-white">¡Te pilló {result.killedBy}!</p>
                  <p className="font-mono text-sm text-white/70">
                    {result.score} esquivados
                    {result.record
                      ? <span style={{ color: '#FBBF24' }}> · ¡nuevo récord! 🏆</span>
                      : <span className="inline-flex items-center gap-1 text-white/50"> · <Trophy size={12} /> {result.best}</span>}
                  </p>
                  <p className="text-xs text-white/40">partida #{result.runs} · {result.dodged} esquivados en total</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-widest text-white/35">modo</span>
                    {(['facil', 'normal'] as const).map((m) => (
                      <button key={m} onClick={() => chooseMode(m)} className="rounded-full px-3 py-1 text-xs font-semibold transition-colors"
                        style={mode === m ? { background: 'linear-gradient(180deg, var(--purple-400), var(--purple-600))', color: '#fff' } : { color: 'rgba(255,255,255,0.55)', border: '1px solid var(--border-subtle)' }}>
                        {m === 'facil' ? '🌱 Fácil' : '🔥 Normal'}
                      </button>
                    ))}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-widest text-white/35">skin</span>
                    {SKINS.map((s) => {
                      const isUnlocked = unlocked.includes(s.id);
                      return (
                        <button key={s.id} onClick={() => isUnlocked && chooseSkin(s.id)} disabled={!isUnlocked} title={isUnlocked ? s.name : `Bloqueada · ${skinHint(s.id)}`}
                          className="h-8 w-8 rounded-full transition-transform hover:scale-110 disabled:cursor-not-allowed"
                          style={{ background: `linear-gradient(135deg, ${s.c0}, ${s.c2})`, opacity: isUnlocked ? 1 : 0.25, border: skin === s.id ? '2px solid #fff' : '2px solid transparent' }}>
                          {!isUnlocked && <span className="text-[11px]">🔒</span>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2 flex gap-3">
                    <button onClick={() => resetRef.current()} className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
                      style={{ background: 'linear-gradient(180deg, var(--purple-400), var(--purple-600))', boxShadow: '0 6px 24px var(--purple-glow)' }}>
                      <RotateCcw size={14} /> Otra vez
                    </button>
                    <button onClick={onClose} className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white/80 transition-colors hover:text-white"
                      style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)' }}>
                      Salir
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
