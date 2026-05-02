/**
 * PATCH  /api/admin/job-offers/[id] → editar oferta.
 * DELETE /api/admin/job-offers/[id] → borrar (o cerrar si tiene candidaturas).
 *
 * Reglas:
 *   - Solo ADMIN.
 *   - PATCH: si transición a 'publicada' por primera vez, set published_at.
 *     Si transición a 'cerrada', set closed_at.
 *   - DELETE: si la oferta tiene candidaturas asociadas, en lugar de borrar
 *     cambia status='cerrada' (preserva el historial). Devuelve { closed: true }.
 *     Si no tiene candidaturas, borra. Devuelve { deleted: true }.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { jobOffers, jobApplications } from '../../../../../../drizzle/schema';
import { auth } from '@/lib/auth';
import { getOfferById, offerSlugExists } from '@/lib/admin-jobs';
import { slugify } from '@/lib/slug';

export const runtime = 'nodejs';

const patchSchema = z.object({
  title: z.string().min(2).max(200).trim().optional(),
  slug: z.string().max(80).optional().nullable(),
  description: z.string().min(10).max(20000).trim().optional(),
  location: z.string().min(2).max(200).trim().optional(),
  contractType: z.enum(['indefinido', 'temporal', 'practicas', 'freelance']).nullable().optional(),
  schedule: z.enum(['completa', 'parcial', 'flexible']).nullable().optional(),
  salary: z.string().max(200).nullable().optional(),
  experienceRequired: z.string().max(500).nullable().optional(),
  languages: z.string().max(200).nullable().optional(),
  extras: z.string().max(2000).nullable().optional(),
  requiresComputer: z.enum(['si', 'no', 'depende']).optional(),
  positionsCount: z.number().int().min(1).max(50).optional(),
  status: z.enum(['borrador', 'publicada', 'cerrada']).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const existing = await getOfferById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Oferta no encontrada.' }, { status: 404 });
  }

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

  // Slug: si viene explícito, validar único (excluyendo este id).
  let nextSlug = existing.slug;
  if (parsed.slug !== undefined && parsed.slug !== null) {
    const candidate = slugify(parsed.slug);
    if (!candidate) {
      return NextResponse.json({ error: 'Slug inválido.' }, { status: 400 });
    }
    if (candidate !== existing.slug && (await offerSlugExists(candidate, id))) {
      return NextResponse.json({ error: `El slug "${candidate}" ya existe.` }, { status: 400 });
    }
    nextSlug = candidate;
  }

  const now = Math.floor(Date.now() / 1000);
  const setObj: Record<string, unknown> = {
    slug: nextSlug,
    updatedAt: sql`(unixepoch())`,
  };
  if (parsed.title !== undefined) setObj.title = parsed.title;
  if (parsed.description !== undefined) setObj.description = parsed.description;
  if (parsed.location !== undefined) setObj.location = parsed.location;
  if (parsed.contractType !== undefined) setObj.contractType = parsed.contractType ?? null;
  if (parsed.schedule !== undefined) setObj.schedule = parsed.schedule ?? null;
  if (parsed.salary !== undefined) setObj.salary = parsed.salary?.trim() || null;
  if (parsed.experienceRequired !== undefined) setObj.experienceRequired = parsed.experienceRequired?.trim() || null;
  if (parsed.languages !== undefined) setObj.languages = parsed.languages?.trim() || null;
  if (parsed.extras !== undefined) setObj.extras = parsed.extras?.trim() || null;
  if (parsed.requiresComputer !== undefined) setObj.requiresComputer = parsed.requiresComputer;
  if (parsed.positionsCount !== undefined) setObj.positionsCount = parsed.positionsCount;

  // Transiciones de status: gestionar published_at / closed_at.
  if (parsed.status !== undefined && parsed.status !== existing.status) {
    setObj.status = parsed.status;
    if (parsed.status === 'publicada' && !existing.publishedAt) {
      setObj.publishedAt = now;
    }
    if (parsed.status === 'cerrada') {
      setObj.closedAt = now;
    }
  }

  try {
    await db.update(jobOffers).set(setObj).where(eq(jobOffers.id, id));
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error(`[admin-job-offers] patch failed id=${id} err="${(err as Error).message}"`);
    return NextResponse.json({ error: 'No hemos podido guardar la oferta.' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const existing = await getOfferById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Oferta no encontrada.' }, { status: 404 });
  }

  // Si tiene candidaturas, en lugar de borrar (que las dejaría espontáneas
  // por el ON DELETE SET NULL), preferimos cerrar la plaza para preservar
  // el contexto. El admin puede luego borrar manualmente vía SQL si quiere.
  const apps = await db
    .select({ c: sql<number>`count(*)` })
    .from(jobApplications)
    .where(eq(jobApplications.jobOfferId, id));
  const appsCount = Number(apps[0]?.c ?? 0);

  if (appsCount > 0) {
    const now = Math.floor(Date.now() / 1000);
    await db
      .update(jobOffers)
      .set({ status: 'cerrada', closedAt: now, updatedAt: sql`(unixepoch())` })
      .where(eq(jobOffers.id, id));
    return NextResponse.json({ ok: true, closed: true, applicationsCount: appsCount });
  }

  try {
    await db.delete(jobOffers).where(eq(jobOffers.id, id));
    return NextResponse.json({ ok: true, deleted: true });
  } catch (err) {
    console.error(`[admin-job-offers] delete failed id=${id} err="${(err as Error).message}"`);
    return NextResponse.json({ error: 'No hemos podido borrar la oferta.' }, { status: 500 });
  }
}
