/**
 * POST /api/empleo/candidatura
 *
 * Endpoint público (sin auth) para registrar una candidatura.
 *
 * Flujo:
 *   1. Rate limit: 3 candidaturas/hora por IP.
 *   2. zod parse del body.
 *   3. Si jobOfferId presente: verificar que la oferta existe y
 *      status='publicada'. Si no: 400. Capturar snapshots.
 *   4. Si jobOfferId null: candidatura espontánea (snapshots null).
 *   5. INSERT en job_applications con gdpr_consent_at = ahora.
 *
 * No envía email automático al candidato (decisión confirmada).
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { jobOffers, jobApplications } from '../../../../../drizzle/schema';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const bodySchema = z.object({
  jobOfferId: z.string().uuid().nullable(),
  fullName: z.string().min(2).max(120).trim(),
  email: z.string().email().max(200).trim(),
  phone: z.string().regex(/^[+\d\s]{6,20}$/),
  city: z.string().min(2).max(120).trim(),
  message: z.string().max(1000).nullable().optional(),
  hasComputer: z.enum(['si', 'no']).nullable().optional(),
  cvBlobUrl: z.string().url().max(500),
  cvFilename: z.string().min(1).max(255),
  cvSizeBytes: z.number().int().min(1).max(11 * 1024 * 1024),
});

export async function POST(req: Request) {
  // 1. Rate limit.
  const ip = getClientIp(req);
  const rl = rateLimit(`application:${ip}`, { max: 3, windowMs: 60 * 60 * 1000 });
  if (!rl.allowed) {
    console.warn(`[candidatura] rate-limited ip=${ip}`);
    return NextResponse.json(
      { error: 'Demasiadas candidaturas. Inténtalo de nuevo en una hora.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetMs / 1000)) } },
    );
  }

  // 2. Parse + validate.
  let body: z.infer<typeof bodySchema>;
  try {
    const raw = await req.json();
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 });
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: 'Body inválido.' }, { status: 400 });
  }

  // 3. Si hay jobOfferId, verificar oferta.
  let offerSnapshot: {
    title: string | null;
    description: string | null;
    salary: string | null;
    slug: string | null;
  } = { title: null, description: null, salary: null, slug: null };

  if (body.jobOfferId) {
    const offerRows = await db
      .select()
      .from(jobOffers)
      .where(eq(jobOffers.id, body.jobOfferId))
      .limit(1);
    const offer = offerRows[0];
    if (!offer) {
      return NextResponse.json({ error: 'Oferta no encontrada.' }, { status: 400 });
    }
    if (offer.status !== 'publicada') {
      return NextResponse.json(
        { error: 'Esta oferta ya no acepta candidaturas.' },
        { status: 400 },
      );
    }
    offerSnapshot = {
      title: offer.title,
      description: offer.description,
      salary: offer.salary,
      slug: offer.slug,
    };
  }

  // 4. INSERT.
  try {
    const now = Math.floor(Date.now() / 1000);
    await db.insert(jobApplications).values({
      jobOfferId: body.jobOfferId,
      offerTitleSnapshot: offerSnapshot.title,
      offerDescriptionSnapshot: offerSnapshot.description,
      offerSalarySnapshot: offerSnapshot.salary,
      offerSlugSnapshot: offerSnapshot.slug,
      fullName: body.fullName,
      email: body.email.toLowerCase(),
      phone: body.phone,
      city: body.city,
      message: body.message ?? null,
      hasComputer: body.hasComputer ?? null,
      cvBlobUrl: body.cvBlobUrl,
      cvFilename: body.cvFilename,
      cvSizeBytes: body.cvSizeBytes,
      gdprConsentAt: now,
    });
    console.log(
      `[candidatura] result=ok ip=${ip} job_offer_id=${body.jobOfferId ?? 'spontaneous'} email=${body.email}`,
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[candidatura] failed ip=${ip} err="${(err as Error).message}"`);
    return NextResponse.json({ error: 'No hemos podido guardar tu candidatura.' }, { status: 500 });
  }
}
