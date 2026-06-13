import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { contactMessages } from '../../../../drizzle/schema';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  service: z.string().max(80).optional(),
  message: z.string().min(10).max(4000),
});

export async function POST(req: Request) {
  try {
    const rl = rateLimit(`contacto:${getClientIp(req)}`, { max: 6, windowMs: 60_000 });
    if (!rl.allowed) return NextResponse.json({ error: 'Demasiados envíos, espera un momento' }, { status: 429 });
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    await db.insert(contactMessages).values(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
