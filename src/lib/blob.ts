/**
 * Helpers para subida y borrado de CVs en Vercel Blob.
 *
 * Diseño:
 *   - sanitizeFilename: pura.
 *   - validateCv: valida tamaño + MIME real (magic bytes) + match
 *     entre extensión declarada y MIME real. NO toca Blob.
 *   - uploadCv: usa validateCv, luego sube via @vercel/blob.put.
 *     Acepta `deps?` para inyectar mocks de `put` y `randomUUID`
 *     en tests sin mockear el módulo entero.
 *   - deleteCv: best-effort, log + continue en error.
 *
 * Validación MIME real con `file-type` (magic bytes). Aunque el
 * cliente declare `Content-Type` arbitrario, leemos los primeros
 * bytes del archivo y dejamos que `file-type` deduzca el tipo.
 * Esto bloquea suplantación (.exe disfrazado de .pdf).
 */

import { put as realPut, del as realDel } from '@vercel/blob';
import { fileTypeFromBuffer } from 'file-type';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const HEADER_READ_BYTES = 4096;

const ALLOWED_MIMES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

/** extensión (lowercase, sin punto) → MIME canónico esperado. */
const EXTENSION_TO_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export type CvUploadErrorCode =
  | 'invalid_filename'
  | 'invalid_extension'
  | 'file_too_large'
  | 'empty_file'
  | 'unknown_mime'
  | 'mime_not_allowed'
  | 'mime_extension_mismatch';

export class CvUploadError extends Error {
  code: CvUploadErrorCode;
  constructor(message: string, code: CvUploadErrorCode) {
    super(message);
    this.name = 'CvUploadError';
    this.code = code;
  }
}

/**
 * Sanitiza el nombre de archivo: elimina componentes de path,
 * permite solo [A-Za-z0-9._-], colapsa guiones, recorta puntos/
 * guiones extremos. Si el resultado es vacío, devuelve ''.
 */
export function sanitizeFilename(name: string): string {
  if (typeof name !== 'string') return '';
  const base = name.split(/[/\\]/).pop() ?? '';
  let clean = base.replace(/[^A-Za-z0-9._-]/g, '-');
  clean = clean.replace(/-+/g, '-');
  clean = clean.replace(/^[-.]+|[-.]+$/g, '');
  return clean;
}

function getExtension(filename: string): string | null {
  const idx = filename.lastIndexOf('.');
  if (idx <= 0 || idx === filename.length - 1) return null;
  return filename.slice(idx + 1).toLowerCase();
}

/**
 * Valida un archivo de CV. Lanza CvUploadError si algo no cuadra.
 * No llama a Vercel Blob — solo lectura local de bytes.
 *
 * Devuelve metadatos útiles para el caller: el filename sanitizado
 * (apto para path de blob) y el MIME real detectado.
 */
export async function validateCv(file: File): Promise<{
  sanitizedFilename: string;
  detectedMime: string;
}> {
  // 1. Filename + extensión.
  const original = file.name ?? '';
  const sanitized = sanitizeFilename(original);
  if (!sanitized) {
    throw new CvUploadError('Nombre de archivo inválido o vacío.', 'invalid_filename');
  }
  const ext = getExtension(sanitized);
  if (!ext) {
    throw new CvUploadError('El archivo no tiene extensión.', 'invalid_filename');
  }
  if (!(ext in EXTENSION_TO_MIME)) {
    throw new CvUploadError(
      'Extensión no permitida. Usa PDF, DOC, DOCX, JPG, PNG o WebP.',
      'invalid_extension',
    );
  }

  // 2. Tamaño.
  if (file.size === 0) {
    throw new CvUploadError('El archivo está vacío.', 'empty_file');
  }
  if (file.size > MAX_SIZE) {
    throw new CvUploadError('El archivo supera el tamaño máximo de 10 MB.', 'file_too_large');
  }

  // 3. MIME real desde magic bytes (primeros 4 KB son suficientes).
  const headerBuf = Buffer.from(
    await file.slice(0, HEADER_READ_BYTES).arrayBuffer(),
  );
  const detected = await fileTypeFromBuffer(headerBuf);
  if (!detected) {
    throw new CvUploadError(
      'No hemos podido reconocer el tipo de archivo. Sube un PDF, DOC, DOCX, JPG, PNG o WebP.',
      'unknown_mime',
    );
  }

  // 4. MIME real ∈ allow-list.
  if (!ALLOWED_MIMES.has(detected.mime)) {
    throw new CvUploadError(
      'Tipo de archivo no permitido. Usa PDF, DOC, DOCX, JPG, PNG o WebP.',
      'mime_not_allowed',
    );
  }

  // 5. Match entre extensión declarada y MIME real (anti-suplantación).
  const expectedMime = EXTENSION_TO_MIME[ext];
  if (detected.mime !== expectedMime) {
    throw new CvUploadError(
      'La extensión del archivo no coincide con su contenido real.',
      'mime_extension_mismatch',
    );
  }

  return { sanitizedFilename: sanitized, detectedMime: detected.mime };
}

/**
 * Sube un CV validado a Vercel Blob.
 *
 * `deps` es solo para tests — permite inyectar un mock de `put` y
 * un generador de UUID determinista sin tocar el módulo real.
 */
export async function uploadCv(
  file: File,
  deps: {
    put?: typeof realPut;
    randomUUID?: () => string;
  } = {},
): Promise<{ url: string; filename: string; size: number }> {
  const put = deps.put ?? realPut;
  const randomUUID = deps.randomUUID ?? (() => crypto.randomUUID());

  const { sanitizedFilename } = await validateCv(file);
  const uuid = randomUUID();
  const path = `cv/${uuid}/${sanitizedFilename}`;

  const result = await put(path, file, { access: 'public' });

  return {
    url: result.url,
    filename: file.name ?? sanitizedFilename,
    size: file.size,
  };
}

/**
 * Borra un CV del Blob por URL. Best-effort: si la URL no existe o
 * Blob falla, log + continue (no lanza). Usado por el cron de
 * retención GDPR donde no queremos abortar todo si un blob ya no
 * está.
 */
export async function deleteCv(url: string): Promise<void> {
  try {
    await realDel(url);
  } catch (err) {
    console.warn(`[blob] deleteCv failed url=${url} err="${(err as Error).message}"`);
  }
}
