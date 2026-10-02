import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowUpRight, MapPin, Briefcase } from 'lucide-react';
import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Reveal, RevealGroup, RevealItem } from '@/components/effects/Reveal';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { breadcrumbJsonLd } from '@/lib/seo';
import { channelNumber, tvProjects } from '@/lib/tv-channels';

export const metadata: Metadata = {
  title: 'Proyectos: diseño y desarrollo a medida',
  description:
    'Explora una selección de webs, tiendas y conceptos de Latech. Diseño y desarrollo para comercio, restauración, industria y servicios.',
  alternates: {
    canonical: '/proyectos',
  },
};

import { projects as PROJECTS } from '@/lib/projects';

export default function ProyectosPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Selección de proyectos de Latech',
          numberOfItems: PROJECTS.length,
          itemListElement: PROJECTS.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p.name,
            url: p.url,
          })),
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Proyectos', path: '/proyectos' },
        ])}
      />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="relative min-h-screen overflow-x-hidden" style={{ background: 'var(--bg-base)' }}>
        <AuroraBackground />
        <MouseGlow />

        {/* === Header === */}
        <section className="relative px-6 pt-36 pb-12 md:px-10 md:pt-44 md:pb-16">
          <div className="mx-auto max-w-5xl">
            <Breadcrumbs
              items={[
                { name: 'Inicio', path: '/' },
                { name: 'Proyectos', path: '/proyectos' },
              ]}
            />
            <Reveal>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                Cómo trabajamos
              </p>
              <h1
                className="font-display text-4xl text-white md:text-6xl"
                style={{ letterSpacing: '-0.04em', fontWeight: 800 }}
              >
                Proyectos con identidad propia
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
                Cada proyecto que hacemos lo cuidamos como si fuera nuestro. Explora esta selección
                de trabajos y conceptos para conocer sus funciones y su dirección visual.
                Las fichas de concepto se identifican expresamente.
              </p>
            </Reveal>
          </div>
        </section>

        {/* === Grid === */}
        <section className="relative px-6 pb-24 md:px-10 md:pb-32">
          <div className="mx-auto max-w-7xl">
            <RevealGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {PROJECTS.map((p) => (
                <RevealItem key={p.id}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visitar ${p.domain} en una pestaña nueva`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl glass transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    {/* Preview imagen */}
                    <div
                      className="relative aspect-[16/10] w-full overflow-hidden border-b"
                      style={{ borderColor: 'var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}
                    >
                      <Image
                        src={p.image}
                        alt={`Captura de la web ${p.domain}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                      <span
                        className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ background: 'rgba(3,9,20,0.75)', backdropFilter: 'blur(10px)' }}
                      >
                        Ver web <ArrowUpRight size={11} />
                      </span>
                    </div>

                    {/* Contenido */}
                    <div className="flex flex-1 flex-col p-6">
                      <h2
                        className="font-display text-xl text-white"
                        style={{ letterSpacing: '-0.02em', fontWeight: 700 }}
                      >
                        {p.name}
                      </h2>
                        {p.id === 'maison-noir' && <span className="mt-2 inline-flex rounded-full border border-purple-300/30 px-2.5 py-1 text-[11px] font-medium text-purple-200">Concepto de diseño</span>}
                      <p className="mt-1 font-mono text-[11px] text-white/40">{p.domain}</p>
                      {p.services && <p className="mt-3 text-[11px] leading-relaxed text-sky-200">{p.services.join(' · ')}</p>}
                      {p.services && tvProjects.some(project => project.id === p.id) && <p className="mt-2 font-mono text-[10px] text-white/55">CH {channelNumber(p.id)} · LATECH TV</p>}

                      <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-white/55">
                        <span className="inline-flex items-center gap-1.5">
                          <Briefcase size={11} className="text-white/40" />
                          {p.sector}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={11} className="text-white/40" />
                          {p.location}
                        </span>
                      </div>

                      <p className="mt-4 flex-1 text-sm leading-relaxed text-white/70">
                        {p.description}
                      </p>

                      <span
                        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-white/85 transition-colors group-hover:text-white"
                        style={{ color: 'var(--accent-calc)' }}
                      >
                        Visitar {p.domain}
                        <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </a>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
