import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { and, count, eq, gt, lt } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { tvRemoteSessions as sessions, type TvDeviceInfo } from '../../drizzle/schema';
import { tvChannelIds } from './tv-channels';
import { remoteRequestSchema, TV_INVITE_MS, TV_SESSION_MS, TV_OFFLINE_MS, type RemoteRequest, type RemoteState } from './tv-remote-protocol';
export class RemoteError extends Error { constructor(public status: number, message: string) { super(message); } }
export const hashRemoteToken = (token: string) => createHash('sha256').update(token).digest('hex');
function matches(token: string | undefined, expected: string | null) {
  return !!token && !!expected && /^[a-f0-9]{64}$/.test(token) && timingSafeEqual(Buffer.from(hashRemoteToken(token)), Buffer.from(expected));
}
type Row = typeof sessions.$inferSelect;
type Context = { token?: string; ipHash: string; info: TvDeviceInfo; user?: { id: string; name: string } };
function snapshot(row: Row, now: number): RemoteState {
  return { id: row.id, expiresAt: row.expiresAt, inviteExpiresAt: row.inviteExpiresAt, paired: !!row.pairedAt,
    hostOnline: now - row.hostSeenAt < TV_OFFLINE_MS, controllerOnline: !!row.controllerSeenAt && now - row.controllerSeenAt < TV_OFFLINE_MS,
    channel: row.channel, expanded: row.expanded, commandVersion: row.commandVersion, appliedVersion: row.appliedVersion,
    displayedChannel: row.displayedChannel, displayedExpanded: row.displayedExpanded, lastAction: row.lastAction };
}
// Serialize claims and commands across independent serverless instances.
export function createTvRemoteService<TSchema extends Record<string, unknown>>(database: LibSQLDatabase<TSchema>, clock = Date.now) {
  return async function execute(input: RemoteRequest, context: Context) {
    const parsed = remoteRequestSchema.safeParse(input);
    if (!parsed.success) throw new RemoteError(400, 'Orden no válida.');
    const request = parsed.data; const now = clock();
    return database.transaction(async tx => {
      if (request.action === 'create') {
        await tx.delete(sessions).where(lt(sessions.createdAt, now - 30 * 86_400_000));
        await tx.update(sessions).set({ hostTokenHash: null, inviteTokenHash: null, controllerTokenHash: null }).where(lt(sessions.expiresAt, now));
        await tx.update(sessions).set({ creatorIpHash: null }).where(lt(sessions.createdAt, now - 86_400_000));
        const recent = await tx.select({ createdAt: sessions.createdAt }).from(sessions).where(and(eq(sessions.creatorIpHash, context.ipHash), gt(sessions.createdAt, now - 86_400_000)));
        if (recent.length >= 20 || recent.filter(row => row.createdAt > now - 600_000).length >= 6) throw new RemoteError(429, 'Has creado varios mandos. Espera unos minutos antes de generar otro.');
        const [active] = await tx.select({ value: count() }).from(sessions).where(gt(sessions.expiresAt, now));
        if (active.value >= 150) throw new RemoteError(503, 'Todos los mandos están ocupados. Prueba en unos minutos.');
        const token = randomBytes(32).toString('hex'); const invite = randomBytes(32).toString('hex');
        const [row] = await tx.insert(sessions).values({ id: randomUUID(), hostTokenHash: hashRemoteToken(token), inviteTokenHash: hashRemoteToken(invite), creatorIpHash: context.ipHash,
          createdAt: now, inviteExpiresAt: now + TV_INVITE_MS, expiresAt: now + TV_SESSION_MS, hostSeenAt: now,
          channel: request.channel, displayedChannel: request.channel, expanded: request.expanded, displayedExpanded: request.expanded, hostInfo: context.info }).returning();
        return { ...snapshot(row, now), token, invite };
      }
      const [row] = await tx.select().from(sessions).where(eq(sessions.id, request.id)).limit(1);
      if (!row || row.revokedAt || now >= row.expiresAt) throw new RemoteError(410, 'Esta conexión ha terminado. Escanea un QR nuevo en la televisión.');
      if (request.action === 'join') {
        if (row.controllerTokenHash) {
          if (matches(request.controller, row.controllerTokenHash)) return snapshot(row, now);
          throw new RemoteError(409, 'Este QR ya tiene un mando conectado. Genera otro en la televisión.');
        }
        if (now >= row.inviteExpiresAt) throw new RemoteError(410, 'Este QR ha caducado. Genera uno nuevo en la televisión.');
        if (!matches(request.invite, row.inviteTokenHash)) throw new RemoteError(401, 'QR no válido.');
        if (now - row.hostSeenAt >= TV_OFFLINE_MS) throw new RemoteError(409, 'La televisión no está disponible. Vuelve a abrirla y escanea de nuevo.');
        const [paired] = await tx.update(sessions).set({ controllerTokenHash: hashRemoteToken(request.controller), inviteTokenHash: null, pairedAt: now, controllerSeenAt: now,
          controllerInfo: context.info, controllerUserId: context.user?.id ?? null, controllerName: context.user?.name ?? null }).where(eq(sessions.id, row.id)).returning();
        return snapshot(paired, now);
      }
      const role = request.action === 'command' ? 'controller' : request.role;
      if (!matches(context.token, role === 'host' ? row.hostTokenHash : row.controllerTokenHash)) throw new RemoteError(401, 'La conexión ya no es válida. Escanea un QR nuevo.');
      if (request.action === 'disconnect') {
        await tx.update(sessions).set({ revokedAt: now, expiresAt: now, hostTokenHash: null, inviteTokenHash: null, controllerTokenHash: null }).where(eq(sessions.id, row.id));
        return snapshot({ ...row, expiresAt: now }, now);
      }
      const changes: Partial<typeof sessions.$inferInsert> = {};
      if (role === 'host' && now - row.hostSeenAt > 4000) changes.hostSeenAt = now;
      if (role === 'controller' && now - (row.controllerSeenAt ?? 0) > 4000) changes.controllerSeenAt = now;
      if (request.action === 'command') {
        if (now - row.hostSeenAt >= TV_OFFLINE_MS) throw new RemoteError(409, 'La televisión está en pausa. Deja su pestaña abierta para continuar.');
        if (now - row.lastCommandAt < 160) throw new RemoteError(429, 'Un momento: la señal anterior está saliendo.');
        const current = tvChannelIds.indexOf(row.channel);
        changes.channel = request.command === 'next' ? tvChannelIds[(current + 1) % tvChannelIds.length]
          : request.command === 'previous' ? tvChannelIds[(current - 1 + tvChannelIds.length) % tvChannelIds.length]
          : request.command === 'channel' ? request.channel : row.channel;
        changes.expanded = request.command === 'expand' ? !row.expanded : request.command.startsWith('visit-') || request.command.startsWith('scroll-') ? false : row.expanded;
        changes.commandVersion = row.commandVersion + 1; changes.lastAction = request.command;
        changes.lastCommandAt = now; changes.commandCount = row.commandCount + 1;
      } else if (role === 'host' && request.appliedVersion !== undefined && request.appliedVersion <= row.commandVersion && request.appliedVersion >= row.appliedVersion) {
        changes.appliedVersion = request.appliedVersion;
        if (request.channel !== undefined) changes.displayedChannel = request.channel;
        if (request.expanded !== undefined) changes.displayedExpanded = request.expanded;
        if (request.appliedVersion === row.commandVersion) {
          if (request.channel !== undefined) changes.channel = request.channel;
          if (request.expanded !== undefined) changes.expanded = request.expanded;
        }
      }
      if (!Object.keys(changes).length) return snapshot(row, now);
      const [updated] = await tx.update(sessions).set(changes).where(eq(sessions.id, row.id)).returning();
      return snapshot(updated, now);
    });
  };
}
