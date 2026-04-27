'use client';

import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle } from 'lucide-react';
import GradientText from '../effects/GradientText';
import MagneticButton from '../effects/MagneticButton';
import NumberFlow from '../effects/NumberFlow';
import { whatsappLink } from '@/lib/stripe-links';

export default function Hero() {
  return (
    <section className="relative z-10 flex min-h-[100svh] items-center pt-44 pb-24">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/80"
          >
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-dot" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Disponible para nuevos proyectos · Entrega en 24-48h
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-balance"
            style={{
              fontSize: 'clamp(2.75rem, 9vw, 8.5rem)',
              lineHeight: 0.95,
              letterSpacing: '-0.045em',
              fontWeight: 800,
            }}
          >
            <span className="block">Webs que</span>
            <GradientText as="span" className="block">convierten visitas</GradientText>
            <span className="block">en clientes.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-7 max-w-2xl text-pretty text-base leading-relaxed text-white/65 md:text-lg"
          >
            Diseño web, tiendas online y agentes de IA con n8n para empresas que quieren crecer.
            Desarrollo en 24-48 horas. Sin permanencia.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <MagneticButton href="/tienda">
              Ver planes <ArrowRight size={16} />
            </MagneticButton>
            <MagneticButton href={whatsappLink('Hola, quiero más información sobre Latech')} variant="secondary" target="_blank" rel="noreferrer">
              <MessageCircle size={16} /> Hablar por WhatsApp
            </MagneticButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-16 grid w-full max-w-2xl grid-cols-2 gap-4 md:grid-cols-4"
          >
            {[
              { v: 50, suf: '+', l: 'webs entregadas' },
              { v: 24, suf: 'h', l: 'tiempo medio' },
              { v: 100, suf: '%', l: 'sin permanencia' },
              { v: 5, suf: '★', l: 'valoración Google' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl glass px-3 py-4 text-center">
                <div className="font-display text-2xl tabular-nums text-white md:text-3xl">
                  <NumberFlow value={s.v} suffix={s.suf} />
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-white/50">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div aria-hidden className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="flex flex-col items-center gap-2 text-white/30"
        >
          <span className="text-[10px] uppercase tracking-widest">scroll</span>
          <motion.div
            animate={{ scaleY: [0.4, 1, 0.4], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="h-12 w-px"
            style={{ background: 'linear-gradient(180deg, transparent, var(--purple-300), transparent)', transformOrigin: 'top' }}
          />
        </motion.div>
      </div>
    </section>
  );
}
