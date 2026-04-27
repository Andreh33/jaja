import { NextResponse } from 'next/server';
import archiver from 'archiver';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { archivos } from '../../../../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import path from 'path';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const files = await db.select().from(archivos).where(eq(archivos.userId, id));
  if (files.length === 0) return NextResponse.json({ error: 'Sin archivos' }, { status: 404 });

  const stream = new ReadableStream({
    start(controller) {
      const arch = archiver('zip', { zlib: { level: 9 } });
      arch.on('data', (chunk) => controller.enqueue(chunk));
      arch.on('end', () => controller.close());
      arch.on('error', (err) => controller.error(err));

      for (const f of files) {
        const abs = path.join(process.cwd(), 'public', 'uploads', 'clientes', f.userId, f.storedAs);
        arch.file(abs, { name: `${f.category}/${f.filename}` });
      }
      arch.finalize();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="cliente-${id}.zip"`,
    },
  });
}
