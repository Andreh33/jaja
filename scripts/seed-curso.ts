/**
 * Seed idempotente de la plataforma de formación.
 *
 * - courseModules: 6 módulos (modulo-0..5) con orden, título, descripción,
 *   videoUrl/pdfUrl (de blob-manifest.json) y duración (segundos).
 * - courseQuestions: 39 preguntas desde contenido-curso/preguntas/modulo-N.json.
 *
 * Idempotente vía onConflictDoUpdate por id estable: re-ejecutar NO duplica.
 * NO toca ninguna otra tabla.
 *
 * Requiere haber corrido antes upload-curso.ts (blob-manifest.json).
 * Uso:  npx tsx scripts/seed-curso.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { courseModules, courseQuestions } from '../drizzle/schema';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
const db = drizzle(client);

const CURSO = 'contenido-curso';

// Duraciones reales (ffprobe, segundos redondeados).
const DURATIONS: Record<number, number> = { 0: 249, 1: 704, 2: 398, 3: 308, 4: 155, 5: 183 };

const DESCRIPTIONS: Record<number, string> = {
  0: 'Bienvenida, quiénes somos y tu papel como comercial.',
  1: 'Los tres servicios: web, tienda online y asistente IA (vende beneficios, no características).',
  2: 'Cómo entrarle al cliente por teléfono: conseguir la reunión y rebatir las objeciones.',
  3: 'Cómo entrarle al cliente en persona: primera impresión y lenguaje corporal.',
  4: 'Acceso y uso del CRM: CRM, Calendario, Avisos y registro de llamadas.',
  5: 'Consejos de venta y cierre: constancia, seguimiento y mentalidad resiliente.',
};

type PreguntasFile = {
  moduleId: string;
  title: string;
  questions: {
    id: string;
    order: number;
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
};

async function main() {
  const manifestPath = join(CURSO, 'blob-manifest.json');
  if (!existsSync(manifestPath)) {
    throw new Error(`No existe ${manifestPath}. Ejecuta primero scripts/upload-curso.ts`);
  }
  const manifest: Record<string, { videoUrl: string; pdfUrl: string }> = JSON.parse(
    readFileSync(manifestPath, 'utf8'),
  );

  let modCount = 0;
  let qCount = 0;

  for (const n of [0, 1, 2, 3, 4, 5]) {
    const id = `modulo-${n}`;
    const pf: PreguntasFile = JSON.parse(
      readFileSync(join(CURSO, 'preguntas', `${id}.json`), 'utf8'),
    );
    const urls = manifest[id];
    if (!urls) throw new Error(`Manifest sin URLs para ${id}`);

    await db
      .insert(courseModules)
      .values({
        id,
        order: n,
        title: pf.title,
        description: DESCRIPTIONS[n],
        videoUrl: urls.videoUrl,
        pdfUrl: urls.pdfUrl,
        durationSeconds: DURATIONS[n],
      })
      .onConflictDoUpdate({
        target: courseModules.id,
        set: {
          order: n,
          title: pf.title,
          description: DESCRIPTIONS[n],
          videoUrl: urls.videoUrl,
          pdfUrl: urls.pdfUrl,
          durationSeconds: DURATIONS[n],
        },
      });
    modCount++;

    for (const q of pf.questions) {
      await db
        .insert(courseQuestions)
        .values({
          id: q.id,
          moduleId: id,
          order: q.order,
          prompt: q.prompt,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        })
        .onConflictDoUpdate({
          target: courseQuestions.id,
          set: {
            moduleId: id,
            order: q.order,
            prompt: q.prompt,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
          },
        });
      qCount++;
    }
    console.log(`[seed] ${id}: módulo + ${pf.questions.length} preguntas`);
  }

  console.log(`[seed] ✓ ${modCount} módulos y ${qCount} preguntas sembrados (idempotente).`);
}

main().catch((err) => {
  console.error('[seed] ERROR', err);
  process.exit(1);
});
