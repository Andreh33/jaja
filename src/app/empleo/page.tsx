import type { Metadata } from 'next';
import { sql } from 'drizzle-orm';
import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Reveal, RevealGroup, RevealItem } from '@/components/effects/Reveal';
import { db } from '@/lib/db';
import { jobOffers } from '../../../drizzle/schema';
import { inArray } from 'drizzle-orm';
import JobCard from './_components/JobCard';
import ApplicationForm from './_components/ApplicationForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Ofertas de empleo · Trabaja con nosotros',
  description:
    'Posiciones abiertas en Latech. Si encajas con nuestra forma de trabajar, escríbenos —también valoramos candidaturas espontáneas.',
  alternates: { canonical: '/empleo' },
};

export default async function EmpleoPage() {
  const offers = await db
    .select()
    .from(jobOffers)
    .where(inArray(jobOffers.status, ['publicada', 'cerrada']))
    .orderBy(sql`${jobOffers.publishedAt} IS NULL, ${jobOffers.publishedAt} DESC`);

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-x-hidden" style={{ background: 'var(--bg-base)' }}>
        <AuroraBackground />
        <MouseGlow />

        {/* === Hero === */}
        <section className="relative px-6 pt-28 pb-8 md:px-10 md:pt-44 md:pb-12">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                Trabaja con nosotros
              </p>
              <h1
                className="font-display text-3xl text-white md:text-5xl lg:text-6xl"
                style={{ letterSpacing: '-0.04em', fontWeight: 800 }}
              >
                Ofertas de empleo
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65">
                Trabajamos con un equipo pequeño, técnico y cercano. Si te interesa lo que hacemos,
                échale un ojo a nuestras posiciones abiertas o escríbenos directamente.
              </p>
            </Reveal>
          </div>
        </section>

        {/* === Listado o estado vacío === */}
        <section className="relative px-6 pb-12 md:px-10 md:pb-16">
          <div className="mx-auto max-w-7xl">
            {offers.length === 0 ? (
              <Reveal>
                <div
                  className="rounded-2xl border border-dashed p-8 text-center md:p-12"
                  style={{ borderColor: 'var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}
                >
                  <h2
                    className="font-display text-2xl text-white md:text-3xl"
                    style={{ letterSpacing: '-0.02em', fontWeight: 700 }}
                  >
                    No hay ofertas publicadas ahora mismo
                  </h2>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/65">
                    Pero escríbenos por si surge algo que encaje contigo. Las candidaturas
                    espontáneas también las leemos.
                  </p>
                </div>
              </Reveal>
            ) : (
              <RevealGroup className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {offers.map((offer) => (
                  <RevealItem key={offer.id}>
                    <JobCard offer={offer} />
                  </RevealItem>
                ))}
              </RevealGroup>
            )}
          </div>
        </section>

        {/* === Form espontáneo === */}
        <section className="relative px-6 pb-24 md:px-10 md:pb-32">
          <div className="mx-auto max-w-3xl">
            <div
              className="rounded-2xl glass p-6 md:p-10"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <h2
                className="font-display text-2xl text-white md:text-3xl"
                style={{ letterSpacing: '-0.02em', fontWeight: 700 }}
              >
                {offers.length === 0
                  ? 'Mándanos tu candidatura'
                  : '¿No encajas en ninguna pero quieres trabajar con nosotros?'}
              </h2>
              <p className="mt-2 text-sm text-white/65">
                Cuéntanos quién eres y por qué te interesa. Si surge algo que cuadre, te escribimos.
              </p>
              <div className="mt-6">
                <ApplicationForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
