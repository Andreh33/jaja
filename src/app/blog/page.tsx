import type { Metadata } from 'next';
import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import { SignatureMarquee, Marquee } from '@/components/effects/Marquee';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Reveal } from '@/components/effects/Reveal';
import GradientText from '@/components/effects/GradientText';
import BlogFilter from '@/components/shared/BlogFilter';
import { getPostSummaries } from '@/lib/posts';

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
  const categories = Array.from(new Set(posts.map((p) => p.category).filter(Boolean) as string[]));

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

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6">
            <BlogFilter posts={posts} categories={categories} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
