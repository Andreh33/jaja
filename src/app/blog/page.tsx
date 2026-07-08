import type { Metadata } from 'next';
import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import { SignatureMarquee, Marquee } from '@/components/effects/Marquee';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Reveal } from '@/components/effects/Reveal';
import GradientText from '@/components/effects/GradientText';
import BlogCard from '@/components/shared/BlogCard';
import BlogCategoryPills from '@/components/shared/BlogCategoryPills';
import { getPostSummaries } from '@/lib/posts';
import { uniqueCategories } from '@/lib/blog-categories';

export const metadata: Metadata = {
  title: 'Blog de diseño web, tiendas online y agentes de IA',
  description:
    'Guías prácticas sobre diseño web, e-commerce, SEO local y agentes de IA para pymes: qué contratar, cuánto cuesta y cómo sacarle rendimiento a tu web.',
  alternates: { canonical: '/blog' },
};

// ISR: el listado cambia solo cuando se publica un post.
export const revalidate = 900;

export default async function BlogPage() {
  const posts = await getPostSummaries();
  const categories = uniqueCategories(posts);

  return (
    <>
      <SignatureMarquee />
      <Navbar />
      <AuroraBackground />
      <MouseGlow />
      <main className="relative z-10">
        <section className="pt-44 pb-16">
          <div className="mx-auto max-w-7xl px-6">
            <Reveal>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Blog</p>
              <h1 className="font-display text-balance text-5xl md:text-7xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
                Ideas, guías y<br />
                <GradientText as="span">conocimiento técnico.</GradientText>
              </h1>
              <p className="mt-7 max-w-2xl text-base text-white/65">
                Sobre diseño web, e-commerce, agentes de IA, SEO local y todo lo que toca a la tecnología
                aplicada al negocio.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="py-8">
          <div className="border-y" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)' }}>
            <div className="py-5">
              <Marquee speed={40}>
                {posts.slice(0, 6).map((p) => (
                  <span key={p.id} className="flex items-center gap-8 pl-8 font-mono text-sm text-white/35">
                    ÚLTIMOS POSTS · {p.title.toUpperCase()}
                    <span className="inline-block h-1 w-1 rounded-full bg-white/15" />
                  </span>
                ))}
              </Marquee>
            </div>
          </div>
        </section>

        {/* Listado server-rendered con enlaces reales: las píldoras de
            categoría son <a> a los hubs /blog/categoria/* y las tarjetas
            llegan visibles en el HTML inicial (antes: filtro client-side
            con framer-motion que servía el grid con opacity 0). */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6">
            <BlogCategoryPills categories={categories} />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
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
