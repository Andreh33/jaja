import { NextResponse } from 'next/server';
import archiver from 'archiver';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { archivos } from '../../../../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { Readable } from 'stream';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const files = await db.select().from(archivos).where(eq(archivos.userId, id));
  if (files.length === 0) return NextResponse.json({ error: 'Sin archivos' }, { status: 404 });

  const arch = archiver('zip', { zlib: { level: 9 } });

  (async () => {
    for (const f of files) {
      try {
        const res = await fetch(f.url);
        if (!res.ok || !res.body) continue;
        const nodeStream = Readable.fromWeb(res.body as unknown as import('stream/web').ReadableStream<Uint8Array>);
        arch.append(nodeStream, { name: `${f.category}/${f.filename}` });
      } catch (err) {
        console.warn('[zip] fetch failed for', f.url, err);
      }
    }
    arch.finalize();
  })();

  const stream = new ReadableStream({
    start(controller) {
      arch.on('data', (chunk) => controller.enqueue(chunk));
      arch.on('end', () => controller.close());
      arch.on('error', (err) => controller.error(err));
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="cliente-${id}.zip"`,
    },
  });
}
