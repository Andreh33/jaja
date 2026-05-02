/**
 * POST /api/upload/cv
 *
 * Endpoint público (sin auth) para subir un CV asociado a una
 * candidatura. Lo usa el formulario de /empleo/[slug] y la
 * candidatura espontánea de /empleo.
 *
 * Validaciones:
 *   1. Rate limit: 5 uploads/hora por IP.
 *   2. FormData con field "file" presente.
 *   3. Tamaño <= 10 MB.
 *   4. MIME real (magic bytes) ∈ allow-list (PDF/DOC/DOCX/JPG/PNG/WebP).
 *   5. Extensión declarada coincide con MIME real (anti-suplantación).
 *
 * Devuelve { ok: true, url, filename, size } o un error con código.
 */

import { NextResponse } from 'next/server';
import { uploadCv, CvUploadError } from '@/lib/blob';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  // 1. Rate limit por IP.
  const ip = getClientIp(req);
  const rl = rateLimit(`upload-cv:${ip}`, { max: 5, windowMs: 60 * 60 * 1000 });
  if (!rl.allowed) {
    console.warn(`[upload-cv] rate-limited ip=${ip} resetMs=${rl.resetMs}`);
    return NextResponse.json(
      { error: 'Demasiadas subidas. Inténtalo de nuevo en una hora.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(rl.resetMs / 1000)) },
      },
    );
  }

  // 2. Parse FormData.
  let file: File | null = null;
  try {
    const fd = await req.formData();
    const f = fd.get('file');
    if (f instanceof File) file = f;
  } catch {
    return NextResponse.json({ error: 'Body inválido.' }, { status: 400 });
  }
  if (!file) {
    return NextResponse.json({ error: 'No se ha recibido ningún archivo.' }, { status: 400 });
  }

  // 3. Validación + upload.
  try {
    const result = await uploadCv(file);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof CvUploadError) {
      console.warn(`[upload-cv] rejected ip=${ip} code=${err.code} filename="${file.name}"`);
      return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
    }
    console.error(`[upload-cv] failed ip=${ip} err="${(err as Error).message}"`);
    return NextResponse.json({ error: 'No hemos podido subir el archivo.' }, { status: 500 });
  }
}
