/**
 * POST /api/admin/clientes/[id]/data
 *
 * UPSERT en `admin_client_data` para el usuario {id}. Solo admin.
 *
 * Body: { comercial?: string|null, dominio?: string|null, tareas?: string|null }
 *   - Strings vacíos/whitespace se normalizan a null en el helper.
 *   - null mantiene el campo limpio.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { upsertAdminClientData } from '@/lib/admin-data';

export const runtime = 'nodejs';

const bodySchema = z.object({
  comercial: z.string().max(200).nullable().optional(),
  dominio: z.string().max(200).nullable().optional(),
  tareas: z.string().max(5000).nullable().optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });

  let parsed: z.infer<typeof bodySchema>;
  try {
    const body = await req.json();
    const r = bodySchema.safeParse(body);
    if (!r.success) {
      return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
    }
    parsed = r.data;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  try {
    const data = await upsertAdminClientData(id, {
      comercialQueVendio: parsed.comercial ?? null,
      dominioElegido: parsed.dominio ?? null,
      tareasPendientes: parsed.tareas ?? null,
    });
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error(`[admin-data] upsert failed user_id=${id} err="${(err as Error).message}"`);
    return NextResponse.json({ error: 'save_failed' }, { status: 500 });
  }
}
