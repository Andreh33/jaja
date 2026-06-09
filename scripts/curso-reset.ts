/**
 * Resetea SOLO los datos generados por comerciales en la plataforma de
 * formación: commercials, course_progress, exam_attempts, exam_answers.
 *
 * NO toca course_modules ni course_questions (contenido sembrado), ni ninguna
 * otra tabla existente (users, posts, mensajes, clientes...). Útil para limpiar
 * datos de prueba durante el desarrollo / QA.
 *
 * Uso:  npx tsx scripts/curso-reset.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@libsql/client';

async function main() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  // Orden hijo→padre (aunque hay ON DELETE CASCADE, somos explícitos).
  for (const t of ['exam_answers', 'exam_attempts', 'course_progress', 'commercials']) {
    const before = await db.execute(`SELECT count(*) c FROM ${t}`);
    await db.execute(`DELETE FROM ${t}`);
    console.log(`[reset] ${t}: ${before.rows[0].c} filas borradas`);
  }
  console.log('[reset] ✓ Datos de comerciales/progreso/exámenes limpiados. Contenido (módulos/preguntas) intacto.');
}

main().catch((e) => { console.error('[reset] ERROR', e); process.exit(1); });
