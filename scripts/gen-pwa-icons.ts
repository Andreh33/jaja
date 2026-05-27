/**
 * Genera los iconos PWA desde la marca de `src/app/icon.svg`.
 *
 * - icon-192.png / icon-512.png  → propósito "any" (con esquinas redondeadas).
 * - icon-maskable-512.png        → propósito "maskable" (fondo a sangre + logo
 *                                   dentro de la safe-zone, ~70%).
 * - apple-touch-icon.png (180)   → icono de inicio en iOS.
 *
 * Run: npx tsx scripts/gen-pwa-icons.ts
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'public', 'icons');

const GRAD =
  '<defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">' +
  '<stop offset="0%" stop-color="#8B5CF6"/><stop offset="50%" stop-color="#F97316"/>' +
  '<stop offset="100%" stop-color="#FBBF24"/></linearGradient></defs>';
const LOGO =
  '<path d="M9 8.5v15h13.5" stroke="url(#g)" stroke-width="3.2" stroke-linecap="round" ' +
  'stroke-linejoin="round" fill="none"/><circle cx="24" cy="9" r="2.5" fill="url(#g)"/>';

const anySvg =
  `<svg width="512" height="512" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">${GRAD}` +
  `<rect width="32" height="32" rx="8" fill="#07050E"/>${LOGO}</svg>`;

// maskable: fondo a sangre (sin redondear) + logo escalado y centrado en la safe-zone.
const maskableSvg =
  `<svg width="512" height="512" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">${GRAD}` +
  `<rect width="32" height="32" fill="#07050E"/>` +
  `<g transform="translate(16 16) scale(0.7) translate(-16.95 -15.8)">${LOGO}</g></svg>`;

async function main() {
  await mkdir(OUT, { recursive: true });
  await sharp(Buffer.from(anySvg)).resize(192, 192).png().toFile(join(OUT, 'icon-192.png'));
  await sharp(Buffer.from(anySvg)).resize(512, 512).png().toFile(join(OUT, 'icon-512.png'));
  await sharp(Buffer.from(maskableSvg)).resize(512, 512).png().toFile(join(OUT, 'icon-maskable-512.png'));
  await sharp(Buffer.from(anySvg)).resize(180, 180).png().toFile(join(OUT, 'apple-touch-icon.png'));
  console.log('PWA icons generated in', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
