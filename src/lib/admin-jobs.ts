/**
 * Helpers BBDD para la sección admin del portal de empleo.
 *
 * - Lecturas para los server components del listado y detalle.
 * - Mutaciones aisladas para los endpoints API (POST/PATCH/DELETE).
 *
 * Auth: estos helpers asumen que el caller verificó role=ADMIN antes
 * de invocarlos. NO incluyen check de auth.
 */

import { eq, sql, desc } from 'drizzle-orm';
import { db } from './db';
import { jobOffers, jobApplications } from '../../drizzle/schema';
import type { JobOffer, JobApplication } from '../../drizzle/schema';

export type ApplicationStatus = 'pendiente' | 'contactado' | 'descartado' | 'contratado';
export type OfferStatus = 'borrador' | 'publicada' | 'cerrada';

export async function listOffersWithCounts(): Promise<
  Array<JobOffer & { applicationsCount: number }>
> {
  const offers = await db.select().from(jobOffers).orderBy(desc(jobOffers.createdAt));
  // Una sola query con GROUP BY para counts (evita N+1).
  const counts = await db
    .select({
      jobOfferId: jobApplications.jobOfferId,
      c: sql<number>`count(*)`,
    })
    .from(jobApplications)
    .groupBy(jobApplications.jobOfferId);
  const byId = new Map<string, number>();
  for (const r of counts) {
    if (r.jobOfferId) byId.set(r.jobOfferId, Number(r.c));
  }
  return offers.map((o) => ({ ...o, applicationsCount: byId.get(o.id) ?? 0 }));
}

export async function getOfferById(id: string): Promise<JobOffer | null> {
  const rows = await db.select().from(jobOffers).where(eq(jobOffers.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function offerSlugExists(slug: string, exceptId?: string): Promise<boolean> {
  const rows = await db
    .select({ id: jobOffers.id })
    .from(jobOffers)
    .where(eq(jobOffers.slug, slug))
    .limit(1);
  if (rows.length === 0) return false;
  if (exceptId && rows[0].id === exceptId) return false;
  return true;
}

export async function listApplicationsWithOffer(filters?: {
  status?: ApplicationStatus;
  jobOfferId?: string | 'spontaneous';
}): Promise<Array<JobApplication & { offerTitle: string | null }>> {
  // Read all then filter in memory (we expect few hundreds at most).
  const apps = await db.select().from(jobApplications).orderBy(desc(jobApplications.createdAt));
  const offerIdsToFetch = new Set<string>();
  for (const a of apps) if (a.jobOfferId) offerIdsToFetch.add(a.jobOfferId);

  const offers =
    offerIdsToFetch.size > 0
      ? await db.select().from(jobOffers)
      : [];
  const titleById = new Map<string, string>();
  for (const o of offers) titleById.set(o.id, o.title);

  let result: Array<JobApplication & { offerTitle: string | null }> = apps.map((a) => ({
    ...a,
    offerTitle: a.jobOfferId
      ? titleById.get(a.jobOfferId) ?? a.offerTitleSnapshot
      : a.offerTitleSnapshot, // espontánea o oferta borrada → snapshot
  }));

  if (filters?.status) {
    result = result.filter((a) => a.status === filters.status);
  }
  if (filters?.jobOfferId === 'spontaneous') {
    result = result.filter((a) => a.jobOfferId === null);
  } else if (filters?.jobOfferId) {
    result = result.filter((a) => a.jobOfferId === filters.jobOfferId);
  }

  return result;
}

export async function getApplicationById(id: string): Promise<JobApplication | null> {
  const rows = await db.select().from(jobApplications).where(eq(jobApplications.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getJobMetrics(): Promise<{
  activeOffers: number;
  pendingApplications: number;
  applicationsLast30d: number;
}> {
  const offersAll = await db.select().from(jobOffers);
  const apps = await db.select().from(jobApplications);
  const now = Math.floor(Date.now() / 1000);
  const cutoff = now - 30 * 24 * 60 * 60;
  return {
    activeOffers: offersAll.filter((o) => o.status === 'publicada').length,
    pendingApplications: apps.filter((a) => a.status === 'pendiente').length,
    applicationsLast30d: apps.filter((a) => {
      const ts = typeof a.createdAt === 'number' ? a.createdAt : Math.floor((a.createdAt as Date).getTime() / 1000);
      return ts >= cutoff;
    }).length,
  };
}
