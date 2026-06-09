/**
 * Lógica del examen final del curso.
 *
 * - Muestreo de QUESTIONS_PER_MODULE preguntas por módulo (4 → 24 en total).
 * - Orden de preguntas y de opciones aleatorizado por intento.
 * - Al cliente se le envían las opciones barajadas con su ÍNDICE ORIGINAL (`oi`)
 *   pero NUNCA el `correctIndex`: la corrección es 100% en servidor.
 *
 * `buildExam()` es server-only (usa la BD). La corrección vive en
 * /api/cursos/examen.
 */

import { db, schema } from '@/lib/db';
import { asc } from 'drizzle-orm';

export const PASS_MARK = 0.7;
export const QUESTIONS_PER_MODULE = 4;

export type ExamOption = { text: string; oi: number }; // oi = índice original (0..3)
export type ExamQuestion = {
  id: string;
  moduleId: string;
  moduleOrder: number;
  moduleTitle: string;
  prompt: string;
  options: ExamOption[];
};

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Construye un examen: 4 preguntas aleatorias por módulo, opciones barajadas,
 * y el conjunto final de preguntas también barajado. Sin respuestas correctas.
 */
export async function buildExam(): Promise<ExamQuestion[]> {
  const modules = await db
    .select()
    .from(schema.courseModules)
    .orderBy(asc(schema.courseModules.order));

  const allQuestions = await db.select().from(schema.courseQuestions);

  const byModule = new Map<string, typeof allQuestions>();
  for (const q of allQuestions) {
    const list = byModule.get(q.moduleId) ?? [];
    list.push(q);
    byModule.set(q.moduleId, list);
  }

  const picked: ExamQuestion[] = [];
  for (const m of modules) {
    const qs = byModule.get(m.id) ?? [];
    const sample = shuffle(qs).slice(0, QUESTIONS_PER_MODULE);
    for (const q of sample) {
      const options = q.options as string[];
      const shuffledOptions: ExamOption[] = shuffle(
        options.map((text, oi) => ({ text, oi })),
      );
      picked.push({
        id: q.id,
        moduleId: m.id,
        moduleOrder: m.order,
        moduleTitle: m.title,
        prompt: q.prompt,
        options: shuffledOptions,
      });
    }
  }

  return shuffle(picked);
}
