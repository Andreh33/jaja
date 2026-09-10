import type { Metadata } from 'next';
import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import { SignatureMarquee } from '@/components/effects/Marquee';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Reveal } from '@/components/effects/Reveal';
import GradientText from '@/components/effects/GradientText';
import CalculadoraClient from './CalculadoraClient';

export const metadata: Metadata = {
  title: 'Calculadora de presupuesto web online',
  description:
    'Configura tu web desde 600 € más mantenimiento mensual. Revisa servicios, extras e IVA y prepara tu presupuesto por WhatsApp, sin registro.',
  alternates: { canonical: '/tienda/calculadora' },
};

export default function CalculadoraPage() {
  return (
    <>
      <SignatureMarquee />
      <Navbar />
      <AuroraBackground />
      <MouseGlow />
      <main className="relative z-10 pb-32 md:pb-0">
        <section className="pt-36 pb-8 md:pt-44 md:pb-12">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <Reveal>
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
                style={{
                  background: 'rgba(251,191,36,0.12)',
                  color: 'var(--accent-calc)',
                  border: '1px solid rgba(251,191,36,0.3)',
                }}
              >
                ● CALCULADORA
              </span>
              <h1
                className="mt-7 font-display text-balance text-3xl md:text-5xl lg:text-7xl"
                style={{ letterSpacing: '-0.04em', fontWeight: 800, lineHeight: 1 }}
              >
                Dale forma a tu idea.<br />
                <GradientText as="span">Ponle números.</GradientText>
              </h1>
              <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-white/65">
                Web desde 600 € de creación y 60 €/mes de mantenimiento, IVA no incluido.
                Elige tus servicios, revisa el desglose y prepara el mensaje para hablarlo por WhatsApp.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="pb-56 lg:pb-32">
          <div className="mx-auto max-w-7xl px-6">
            <CalculadoraClient />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
