import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { remoteRequestSchema } from '@/lib/tv-remote-protocol';
import { createTvRemoteService, RemoteError } from '@/lib/tv-remote-service';
import { tvDeviceInfo, tvIpHash } from '@/lib/tv-device-info';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
export const runtime = 'nodejs';
const execute = createTvRemoteService(db);
const headers = { 'Cache-Control': 'no-store, private', 'X-Robots-Tag': 'noindex, nofollow', 'X-Content-Type-Options': 'nosniff' };
export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin');
    // Next's Node adapter can normalize request.url to localhost in development.
    // Host is the actual authority sent by the browser (not a client-supplied URL field).
    const expectedOrigin = new URL(request.url);
    expectedOrigin.host = request.headers.get('host') || expectedOrigin.host;
    if (!origin || origin !== expectedOrigin.origin || request.headers.get('sec-fetch-site') === 'cross-site') return Response.json({ error: 'Origen no permitido.' }, { status: 403, headers });
    if (!request.headers.get('content-type')?.startsWith('application/json')) return Response.json({ error: 'Formato no válido.' }, { status: 415, headers });
    if (!rateLimit(`tv-remote:${getClientIp(request)}`, { max: 180, windowMs: 60_000 }).allowed) return Response.json({ error: 'Demasiadas señales. Espera un momento.' }, { status: 429, headers });
    const reader = request.body?.getReader();
    if (!reader) return Response.json({ error: 'Falta la orden.' }, { status: 400, headers });
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const { value, done } = await reader.read(); if (done) break; size += value.length; if (size > 2048) { await reader.cancel(); return Response.json({ error: 'Orden demasiado grande.' }, { status: 413, headers }); } chunks.push(value); }
    let input: unknown;
    try { input = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return Response.json({ error: 'Orden no válida.' }, { status: 400, headers }); }
    const parsed = remoteRequestSchema.safeParse(input);
    if (!parsed.success) return Response.json({ error: 'Orden no válida.' }, { status: 400, headers });
    const session = parsed.data.action === 'join' ? await auth() : null;
    const result = await execute(parsed.data, { token: request.headers.get('authorization')?.replace(/^Bearer /, ''), ipHash: tvIpHash(request.headers), info: tvDeviceInfo(request.headers),
      user: session?.user?.id ? { id: session.user.id, name: session.user.name || 'Cliente con sesión iniciada' } : undefined });
    return Response.json(result, { headers });
  } catch (error) {
    if (error instanceof RemoteError) return Response.json({ error: error.message }, { status: error.status, headers });
    console.error('[tv-remote] Service unavailable');
    return Response.json({ error: 'El mando no está disponible ahora. Puedes seguir explorando desde la televisión.' }, { status: 503, headers });
  }
}
