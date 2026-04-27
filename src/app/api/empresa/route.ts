import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { empresas } from '../../../../drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const r = await db.select().from(empresas).where(eq(empresas.userId, session.user.id)).limit(1);
  return NextResponse.json(r[0] || null);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const userId = session.user.id;
  const body = await req.json();

  const data = {
    nombre: body.nombre ?? null,
    cif: body.cif ?? null,
    sector: body.sector ?? null,
    telefono: body.telefono ?? null,
    email: body.email ?? null,
    direccion: body.direccion ?? null,
    ciudad: body.ciudad ?? null,
    cp: body.cp ?? null,
    horarios: body.horarios ?? null,
    redes: body.redes ?? null,
    descripcion: body.descripcion ?? null,
    serviciosContratados: body.serviciosContratados ?? null,
    notasInternas: body.notasInternas ?? null,
    updatedAt: new Date(),
  };

  const existing = await db.select().from(empresas).where(eq(empresas.userId, userId)).limit(1);
  if (existing.length === 0) {
    await db.insert(empresas).values({ userId, ...data });
  } else {
    await db.update(empresas).set(data).where(eq(empresas.userId, userId));
  }
  return NextResponse.json({ ok: true });
}
