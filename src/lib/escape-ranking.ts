import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

export const ESCAPE_RULES_VERSION = 'escape-v2';
export const ESCAPE_RUN_TTL_MS = 60 * 60 * 1000;
export const ESCAPE_MAX_ACTIVE_MS = 30 * 60 * 1000;
export const escapeCategorySchema = z.object({
  mode: z.enum(['campana', 'infinito']),
  difficulty: z.enum(['facil', 'normal']),
});
export type EscapeCategory = z.infer<typeof escapeCategorySchema>;
export const escapeResultSchema = z.object({
  runId: z.uuid(),
  runToken: z.string().regex(/^[a-f0-9]{64}$/),
  name: z.string().trim().min(1).max(14).regex(/^[\p{L}\p{N} ._-]+$/u, 'Usa letras, números, espacios, punto, guion o guion bajo.'),
  score: z.number().int().min(0).max(100000),
  durationMs: z.number().int().min(0).max(ESCAPE_MAX_ACTIVE_MS),
});
export type EscapeResultInput = z.infer<typeof escapeResultSchema>;
export type EscapeRun = EscapeCategory & {
  id: string; tokenHash: string; rulesVersion: string; startedAt: number; expiresAt: number;
};
export type EscapeEntry = { id: string; name: string; score: number; durationMs: number };
export type StoredEscapeEntry = EscapeEntry & { createdAt: number };
export interface EscapeRankingStore {
  createRun: (run: EscapeRun) => Promise<void>;
  getRun: (id: string) => Promise<EscapeRun | null>;
  getResult: (id: string) => Promise<StoredEscapeEntry | null>;
  insertResult: (entry: StoredEscapeEntry) => Promise<boolean>;
  top: (category: EscapeCategory, rulesVersion: string) => Promise<EscapeEntry[]>;
}

export class EscapeRankingError extends Error {
  constructor(public code: string, public status: number, message: string) { super(message); }
}

function tokenHash(token: string): string { return createHash('sha256').update(token).digest('hex'); }

export async function createEscapeRun(input: unknown, store: EscapeRankingStore, now = Date.now()) {
  const parsed = escapeCategorySchema.safeParse(input);
  if (!parsed.success) throw new EscapeRankingError('INVALID_CATEGORY', 400, 'Elige un modo y una dificultad válidos.');
  const runToken = randomBytes(32).toString('hex');
  const run: EscapeRun = {
    ...parsed.data, id: randomUUID(), tokenHash: tokenHash(runToken), rulesVersion: ESCAPE_RULES_VERSION,
    startedAt: now, expiresAt: now + ESCAPE_RUN_TTL_MS,
  };
  await store.createRun(run);
  return { runId: run.id, runToken, rulesVersion: run.rulesVersion, expiresAt: run.expiresAt };
}

function publicEntry(entry: StoredEscapeEntry): EscapeEntry {
  return { id: entry.id, name: entry.name, score: entry.score, durationMs: entry.durationMs };
}

export async function submitEscapeResult(input: unknown, store: EscapeRankingStore, now = Date.now()) {
  const parsed = escapeResultSchema.safeParse(input);
  if (!parsed.success) throw new EscapeRankingError('INVALID_RESULT', 400, 'Revisa el nombre y los datos de la partida.');
  const result = parsed.data;
  const run = await store.getRun(result.runId);
  if (!run || !/^[a-f0-9]{64}$/.test(run.tokenHash) || !timingSafeEqual(Buffer.from(run.tokenHash, 'hex'), Buffer.from(tokenHash(result.runToken), 'hex'))) {
    throw new EscapeRankingError('INVALID_SESSION', 401, 'La sesión de esta partida no es válida.');
  }
  const reply = async (entry: StoredEscapeEntry, duplicate: boolean) => {
    if (entry.name !== result.name || entry.score !== result.score || entry.durationMs !== result.durationMs) {
      throw new EscapeRankingError('RESULT_CONFLICT', 409, 'Esta partida ya tiene otro resultado publicado.');
    }
    return { ok: true as const, duplicate, entry: publicEntry(entry), top: await store.top(run, run.rulesVersion) };
  };
  // A lost response can be retried even after expiry. It can never change the
  // already accepted result, alias, category or rules of that run.
  const existing = await store.getResult(run.id);
  if (existing) return reply(existing, true);
  if (run.expiresAt <= now || run.rulesVersion !== ESCAPE_RULES_VERSION) {
    throw new EscapeRankingError('SESSION_EXPIRED', 410, 'La sesión ha caducado. Tu récord local se conserva.');
  }
  const elapsed = now - run.startedAt;
  // A generous plausibility bound, not proof of a genuine playthrough. Replay
  // validation/server simulation would be required for a competitive tournament.
  const plausibleScore = Math.floor(result.durationMs / 1000 * 8) + 30;
  if (elapsed < 0 || result.durationMs > elapsed + 2000 || result.score > plausibleScore) {
    throw new EscapeRankingError('IMPLAUSIBLE_RESULT', 422, 'La puntuación no encaja con la duración de esta partida.');
  }
  const entry: StoredEscapeEntry = { id: run.id, name: result.name, score: result.score, durationMs: result.durationMs, createdAt: now };
  if (await store.insertResult(entry)) return reply(entry, false);
  // The unique run_id constraint also covers two concurrent identical retries.
  const accepted = await store.getResult(run.id);
  if (!accepted) throw new Error('Result insert did not return an accepted record');
  return reply(accepted, true);
}
