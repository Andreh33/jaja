import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { arcadeRequestSchema } from '@/lib/arcade-protocol';
import { createArcadeService } from '@/lib/arcade-service';
import { RemoteError } from '@/lib/tv-remote-service';
import { tvDeviceInfo, tvIpHash } from '@/lib/tv-device-info';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { arcadeIceServers } from '@/lib/arcade-ice';
export const runtime = 'nodejs';
const execute = createArcadeService(db);
const headers = { 'Cache-Control': 'no-store, private', 'X-Robots-Tag': 'noindex, nofollow', 'X-Content-Type-Options': 'nosniff' };
export async function POST(request: Request) {
  try {
    const expected = new URL(request.url); expected.host = request.headers.get('host') || expected.host;
    if (request.headers.get('origin') !== expected.origin || request.headers.get('sec-fetch-site') === 'cross-site') return Response.json({ error: 'Origen no permitido.' }, { status: 403, headers });
    if (!request.headers.get('content-type')?.startsWith('application/json')) return Response.json({ error: 'Formato no válido.' }, { status: 415, headers });
    if (!rateLimit(`tv-arcade:${getClientIp(request)}`, { max: 420, windowMs: 60000 }).allowed) return Response.json({ error: 'Demasiadas señales.' }, { status: 429, headers });
    const reader = request.body?.getReader(); if (!reader) return Response.json({ error: 'Falta la orden.' }, { status: 400, headers });
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const { value, done } = await reader.read(); if (done) break; size += value.length; if (size > 18000) { await reader.cancel(); return Response.json({ error: 'Orden demasiado grande.' }, { status: 413, headers }); } chunks.push(value); }
    let input: unknown; try { input = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return Response.json({ error: 'Orden no válida.' }, { status: 400, headers }); }
    const parsed = arcadeRequestSchema.safeParse(input); if (!parsed.success) return Response.json({ error: 'Orden no válida.' }, { status: 400, headers });
    const userSession = parsed.data.action === 'join' ? await auth() : null;
    const result = await execute(parsed.data, { token: request.headers.get('authorization')?.replace(/^Bearer /, ''), ipHash: tvIpHash(request.headers), info: tvDeviceInfo(request.headers),
      user: userSession?.user?.id ? { id: userSession.user.id, name: userSession.user.name || 'Cliente' } : undefined });
    return Response.json({ ...result, iceServers: arcadeIceServers(result.id) }, { headers });
  } catch (error) {
    if (error instanceof RemoteError) return Response.json({ error: error.message }, { status: error.status, headers });
    console.error('[tv-arcade] Service unavailable');
    return Response.json({ error: 'La conexión de mandos no está disponible. El plataformas sigue disponible con teclado.' }, { status: 503, headers });
  }
}
