'use client';

import { ArrowRight, MessageCircle } from 'lucide-react';
import MagneticButton from '../effects/MagneticButton';
import { Reveal } from '../effects/Reveal';
import { whatsappLink } from '@/lib/stripe-links';

export default function CTABanner() {
  return (
    <section className="relative z-10 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.25) 0%, transparent 65%), radial-gradient(ellipse at 30% 60%, rgba(249,115,22,0.18) 0%, transparent 55%)',
        }}
      />
      <div className="mx-auto flex min-h-[80vh] max-w-5xl flex-col items-center justify-center px-6 py-32 text-center">
        <Reveal>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">El siguiente paso</p>
          <h2 className="font-display text-balance text-4xl md:text-7xl" style={{ letterSpacing: '-0.04em', fontWeight: 800, lineHeight: 0.98 }}>
            ¿Listo para llevar<br />
            tu negocio al<br />
            <span className="text-gradient">siguiente nivel?</span>
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-base text-white/60">
            Cuéntanos qué necesitas. Te respondemos en menos de 24h con propuesta clara,
            tiempos reales y precio fijo. Sin compromiso.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton href={whatsappLink('Hola, quiero información sobre Latech')} target="_blank" rel="noreferrer">
              <MessageCircle size={16} /> Hablar por WhatsApp
            </MagneticButton>
            <MagneticButton href="/tienda" variant="secondary">
              Ver planes <ArrowRight size={16} />
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
