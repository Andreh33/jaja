'use client';

import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import TiltCard from '../effects/TiltCard';
import type { Post } from '../../../drizzle/schema';
import { formatDate } from '@/lib/utils';

const CATEGORY_COLORS: Record<string, string> = {
  'Diseño Web': 'var(--accent-web)',
  'Tiendas Online': 'var(--accent-shop)',
  'IA': 'var(--accent-ia)',
  'SEO': 'var(--purple-300)',
  'Tutoriales': 'var(--warning)',
};

export default function BlogCard({ post }: { post: Post }) {
  const color = (post.category && CATEGORY_COLORS[post.category]) || 'var(--purple-300)';
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <TiltCard max={5} className="h-full">
        <article className="h-full overflow-hidden rounded-3xl glass transition-all duration-300 group-hover:-translate-y-1">
          <div className="relative aspect-[16/10] overflow-hidden">
            {post.cover ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.cover}
                  alt={post.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="pointer-events-none absolute inset-0 transition-opacity duration-300 group-hover:opacity-50"
                  style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(7,5,14,0.45))', opacity: 0.7 }}
                />
              </>
            ) : (
              <>
                <div
                  className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${color}40, transparent 60%), radial-gradient(circle at 70% 70%, var(--purple-glow), transparent 60%), var(--bg-elevated)`,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-15">
                  <span className="font-display text-9xl text-white">{post.title.charAt(0)}</span>
                </div>
              </>
            )}
            {post.category && (
              <span
                className="absolute left-4 top-4 z-10 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest"
                style={{ background: `${color}25`, color, border: `1px solid ${color}50`, backdropFilter: 'blur(10px)' }}
              >
                {post.category}
              </span>
            )}
          </div>
          <div className="p-6">
            <h3 className="font-display text-xl text-white transition-colors group-hover:text-white" style={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/55">{post.excerpt}</p>
            )}
            <div className="mt-5 flex items-center justify-between text-xs text-white/40">
              <span>{post.author} · {post.publishedAt ? formatDate(post.publishedAt) : ''}</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={11} /> {post.readingMinutes} min
              </span>
            </div>
            <div className="mt-5 inline-flex items-center gap-1 text-xs font-semibold transition-colors" style={{ color }}>
              Leer artículo <ArrowRight size={11} />
            </div>
          </div>
        </article>
      </TiltCard>
    </Link>
  );
}
