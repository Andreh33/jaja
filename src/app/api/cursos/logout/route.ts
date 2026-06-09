import { NextResponse } from 'next/server';
import { CURSO_COOKIE, cursoCookieOptions } from '@/lib/curso-auth';

/** Cierra la sesión del comercial (borra la cookie). Útil en dispositivos compartidos. */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CURSO_COOKIE, '', cursoCookieOptions(0));
  return res;
}
