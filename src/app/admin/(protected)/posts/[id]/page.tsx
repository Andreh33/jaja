import { db } from '@/lib/db';
import { posts } from '../../../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import PostEditor from '@/components/admin/PostEditor';

export const dynamic = 'force-dynamic';

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (r.length === 0) notFound();
  const p = r[0];
  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <h1 className="font-display text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
        Editar post
      </h1>
      <p className="mt-2 text-sm text-white/55">{p.title}</p>
      <div className="mt-8">
        <PostEditor initial={{
          id: p.id,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          content: p.content,
          category: p.category,
          cover: p.cover,
          readingMinutes: p.readingMinutes,
          published: p.published,
        }} />
      </div>
    </div>
  );
}
