import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import { SignatureMarquee } from '@/components/effects/Marquee';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BlogCard from '@/components/shared/BlogCard';
import BlogCategoryPills from '@/components/shared/BlogCategoryPills';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { getPostSummaries } from '@/lib/posts';
import {
  CATEGORY_DESCRIPTIONS,
  categoryFromSlug,
  categorySlug,
  uniqueCategories,
} from '@/lib/blog-categories';
import { SITE_URL, breadcrumbJsonLd, truncateDescription } from '@/lib/seo';

// ISR: el listado cambia solo cuando se publica un post.
export const revalidate = 900;

// Hubs de categoría SSG en build; categorías nuevas entran vía ISR.
export async function generateStaticParams() {
  try {
    const posts = await getPostSummaries();
    return uniqueCategories(posts).map((c) => ({ categoria: categorySlug(c) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>;
}): Promise<Metadata> {
  const { categoria } = await params;
  const posts = await getPostSummaries();
  const category = categoryFromSlug(posts, categoria);
  if (!category) return { title: 'Categoría no encontrada' };
  const url = `${SITE_URL}/blog/categoria/${categoria}`;
  const description = truncateDescription(
    CATEGORY_DESCRIPTIONS[category] ?? `Artículos y guías de ${category} para pymes y negocios de España.`,
  );
  return {
    title: `${category}: guías y artículos del blog`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${category} · Blog de Latech`,
      description,
      url,
      siteName: 'Latech',
      locale: 'es_ES',
      type: 'website',
    },
  };
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const posts = await getPostSummaries();
  const category = categoryFromSlug(posts, categoria);
  if (!category) notFound();

  const categories = uniqueCategories(posts);
  const filtered = posts.filter((p) => p.category === category);
  const description =
    CATEGORY_DESCRIPTIONS[category] ?? `Artículos y guías de ${category} para pymes y negocios de España.`;
  const breadcrumb = [
    { name: 'Inicio', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: category, path: `/blog/categoria/${categoria}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(breadcrumb)} />
      <SignatureMarquee />
      <Navbar />
      <AuroraBackground intensity="subtle" />
      <MouseGlow />
      <main className="relative z-10">
        <section className="pt-44 pb-12">
          <div className="mx-auto max-w-7xl px-6">
            <Breadcrumbs items={breadcrumb} />
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Blog · {filtered.length} artículos
            </p>
            <h1
              className="font-display text-balance text-4xl md:text-6xl"
              style={{ letterSpacing: '-0.04em', fontWeight: 800 }}
            >
              {category}
            </h1>
            <p className="mt-6 max-w-2xl text-base text-white/65">{description}</p>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-7xl px-6">
            <BlogCategoryPills categories={categories} active={category} />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
