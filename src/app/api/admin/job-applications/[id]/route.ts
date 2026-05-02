/**
 * PATCH /api/admin/job-applications/[id]
 *
 * Actualiza status y/o notas internas de una candidatura. Solo ADMIN.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { jobApplications } from '../../../../../../drizzle/schema';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

const patchSchema = z.object({
  status: z.enum(['pendiente', 'contactado', 'descartado', 'contratado']).optional(),
  adminNotes: z.string().max(5000).nullable().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;

  let parsed: z.infer<typeof patchSchema>;
  try {
    const raw = await req.json();
    const r = patchSchema.safeParse(raw);
    if (!r.success) {
      return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 });
    }
    parsed = r.data;
  } catch {
    return NextResponse.json({ error: 'Body inválido.' }, { status: 400 });
  }

  const setObj: Record<string, unknown> = {};
  if (parsed.status !== undefined) setObj.status = parsed.status;
  if (parsed.adminNotes !== undefined) {
    setObj.adminNotes = parsed.adminNotes && parsed.adminNotes.trim() ? parsed.adminNotes.trim() : null;
  }

  if (Object.keys(setObj).length === 0) {
    return NextResponse.json({ error: 'No hay nada que actualizar.' }, { status: 400 });
  }

  try {
    const updated = await db
      .update(jobApplications)
      .set(setObj)
      .where(eq(jobApplications.id, id))
      .returning({ id: jobApplications.id });
    if (updated.length === 0) {
      return NextResponse.json({ error: 'Candidatura no encontrada.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[admin-job-applications] patch failed id=${id} err="${(err as Error).message}"`);
    return NextResponse.json({ error: 'No hemos podido guardar.' }, { status: 500 });
  }
}
