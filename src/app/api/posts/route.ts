import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { posts } from '../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { slugify, readingTime } from '@/lib/utils';

const postSchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  title: z.string().min(2),
  excerpt: z.string().optional(),
  content: z.string().min(10),
  category: z.string().optional(),
  cover: z.string().optional(),
  readingMinutes: z.number().optional(),
  published: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const parsed = postSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  const d = parsed.data;
  const slug = d.slug || slugify(d.title);
  await db.insert(posts).values({
    slug,
    title: d.title,
    excerpt: d.excerpt || null,
    content: d.content,
    category: d.category || null,
    cover: d.cover || null,
    author: 'Equipo Latech',
    readingMinutes: d.readingMinutes || readingTime(d.content),
    published: d.published ?? true,
  });
  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const parsed = postSchema.safeParse(await req.json());
  if (!parsed.success || !parsed.data.id) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  const d = parsed.data;
  const slug = d.slug || slugify(d.title);
  await db.update(posts).set({
    slug,
    title: d.title,
    excerpt: d.excerpt || null,
    content: d.content,
    category: d.category || null,
    cover: d.cover || null,
    readingMinutes: d.readingMinutes || readingTime(d.content),
    published: d.published ?? true,
  }).where(eq(posts.id, d.id!));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 });
  await db.delete(posts).where(eq(posts.id, id));
  return NextResponse.json({ ok: true });
}
