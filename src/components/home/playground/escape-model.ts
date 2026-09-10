import { gameStorage, readGameNumber } from './game-storage';

export type Obstacle = { node: HTMLElement; x: number; w: number; h: number; s: number; passed: boolean };
export type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; r: number; sq?: boolean };
export type Float = { x: number; y: number; vy: number; life: number; text: string; color: string; size: number };
export type WEnemy = { x: number; dead: number; passed: boolean };
export type Crack = { x1: number; y1: number; x2: number; y2: number; bx: number; by: number; bx2: number; by2: number; rx: number; ry: number };
export type Proj = { x: number; y: number; rot: number; kind: string };
export type Pickup = { x: number; y: number; kind: 'shield' | 'heart' | 'coin'; ph: number };
export type Boss = { state: 'enter' | 'idle' | 'telegraph' | 'dash' | 'low' | 'return' | 'dying'; x: number; y: number; baseX: number; baseY: number; hp: number; t: number; shootT: number; swoopT: number; phase: number; hitFlash: number; deadT: number; type: string; mega: boolean };
export type WeatherKind = 'clear' | 'rain' | 'storm' | 'fog';
export type WeatherFx = { x: number; y: number; vx: number; vy: number; r: number; rot: number; a: number; kind: WeatherKind };
export type Hole = { x: number; w: number };

export const GROUND_RATIO = 0.56; // horizonte hacia el centro (antes pegado abajo)
export const RUN_X = 160;
export const GRAVITY = 2600;
export const JUMP_V = -980;
export const BUFFER = 0.15;
export const COYOTE = 0.11;
export const BEAN_HW = 18;  // medio ancho hitbox judía
export const BEAN_H = 56;   // alto hitbox judía
export const BOSS_SCORE = 18;
export const BEST_KEY = 'latech-escape-best';
export const RUNS_KEY = 'latech-escape-runs';
export const DODGED_KEY = 'latech-escape-dodged';
export const SKIN_KEY = 'latech-escape-skin';
export const BOSSKILLS_KEY = 'latech-escape-bosskills';
export const MODE_KEY = 'latech-escape-mode';
export const COINS_KEY = 'latech-escape-coins';
export const OWNED_KEY = 'latech-escape-owned';
export const GAMEMODE_KEY = 'latech-escape-gamemode';
export const LB_KEY = 'latech-escape-lb';
export const NAME_KEY = 'latech-escape-name';
export const readCoins = () => readGameNumber(COINS_KEY);
export const readOwned = (): string[] => { try { const o = JSON.parse(gameStorage.getItem(OWNED_KEY) || '["default"]'); return Array.isArray(o) ? [...new Set(['default', ...o.filter((id) => typeof id === 'string' && SKINS.some((skin) => skin.id === id))])] : ['default']; } catch { return ['default']; } };
export const readLB = (): { name: string; score: number }[] => { try { const l = JSON.parse(gameStorage.getItem(LB_KEY) || '[]'); return Array.isArray(l) ? l.filter((entry) => entry && typeof entry.name === 'string' && Number.isSafeInteger(entry.score) && entry.score >= 0).slice(0, 10) : []; } catch { return []; } };

export type Diff = { startSpeed: number; maxSpeed: number; accel: number; gapBase: number; bossAt: number; startLives: number; startShield: boolean; projSpeed: number; wTimer: number };
export const DIFF: Record<'facil' | 'normal', Diff> = {
  facil: { startSpeed: 250, maxSpeed: 520, accel: 6.5, gapBase: 480, bossAt: 28, startLives: 1, startShield: true, projSpeed: 0.85, wTimer: 6.5 },
  normal: { startSpeed: 320, maxSpeed: 660, accel: 10, gapBase: 380, bossAt: 18, startLives: 0, startShield: false, projSpeed: 1.05, wTimer: 4.5 },
};

export type Skin = { id: string; name: string; c0: string; c1: string; c2: string; aura: string; price: number };
export const SKINS: Skin[] = [
  { id: 'default', name: 'Clásica', c0: '#C9A6FF', c1: '#8B5CF6', c2: '#5B21B6', aura: '139,92,246', price: 0 },
  { id: 'dorada', name: 'Dorada', c0: '#FFE9A8', c1: '#FBBF24', c2: '#B45309', aura: '251,191,36', price: 20 },
  { id: 'neon', name: 'Neón', c0: '#7DF9FF', c1: '#22D3EE', c2: '#9333EA', aura: '34,211,238', price: 30 },
  { id: 'esmeralda', name: 'Esmeralda', c0: '#A7F3D0', c1: '#10B981', c2: '#065F46', aura: '16,185,129', price: 40 },
  { id: 'fuego', name: 'Fuego', c0: '#FED7AA', c1: '#F97316', c2: '#B91C1C', aura: '249,115,22', price: 55 },
  { id: 'hielo', name: 'Hielo', c0: '#E0F2FE', c1: '#60A5FA', c2: '#1E40AF', aura: '96,165,250', price: 70 },
  { id: 'rosa', name: 'Chicle', c0: '#FBCFE8', c1: '#EC4899', c2: '#9D174D', aura: '236,72,153', price: 90 },
  { id: 'matrix', name: 'Matrix', c0: '#86EFAC', c1: '#22C55E', c2: '#14532D', aura: '34,197,94', price: 120 },
  { id: 'galaxia', name: 'Galaxia', c0: '#C4B5FD', c1: '#7C3AED', c2: '#1E1B4B', aura: '124,58,237', price: 160 },
  { id: 'oro', name: 'Oro puro', c0: '#FEF3C7', c1: '#F59E0B', c2: '#78350F', aura: '245,158,11', price: 220 },
];

export const SELECTORS = ['.glass', '[class*="rounded-3xl"]', '[class*="rounded-2xl"]', '[class*="rounded-xl"]', 'article', '[class*="card"]', 'li[class*="rounded"]'];

// Campaña: jefes temáticos en secuencia (acto 1 → final)
export const BOSS_TYPES = [
  { id: 'plantilla', name: 'PLANTILLA', defeat: 'plantilla destruida', c0: '#9aa3b2', c1: '#3a4150' },
  { id: 'plugin', name: 'PLUGIN DE PAGO', defeat: 'plugin cancelado', c0: '#fcd34d', c1: '#b45309' },
  { id: 'lenta', name: 'WEB LENTA', defeat: 'web acelerada', c0: '#aab6c9', c1: '#475569' },
  { id: 'wordpress', name: 'WORDPRESS', defeat: 'WordPress eliminado', c0: '#2a90bd', c1: '#143f57' },
];


export type EscapeResult = { score: number; best: number; record: boolean; killedBy: string; runs: number; dodged: number; won: boolean };
