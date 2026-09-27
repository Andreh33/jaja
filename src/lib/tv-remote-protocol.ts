import { z } from 'zod';
import { isTvChannel } from './tv-channels';
export const TV_INVITE_MS = 2 * 60_000;
export const TV_SESSION_MS = 20 * 60_000;
export const TV_OFFLINE_MS = 18_000;
export const tokenSchema = z.string().regex(/^[a-f0-9]{64}$/);
const id = z.string().uuid();
const channel = z.string().max(50).refine(isTvChannel);
export const remoteCommands = ['next', 'previous', 'channel', 'expand', 'scroll-up', 'scroll-down', 'visit-home', 'visit-projects', 'visit-lab', 'visit-contact'] as const;
export type RemoteCommand = (typeof remoteCommands)[number];
export const remoteRequestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('create'), channel, expanded: z.boolean() }).strict(),
  z.object({ action: z.literal('join'), id, invite: tokenSchema, controller: tokenSchema }).strict(),
  z.object({ action: z.literal('poll'), id, role: z.enum(['host', 'controller']), appliedVersion: z.number().int().min(-1).max(1_000_000).optional(), channel: channel.optional(), expanded: z.boolean().optional() }).strict(),
  z.object({ action: z.literal('command'), id, command: z.enum(remoteCommands), channel: channel.optional() }).strict().refine(value => value.command !== 'channel' || !!value.channel),
  z.object({ action: z.literal('disconnect'), id, role: z.enum(['host', 'controller']) }).strict(),
]);
export type RemoteRequest = z.infer<typeof remoteRequestSchema>;
export type RemoteState = { id: string; expiresAt: number; inviteExpiresAt: number; paired: boolean; hostOnline: boolean; controllerOnline: boolean; channel: string; expanded: boolean; commandVersion: number; appliedVersion: number; displayedChannel: string; displayedExpanded: boolean; lastAction: string };
export type RemoteCredentials = { id: string; token: string };
export class RemoteHttpError extends Error { constructor(message: string, public status: number) { super(message); } }
export async function remoteFetch(body: RemoteRequest, token?: string, signal?: AbortSignal): Promise<RemoteState & { token?: string; invite?: string }> {
  const timeout = AbortSignal.timeout(10_000);
  const requestSignal = signal && typeof AbortSignal.any === 'function' ? AbortSignal.any([signal, timeout]) : signal ?? timeout;
  const response = await fetch('/api/tv-remote', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body), cache: 'no-store', signal: requestSignal });
  const result = await response.json();
  if (!response.ok) throw new RemoteHttpError(result.error || 'No se pudo conectar con la televisión.', response.status);
  return result;
}
