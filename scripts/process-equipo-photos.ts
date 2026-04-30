import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

type Job = {
  src: string;
  out: string;
  cropTop?: number;
  cropBottom?: number;
  whiteThreshold?: number;
  edgeSoft?: number;
};

const JOBS: Job[] = [
  {
    src: 'public/equipo/fundadores/foto.jpeg',
    out: 'public/equipo/fundadores/foto.png',
    cropTop: 249,
    cropBottom: 52,
  },
  {
    src: 'public/equipo/jose-luis-grondona/foto.jpeg',
    out: 'public/equipo/jose-luis-grondona/foto.png',
  },
  {
    src: 'public/equipo/ricardo-perez/foto.jpeg',
    out: 'public/equipo/ricardo-perez/foto.png',
  },
];

const HARD_WHITE = 245;
const SOFT_WHITE = 225;

function isWhite(r: number, g: number, b: number, t: number): boolean {
  return r >= t && g >= t && b >= t;
}

async function process(job: Job): Promise<{ width: number; height: number }> {
  let img = sharp(job.src);
  const meta = await img.metadata();
  const fullW = meta.width!;
  const fullH = meta.height!;
  const cropTop = job.cropTop ?? 0;
  const cropBottom = job.cropBottom ?? 0;
  const W = fullW;
  const H = fullH - cropTop - cropBottom;
  if (cropTop > 0 || cropBottom > 0) {
    img = img.extract({ left: 0, top: cropTop, width: W, height: H });
  }
  const { data: rgb } = await img
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const N = W * H;
  const out = Buffer.alloc(N * 4);
  const visited = new Uint8Array(N);
  const isBgWhite = new Uint8Array(N);

  // Flood-fill desde los bordes
  const queue: number[] = [];
  const enqueue = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const idx = y * W + x;
    if (visited[idx]) return;
    const p = idx * 3;
    if (!isWhite(rgb[p], rgb[p + 1], rgb[p + 2], SOFT_WHITE)) return;
    visited[idx] = 1;
    isBgWhite[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < W; x++) {
    enqueue(x, 0);
    enqueue(x, H - 1);
  }
  for (let y = 0; y < H; y++) {
    enqueue(0, y);
    enqueue(W - 1, y);
  }

  while (queue.length) {
    const idx = queue.pop()!;
    const x = idx % W;
    const y = (idx - x) / W;
    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }

  // Construir RGBA con alpha suave en la transición
  for (let idx = 0; idx < N; idx++) {
    const p = idx * 3;
    const o = idx * 4;
    const r = rgb[p];
    const g = rgb[p + 1];
    const b = rgb[p + 2];
    out[o] = r;
    out[o + 1] = g;
    out[o + 2] = b;
    if (isBgWhite[idx]) {
      const minC = Math.min(r, g, b);
      if (minC >= HARD_WHITE) {
        out[o + 3] = 0;
      } else if (minC >= SOFT_WHITE) {
        out[o + 3] = Math.round(((HARD_WHITE - minC) / (HARD_WHITE - SOFT_WHITE)) * 255);
      } else {
        out[o + 3] = 255;
      }
    } else {
      out[o + 3] = 255;
    }
  }

  const png = await sharp(out, { raw: { width: W, height: H, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(job.out, png);
  return { width: W, height: H };
}

(async () => {
  for (const job of JOBS) {
    const { width, height } = await process(job);
    console.log(job.out, width, 'x', height);
  }
})();
