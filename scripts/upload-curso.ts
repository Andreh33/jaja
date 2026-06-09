/**
 * Sube a Vercel Blob los 6 vídeos MP4 (transcodificados) y los 6 PDFs del curso.
 *
 * - Rutas estables (sin sufijo aleatorio) + allowOverwrite → idempotente:
 *   re-ejecutar sobreescribe el mismo blob y mantiene la MISMA URL, así el
 *   seed posterior nunca apunta a una URL muerta.
 * - Sólo se suben los MP4 (los .wmv no van en navegador/Safari).
 * - Escribe contenido-curso/blob-manifest.json con las URLs (videoUrl/pdfUrl).
 *
 * Requiere BLOB_READ_WRITE_TOKEN en .env.local.
 * Uso:  npx tsx scripts/upload-curso.ts
 */

import { put } from '@vercel/blob';
import * as dotenv from 'dotenv';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

dotenv.config({ path: '.env.local' });

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('[upload] FALTA BLOB_READ_WRITE_TOKEN en .env.local');
  process.exit(1);
}

const CURSO = 'contenido-curso';
const MODULES = [0, 1, 2, 3, 4, 5];

type Manifest = Record<string, { videoUrl: string; pdfUrl: string }>;

async function main() {
  const manifest: Manifest = {};

  for (const n of MODULES) {
    const id = `modulo-${n}`;
    const mp4 = join(CURSO, `${n}.mp4`);
    const pdf = join(CURSO, 'pdfs', `${id}.pdf`);
    if (!existsSync(mp4)) throw new Error(`No existe ${mp4} (¿terminó la transcodificación?)`);
    if (!existsSync(pdf)) throw new Error(`No existe ${pdf} (¿se generaron los PDFs?)`);

    console.log(`[upload] ${id}: subiendo vídeo...`);
    const video = await put(`curso/${id}/video.mp4`, readFileSync(mp4), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'video/mp4',
    });

    console.log(`[upload] ${id}: subiendo PDF...`);
    const pdfBlob = await put(`curso/${id}/resumen.pdf`, readFileSync(pdf), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/pdf',
    });

    manifest[id] = { videoUrl: video.url, pdfUrl: pdfBlob.url };
    console.log(`[upload] ${id}: OK`);
  }

  const out = join(CURSO, 'blob-manifest.json');
  writeFileSync(out, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`[upload] ✓ Manifest escrito en ${out}`);
  for (const [id, u] of Object.entries(manifest)) {
    console.log(`  ${id}\n    video: ${u.videoUrl}\n    pdf:   ${u.pdfUrl}`);
  }
}

main().catch((err) => {
  console.error('[upload] ERROR', err);
  process.exit(1);
});
