import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { contactMessages } from '../../../../drizzle/schema';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(10),
});

export async function POST(req: Request) {
  try {
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
