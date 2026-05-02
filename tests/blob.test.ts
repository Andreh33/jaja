/**
 * Tests de la lógica de subida de CV. NO toca @vercel/blob real:
 *   - Para sanitizeFilename y validateCv: no hay nada que mockear.
 *   - Para uploadCv: inyectamos `put` y `randomUUID` mock vía el
 *     parámetro `deps` del helper.
 *
 * Magic bytes usados (suficientes para que file-type detecte):
 *   PDF:  %PDF-1.4
 *   PNG:  89 50 4E 47 0D 0A 1A 0A + IHDR
 *   JPG:  FF D8 FF E0 ... JFIF
 *   WebP: RIFF + size + WEBP + VP8
 *   ZIP:  PK\x03\x04 (rechazado: ni en allow-list ni con
 *         extensión .docx detectable como zip puro).
 *
 * Run: npm test
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeFilename, validateCv, uploadCv, CvUploadError } from '../src/lib/blob';

// ---------- Magic byte fixtures ----------

const PDF_BYTES = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A, 0x25]);
const PNG_BYTES = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
  0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00,
]);
const JPG_BYTES = Buffer.from([
  0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
]);
const WEBP_BYTES = Buffer.concat([
  Buffer.from('RIFF'),
  Buffer.from([0x00, 0x00, 0x00, 0x00]),
  Buffer.from('WEBPVP8 '),
]);
const ZIP_BYTES = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00]);

function makeFile(bytes: Buffer | Uint8Array, name: string): File {
  // Cast a BlobPart: Node's Buffer es Uint8Array<ArrayBufferLike> y TypeScript
  // strict no lo acepta directamente como BlobPart (que requiere ArrayBuffer).
  // El runtime funciona perfecto.
  return new File([bytes as unknown as BlobPart], name);
}

// ---------------------------------------------------------------------------
// sanitizeFilename
// ---------------------------------------------------------------------------

describe('sanitizeFilename', () => {
  it('strips path traversal sequences', () => {
    assert.equal(sanitizeFilename('../../etc/passwd.pdf'), 'passwd.pdf');
    assert.equal(sanitizeFilename('..\\..\\windows\\system32\\evil.pdf'), 'evil.pdf');
    assert.equal(sanitizeFilename('foo/bar/baz.pdf'), 'baz.pdf');
  });

  it('replaces non-ASCII and special chars with hyphens, collapses runs', () => {
    assert.equal(sanitizeFilename('CV João José.pdf'), 'CV-Jo-o-Jos-.pdf');
    assert.equal(sanitizeFilename('my résumé!@#$.pdf'), 'my-r-sum-.pdf');
    assert.equal(sanitizeFilename('a    b____c.pdf'), 'a-b____c.pdf');
  });

  it('returns empty string for empty/dotty/dash-only inputs', () => {
    assert.equal(sanitizeFilename(''), '');
    assert.equal(sanitizeFilename('.'), '');
    assert.equal(sanitizeFilename('..'), '');
    assert.equal(sanitizeFilename('   '), '');
  });

  it('preserves valid filenames unchanged', () => {
    assert.equal(sanitizeFilename('cv-2026.pdf'), 'cv-2026.pdf');
    assert.equal(sanitizeFilename('My_CV.PDF'), 'My_CV.PDF');
  });
});

// ---------------------------------------------------------------------------
// validateCv — accepted MIME types
// ---------------------------------------------------------------------------

describe('validateCv — allowed types', () => {
  it('accepts PDF', async () => {
    const file = makeFile(PDF_BYTES, 'cv.pdf');
    const r = await validateCv(file);
    assert.equal(r.detectedMime, 'application/pdf');
    assert.equal(r.sanitizedFilename, 'cv.pdf');
  });

  it('accepts PNG', async () => {
    const file = makeFile(PNG_BYTES, 'photo.png');
    const r = await validateCv(file);
    assert.equal(r.detectedMime, 'image/png');
  });

  it('accepts JPG (.jpg extension)', async () => {
    const file = makeFile(JPG_BYTES, 'photo.jpg');
    const r = await validateCv(file);
    assert.equal(r.detectedMime, 'image/jpeg');
  });

  it('accepts JPG (.jpeg extension)', async () => {
    const file = makeFile(JPG_BYTES, 'photo.jpeg');
    const r = await validateCv(file);
    assert.equal(r.detectedMime, 'image/jpeg');
  });

  it('accepts WebP', async () => {
    const file = makeFile(WEBP_BYTES, 'photo.webp');
    const r = await validateCv(file);
    assert.equal(r.detectedMime, 'image/webp');
  });
});

// Note: DOC and DOCX cannot be tested with synthetic magic-bytes only.
// file-type identifies DOCX via internal manifest of the zip archive,
// which requires a full valid DOCX structure (>200 bytes). They are
// accepted in production when real files are uploaded.

// ---------------------------------------------------------------------------
// validateCv — rejected
// ---------------------------------------------------------------------------

describe('validateCv — rejected', () => {
  it('rejects file > 10MB', async () => {
    // Create a file >10MB starting with valid PDF magic bytes so MIME
    // detection passes — the only rejection should be size.
    const bigBytes = Buffer.concat([PDF_BYTES, Buffer.alloc(11 * 1024 * 1024)]);
    const file = makeFile(bigBytes, 'big.pdf');
    await assert.rejects(
      () => validateCv(file),
      (err: unknown) => err instanceof CvUploadError && err.code === 'file_too_large',
    );
  });

  it('rejects empty file', async () => {
    const file = makeFile(Buffer.alloc(0), 'empty.pdf');
    await assert.rejects(
      () => validateCv(file),
      (err: unknown) => err instanceof CvUploadError && err.code === 'empty_file',
    );
  });

  it('rejects empty filename', async () => {
    const file = makeFile(PDF_BYTES, '');
    await assert.rejects(
      () => validateCv(file),
      (err: unknown) => err instanceof CvUploadError && err.code === 'invalid_filename',
    );
  });

  it('rejects filename with no extension', async () => {
    const file = makeFile(PDF_BYTES, 'cv');
    await assert.rejects(
      () => validateCv(file),
      (err: unknown) => err instanceof CvUploadError && err.code === 'invalid_filename',
    );
  });

  it('rejects filename with disallowed extension (.exe)', async () => {
    const file = makeFile(PDF_BYTES, 'evil.exe');
    await assert.rejects(
      () => validateCv(file),
      (err: unknown) => err instanceof CvUploadError && err.code === 'invalid_extension',
    );
  });

  it('rejects MIME spoofing (PDF bytes with .png extension)', async () => {
    const file = makeFile(PDF_BYTES, 'spoof.png');
    await assert.rejects(
      () => validateCv(file),
      (err: unknown) =>
        err instanceof CvUploadError && err.code === 'mime_extension_mismatch',
    );
  });

  it('rejects MIME spoofing (ZIP bytes with .pdf extension)', async () => {
    const file = makeFile(ZIP_BYTES, 'cv.pdf');
    await assert.rejects(
      () => validateCv(file),
      (err: unknown) =>
        // ZIP is not in allow-list → mime_not_allowed (checked before extension match)
        err instanceof CvUploadError && err.code === 'mime_not_allowed',
    );
  });

  it('rejects unknown bytes (random buffer)', async () => {
    const file = makeFile(Buffer.from([0x00, 0x01, 0x02, 0x03]), 'cv.pdf');
    await assert.rejects(
      () => validateCv(file),
      (err: unknown) => err instanceof CvUploadError && err.code === 'unknown_mime',
    );
  });
});

// ---------------------------------------------------------------------------
// uploadCv — UUID uniqueness via injected deps
// ---------------------------------------------------------------------------

describe('uploadCv — generates unique UUID per call (via injected deps)', () => {
  it('passes a different path to put() on each call', async () => {
    const file = makeFile(PDF_BYTES, 'cv.pdf');
    let callCount = 0;
    const putCalls: string[] = [];
    const fakePut = async (pathname: string) => {
      putCalls.push(pathname);
      return { url: `https://blob.example/${pathname}`, pathname, contentType: 'application/pdf', contentDisposition: '' };
    };
    // randomUUID determinist per call (different value each time).
    const fakeRandomUUID = () => `uuid-${++callCount}`;

    const r1 = await uploadCv(file, { put: fakePut as never, randomUUID: fakeRandomUUID });
    const r2 = await uploadCv(file, { put: fakePut as never, randomUUID: fakeRandomUUID });

    assert.equal(putCalls[0], 'cv/uuid-1/cv.pdf');
    assert.equal(putCalls[1], 'cv/uuid-2/cv.pdf');
    assert.notEqual(r1.url, r2.url);
    assert.equal(r1.filename, 'cv.pdf');
    assert.equal(r1.size, PDF_BYTES.length);
  });
});
