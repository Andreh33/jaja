import Link from 'next/link';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import type { PostSummary } from '@/lib/posts';
import { categorySlug } from '@/lib/blog-categories';
import { blogHref, type paginateBlog } from '@/lib/blog-library';
import { formatDate } from '@/lib/utils';
import { isSafeContentUrl } from '@/lib/content-url';

export default function BlogLibrary({ result, categories, query, category, basePath = '/blog' }: {
  result: ReturnType<typeof paginateBlog>;
  categories: string[];
  query: string;
  category?: string;
  basePath?: string;
}) {
  const pills = [{ label: 'Todos', path: '/blog', active: !category }, ...categories.map(c => ({ label: c, path: `/blog/categoria/${categorySlug(c)}`, active: c === category }))];
  return <div id="articulos" className="scroll-mt-32">
    <form action={basePath} method="get" role="search" className="mb-8 max-w-2xl"><label htmlFor="blog-search" className="mb-3 block text-sm font-medium text-white/80">¿Sobre qué quieres aprender?</label><div className="flex gap-2"><div className="relative min-w-0 flex-1"><Search size={18} className="pointer-events-none absolute left-4 top-4 text-white/45" /><input id="blog-search" name="q" type="search" maxLength={120} defaultValue={query} placeholder="Prueba con diseño, reservas o SEO…" className="min-h-12 w-full rounded-xl border border-white/20 bg-white/[.03] py-3 pr-4 pl-11 text-base text-white outline-none placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-purple-300" /></div><button type="submit" className="min-h-12 rounded-xl border border-purple-400/50 bg-purple-400/15 px-4 text-sm font-semibold text-white outline-none hover:bg-purple-400/25 focus-visible:ring-2 focus-visible:ring-purple-300">Buscar</button></div></form>
    <nav aria-label="Categorías del blog" className="mb-8 flex flex-wrap gap-2">{pills.map(pill => <Link key={pill.path} href={blogHref(pill.path, query)} aria-current={pill.active ? 'page' : undefined} className={`inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-purple-300 ${pill.active ? 'border-purple-400/50 bg-purple-400/15 text-white' : 'border-white/10 text-white/65 hover:border-white/30 hover:text-white'}`}>{pill.label}</Link>)}</nav>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-white/65">{result.total} {result.total === 1 ? 'artículo' : 'artículos'}{query && <> para <strong className="break-words text-white">«{query}»</strong></>}{category && <> en {category}</>}</p>{query && <Link href={basePath} className="py-2 text-sm text-purple-200 underline underline-offset-4">Quitar búsqueda</Link>}</div>
    {result.posts.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{result.posts.map(post => <LibraryCard key={post.id} post={post} />)}</div> : <div className="rounded-2xl border border-white/15 px-6 py-12"><h2 className="font-display text-2xl font-bold text-white">No encontramos esa combinación.</h2><p className="mt-3 max-w-lg text-sm leading-relaxed text-white/65">Prueba con otro término o busca en todas las categorías. Tus filtros se conservan en la dirección de la página.</p><Link href={query ? blogHref('/blog', query) : '/blog'} className="mt-6 inline-flex min-h-11 items-center text-sm text-purple-200 underline underline-offset-4">Buscar en todo el blog</Link></div>}
    {result.pages > 1 && <nav aria-label="Páginas de artículos" className="mt-10 flex flex-wrap items-center justify-center gap-2">{result.page > 1 && <PageLink href={blogHref(basePath, query, result.page - 1)} label="Página anterior"><ArrowLeft size={16} /></PageLink>}{Array.from({ length: result.pages }, (_, i) => i + 1).map(page => <PageLink key={page} href={blogHref(basePath, query, page)} label={`Página ${page}`} current={page === result.page}>{page}</PageLink>)}{result.page < result.pages && <PageLink href={blogHref(basePath, query, result.page + 1)} label="Página siguiente"><ArrowRight size={16} /></PageLink>}</nav>}
  </div>;
}
function PageLink({ href, children, label, current }: { href: string; children: React.ReactNode; label: string; current?: boolean }) {
  return <Link href={href} aria-label={label} aria-current={current ? 'page' : undefined} className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-purple-300 ${current ? 'border-purple-400/60 bg-purple-400/20 text-white' : 'border-white/15 text-white/70 hover:bg-white/5'}`}>{children}</Link>;
}
function LibraryCard({ post }: { post: PostSummary }) {
  return <article className="overflow-hidden rounded-2xl border border-white/12 bg-white/[.025]"><Link href={`/blog/${post.slug}`} className="group flex h-full flex-col outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple-300">
    {post.cover && isSafeContentUrl(post.cover, true) && <div className="aspect-[16/9] overflow-hidden bg-white/5">{/* Editorial covers may use arbitrary approved HTTPS hosts; fixed dimensions reserve space. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={post.cover} alt="" width={640} height={360} loading="lazy" decoding="async" className="h-full w-full object-cover" /></div>}
    <div className="flex flex-1 flex-col p-6"><p className="text-xs font-semibold uppercase tracking-wider text-purple-200">{post.category}</p><h2 className="mt-3 font-display text-xl font-semibold leading-snug tracking-tight text-white group-hover:text-purple-100">{post.title}</h2>{post.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/65">{post.excerpt}</p>}<div className="mt-auto pt-6"><div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/50">{post.publishedAt && <time dateTime={new Date(post.publishedAt).toISOString()}>{formatDate(post.publishedAt)}</time>}{post.readingMinutes && <span>{post.readingMinutes} min de lectura</span>}</div><p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-purple-200">Leer artículo <ArrowRight size={14} /></p></div></div>
  </Link></article>;
}
