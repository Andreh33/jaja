import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });
  const mods = await db.execute('SELECT count(*) c FROM course_modules');
  const qs = await db.execute('SELECT count(*) c FROM course_questions');
  console.log('course_modules:', mods.rows[0].c, '| course_questions:', qs.rows[0].c);

  const perMod = await db.execute(
    'SELECT module_id, count(*) c FROM course_questions GROUP BY module_id ORDER BY module_id',
  );
  console.log('Preguntas por módulo:', perMod.rows.map((r) => `${r.module_id}:${r.c}`).join(' '));

  const rows = await db.execute(
    'SELECT id, sort_order, title, duration_seconds, substr(video_url,1,48) v, substr(pdf_url,1,48) p FROM course_modules ORDER BY sort_order',
  );
  console.log('\nMódulos:');
  for (const r of rows.rows) {
    console.log(`  [${r.sort_order}] ${r.id} (${r.duration_seconds}s) — ${r.title}`);
    console.log(`        video ${r.v}...  pdf ${r.p}...`);
  }

  // sample question integrity
  const sample = await db.execute("SELECT id, options, correct_index FROM course_questions WHERE id='modulo-1-q5'");
  const s = sample.rows[0];
  const opts = JSON.parse(String(s.options));
  console.log(`\nMuestra ${s.id}: ${opts.length} opciones, correcta=[${s.correct_index}] "${opts[Number(s.correct_index)]}"`);
}
main().catch((e) => { console.error('ERR', e); process.exit(1); });
