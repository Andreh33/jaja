import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users, passwordResets } from '../../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const schema = z.object({ token: z.string().min(10).max(128), password: z.string().min(6).max(200) });

export async function POST(req: Request) {
  try {
    const rl = rateLimit(`reset:${getClientIp(req)}`, { max: 10, windowMs: 60_000 });
    if (!rl.allowed) return NextResponse.json({ error: 'Demasiados intentos, espera un momento' }, { status: 429 });
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    const { token, password } = parsed.data;
    const found = await db.select().from(passwordResets).where(eq(passwordResets.token, token)).limit(1);
    if (found.length === 0) return NextResponse.json({ error: 'Token no encontrado' }, { status: 400 });
    const reset = found[0];
    if (!reset.expiresAt || new Date(reset.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Token expirado' }, { status: 400 });
    }
    const hashed = await bcrypt.hash(password, 10);
    await db.update(users).set({ password: hashed, updatedAt: new Date() }).where(eq(users.id, reset.userId));
    await db.delete(passwordResets).where(eq(passwordResets.id, reset.id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
