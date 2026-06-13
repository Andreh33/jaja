import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users } from '../../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const rl = rateLimit(`signup:${getClientIp(req)}`, { max: 8, windowMs: 60_000 });
    if (!rl.allowed) return NextResponse.json({ error: 'Demasiados intentos, espera un momento' }, { status: 429 });
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    const { email, password, name, phone } = parsed.data;
    const lc = email.toLowerCase();
    const existing = await db.select().from(users).where(eq(users.email, lc)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Ese email ya está registrado' }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    await db.insert(users).values({
      email: lc,
      password: hashed,
      name,
      phone,
      role: 'CLIENT',
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
