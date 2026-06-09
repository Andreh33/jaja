import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema } from '@/lib/db';
import { eq, inArray } from 'drizzle-orm';
import { getCommercialId } from '@/lib/curso-auth';
import { getCourseState } from '@/lib/curso';
import { PASS_MARK } from '@/lib/curso-exam';

const bodySchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        chosenIndex: z.number().int().min(0).max(3),
      }),
    )
    .min(1)
    .max(100),
});

export async function POST(req: Request) {
  try {
    const commercialId = await getCommercialId();
    if (!commercialId) {
      return NextResponse.json({ error: 'No identificado.' }, { status: 401 });
    }

    // El examen solo es válido con los 6 módulos completados.
    const state = await getCourseState(commercialId);
    if (!state.examUnlocked) {
      return NextResponse.json({ error: 'Aún no has completado todos los módulos.' }, { status: 403 });
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Respuestas inválidas.' }, { status: 400 });
    }
    // Deduplicar por questionId (una respuesta por pregunta).
    const answerMap = new Map<string, number>();
    for (const a of parsed.data.answers) answerMap.set(a.questionId, a.chosenIndex);
    const questionIds = [...answerMap.keys()];

    // Fuente de verdad: las preguntas reales desde la BD.
    const questions = await db
      .select()
      .from(schema.courseQuestions)
      .where(inArray(schema.courseQuestions.id, questionIds));
    if (questions.length !== questionIds.length) {
      return NextResponse.json({ error: 'Examen inválido.' }, { status: 400 });
    }
    const qById = new Map(questions.map((q) => [q.id, q]));

    const commercial = (
      await db.select().from(schema.commercials).where(eq(schema.commercials.id, commercialId)).limit(1)
    )[0];

    const total = questionIds.length;
    let score = 0;
    const review = questionIds.map((qid) => {
      const q = qById.get(qid)!;
      const chosenIndex = answerMap.get(qid)!;
      const isCorrect = chosenIndex === q.correctIndex;
      if (isCorrect) score++;
      return {
        questionId: qid,
        moduleId: q.moduleId,
        prompt: q.prompt,
        options: q.options as string[],
        chosenIndex,
        correctIndex: q.correctIndex,
        isCorrect,
        explanation: q.explanation ?? '',
      };
    });
    const passed = score / total >= PASS_MARK;

    // Persistir intento + respuestas (alimenta el análisis por pregunta del admin).
    const now = new Date();
    const attempt = (
      await db
        .insert(schema.examAttempts)
        .values({
          commercialId,
          commercialName: commercial?.name ?? null,
          commercialPhone: commercial?.phone ?? null,
          startedAt: now,
          finishedAt: now,
          score,
          total,
          passed,
        })
        .returning({ id: schema.examAttempts.id })
    )[0];

    await db.insert(schema.examAnswers).values(
      review.map((r) => ({
        attemptId: attempt.id,
        questionId: r.questionId,
        chosenIndex: r.chosenIndex,
        isCorrect: r.isCorrect,
      })),
    );

    return NextResponse.json({
      ok: true,
      attemptId: attempt.id,
      score,
      total,
      passed,
      passMark: PASS_MARK,
      review,
    });
  } catch (err) {
    console.error('[cursos/examen] error', err);
    return NextResponse.json({ error: 'Error en el servidor.' }, { status: 500 });
  }
}
