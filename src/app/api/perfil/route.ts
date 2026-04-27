import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const body = await req.json();
  const update: { name?: string; phone?: string; updatedAt: Date } = { updatedAt: new Date() };
  if (typeof body.name === 'string') update.name = body.name;
  if (typeof body.phone === 'string') update.phone = body.phone;
  await db.update(users).set(update).where(eq(users.id, session.user.id));
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const body = await req.json();
  if (!body.currentPassword || !body.newPassword || body.newPassword.length < 6) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
  const found = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
  if (found.length === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  const ok = await bcrypt.compare(body.currentPassword, found[0].password);
  if (!ok) return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 400 });
  const hashed = await bcrypt.hash(body.newPassword, 10);
  await db.update(users).set({ password: hashed, updatedAt: new Date() }).where(eq(users.id, session.user.id));
  return NextResponse.json({ ok: true });
}
