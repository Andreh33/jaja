import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, ArrowLeft, MessageCircle, ArrowRight } from 'lucide-react';
import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import { SignatureMarquee } from '@/components/effects/Marquee';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MagneticButton from '@/components/effects/MagneticButton';
import BlogCard from '@/components/shared/BlogCard';
import { Reveal } from '@/components/effects/Reveal';
import { getAllPosts, getPostBySlug } from '@/lib/posts';
import { renderMarkdown } from '@/lib/markdown';
import { formatDate } from '@/lib/utils';
import { whatsappLink } from '@/lib/stripe-links';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const CATEGORY_COLORS: Record<string, string> = {
  'Diseño Web': 'var(--accent-web)',
  'Tiendas Online': 'var(--accent-shop)',
  'IA': 'var(--accent-ia)',
  'SEO': 'var(--purple-300)',
  'Tutoriales': 'var(--warning)',
};

const SITE_URL = 'https://serviciosonlineweb.com';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Post no encontrado' };
  const url = `${SITE_URL}/blog/${post.slug}`;
  const image = post.cover ? `${SITE_URL}${post.cover}` : `${SITE_URL}/og/post-1.svg`;
  return {
    title: `${post.title} · Latech`,
    description: post.excerpt || undefined,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.excerpt || undefined,
      siteName: 'Latech',
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      authors: post.author ? [post.author] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || undefined,
      images: [image],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const all = await getAllPosts();
  const related = all.filter((p) => p.id !== post.id).slice(0, 3);
  const html = renderMarkdown(post.content);
  const color = (post.category && CATEGORY_COLORS[post.category]) || 'var(--purple-300)';

  const articleUrl = `${SITE_URL}/blog/${post.slug}`;
  const articleImage = post.cover ? `${SITE_URL}${post.cover}` : `${SITE_URL}/og/post-1.svg`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || undefined,
    image: [articleImage],
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    dateModified: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    author: { '@type': 'Organization', name: post.author || 'Equipo Latech' },
    publisher: {
      '@type': 'Organization',
      name: 'Latech',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.svg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
    articleSection: post.category || undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <SignatureMarquee />
      <Navbar />
      <AuroraBackground intensity="subtle" />
      <MouseGlow />
      <main className="relative z-10">
        <article className="pt-44 pb-16">
          <div className="mx-auto max-w-3xl px-6">
            <Reveal>
              <Link href="/blog" className="inline-flex items-center gap-2 text-xs text-white/55 transition-colors hover:text-white">
                <ArrowLeft size={12} /> Todos los artículos
              </Link>
              {post.category && (
                <span
                  className="ml-3 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
                >
                  {post.category}
                </span>
              )}
              <h1 className="mt-7 font-display text-balance text-4xl md:text-6xl" style={{ letterSpacing: '-0.04em', fontWeight: 800, lineHeight: 1.05 }}>
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="mt-6 text-lg leading-relaxed text-white/65">{post.excerpt}</p>
              )}
              <div className="mt-8 flex items-center gap-4 border-y py-5 text-sm text-white/55" style={{ borderColor: 'var(--border-subtle)' }}>
                <span>{post.author}</span>
                <span className="text-white/20">·</span>
                <span>{post.publishedAt ? formatDate(post.publishedAt) : ''}</span>
                <span className="text-white/20">·</span>
                <span className="inline-flex items-center gap-1"><Clock size={12} /> {post.readingMinutes} min</span>
              </div>
            </Reveal>
          </div>
        </article>

        <section className="pb-16">
          <div className="mx-auto max-w-3xl px-6">
            <div className="prose-latech" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-3xl px-6">
            <div className="rounded-3xl glass p-7 md:p-10">
              <h3 className="font-display text-2xl text-white">¿Quieres aplicar esto a tu negocio?</h3>
              <p className="mt-3 text-sm text-white/65">
                En Latech construimos webs, tiendas online y agentes de IA con la mejor base técnica.
                Sin permanencia, en 24-48h.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <MagneticButton href="/tienda">
                  Ver planes <ArrowRight size={14} />
                </MagneticButton>
                <MagneticButton href={whatsappLink('Hola, leí vuestro blog y me gustaría hablar')} target="_blank" rel="noreferrer" variant="secondary">
                  <MessageCircle size={14} /> Hablar
                </MagneticButton>
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="py-16">
            <div className="mx-auto max-w-7xl px-6">
              <Reveal>
                <h3 className="mb-8 font-display text-3xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
                  Sigue leyendo
                </h3>
              </Reveal>
              <div className="grid gap-6 md:grid-cols-3">
                {related.map((p) => <BlogCard key={p.id} post={p} />)}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
