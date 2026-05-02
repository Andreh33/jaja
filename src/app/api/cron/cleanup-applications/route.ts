/**
 * GET /api/cron/cleanup-applications
 *
 * Cron diario de retención GDPR. Borra candidaturas con
 * `status != 'contratado'` y más de 30 días de antigüedad,
 * incluyendo su CV en Vercel Blob.
 *
 * Auth: header `Authorization: Bearer ${CRON_SECRET}`. La var de
 * entorno CRON_SECRET debe estar definida en Vercel Production.
 *
 * Schedule en vercel.json: "0 3 * * *" (03:00 UTC daily).
 */

import { NextResponse } from 'next/server';
import { eq, and, lt, ne } from 'drizzle-orm';
import { del as blobDel } from '@vercel/blob';
import { db } from '@/lib/db';
import { jobApplications } from '../../../../../drizzle/schema';
import { runCleanup } from '@/lib/jobs-cleanup';

export const runtime = 'nodejs';
// Cron jobs no tienen TTL fijo de Function; mantenemos default para 5 min máx.
export const maxDuration = 300;

export async function GET(req: Request) {
  // 1. Auth via bearer token.
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    console.error('[cron-cleanup] CRON_SECRET not configured in env. Aborting.');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }
  const authHeader = req.headers.get('authorization') ?? '';
  const ok = authHeader === `Bearer ${expected}`;
  if (!ok) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // 2. Run cleanup with real deps.
  const result = await runCleanup({
    selectExpired: async (cutoff) => {
      // jobApplications.createdAt está declarada como `timestamp` mode en
      // Drizzle (almacena unix segundos en SQLite, expone Date en TS).
      // Convertimos cutoff (segundos) a Date para que el comparador case.
      const cutoffDate = new Date(cutoff * 1000);
      const rows = await db
        .select({ id: jobApplications.id, cvBlobUrl: jobApplications.cvBlobUrl })
        .from(jobApplications)
        .where(
          and(
            ne(jobApplications.status, 'contratado'),
            lt(jobApplications.createdAt, cutoffDate),
          ),
        );
      return rows.map((r) => ({ id: r.id, cvBlobUrl: r.cvBlobUrl }));
    },
    deleteApplication: async (id) => {
      await db.delete(jobApplications).where(eq(jobApplications.id, id));
    },
    deleteBlob: async (url) => {
      // Llamamos al `del` raw de @vercel/blob (no al helper deleteCv, que
      // traga errores). Aquí dejamos que las excepciones suban para que
      // runCleanup las cuente como failedCvDeletes.
      await blobDel(url);
    },
  });

  const processedAt = new Date().toISOString();
  console.log(
    `[cron-cleanup] result=ok processedAt=${processedAt} deletedApplications=${result.deletedApplications} deletedCvs=${result.deletedCvs} failedCvDeletes=${result.failedCvDeletes}`,
  );

  return NextResponse.json({ ok: true, ...result, processedAt });
}
