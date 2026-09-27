import { z } from 'zod';
import type { ArcadeView, Player } from './arcade-engine';
export const ARCADE_SESSION_MS = 30 * 60_000;
export const ARCADE_INVITE_MS = 5 * 60_000;
export const ARCADE_OFFLINE_MS = 20_000;
export type ArcadeMode = 'lobby' | 'platform' | 'fight' | 'blocks' | 'photo' | 'naval' | 'space' | 'orbit';
export type ArcadeRole = 'host' | 'p0' | 'p1';
const id = z.string().uuid(); const token = z.string().regex(/^[a-f0-9]{64}$/); const slot = z.union([z.literal(0), z.literal(1)]);
const role = z.enum(['host', 'p0', 'p1']); const version = z.number().int().nonnegative().max(100000);
export const arcadeRequestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('create') }).strict(),
  z.object({ action: z.literal('join'), id, slot, invite: token, controller: token }).strict(),
  z.object({ action: z.literal('poll'), id, role }).strict(),
  z.object({ action: z.literal('close'), id, role }).strict(),
  z.object({ action: z.literal('select'), id, role: z.literal('host'), mode: z.enum(['lobby', 'platform', 'fight', 'blocks', 'photo', 'naval', 'space', 'orbit']), version }).strict(),
  z.object({ action: z.literal('move'), id, role: z.enum(['p0', 'p1']), cell: z.number().int().min(-1).max(63), version }).strict(),
  z.object({ action: z.literal('signal'), id, role, slot, signalId: id, sdp: z.string().min(10).max(16000) }).strict(),
  z.object({ action: z.literal('reconnect'), id, role: z.enum(['p0', 'p1']) }).strict(),
  z.object({action:z.literal('finished'),id,role:z.literal('host'),version}).strict(),
  z.object({action:z.literal('rematch'),id,role:z.enum(['p0','p1']),version}).strict(),
]);
export type ArcadeRequest = z.infer<typeof arcadeRequestSchema>;
export type ArcadeState = { id: string; expiresAt: number; inviteExpiresAt: number; hostOnline: boolean; mode: ArcadeMode; version: number; game: ArcadeView | null;
  players: [ { connected: boolean; online: boolean;rematchReady?:boolean }, { connected: boolean; online: boolean;rematchReady?:boolean } ]; canRematch?:boolean;
  signals: [ { offer?: string | null; answer?: string | null; signalId: string | null }, { offer?: string | null; answer?: string | null; signalId: string | null } ];
  token?: string; invites?: [string, string]; iceServers?: RTCIceServer[] };
export type ArcadeCredentials = { id: string; token: string; role: ArcadeRole; slot?: Player };
export class ArcadeHttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function arcadeFetch(request: ArcadeRequest, token?: string, signal?: AbortSignal): Promise<ArcadeState> {
  const timeout = AbortSignal.timeout(request.action === 'create' ? 30000 : 12000);
  let response: Response;
  try { response = await fetch('/api/tv-arcade', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(request), cache: 'no-store', signal: signal ? AbortSignal.any([signal, timeout]) : timeout }); }
  catch (error) { if (error instanceof Error && error.name === 'TimeoutError') throw new ArcadeHttpError(408, 'La señal está tardando más de lo habitual. Vuelve a intentarlo.'); throw error; }
  const result = await response.json();
  if (!response.ok) throw new ArcadeHttpError(response.status, result.error || 'Señal interrumpida.');
  return result;
}
export function arcadeToken() { return Array.from(crypto.getRandomValues(new Uint8Array(32)), value => value.toString(16).padStart(2, '0')).join(''); }

/** A host's explicit game change may overtake the previous turn's poll. */
export async function selectArcadeMode(credentials: Pick<ArcadeCredentials, 'id' | 'token'>, mode: ArcadeMode, version: number, send = arcadeFetch): Promise<ArcadeState> {
  const select = (currentVersion: number) => send({ action: 'select', id: credentials.id, role: 'host', mode, version: currentVersion }, credentials.token);
  try { return await select(version); }
  catch (error) {
    if (!(error instanceof ArcadeHttpError) || error.status !== 409) throw error;
    const fresh = await send({ action: 'poll', id: credentials.id, role: 'host' }, credentials.token);
    return select(fresh.version); // One bounded retry; never replay a player's move.
  }
}
