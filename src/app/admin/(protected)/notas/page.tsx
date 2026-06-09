import { db, schema } from '@/lib/db';
import { sql, desc, asc } from 'drizzle-orm';
import NotasClient from './NotasClient';

export const dynamic = 'force-dynamic';

export type AttemptRow = {
  id: string;
  name: string | null;
  phone: string | null;
  finishedAt: number | null; // epoch ms
  score: number | null;
  total: number | null;
  passed: boolean;
};

export type QuestionStat = {
  id: string;
  order: number;
  prompt: string;
  answered: number;
  correct: number;
  correctRate: number | null; // 0..100, null si sin datos
};

export type ModuleAnalysis = {
  moduleId: string;
  order: number;
  title: string;
  questions: QuestionStat[];
};

export default async function AdminNotasPage() {
  const attemptsRaw = await db
    .select()
    .from(schema.examAttempts)
    .orderBy(desc(schema.examAttempts.finishedAt));

  const attempts: AttemptRow[] = attemptsRaw.map((a) => ({
    id: a.id,
    name: a.commercialName,
    phone: a.commercialPhone,
    finishedAt: a.finishedAt ? new Date(a.finishedAt).getTime() : null,
    score: a.score,
    total: a.total,
    passed: !!a.passed,
  }));

  // Agregado por pregunta: cuántas veces se respondió y cuántas correctas.
  const statRows = await db
    .select({
      questionId: schema.examAnswers.questionId,
      total: sql<number>`count(*)`,
      correct: sql<number>`coalesce(sum(${schema.examAnswers.isCorrect}), 0)`,
    })
    .from(schema.examAnswers)
    .groupBy(schema.examAnswers.questionId);
  const statMap = new Map(statRows.map((r) => [r.questionId, { total: Number(r.total), correct: Number(r.correct) }]));

  const modules = await db.select().from(schema.courseModules).orderBy(asc(schema.courseModules.order));
  const questions = await db.select().from(schema.courseQuestions).orderBy(asc(schema.courseQuestions.order));

  const analysis: ModuleAnalysis[] = modules.map((m) => ({
    moduleId: m.id,
    order: m.order,
    title: m.title,
    questions: questions
      .filter((q) => q.moduleId === m.id)
      .map((q) => {
        const s = statMap.get(q.id);
        const answered = s?.total ?? 0;
        const correct = s?.correct ?? 0;
        return {
          id: q.id,
          order: q.order,
          prompt: q.prompt,
          answered,
          correct,
          correctRate: answered > 0 ? Math.round((correct / answered) * 100) : null,
        };
      }),
  }));

  const totalAttempts = attempts.length;
  const passedCount = attempts.filter((a) => a.passed).length;
  const passRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;
  const avgPct =
    totalAttempts > 0
      ? Math.round(
          (attempts.reduce((acc, a) => acc + (a.total ? (a.score ?? 0) / a.total : 0), 0) / totalAttempts) * 100,
        )
      : 0;

  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <h1 className="font-display text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
        Notas de los exámenes
      </h1>
      <p className="mt-2 text-sm text-white/55">
        Intentos de los comerciales y análisis por pregunta del examen de formación.
      </p>

      <NotasClient
        attempts={attempts}
        analysis={analysis}
        kpis={{ totalAttempts, passedCount, passRate, avgPct }}
      />
    </div>
  );
}
