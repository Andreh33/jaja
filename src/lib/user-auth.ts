import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { users } from '../../drizzle/schema';

export type ResolveUserContact = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

export type ResolveUserResult =
  | { ok: true; userId: string; userName: string; phone: string }
  | { ok: false; status: 401 | 500; error: string };

export const GENERIC_AUTH_ERROR =
  'No hemos podido verificar tu cuenta. Revisa tus credenciales o intenta recuperar la contraseña.';

/**
 * Resuelve un usuario a partir de los datos de contacto del wizard:
 *   - Si el email existe → bcrypt.compare. Si OK, devuelve userId.
 *     Si la contraseña no matchea, devuelve error 401 genérico.
 *   - Si no existe → crea el usuario con bcrypt.hash(password, 10).
 *
 * Usa `email.toLowerCase().trim()` internamente.
 *
 * NO mutar campos extras del usuario existente (name/phone) para evitar
 * sobreescribir datos que el cliente ya configuró en su perfil.
 */
export async function resolveOrCreateUser(contact: ResolveUserContact): Promise<ResolveUserResult> {
  const email = contact.email.toLowerCase().trim();
  try {
    const existing = await db
      .select({ id: users.id, password: users.password, name: users.name, phone: users.phone })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      const u = existing[0];
      const ok = await bcrypt.compare(contact.password, u.password);
      if (!ok) {
        return { ok: false, status: 401, error: GENERIC_AUTH_ERROR };
      }
      return {
        ok: true,
        userId: u.id,
        userName: u.name ?? contact.name,
        phone: u.phone ?? contact.phone,
      };
    }

    const hashed = await bcrypt.hash(contact.password, 10);
    const [created] = await db
      .insert(users)
      .values({
        email,
        password: hashed,
        name: contact.name,
        phone: contact.phone,
        role: 'CLIENT',
      })
      .returning({ id: users.id, name: users.name, phone: users.phone });

    return {
      ok: true,
      userId: created.id,
      userName: created.name ?? contact.name,
      phone: created.phone ?? contact.phone,
    };
  } catch (err) {
    console.error('[user-auth] resolveOrCreateUser failed:', err);
    return { ok: false, status: 500, error: 'No hemos podido procesar tu cuenta. Inténtalo de nuevo.' };
  }
}

/**
 * Recupera datos básicos de un usuario por id para usar en el flujo de checkout
 * cuando el caller ya viene autenticado (cookie de sesión NextAuth).
 */
export async function getUserById(userId: string): Promise<{
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
} | null> {
  const rows = await db
    .select({ id: users.id, email: users.email, name: users.name, phone: users.phone })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return rows[0] ?? null;
}
