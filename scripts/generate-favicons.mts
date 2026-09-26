import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

// One original vector master; no re-sampling of the old raster logo.
// Run: npx tsx scripts/generate-favicons.mts
const root = new URL('../', import.meta.url);
const source = await readFile(new URL('src/app/icon.svg', root));
const render = (size: number) => sharp(source, { density: 384 })
  .resize(size, size).png().toBuffer();

const sizes = [16, 32, 48, 64, 128, 256];
const images = await Promise.all(sizes.map(render));
const directory = Buffer.alloc(6 + images.length * 16);
directory.writeUInt16LE(1, 2); // ICO image type.
directory.writeUInt16LE(images.length, 4);
let offset = directory.length;
images.forEach((image, index) => {
  const entry = 6 + index * 16;
  directory[entry] = sizes[index] === 256 ? 0 : sizes[index];
  directory[entry + 1] = directory[entry];
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(image.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += image.length;
});

await writeFile(new URL('src/app/favicon.ico', root), Buffer.concat([directory, ...images]));
await writeFile(new URL('src/app/icon.png', root), await render(512));
// Apple applies its own rounded mask. An opaque, uniform background avoids
// automatic black transparency fills and keeps the white A clearly visible.
await sharp(source, { density: 384 }).resize(180, 180)
  .flatten({ background: '#071725' }).png()
  .toFile(new URL('src/app/apple-icon.png', root).pathname);
console.log('Generated transparent 512px PNG, six-size ICO and opaque Apple icon.');
