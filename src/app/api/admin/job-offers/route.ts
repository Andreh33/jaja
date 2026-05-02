/**
 * POST /api/admin/job-offers
 *
 * Crea una nueva oferta de empleo. Solo admin.
 *
 * - Slug auto-derivado del título si no viene en body, validado único.
 * - Si status='publicada', set published_at = ahora.
 * - Defensa: zod schema replica los enums permitidos (en BBDD ya no hay
 *   CHECK constraints — ver MIGRATION_NOTES.md).
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { jobOffers } from '../../../../../drizzle/schema';
import { auth } from '@/lib/auth';
import { offerSlugExists } from '@/lib/admin-jobs';
import { slugify } from '@/lib/slug';

export const runtime = 'nodejs';

const offerSchema = z.object({
  title: z.string().min(2).max(200).trim(),
  slug: z.string().max(80).optional().nullable(),
  description: z.string().min(10).max(20000).trim(),
  location: z.string().min(2).max(200).trim(),
  contractType: z.enum(['indefinido', 'temporal', 'practicas', 'freelance']).nullable().optional(),
  schedule: z.enum(['completa', 'parcial', 'flexible']).nullable().optional(),
  salary: z.string().max(200).nullable().optional(),
  experienceRequired: z.string().max(500).nullable().optional(),
  languages: z.string().max(200).nullable().optional(),
  extras: z.string().max(2000).nullable().optional(),
  requiresComputer: z.enum(['si', 'no', 'depende']),
  positionsCount: z.number().int().min(1).max(50),
  status: z.enum(['borrador', 'publicada', 'cerrada']),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let parsed: z.infer<typeof offerSchema>;
  try {
    const raw = await req.json();
    const r = offerSchema.safeParse(raw);
    if (!r.success) {
      return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 });
    }
    parsed = r.data;
  } catch {
    return NextResponse.json({ error: 'Body inválido.' }, { status: 400 });
  }

  // Slug: si viene, sanitizar; si no, derivar del título.
  const baseSlug = (parsed.slug?.trim() ? slugify(parsed.slug) : slugify(parsed.title));
  if (!baseSlug) {
    return NextResponse.json({ error: 'No hemos podido generar un slug válido.' }, { status: 400 });
  }
  if (await offerSlugExists(baseSlug)) {
    return NextResponse.json({ error: `El slug "${baseSlug}" ya existe.` }, { status: 400 });
  }

  const now = Math.floor(Date.now() / 1000);

  try {
    const inserted = await db
      .insert(jobOffers)
      .values({
        slug: baseSlug,
        title: parsed.title,
        description: parsed.description,
        location: parsed.location,
        contractType: parsed.contractType ?? null,
        schedule: parsed.schedule ?? null,
        salary: parsed.salary?.trim() || null,
        experienceRequired: parsed.experienceRequired?.trim() || null,
        languages: parsed.languages?.trim() || null,
        extras: parsed.extras?.trim() || null,
        requiresComputer: parsed.requiresComputer,
        positionsCount: parsed.positionsCount,
        status: parsed.status,
        publishedAt: parsed.status === 'publicada' ? now : null,
        closedAt: parsed.status === 'cerrada' ? now : null,
      })
      .returning({ id: jobOffers.id });
    return NextResponse.json({ ok: true, id: inserted[0].id });
  } catch (err) {
    console.error(`[admin-job-offers] create failed err="${(err as Error).message}"`);
    return NextResponse.json({ error: 'No hemos podido crear la oferta.' }, { status: 500 });
  }
}
