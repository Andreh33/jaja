import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const asset = (name: string) => new URL(`../src/app/${name}`, import.meta.url);

describe('Latech favicon assets', () => {
  it('renders the Studio laboratory mark as a decorative vector, never a platform emoji', async () => {
    const source = await readFile(new URL('../src/components/home/HeroPreview.tsx', import.meta.url), 'utf8');
    const css = await readFile(new URL('../src/components/home/HeroPreview.module.css', import.meta.url), 'utf8');
    assert.match(source, /<svg className=\{styles\.labMark\}[^>]*aria-hidden="true"/);
    assert.doesNotMatch(css, /content:\s*['"]✳/);
  });

  it('has a self-contained square vector without raster images or scripts', async () => {
    const svg = await readFile(asset('icon.svg'), 'utf8');
    assert.match(svg, /viewBox="0 0 64 64"/);
    assert.match(svg, /<title>Latech<\/title>/);
    assert.doesNotMatch(svg, /<(?:image|script|foreignObject)\b|\b(?:href|onload)=/);
  });

  it('keeps the PNG transparent outside the mark, without an opaque tile', async () => {
    const { data, info } = await sharp(await readFile(asset('icon.png'))).raw().toBuffer({ resolveWithObject: true });
    assert.equal(info.width, 512); assert.equal(info.height, 512);
    assert.equal(info.channels, 4);
    for (const [x, y] of [[0, 0], [256, 0], [0, 256], [511, 511]]) {
      assert.equal(data[(y * info.width + x) * 4 + 3], 0);
    }
    const opaquePixels = data.filter((alpha, index) => index % 4 === 3 && alpha === 255).length;
    assert.ok(opaquePixels > 512 * 512 * .15);
    assert.ok(opaquePixels < 512 * 512 * .45);
  });

  it('contains six independently rendered ICO sizes, including native 16px and 32px', async () => {
    const ico = await readFile(asset('favicon.ico'));
    assert.equal(ico.readUInt16LE(0), 0);
    assert.equal(ico.readUInt16LE(2), 1);
    assert.equal(ico.readUInt16LE(4), 6);
    let expectedOffset = 6 + 6 * 16;
    for (const [index, size] of [16, 32, 48, 64, 128, 256].entries()) {
      const entry = 6 + index * 16;
      assert.equal(ico[entry] || 256, size);
      assert.equal(ico[entry + 1] || 256, size);
      assert.equal(ico.readUInt16LE(entry + 6), 32);
      const length = ico.readUInt32LE(entry + 8);
      const offset = ico.readUInt32LE(entry + 12);
      assert.equal(offset, expectedOffset);
      const metadata = await sharp(ico.subarray(offset, offset + length)).metadata();
      assert.equal(metadata.width, size); assert.equal(metadata.height, size);
      expectedOffset += length;
    }
    assert.equal(expectedOffset, ico.length);
  });

  it('provides an opaque 180px Apple icon with a consistent navy background', async () => {
    const apple = sharp(await readFile(asset('apple-icon.png')));
    const metadata = await apple.metadata();
    assert.equal(metadata.width, 180); assert.equal(metadata.height, 180);
    assert.equal((await apple.stats()).isOpaque, true);
    const { data } = await apple.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    assert.deepEqual([...data.subarray(0, 4)], [7, 23, 37, 255]);
  });
});
