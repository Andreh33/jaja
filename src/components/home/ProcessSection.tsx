'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Reveal } from '../effects/Reveal';

const STEPS = [
  { n: '01', title: 'Conversamos', desc: 'Una llamada de 15 minutos para entender tu negocio, tus objetivos y tus clientes.' },
  { n: '02', title: 'Diseñamos', desc: 'Propuesta visual y técnica adaptada a tu marca. Aprobamos juntos antes de programar.' },
  { n: '03', title: 'Construimos', desc: 'Desarrollo en 24-48h con stack moderno: Next.js, Vercel, Tailwind, Stripe, n8n.' },
  { n: '04', title: 'Lanzamos', desc: 'Despliegue, monitorización y soporte continuo desde el día 1. Cambios incluidos cada mes.' },
];

export default function ProcessSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 30%'] });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={ref} className="relative z-10 py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mb-20 max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Proceso</p>
            <h2 className="font-display text-balance text-4xl md:text-6xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
              Cómo trabajamos
            </h2>
            <p className="mt-5 text-base text-white/60">
              Cuatro pasos. Sin sorpresas. Sin reuniones eternas.
            </p>
          </div>
        </Reveal>

        <div className="relative">
          <svg
            className="absolute left-0 right-0 top-12 hidden h-px w-full md:block"
            preserveAspectRatio="none"
            viewBox="0 0 1000 1"
            aria-hidden
          >
            <line x1="0" y1="0.5" x2="1000" y2="0.5" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <motion.line
              x1="0"
              y1="0.5"
              x2="1000"
              y2="0.5"
              stroke="url(#processGrad)"
              strokeWidth="2"
              style={{ pathLength }}
            />
            <defs>
              <linearGradient id="processGrad" x1="0%" x2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#FBBF24" />
              </linearGradient>
            </defs>
          </svg>

          <div className="grid gap-10 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className="mb-6 flex items-center gap-4">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl glass font-mono text-base font-semibold text-white"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-glow)' }}
                  >
                    {s.n}
                  </div>
                </div>
                <h3 className="font-display text-2xl font-bold text-white">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
