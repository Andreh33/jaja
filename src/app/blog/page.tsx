import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { SignatureMarquee } from '@/components/effects/Marquee';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import GradientText from '@/components/effects/GradientText';
import BlogLibrary from '@/components/blog/BlogLibrary';
import { getPostSummaries } from '@/lib/posts';
import { uniqueCategories } from '@/lib/blog-categories';
import { blogHref, paginateBlog, readBlogSearch, type BlogSearchParams } from '@/lib/blog-library';

type Props = { searchParams: Promise<BlogSearchParams> };
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { query, page } = readBlogSearch(await searchParams);
  return {
    title: `${query ? `Buscar «${query}» en el blog` : 'Blog de diseño web, tiendas online y agentes de IA'}${page > 1 ? ` · Página ${page}` : ''}`,
    description: 'Guías prácticas sobre diseño web, e-commerce, SEO y agentes de IA para pymes. Encuentra respuestas por tema y por lo que necesita tu negocio.',
    alternates: { canonical: blogHref('/blog', query, page) },
    ...(query ? { robots: { index: false, follow: true } } : {}),
  };
}
export default async function BlogPage({ searchParams }: Props) {
  const [{ query, page }, posts] = await Promise.all([searchParams.then(readBlogSearch), getPostSummaries()]);
  const result = paginateBlog(posts, query, page);
  if (result.outOfRange) notFound();
  return <><SignatureMarquee /><Navbar /><AuroraBackground intensity="subtle" /><main id="main-content" tabIndex={-1} className="relative z-10"><section className="pt-36 pb-10 md:pt-44 md:pb-14"><div className="mx-auto max-w-7xl px-6"><p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-purple-200">La biblioteca de Latech</p><h1 className="font-display text-balance text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">Ideas, guías y<br /><GradientText as="span">conocimiento técnico.</GradientText></h1><p className="mt-6 max-w-2xl text-base leading-relaxed text-white/65">Respuestas para crear tu web, vender online y automatizar tu negocio. Busca una duda concreta o explora las guías por tema.</p><Link href="/briefing" className="mt-5 inline-flex min-h-11 items-center rounded-full border border-purple-300/30 px-5 py-2 text-sm font-medium text-purple-200 outline-none hover:bg-purple-300/10 focus-visible:ring-2 focus-visible:ring-purple-300">Preparar el briefing de mi proyecto →</Link></div></section><section aria-label="Biblioteca de artículos" className="pb-28"><div className="mx-auto max-w-7xl px-6"><BlogLibrary result={result} categories={uniqueCategories(posts)} query={query} /></div></section></main><Footer /></>;
}
