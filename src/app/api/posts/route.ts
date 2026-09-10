import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { posts } from '../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { invalidatePostCache } from '@/lib/post-revalidation';
import { isSameOriginMutation } from '@/lib/request-origin';
import { postInputSchema } from '@/lib/post-validation';
import { writePost } from '@/lib/post-write';

async function save(req: Request, update: boolean) {
  if (!isSameOriginMutation(req)) return NextResponse.json({ error: 'Origen no autorizado' }, { status: 403 });
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const parsed = postInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Datos inválidos' }, { status: 400 });
  if (update && !parsed.data.id) return NextResponse.json({ error: 'Falta el identificador del artículo.' }, { status: 400 });
  try {
    const result = await writePost(db, parsed.data, update);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    invalidatePostCache(revalidatePath, result.previousSlug, result.slug);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'No se pudo guardar. Tu contenido sigue en el editor.' }, { status: 500 });
  }
}
export async function POST(req: Request) { return save(req, false); }
export async function PUT(req: Request) { return save(req, true); }

export async function DELETE(req: Request) {
  if (!isSameOriginMutation(req)) return NextResponse.json({ error: 'Origen no autorizado' }, { status: 403 });
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 });
  const [previous] = await db.select({ slug: posts.slug }).from(posts).where(eq(posts.id, id)).limit(1);
  if (!previous) return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 });
  await db.delete(posts).where(eq(posts.id, id));
  invalidatePostCache(revalidatePath, previous.slug);
  return NextResponse.json({ ok: true });
}
