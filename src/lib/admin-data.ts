/**
 * Acceso BBDD para datos admin-only sobre clientes.
 *
 * - `admin_client_data`: campos editables solo por admin (comercial,
 *   dominio, tareas pendientes). UNIQUE(user_id) → upsert directo.
 * - Acción de usuario: marcar agente IA como aprovisionado
 *   (`users.phone_agent_pending_provision = 0`).
 *
 * Nota: estos helpers asumen que el caller ya ha verificado que
 * `session.user.role === 'ADMIN'`. NO añaden checks de auth.
 */

import { eq, sql } from 'drizzle-orm';
import { db } from './db';
import { adminClientData, users } from '../../drizzle/schema';

export type AdminClientData = typeof adminClientData.$inferSelect;

export async function getAdminClientData(userId: string): Promise<AdminClientData | null> {
  const rows = await db
    .select()
    .from(adminClientData)
    .where(eq(adminClientData.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertAdminClientData(
  userId: string,
  patch: {
    comercialQueVendio?: string | null;
    dominioElegido?: string | null;
    tareasPendientes?: string | null;
  },
): Promise<AdminClientData> {
  // Normalizar strings vacíos a null para no almacenar "" en BBDD.
  const norm = (v: string | null | undefined): string | null => {
    if (v == null) return null;
    const t = v.trim();
    return t === '' ? null : t;
  };

  const values = {
    userId,
    comercialQueVendio: norm(patch.comercialQueVendio),
    dominioElegido: norm(patch.dominioElegido),
    tareasPendientes: norm(patch.tareasPendientes),
  };

  const inserted = await db
    .insert(adminClientData)
    .values(values)
    .onConflictDoUpdate({
      target: adminClientData.userId,
      set: {
        comercialQueVendio: values.comercialQueVendio,
        dominioElegido: values.dominioElegido,
        tareasPendientes: values.tareasPendientes,
        updatedAt: sql`(unixepoch())`,
      },
    })
    .returning();
  return inserted[0];
}

export async function setPhoneAgentProvisioned(userId: string): Promise<void> {
  await db
    .update(users)
    .set({ phoneAgentPendingProvision: false })
    .where(eq(users.id, userId));
}
