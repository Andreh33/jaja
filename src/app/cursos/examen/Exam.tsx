'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, X, CheckCircle2, XCircle, RotateCcw, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import type { ExamQuestion } from '@/lib/curso-exam';

type ReviewItem = {
  questionId: string;
  moduleId: string;
  prompt: string;
  options: string[];
  chosenIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
};
type Result = { score: number; total: number; passed: boolean; passMark: number; review: ReviewItem[] };

export default function Exam({ questions }: { questions: ExamQuestion[] }) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const q = questions[i];

  if (result) return <ResultView result={result} onRetry={() => router.refresh()} />;

  const select = (oi: number) => setAnswers((a) => ({ ...a, [q.id]: oi }));

  const submit = async () => {
    if (answeredCount < total) {
      toast.error(`Te faltan ${total - answeredCount} preguntas por responder.`);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, chosenIndex]) => ({ questionId, chosenIndex })),
      };
      const r = await fetch('/api/cursos/examen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) {
        toast.error(data.error || 'No se pudo enviar el examen.');
        return;
      }
      setResult(data);
      window.scrollTo({ top: 0 });
    } catch {
      toast.error('Error de conexión.');
    } finally {
      setSubmitting(false);
    }
  };

  const isLast = i === total - 1;
  const selected = answers[q.id];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <Link href="/cursos" className="inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white">
          <ArrowLeft size={15} /> Salir
        </Link>
        <span className="text-xs text-white/45">Pregunta {i + 1} de {total}</span>
      </div>

      {/* Progreso de respondidas */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full transition-all" style={{ width: `${(answeredCount / total) * 100}%`, background: 'var(--grad-signature)' }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.22 }}
          className="mt-6 rounded-3xl glass border border-white/10 p-6 md:p-7"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">Módulo {q.moduleOrder} · {q.moduleTitle}</span>
          <h2 className="mt-2 text-lg font-semibold leading-snug text-white md:text-xl">{q.prompt}</h2>

          <div className="mt-5 space-y-3">
            {q.options.map((opt, idx) => {
              const active = selected === opt.oi;
              return (
                <button
                  key={idx}
                  onClick={() => select(opt.oi)}
                  className={[
                    'flex w-full items-center gap-3 rounded-2xl border p-4 text-left text-sm transition-all',
                    active
                      ? 'border-purple-400/70 bg-purple-500/15 text-white'
                      : 'border-white/10 bg-white/[0.02] text-white/80 hover:border-white/25',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                      active ? 'border-purple-300 bg-purple-400 text-white' : 'border-white/25 text-white/40',
                    ].join(' ')}
                  >
                    {active ? <Check size={14} /> : String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt.text}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          onClick={() => setI((v) => Math.max(0, v - 1))}
          disabled={i === 0}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm text-white/80 transition-colors hover:border-white/35 disabled:opacity-40"
        >
          <ArrowLeft size={15} /> Atrás
        </button>

        {isLast ? (
          <button
            onClick={submit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-60 glow-purple"
            style={{ background: 'var(--grad-signature)' }}
          >
            {submitting ? 'Enviando…' : `Enviar examen (${answeredCount}/${total})`}
          </button>
        ) : (
          <button
            onClick={() => setI((v) => Math.min(total - 1, v + 1))}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98] glow-purple"
            style={{ background: 'var(--grad-signature)' }}
          >
            Siguiente <ArrowRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

function ResultView({ result, onRetry }: { result: Result; onRetry: () => void }) {
  const { score, total, passed, passMark } = result;
  const pctNote = Math.round(passMark * 100);
  const fails = useMemo(() => result.review.filter((r) => !r.isCorrect), [result.review]);

  return (
    <div className="mx-auto max-w-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl glass-strong border border-white/10 p-7 text-center md:p-9"
      >
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-white"
          style={{ background: passed ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)' }}
        >
          {passed ? <Trophy size={28} /> : <XCircle size={28} />}
        </div>
        <h1 className="font-display mt-5 text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.03em', fontWeight: 800 }}>
          {passed ? '¡Aprobado!' : 'No superado'}
        </h1>
        <p className="mt-2 text-5xl font-bold text-white">
          {score}<span className="text-white/35">/{total}</span>
        </p>
        <p className="mt-2 text-sm text-white/55">
          {passed
            ? '¡Enhorabuena! Ya formas parte del equipo comercial.'
            : `Necesitas al menos un ${pctNote}% para aprobar. Repasa los módulos y vuelve a intentarlo.`}
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/85 transition-colors hover:border-white/35"
          >
            <RotateCcw size={15} /> Repetir examen
          </button>
          <Link
            href="/cursos"
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white glow-purple"
            style={{ background: 'var(--grad-signature)' }}
          >
            Volver al curso
          </Link>
        </div>
      </motion.div>

      {fails.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white">Repaso de tus fallos ({fails.length})</h2>
          <div className="mt-4 space-y-4">
            {fails.map((r) => (
              <div key={r.questionId} className="rounded-2xl glass border border-white/10 p-5">
                <p className="text-sm font-semibold text-white">{r.prompt}</p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-red-300">
                    <X size={16} className="mt-0.5 shrink-0" />
                    <span>Tu respuesta: {r.options[r.chosenIndex]}</span>
                  </div>
                  <div className="flex items-start gap-2 text-emerald-300">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                    <span>Correcta: {r.options[r.correctIndex]}</span>
                  </div>
                </div>
                {r.explanation && (
                  <p className="mt-3 rounded-xl bg-white/[0.03] p-3 text-xs leading-relaxed text-white/60">{r.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.07] px-4 py-4 text-sm text-emerald-300">
          <CheckCircle2 size={18} /> ¡Perfecto, sin fallos!
        </div>
      )}
    </div>
  );
}
