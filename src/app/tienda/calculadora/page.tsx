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
  title: 'Calculadora · Configura tu plan a medida',
  description:
    'Configura tu plan a medida: web, hosting, tienda, redes, agente IA, blog y logo. Paga solo por lo que necesitas.',
};

export default function CalculadoraPage() {
  return (
    <>
      <SignatureMarquee />
      <Navbar />
      <AuroraBackground />
      <MouseGlow />
      <main className="relative z-10">
        <section className="pt-44 pb-12">
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
                className="mt-7 font-display text-balance text-5xl md:text-7xl"
                style={{ letterSpacing: '-0.04em', fontWeight: 800, lineHeight: 1 }}
              >
                Configura tu plan<br />
                <GradientText as="span">a medida</GradientText>
              </h1>
              <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-white/65">
                Elige solo los servicios que necesitas. Verás el precio actualizado en tiempo real.
                Al final, pagas con un único checkout seguro de Stripe.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="pb-32">
          <div className="mx-auto max-w-7xl px-6">
            <CalculadoraClient />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
