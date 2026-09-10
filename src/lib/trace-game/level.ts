/** Version 1 is immutable: shared links keep their geometry and physics. */
export const TRACE_VERSION = 1;
export const TRACE_SAMPLES = 16;
export const MAX_TRACE_POINTS = 256;
const ALPHABET = '0123456789abcdefghijklmnopqrstuv';
export type TracePoint = { x: number; y: number };
export type Platform = { x: number; y: number; width: number };
export type TraceLevel = { token: string; samples: number[]; platforms: Platform[]; finish: number; repaired: boolean };
export const TRACE_PHYSICS = { speed: 185, gravity: 1400, jump: 470, playerHalfWidth: 13, playerHeight: 40 } as const;
const clamp = (n: number, low: number, high: number) => Math.max(low, Math.min(high, n));

export function levelFromSamples(samples: readonly number[]): TraceLevel {
  if (samples.length !== TRACE_SAMPLES || samples.some((y) => !Number.isInteger(y) || y < 0 || y > 31)) throw new Error('El recorrido no es válido.');
  const platforms: Platform[] = [{ x: 0, y: 330, width: 340 }];
  let repaired = false;
  for (let i = 0; i < samples.length; i++) {
    const previous = platforms[platforms.length - 1];
    const desired = 270 + Math.round(samples[i] / 31 * 130);
    const y = clamp(desired, previous.y - 30, previous.y + 30);
    if (y !== desired) repaired = true;
    const gap = 32 + (samples[i] % 4) * 4;
    platforms.push({ x: previous.x + previous.width + gap, y, width: 152 + (samples[i] % 3) * 10 });
  }
  const last = platforms[platforms.length - 1];
  return { token: `${TRACE_VERSION}.${samples.map((y) => ALPHABET[y]).join('')}`, samples: [...samples], platforms, finish: last.x + last.width - 35, repaired };
}

export function decodeTraceLevel(token: string): TraceLevel | null {
  if (!/^1\.[0-9a-v]{16}$/.test(token)) return null;
  return levelFromSamples([...token.slice(2)].map((c) => ALPHABET.indexOf(c)));
}

/** A bounded horizontal profile, never executable text or a public drawing upload. */
export function generateTraceLevel(points: readonly TracePoint[]): TraceLevel {
  if (points.length < 2 || points.length > MAX_TRACE_POINTS || points.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))) throw new Error('Dibuja una línea un poco más larga o elige un recorrido.');
  const sorted = points.map((p) => ({ x: clamp(p.x, 0, 1), y: clamp(p.y, 0, 1) })).sort((a, b) => a.x - b.x);
  const first = sorted[0], last = sorted[sorted.length - 1];
  if (last.x - first.x < .08) throw new Error('Tu línea necesita un poco de recorrido horizontal. Prueba de izquierda a derecha.');
  const samples: number[] = [];
  let cursor = 0;
  for (let i = 0; i < TRACE_SAMPLES; i++) {
    const x = first.x + (last.x - first.x) * i / (TRACE_SAMPLES - 1);
    while (cursor < sorted.length - 2 && sorted[cursor + 1].x < x) cursor++;
    const a = sorted[cursor], b = sorted[cursor + 1];
    const progress = b.x === a.x ? 0 : clamp((x - a.x) / (b.x - a.x), 0, 1);
    samples.push(Math.round(clamp(a.y + (b.y - a.y) * progress, 0, 1) * 31));
  }
  return levelFromSamples(samples);
}

export const TRACE_PRESETS = [
  { id: 'ondas', name: 'Olas', samples: [15, 12, 8, 6, 9, 15, 21, 24, 21, 15, 9, 6, 9, 15, 21, 18] },
  { id: 'cumbres', name: 'Cumbres', samples: [22, 18, 12, 7, 2, 7, 12, 18, 24, 20, 14, 8, 3, 8, 14, 20] },
  { id: 'escalera', name: 'Escalera', samples: [24, 24, 20, 20, 16, 16, 12, 12, 8, 8, 12, 12, 16, 16, 20, 20] },
] as const;

/** Longest usable flight to a platform top while descending (world units). */
export function jumpReach(from: Platform, to: Platform) {
  const { jump, gravity, speed } = TRACE_PHYSICS;
  const discriminant = jump * jump + 2 * gravity * (to.y - from.y);
  return discriminant < 0 ? 0 : speed * (jump + Math.sqrt(discriminant)) / gravity;
}
