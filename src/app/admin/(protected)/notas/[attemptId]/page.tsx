import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check, X } from 'lucide-react';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function fmtDate(d: Date | null): string {
  if (!d) return '—';
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(d));
}

export default async function AttemptDetailPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;

  const attempt = (
    await db.select().from(schema.examAttempts).where(eq(schema.examAttempts.id, attemptId)).limit(1)
  )[0];
  if (!attempt) notFound();

  const answers = await db
    .select({
      id: schema.examAnswers.id,
      chosenIndex: schema.examAnswers.chosenIndex,
      isCorrect: schema.examAnswers.isCorrect,
      prompt: schema.courseQuestions.prompt,
      options: schema.courseQuestions.options,
      correctIndex: schema.courseQuestions.correctIndex,
      explanation: schema.courseQuestions.explanation,
      moduleId: schema.courseQuestions.moduleId,
    })
    .from(schema.examAnswers)
    .innerJoin(schema.courseQuestions, eq(schema.examAnswers.questionId, schema.courseQuestions.id))
    .where(eq(schema.examAnswers.attemptId, attemptId));

  const pct = attempt.total ? Math.round(((attempt.score ?? 0) / attempt.total) * 100) : 0;

  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <Link href="/admin/notas" className="inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white">
        <ArrowLeft size={15} /> Notas de los exámenes
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-white md:text-3xl" style={{ letterSpacing: '-0.03em', fontWeight: 800 }}>
            {attempt.commercialName || '—'}
          </h1>
          <p className="mt-1 text-sm text-white/55">{attempt.commercialPhone || '—'} · {fmtDate(attempt.finishedAt)}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">{attempt.score}/{attempt.total} <span className="text-white/40 text-xl">({pct}%)</span></div>
          <span
            className="mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-semibold"
            style={attempt.passed
              ? { background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }
              : { background: 'rgba(239,68,68,0.12)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            {attempt.passed ? 'Aprobado' : 'No superado'}
          </span>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {answers.map((a, i) => {
          const options = a.options as string[];
          return (
            <div
              key={a.id}
              className="rounded-2xl border p-5"
              style={a.isCorrect
                ? { borderColor: 'rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.04)' }
                : { borderColor: 'rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.04)' }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ background: a.isCorrect ? '#10B981' : '#EF4444' }}
                >
                  {a.isCorrect ? <Check size={14} /> : <X size={14} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{i + 1}. {a.prompt}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    {!a.isCorrect && (
                      <p className="text-red-300">Respondió: {options[a.chosenIndex]}</p>
                    )}
                    <p className="text-emerald-300">Correcta: {options[a.correctIndex]}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
