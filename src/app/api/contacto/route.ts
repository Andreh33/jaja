import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contactMessages } from '../../../../drizzle/schema';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { submitContact } from '@/lib/contact-validation';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const rl = rateLimit(`contacto:${getClientIp(req)}`, { max: 6, windowMs: 60_000 });
    if (!rl.allowed) return NextResponse.json({ error: 'Demasiados envíos, espera un momento' }, { status: 429 });
    const body: unknown = await req.json().catch(() => null);
    const result = await submitContact(body, async (message) => {
      await db.insert(contactMessages).values(message);
    });
    if (!result.ok) return NextResponse.json({ error: 'Revisa los campos indicados.', fields: result.fields }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    console.error('[contacto] No se pudo guardar el mensaje');
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
