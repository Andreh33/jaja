import { lt, sql } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { tvArcadeSessions as sessions } from '../../drizzle/schema';
export async function cleanupArcade<TSchema extends Record<string, unknown>>(database: LibSQLDatabase<TSchema>, now = Date.now()) {
  await database.delete(sessions).where(lt(sessions.createdAt, now - 30 * 86400000));
  await database.update(sessions).set({ hostTokenHash: null, game: null, seats: sql`json_set(${sessions.seats}, '$[0].tokenHash', NULL, '$[0].inviteHash', NULL, '$[0].offer', NULL, '$[0].answer', NULL, '$[0].signalId', NULL, '$[1].tokenHash', NULL, '$[1].inviteHash', NULL, '$[1].offer', NULL, '$[1].answer', NULL, '$[1].signalId', NULL)` }).where(lt(sessions.expiresAt, now));
  await database.update(sessions).set({ creatorIpHash: null }).where(lt(sessions.createdAt, now - 86400000));
}
