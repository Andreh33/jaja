import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  Users,
  AlertTriangle,
  GraduationCap,
  Languages,
  Sparkles,
} from 'lucide-react';
import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { db } from '@/lib/db';
import { jobOffers } from '../../../../drizzle/schema';
import ApplicationForm from '../_components/ApplicationForm';

export const dynamic = 'force-dynamic';

const ACCENT = 'var(--accent-calc)';

const CONTRACT_LABELS: Record<string, string> = {
  indefinido: 'Indefinido',
  temporal: 'Temporal',
  practicas: 'Prácticas',
  freelance: 'Freelance',
};
const SCHEDULE_LABELS: Record<string, string> = {
  completa: 'Jornada completa',
  parcial: 'Jornada parcial',
  flexible: 'Horario flexible',
};

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const rows = await db.select().from(jobOffers).where(eq(jobOffers.slug, slug)).limit(1);
  const offer = rows[0];
  if (!offer || offer.status === 'borrador') return { title: 'Oferta no encontrada' };
  return {
    title: `${offer.title} · Empleo en Latech`,
    description: offer.description.slice(0, 200),
    alternates: { canonical: `/empleo/${offer.slug}` },
  };
}

export default async function EmpleoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rows = await db.select().from(jobOffers).where(eq(jobOffers.slug, slug)).limit(1);
  const offer = rows[0];
  if (!offer || offer.status === 'borrador') notFound();

  const isClosed = offer.status === 'cerrada';
  const isOpen = offer.status === 'publicada';

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-x-hidden" style={{ background: 'var(--bg-base)' }}>
        <AuroraBackground />
        <MouseGlow />

        <section className="relative px-6 pt-28 pb-8 md:px-10 md:pt-44 md:pb-12">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/empleo"
              className="inline-flex items-center gap-2 text-xs text-white/55 transition-colors hover:text-white"
            >
              <ArrowLeft size={12} /> Todas las ofertas
            </Link>

            <h1
              className="mt-6 font-display text-3xl text-white md:text-5xl"
              style={{ letterSpacing: '-0.04em', fontWeight: 800 }}
            >
              {offer.title}
            </h1>

            <div className="mt-5 flex flex-wrap gap-2 text-[12px] text-white/70">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5">
                <MapPin size={12} className="text-white/45" />
                {offer.location}
              </span>
              {offer.contractType && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5">
                  <Briefcase size={12} className="text-white/45" />
                  {CONTRACT_LABELS[offer.contractType] ?? offer.contractType}
                </span>
              )}
              {offer.schedule && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5">
                  <Clock size={12} className="text-white/45" />
                  {SCHEDULE_LABELS[offer.schedule] ?? offer.schedule}
                </span>
              )}
            </div>

            {offer.salary && (
              <p className="mt-4 text-base text-white/85">
                <span className="text-white/45">Retribución:</span> {offer.salary}
              </p>
            )}

            {(offer.positionsCount ?? 1) > 1 && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/65">
                <Users size={13} className="text-white/45" />
                Buscamos {offer.positionsCount} personas para esta posición
              </p>
            )}

            {isClosed && (
              <div
                className="mt-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm"
                style={{ borderColor: 'rgba(234,179,8,0.4)', background: 'rgba(234,179,8,0.08)' }}
              >
                <AlertTriangle size={18} style={{ color: '#eab308', marginTop: 1 }} />
                <div>
                  <p className="font-medium text-white">Esta plaza ya está cubierta</p>
                  <p className="mt-1 text-white/65">
                    Si te interesa, échale un ojo a las demás ofertas o mándanos una candidatura
                    espontánea desde el listado.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="relative px-6 pb-12 md:px-10 md:pb-16">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl glass p-6 md:p-10" style={{ borderColor: 'var(--border-subtle)' }}>
              <h2
                className="font-display text-xl text-white md:text-2xl"
                style={{ letterSpacing: '-0.02em', fontWeight: 700 }}
              >
                Sobre la posición
              </h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/80 md:text-base">
                {offer.description}
              </p>

              {offer.experienceRequired && (
                <Block icon={GraduationCap} title="Experiencia requerida">
                  {offer.experienceRequired}
                </Block>
              )}
              {offer.languages && (
                <Block icon={Languages} title="Idiomas">
                  {offer.languages}
                </Block>
              )}
              {offer.extras && (
                <Block icon={Sparkles} title="Lo que ofrecemos">
                  {offer.extras}
                </Block>
              )}
            </div>
          </div>
        </section>

        {isOpen && (
          <section className="relative px-6 pb-24 md:px-10 md:pb-32">
            <div className="mx-auto max-w-3xl">
              <div className="rounded-2xl glass p-6 md:p-10" style={{ borderColor: `${ACCENT}30` }}>
                <h2
                  className="font-display text-2xl text-white md:text-3xl"
                  style={{ letterSpacing: '-0.02em', fontWeight: 700 }}
                >
                  Aplica a esta posición
                </h2>
                <p className="mt-2 text-sm text-white/65">
                  Rellena el formulario y sube tu CV. Si encajas con nosotros, te contactaremos
                  por WhatsApp o email.
                </p>
                <div className="mt-6">
                  <ApplicationForm
                    offer={{
                      id: offer.id,
                      title: offer.title,
                      slug: offer.slug,
                      requiresComputer: offer.requiresComputer as 'si' | 'no' | 'depende',
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

function Block({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 border-t pt-5" style={{ borderColor: 'var(--border-subtle)' }}>
      <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/55">
        <Icon size={12} className="text-white/40" />
        {title}
      </p>
      <p className="whitespace-pre-line text-sm leading-relaxed text-white/75">{children}</p>
    </div>
  );
}
