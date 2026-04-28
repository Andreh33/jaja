import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { archivos } from '../../../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { del } from '@vercel/blob';

const MAX = 50 * 1024 * 1024;

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const list = await db.select().from(archivos).where(eq(archivos.userId, session.user.id)).orderBy(desc(archivos.uploadedAt));
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const userId = session.user.id;

    const body = (await req.json()) as HandleUploadBody;

    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          'image/*',
          'video/*',
          'application/pdf',
          'application/postscript',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/octet-stream',
        ],
        maximumSizeInBytes: MAX,
        addRandomSuffix: true,
        tokenPayload: JSON.stringify({ userId }),
      }),
      onUploadCompleted: async () => {
        // El registro en DB lo hace el cliente al terminar via /api/upload/register.
        // (En desarrollo local este callback no se ejecuta porque Vercel no puede
        //  alcanzar localhost — por eso registramos desde el cliente.)
      },
    });

    return NextResponse.json(json);
  } catch (err) {
    console.error('[upload] error', err);
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.json({ error: `Error en el servidor: ${message}` }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id } = await req.json();
  const found = await db.select().from(archivos).where(eq(archivos.id, id)).limit(1);
  if (found.length === 0 || found[0].userId !== session.user.id) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  }
  const f = found[0];
  try {
    await del(f.url);
  } catch (err) {
    console.warn('[upload] blob del failed', err);
  }
  await db.delete(archivos).where(eq(archivos.id, id));
  return NextResponse.json({ ok: true });
}
