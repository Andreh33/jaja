import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users, passwordResets } from '../../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  try {
    const rl = rateLimit(`forgot:${getClientIp(req)}`, { max: 6, windowMs: 60_000 });
    if (!rl.allowed) return NextResponse.json({ error: 'Demasiados intentos, espera un momento' }, { status: 429 });
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    const { email } = parsed.data;
    const u = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (u.length === 0) {
      return NextResponse.json({ ok: true });
    }
    const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await db.insert(passwordResets).values({ userId: u[0].id, token, expiresAt });
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const link = `${baseUrl}/recuperar/${token}`;
    return NextResponse.json({ ok: true, devLink: link });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
