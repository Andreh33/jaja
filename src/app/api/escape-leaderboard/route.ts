import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@libsql/client';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

// Cliente directo a Turso (tabla creada de forma idempotente; sin migración de esquema).
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

let ready: Promise<unknown> | null = null;
function ensureTable() {
  if (!ready) {
    ready = client.execute(
      'CREATE TABLE IF NOT EXISTS escape_scores (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, score INTEGER NOT NULL, created_at INTEGER NOT NULL)',
    );
  }
  return ready;
}

async function topScores(limit = 20) {
  await ensureTable();
  const r = await client.execute({
    sql: 'SELECT name, score FROM escape_scores ORDER BY score DESC, created_at ASC LIMIT ?',
    args: [limit],
  });
  return r.rows.map((row) => ({ name: String(row.name), score: Number(row.score) }));
}

// conserva imprimibles ASCII + latinos (acentos), descarta control y rarezas
function cleanName(raw: string) {
  const out = [...raw].filter((c) => {
    const x = c.codePointAt(0) || 0;
    return (x >= 32 && x <= 126) || (x >= 160 && x <= 591);
  }).join('').trim().slice(0, 14);
  return out || 'Anonimo';
}

export async function GET() {
  try {
    return NextResponse.json({ top: await topScores() });
  } catch (e) {
    console.error('[escape-leaderboard GET]', e);
    return NextResponse.json({ top: [] });
  }
}

const bodySchema = z.object({
  name: z.string().max(40),
  score: z.number().int().min(0).max(100000), // tope anti-trampas básico
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`escape-lb:${ip}`, { max: 20, windowMs: 60_000 });
    if (!rl.allowed) return NextResponse.json({ error: 'demasiados envios' }, { status: 429 });

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'datos invalidos' }, { status: 400 });

    await ensureTable();
    await client.execute({
      sql: 'INSERT INTO escape_scores (name, score, created_at) VALUES (?, ?, ?)',
      args: [cleanName(parsed.data.name), parsed.data.score, Date.now()],
    });
    return NextResponse.json({ top: await topScores() });
  } catch (e) {
    console.error('[escape-leaderboard POST]', e);
    return NextResponse.json({ error: 'error en el servidor' }, { status: 500 });
  }
}
