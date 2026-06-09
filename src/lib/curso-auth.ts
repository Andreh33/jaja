/**
 * Identificación del comercial para la plataforma de formación.
 * NO usa NextAuth: cookie httpOnly firmada (HMAC) con el commercialId.
 *
 * La cookie vale `${id}.${hmac}` — el HMAC con AUTH_SECRET evita que alguien
 * falsifique la identidad de otro comercial editando la cookie. Esa identidad
 * se reutiliza también en el examen (B6).
 */

import { cookies } from 'next/headers';
import crypto from 'node:crypto';

export const CURSO_COOKIE = 'curso_cid';
const MAX_AGE = 60 * 60 * 24 * 365; // 1 año
const SECRET =
  process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'latech-curso-dev-secret';

/** Solo dígitos. "+34 600 11 22 33" -> "34600112233". Clave estable del comercial. */
export function normalizePhone(raw: string): string {
  return (raw || '').replace(/\D/g, '');
}

function hmac(id: string): string {
  return crypto.createHmac('sha256', SECRET).update(id).digest('base64url');
}

/** Token firmado para la cookie. */
export function signCommercialToken(id: string): string {
  return `${id}.${hmac(id)}`;
}

/** Verifica el token y devuelve el commercialId, o null si es inválido. */
export function verifyCommercialToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const i = token.lastIndexOf('.');
  if (i <= 0) return null;
  const id = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = hmac(id);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;
  return id;
}

/** Opciones de cookie httpOnly (set/clear). */
export function cursoCookieOptions(maxAge = MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

/** Lee y verifica el commercialId desde la cookie (Server Components / Route Handlers). */
export async function getCommercialId(): Promise<string | null> {
  const store = await cookies();
  return verifyCommercialToken(store.get(CURSO_COOKIE)?.value);
}
