/**
 * POST /api/admin/clientes/[id]/phone-agent-provisioned
 *
 * Marca el agente IA por teléfono como aprovisionado para el usuario {id}.
 * Solo admin. Sin body. Idempotente (UPDATE puro).
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { setPhoneAgentProvisioned } from '@/lib/admin-data';

export const runtime = 'nodejs';

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });

  try {
    await setPhoneAgentProvisioned(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[admin-phone-agent] failed user_id=${id} err="${(err as Error).message}"`);
    return NextResponse.json({ error: 'update_failed' }, { status: 500 });
  }
}
