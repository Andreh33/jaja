import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { archivos } from '../../../../../drizzle/schema';
import { del } from '@vercel/blob';

function categoryFor(mime: string, hint?: string): 'logo' | 'foto' | 'video' | 'documento' | 'otro' {
  if (hint === 'logo' || hint === 'foto' || hint === 'video' || hint === 'documento' || hint === 'otro') return hint;
  if (mime.startsWith('image/')) return 'foto';
  if (mime.startsWith('video/')) return 'video';
  if (mime === 'application/pdf' || mime.includes('word')) return 'documento';
  return 'otro';
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const userId = session.user.id;

    const body = (await req.json()) as {
      url?: string;
      pathname?: string;
      filename?: string;
      mimeType?: string;
      size?: number;
      category?: string;
    };

    if (!body.url || !body.filename) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    if (!body.url.includes('.public.blob.vercel-storage.com/') && !body.url.includes('.blob.vercel-storage.com/')) {
      return NextResponse.json({ error: 'URL no válida' }, { status: 400 });
    }

    const mime = body.mimeType || 'application/octet-stream';
    const cat = categoryFor(mime, body.category);
    const id = crypto.randomUUID();

    try {
      await db.insert(archivos).values({
        id,
        userId,
        filename: body.filename,
        storedAs: body.pathname || body.url,
        mimeType: mime,
        size: body.size || 0,
        category: cat,
        url: body.url,
      });
    } catch (err) {
      console.error('[register] db insert failed', err);
      try { await del(body.url); } catch {}
      return NextResponse.json({ error: 'Error al registrar archivo' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error('[register] error', err);
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
