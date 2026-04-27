import { db } from '@/lib/db';
import { posts } from '../../../../../drizzle/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminPostsPage() {
  const all = await db.select().from(posts).orderBy(desc(posts.publishedAt));
  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
            Posts
          </h1>
          <p className="mt-2 text-sm text-white/55">Gestiona los artículos del blog.</p>
        </div>
        <Link href="/admin/posts/nuevo" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ background: 'var(--grad-signature)' }}>
          <Plus size={14} /> Nuevo post
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl glass">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-[10px] uppercase tracking-wider text-white/40" style={{ borderColor: 'var(--border-subtle)' }}>
              <th className="px-5 py-3.5">Título</th>
              <th className="px-5 py-3.5">Categoría</th>
              <th className="px-5 py-3.5">Estado</th>
              <th className="px-5 py-3.5">Publicado</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {all.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-white/5">
                <td className="px-5 py-4 text-white">{p.title}</td>
                <td className="px-5 py-4 text-white/65">{p.category || '—'}</td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: p.published ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)', color: p.published ? 'var(--accent-ia)' : 'var(--text-muted)' }}>
                    <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: p.published ? 'var(--accent-ia)' : 'var(--text-muted)' }} />
                    {p.published ? 'Publicado' : 'Borrador'}
                  </span>
                </td>
                <td className="px-5 py-4 text-white/65">{p.publishedAt ? formatDate(p.publishedAt) : '—'}</td>
                <td className="px-5 py-4 text-right">
                  <Link href={`/admin/posts/${p.id}`} className="text-xs text-white/65 hover:text-white link-underline">Editar →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
