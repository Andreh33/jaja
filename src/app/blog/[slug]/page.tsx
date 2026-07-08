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
import { getPostSummaries, getPostBySlug } from '@/lib/posts';
import { renderMarkdown } from '@/lib/markdown';
import { formatDate } from '@/lib/utils';
import { whatsappLink } from '@/lib/stripe-links';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { breadcrumbJsonLd, truncateDescription, ORG_REF } from '@/lib/seo';
import { categorySlug } from '@/lib/blog-categories';

// ISR: el contenido editorial cambia poco; evita golpear la DB en cada visita.
export const revalidate = 900;

// SSG de los posts en build: TTFB de edge para Googlebot en vez de cold-start
// serverless en el primer rastreo. Los posts nuevos (no listados aquí) siguen
// funcionando vía ISR (dynamicParams por defecto).
export async function generateStaticParams() {
  try {
    const posts = await getPostSummaries();
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

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
  const description = post.excerpt ? truncateDescription(post.excerpt) : undefined;
  // La imagen OG (PNG 1200x630) la genera ./opengraph-image.tsx: los ficheros
  // de metadata tienen prioridad sobre `openGraph.images`, y los SVG de /og
  // no los aceptan los crawlers sociales.
  return {
    // Sin "· Latech" manual: lo añade el template del layout raíz.
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description,
      siteName: 'Latech',
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      authors: post.author ? [post.author] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const all = await getPostSummaries();
  // Relacionados: prioriza la misma categoría (interlink del clúster temático).
  const related = all
    .filter((p) => p.id !== post.id)
    .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category))
    .slice(0, 3);
  const html = renderMarkdown(post.content);
  const color = (post.category && CATEGORY_COLORS[post.category]) || 'var(--purple-300)';

  const articleUrl = `${SITE_URL}/blog/${post.slug}`;
  // PNG dinámico (1200x630) generado por ./opengraph-image.tsx
  const articleImage = `${articleUrl}/opengraph-image`;
  const isTeamAuthor = !post.author || /equipo/i.test(post.author);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || undefined,
    image: [articleImage],
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    dateModified: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    // author/publisher referencian por @id el nodo Organization del @graph
    // del layout (con fundadores Person enlazados): una sola entidad para
    // Google/Bing/LLMs en vez de organizaciones sueltas por página.
    author: isTeamAuthor ? ORG_REF : { '@type': 'Person', name: post.author, url: `${SITE_URL}/sobre-nosotros` },
    publisher: ORG_REF,
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
            <Breadcrumbs
              items={[
                { name: 'Inicio', path: '/' },
                { name: 'Blog', path: '/blog' },
                { name: post.title, path: `/blog/${post.slug}` },
              ]}
            />
            <Reveal>
              <Link href="/blog" className="inline-flex items-center gap-2 text-xs text-white/55 transition-colors hover:text-white">
                <ArrowLeft size={12} /> Todos los artículos
              </Link>
              {post.category && (
                <Link
                  href={`/blog/categoria/${categorySlug(post.category)}`}
                  className="ml-3 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest transition-opacity hover:opacity-80"
                  style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
                >
                  {post.category}
                </Link>
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

        <section className="pb-4">
          <div className="mx-auto max-w-3xl px-6">
            <aside className="rounded-2xl glass p-6 md:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Sobre el autor</p>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                <strong className="text-white">{isTeamAuthor ? 'Equipo Latech' : post.author}</strong> — equipo de
                diseño y desarrollo web de Latech, fundado por Andrés Rubio y Luis Grondona en Puebla de la
                Calzada (Badajoz). Construimos webs, tiendas online y agentes de IA para empresas de toda España,
                con proyectos en producción como Zona Sport, Panelex o Toldos Noa.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs">
                <Link href="/sobre-nosotros" className="text-white/70 underline transition-colors hover:text-white">
                  Conoce al equipo
                </Link>
                <Link href="/proyectos" className="text-white/70 underline transition-colors hover:text-white">
                  Ver proyectos reales
                </Link>
              </div>
            </aside>
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
