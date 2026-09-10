import { NextResponse } from 'next/server';
import { EscapeRankingError } from './escape-ranking';

export const RANKING_HEADERS = { 'Cache-Control': 'no-store' };
export function escapeRankingFailure(error: unknown) {
  if (error instanceof EscapeRankingError) {
    return NextResponse.json({ code: error.code, error: error.message }, { status: error.status, headers: RANKING_HEADERS });
  }
  // SQL/connection errors can contain credentials. Never log raw exceptions.
  console.error('[escape-ranking] Storage operation unavailable');
  return NextResponse.json({ code: 'RANKING_UNAVAILABLE', error: 'El ranking no está disponible ahora. Tu récord local se conserva; puedes volver a intentarlo.' }, { status: 503, headers: RANKING_HEADERS });
}
