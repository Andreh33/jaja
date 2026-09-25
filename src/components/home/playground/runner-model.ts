export type Block = { kind: 'block'; x: number; w: number; h: number; color: string };
export type Sweeper = { kind: 'sweeper'; x: number; len: number; speed: number; angle: number };
export type Obstacle = Block | Sweeper;

export type Coin = { x: number; y: number; taken: boolean; ph: number };
export type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; r: number };
export type Float = { x: number; y: number; vy: number; life: number; text: string; color: string };
export type Star = { x: number; y: number; r: number; tw: number; ph: number };

export const BLOCK_COLORS = ['#3b82f6', '#67c4ff', '#3B82F6', '#10B981'];
export const GROUND_OFFSET = 56;
export const PLAYER_X = 92;
export const GRAVITY = 1900;
export const JUMP_V = -640;

// Cordilleras de fondo: lejos = más claras y lentas, cerca = oscuras y rápidas (perspectiva aérea).
export const RANGES = [
  { par: 0.05, base: 158, amp: 56, step: 20, seed: 0.0, c0: '#183e6b', c1: '#112d4c' },
  { par: 0.12, base: 112, amp: 48, step: 16, seed: 2.1, c0: '#123052', c1: '#0b223c' },
  { par: 0.24, base: 72, amp: 40, step: 14, seed: 4.7, c0: '#0b1d32', c1: '#061322' },
] as const;


export function newRunnerState() { return {
    y: 0,
    vy: 0,
    onGround: true,
    lastGround: 0,
    jumpsLeft: 2,
    dist: 0,
    speed: 280,
    obstacles: [] as Obstacle[],
    coins: [] as Coin[],
    particles: [] as Particle[],
    floats: [] as Float[],
    nextSpawn: 420,
    nextCoin: 600,
    coinsGot: 0,
    combo: 0,
    t: 0,
    shake: 0,
    flash: 0,
    deadVy: 0,
    deadRot: 0,
    runPhase: 0,
    dustT: 0,
    reset: undefined as (() => void) | undefined,
}; }
export type RunnerState = ReturnType<typeof newRunnerState>;
export type RunnerStatus = 'idle' | 'playing' | 'over';
