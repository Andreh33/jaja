import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema } from '@/lib/db';
import { and, eq } from 'drizzle-orm';
import { getCommercialId } from '@/lib/curso-auth';

const bodySchema = z.object({
  moduleId: z.string().min(1),
  watchedSeconds: z.number().int().min(0).max(60 * 60 * 12),
  completed: z.boolean().optional(),
});

// Umbral de completado: se considera visto al 90% (margen sobre el 95% del cliente).
const COMPLETE_RATIO = 0.9;

export async function POST(req: Request) {
  try {
    const commercialId = await getCommercialId();
    if (!commercialId) {
      return NextResponse.json({ error: 'No identificado.' }, { status: 401 });
    }
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 });
    }
    const { moduleId } = parsed.data;

    const mod = await db
      .select({ duration: schema.courseModules.durationSeconds })
      .from(schema.courseModules)
      .where(eq(schema.courseModules.id, moduleId))
      .limit(1);
    if (mod.length === 0) {
      return NextResponse.json({ error: 'Módulo inexistente.' }, { status: 404 });
    }
    const duration = mod[0].duration ?? 0;

    const prev = await db
      .select()
      .from(schema.courseProgress)
      .where(
        and(
          eq(schema.courseProgress.commercialId, commercialId),
          eq(schema.courseProgress.moduleId, moduleId),
        ),
      )
      .limit(1);

    const prevWatched = prev[0]?.watchedSeconds ?? 0;
    // Monotónico y acotado a la duración real.
    const watchedSeconds = Math.min(
      Math.max(prevWatched, parsed.data.watchedSeconds),
      duration || parsed.data.watchedSeconds,
    );
    // El servidor decide `completed`: ya completado, o se alcanzó el umbral real.
    const completed =
      !!prev[0]?.completed ||
      (duration > 0 && watchedSeconds >= Math.floor(duration * COMPLETE_RATIO));

    await db
      .insert(schema.courseProgress)
      .values({ commercialId, moduleId, watchedSeconds, completed, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: [schema.courseProgress.commercialId, schema.courseProgress.moduleId],
        set: { watchedSeconds, completed, updatedAt: new Date() },
      });

    return NextResponse.json({ ok: true, watchedSeconds, completed });
  } catch (err) {
    console.error('[cursos/progress] error', err);
    return NextResponse.json({ error: 'Error en el servidor.' }, { status: 500 });
  }
}
