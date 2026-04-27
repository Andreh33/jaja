import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { contactMessages } from '../../../../../drizzle/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id, read } = await req.json();
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 });
  await db.update(contactMessages).set({ read: !!read }).where(eq(contactMessages.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 });
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
  return NextResponse.json({ ok: true });
}
