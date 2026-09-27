import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { and, count, eq, gt, lt } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { tvArcadeSessions as sessions, type ArcadeSeat, type TvDeviceInfo } from '../../drizzle/schema';
import { arcadeMove, arcadeView, ArcadeRuleError, newArcadeGame, type Player } from './arcade-engine';
import { ARCADE_INVITE_MS, ARCADE_OFFLINE_MS, ARCADE_SESSION_MS, arcadeRequestSchema, type ArcadeMode, type ArcadeRequest, type ArcadeRole, type ArcadeState } from './arcade-protocol';
import { hashRemoteToken, RemoteError } from './tv-remote-service';
import { cleanupArcade } from './arcade-retention';
type Row = typeof sessions.$inferSelect;
type Context = { token?: string; ipHash: string; info: TvDeviceInfo; user?: { id: string; name: string } };
const secret = () => randomBytes(32).toString('hex');
const matches = (token: string | undefined, hash: string | null) => !!token && !!hash && /^[a-f0-9]{64}$/.test(token) && timingSafeEqual(Buffer.from(hashRemoteToken(token)), Buffer.from(hash));
function view(row: Row, role: ArcadeRole, now: number): ArcadeState {
  const player = role === 'host' ? null : role === 'p0' ? 0 : 1;
  return { id: row.id, expiresAt: row.expiresAt, inviteExpiresAt: row.inviteExpiresAt, mode: row.mode as ArcadeMode, version: row.version, hostOnline: now - row.hostSeenAt < ARCADE_OFFLINE_MS,
    game: row.game ? arcadeView(row.game, player) : null,
    players: row.seats.map(seat => ({ connected: !!seat.joinedAt, online: !!seat.joinedAt && now - seat.seenAt < ARCADE_OFFLINE_MS })) as ArcadeState['players'],
    signals: row.seats.map((seat, index) => role === 'host' ? { answer: seat.answer, signalId: seat.signalId } : player === index ? { offer: seat.offer, signalId: seat.signalId } : { signalId: null }) as ArcadeState['signals'] };
}
export function createArcadeService<TSchema extends Record<string, unknown>>(database: LibSQLDatabase<TSchema>, clock = Date.now) {
  return async (input: ArcadeRequest, context: Context) => {
    const parsed = arcadeRequestSchema.safeParse(input); if (!parsed.success) throw new RemoteError(400, 'Orden no válida.');
    const request = parsed.data; const now = clock();
    if (request.action === 'create') await cleanupArcade(database, now);
    return database.transaction(async tx => {
      if (request.action === 'create') {
        await tx.delete(sessions).where(lt(sessions.createdAt, now - 30 * 86400000));
        const recent = await tx.select({ createdAt: sessions.createdAt }).from(sessions).where(and(eq(sessions.creatorIpHash, context.ipHash), gt(sessions.createdAt, now - 86400000)));
        if (recent.length >= 20 || recent.filter(row => row.createdAt > now - 600000).length >= 6) throw new RemoteError(429, 'Has abierto varias salas. Espera unos minutos.');
        const [active] = await tx.select({ value: count() }).from(sessions).where(gt(sessions.expiresAt, now));
        if (active.value >= 100) throw new RemoteError(503, 'El arcade está completo. Prueba en unos minutos.');
        const token = secret(); const invites: [string, string] = [secret(), secret()];
        const seats = invites.map(invite => ({ tokenHash: null, inviteHash: hashRemoteToken(invite), joinedAt: null, seenAt: 0, info: null, name: null, userId: null, offer: null, answer: null, signalId: null })) as [ArcadeSeat, ArcadeSeat];
        const [row] = await tx.insert(sessions).values({ id: randomUUID(), hostTokenHash: hashRemoteToken(token), creatorIpHash: context.ipHash, createdAt: now, expiresAt: now + ARCADE_SESSION_MS,
          inviteExpiresAt: now + ARCADE_INVITE_MS, hostSeenAt: now, seats, hostInfo: context.info }).returning();
        return { ...view(row, 'host', now), token, invites };
      }
      const [row] = await tx.select().from(sessions).where(eq(sessions.id, request.id)).limit(1);
      if (!row || row.revokedAt || now >= row.expiresAt) throw new RemoteError(410, 'Esta sala ha terminado. Abre una nueva en la televisión.');
      const seats = structuredClone(row.seats);
      if (request.action === 'join') {
        const seat = seats[request.slot];
        if (seat.tokenHash) { if (matches(request.controller, seat.tokenHash)) return view(row, request.slot === 0 ? 'p0' : 'p1', now); throw new RemoteError(409, 'Este mando ya está conectado.'); }
        if (now >= row.inviteExpiresAt) throw new RemoteError(410, 'El QR ha caducado. Abre otra sala.');
        if (!matches(request.invite, seat.inviteHash)) throw new RemoteError(401, 'QR no válido.');
        if (now - row.hostSeenAt >= ARCADE_OFFLINE_MS) throw new RemoteError(409, 'Vuelve a abrir la televisión para conectar.');
        Object.assign(seat, { tokenHash: hashRemoteToken(request.controller), inviteHash: null, joinedAt: now, seenAt: now, info: context.info, userId: context.user?.id ?? null, name: context.user?.name ?? null });
        const [updated] = await tx.update(sessions).set({ seats }).where(eq(sessions.id, row.id)).returning();
        return view(updated, request.slot === 0 ? 'p0' : 'p1', now);
      }
      const role = request.role; const player: Player = role === 'p1' ? 1 : 0;
      if (!matches(context.token, role === 'host' ? row.hostTokenHash : seats[player].tokenHash)) throw new RemoteError(401, 'Mando no autorizado.');
      const changes: Partial<typeof sessions.$inferInsert> = {};
      if (role === 'host') { if (now - row.hostSeenAt > 4000) changes.hostSeenAt = now; }
      else if (now - seats[player].seenAt > 4000) { seats[player].seenAt = now; changes.seats = seats; }
      if (request.action === 'close') {
        if (role !== 'host') throw new RemoteError(403, 'Solo la televisión puede cerrar la sala.');
        for (const seat of seats) Object.assign(seat, { tokenHash: null, inviteHash: null, offer: null, answer: null, signalId: null });
        Object.assign(changes, { expiresAt: now, revokedAt: now, hostTokenHash: null, seats, game: null });
      }
      if (request.action === 'select' || request.action === 'move') {
        if (request.version !== row.version) throw new RemoteError(409, 'La partida ha cambiado. Espera a que llegue la nueva jugada.');
        if (request.action === 'select') { changes.mode = request.mode; changes.game = request.mode === 'lobby' || request.mode === 'platform' ? null : newArcadeGame(request.mode); }
        else {
          if (now - row.hostSeenAt >= ARCADE_OFFLINE_MS) throw new RemoteError(409, 'La televisión está en pausa.');
          if (!row.game || !seats.every(seat => seat.joinedAt)) throw new RemoteError(409, 'Conecta los dos mandos antes de jugar.');
          try { changes.game = arcadeMove(row.game, player, request.cell); } catch (error) { if (error instanceof ArcadeRuleError) throw new RemoteError(409, error.message); throw error; }
        }
        changes.version = row.version + 1;
      }
      if (request.action === 'reconnect') { Object.assign(seats[player], { offer: null, answer: null, signalId: null }); changes.seats = seats; }
      if (request.action === 'signal') {
        if (role !== 'host' && request.slot !== player) throw new RemoteError(403, 'Ese mando pertenece a otro jugador.');
        if (!seats[request.slot].joinedAt) throw new RemoteError(409, 'Conecta ese mando primero.');
        if (!request.sdp.startsWith('v=0') || !request.sdp.includes('m=application') || /m=(audio|video)/.test(request.sdp)) throw new RemoteError(400, 'Señal no válida.');
        if (role === 'host') Object.assign(seats[request.slot], { offer: request.sdp, answer: null, signalId: request.signalId });
        else { if (seats[player].signalId !== request.signalId) throw new RemoteError(409, 'La conexión se está renovando.'); seats[player].answer = request.sdp; }
        changes.seats = seats;
      }
      if (!Object.keys(changes).length) return view(row, role, now);
      const [updated] = await tx.update(sessions).set(changes).where(eq(sessions.id, row.id)).returning();
      return view(updated, role, now);
    });
  };
}
