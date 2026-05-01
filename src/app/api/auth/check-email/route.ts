import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users } from '../../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`check-email:${ip}`, { max: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    console.warn(`[rate-limit] check-email blocked ip=${ip} resetMs=${rl.resetMs}`);
    return NextResponse.json(
      { error: 'Demasiadas peticiones. Espera un momento.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetMs / 1000)) } },
    );
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }
    const email = parsed.data.email.toLowerCase().trim();
    const found = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    return NextResponse.json({ exists: found.length > 0 });
  } catch {
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
