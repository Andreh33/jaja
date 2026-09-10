import { NextResponse } from 'next/server';
import { ESCAPE_RULES_VERSION, escapeCategorySchema, escapeResultSchema, submitEscapeResult } from '@/lib/escape-ranking';
import { escapeRankingStore } from '@/lib/escape-ranking-store';
import { escapeRankingFailure, RANKING_HEADERS } from '@/lib/escape-ranking-response';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { isSameOriginMutation } from '@/lib/request-origin';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const category = escapeCategorySchema.safeParse({ mode: query.get('mode') ?? 'infinito', difficulty: query.get('difficulty') ?? 'facil' });
  if (!category.success) return NextResponse.json({ error: 'Categoría no válida.', code: 'INVALID_CATEGORY' }, { status: 400, headers: RANKING_HEADERS });
  try {
    const top = await escapeRankingStore().top(category.data, ESCAPE_RULES_VERSION);
    return NextResponse.json({ top, ...category.data, rulesVersion: ESCAPE_RULES_VERSION }, { headers: RANKING_HEADERS });
  } catch (error) { return escapeRankingFailure(error); }
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Origen no autorizado.' }, { status: 403, headers: RANKING_HEADERS });
  const limit = rateLimit(`escape-result:${getClientIp(request)}`, { max: 20, windowMs: 60_000 });
  if (!limit.allowed) return NextResponse.json({ error: 'Espera un momento antes de volver a publicar.', code: 'RATE_LIMITED' }, { status: 429, headers: { ...RANKING_HEADERS, 'Retry-After': String(Math.ceil(limit.resetMs / 1000)) } });
  const parsed = escapeResultSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Revisa el nombre y los datos de la partida.', code: 'INVALID_RESULT' }, { status: 400, headers: RANKING_HEADERS });
  try {
    return NextResponse.json(await submitEscapeResult(parsed.data, escapeRankingStore()), { headers: RANKING_HEADERS });
  } catch (error) { return escapeRankingFailure(error); }
}
