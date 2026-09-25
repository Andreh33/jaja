import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { SignatureMarquee } from '@/components/effects/Marquee';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BlogLibrary from '@/components/blog/BlogLibrary';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { getPostSummaries } from '@/lib/posts';
import { CATEGORY_DESCRIPTIONS, categoryFromSlug, uniqueCategories } from '@/lib/blog-categories';
import { blogHref, paginateBlog, readBlogSearch, type BlogSearchParams } from '@/lib/blog-library';
import { breadcrumbJsonLd } from '@/lib/seo';

type Props = { params: Promise<{ categoria: string }>; searchParams: Promise<BlogSearchParams> };
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ categoria }, search, posts] = await Promise.all([params, searchParams, getPostSummaries()]);
  const category = categoryFromSlug(posts, categoria);
  if (!category) return { title: 'Categoría no encontrada', robots: { index: false } };
  const { query, page } = readBlogSearch(search);
  return { title: `${category}: guías y artículos${page > 1 ? ` · Página ${page}` : ''}`, description: CATEGORY_DESCRIPTIONS[category] || `Guías de ${category} para empresas.`, alternates: { canonical: blogHref(`/blog/categoria/${categoria}`, query, page) }, ...(query ? { robots: { index: false, follow: true } } : {}) };
}
export default async function BlogCategoryPage({ params, searchParams }: Props) {
  const [{ categoria }, search, posts] = await Promise.all([params, searchParams, getPostSummaries()]);
  const category = categoryFromSlug(posts, categoria);
  if (!category) notFound();
  const { query, page } = readBlogSearch(search); const result = paginateBlog(posts, query, page, category);
  if (result.outOfRange) notFound();
  const path = `/blog/categoria/${categoria}`;
  const breadcrumbs = [{ name: 'Inicio', path: '/' }, { name: 'Blog', path: '/blog' }, { name: category, path }];
  return <><JsonLd data={breadcrumbJsonLd(breadcrumbs)} /><SignatureMarquee /><Navbar /><AuroraBackground intensity="subtle" /><main id="main-content" tabIndex={-1} className="relative z-10"><section className="pt-36 pb-10 md:pt-44 md:pb-14"><div className="mx-auto max-w-7xl px-6"><Breadcrumbs items={breadcrumbs} /><p className="mt-5 mb-4 text-xs font-semibold uppercase tracking-[.2em] text-purple-200">Biblioteca · {category}</p><h1 className="font-display text-4xl font-extrabold tracking-tight md:text-6xl">{category}</h1><p className="mt-6 max-w-2xl text-base leading-relaxed text-white/65">{CATEGORY_DESCRIPTIONS[category] || `Artículos y guías de ${category} para tu negocio.`}</p></div></section><section aria-label={`Artículos de ${category}`} className="pb-28"><div className="mx-auto max-w-7xl px-6"><BlogLibrary result={result} categories={uniqueCategories(posts)} query={query} category={category} basePath={path} /></div></section></main><Footer /></>;
}
