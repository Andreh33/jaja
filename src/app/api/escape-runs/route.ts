import { NextResponse } from 'next/server';
import { createEscapeRun, escapeCategorySchema } from '@/lib/escape-ranking';
import { escapeRankingStore } from '@/lib/escape-ranking-store';
import { escapeRankingFailure, RANKING_HEADERS } from '@/lib/escape-ranking-response';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { isSameOriginMutation } from '@/lib/request-origin';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Origen no autorizado' }, { status: 403, headers: RANKING_HEADERS });
  const limit = rateLimit(`escape-run:${getClientIp(request)}`, { max: 12, windowMs: 60_000 });
  if (!limit.allowed) return NextResponse.json({ error: 'Espera un momento antes de iniciar otra partida con ranking.' }, { status: 429, headers: { ...RANKING_HEADERS, 'Retry-After': String(Math.ceil(limit.resetMs / 1000)) } });
  const parsed = escapeCategorySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Elige un modo y una dificultad válidos.', code: 'INVALID_CATEGORY' }, { status: 400, headers: RANKING_HEADERS });
  try {
    const run = await createEscapeRun(parsed.data, escapeRankingStore());
    return NextResponse.json(run, { status: 201, headers: RANKING_HEADERS });
  } catch (error) { return escapeRankingFailure(error); }
}
