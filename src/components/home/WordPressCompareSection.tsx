'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Reveal } from '../effects/Reveal';

const CLAIMS = [
  {
    label: 'Seguridad',
    text: 'WordPress vive de parches y plugins que hackean a diario. Nuestro código no tiene puertas que forzar.',
  },
  {
    label: 'Velocidad',
    text: 'Una web media en WordPress tarda 4 segundos en cargar. Las nuestras, menos de 1.',
  },
  {
    label: 'Posibilidades',
    text: 'Una plantilla te obliga a encajar tu negocio en ella. El código a medida hace exactamente lo que necesitas.',
  },
  {
    label: 'Mantenimiento',
    text: 'Sin actualizaciones que rompen tu web un domingo por la noche. Nos encargamos de todo, siempre.',
  },
  {
    label: 'SEO',
    text: 'Google premia las webs rápidas y con código limpio. Las nuestras nacen así, sin 40 plugins de por medio.',
  },
];

function ClaimCard({ label, text, i }: { label: string; text: string; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 95%', 'start 45%'] });

  const even = i % 2 === 0;
  const tilt = even ? -2.8 : 2.4;

  // La tarjeta entra deslizándose desde su lado, endereza el ángulo y el
  // texto se rellena con el degradado de marca — todo guiado por el scroll.
  const x = useTransform(scrollYProgress, [0, 1], [even ? -90 : 90, 0]);
  const rotate = useTransform(scrollYProgress, [0, 1], [tilt * 2.6, tilt]);
  const opacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);
  const clipPath = useTransform(
    scrollYProgress,
    [0.3, 1],
    ['inset(0 100% 0 0)', 'inset(0 0% 0 0)']
  );

  return (
    <motion.div
      ref={ref}
      style={{ x, rotate, opacity, zIndex: 10 + i }}
      className={`relative w-full md:w-[62%] ${even ? 'md:mr-auto' : 'md:ml-auto'} ${
        i > 0 ? 'mt-6 md:-mt-8' : ''
      }`}
    >
      <motion.div
        whileHover={{ y: -6, scale: 1.015 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="rounded-3xl glass p-7 md:p-9"
        style={{ border: '1px solid var(--border-glow)', background: 'var(--bg-glass-strong)' }}
      >
        <span
          className="mb-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60"
          style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-glass)' }}
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: 'var(--grad-signature)' }}
          />
          {label}
        </span>
        <div className="relative">
          <p
            className="font-display text-balance text-xl text-white md:text-3xl"
            style={{ letterSpacing: '-0.03em', fontWeight: 700, lineHeight: 1.22 }}
          >
            {text}
          </p>
          <motion.p
            aria-hidden
            className="absolute inset-0 font-display text-balance text-xl text-transparent md:text-3xl"
            style={{
              letterSpacing: '-0.03em',
              fontWeight: 700,
              lineHeight: 1.22,
              backgroundImage: 'var(--grad-signature)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              clipPath,
            }}
          >
            {text}
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function WordPressCompareSection() {
  return (
    <section className="relative z-10 overflow-x-clip py-32">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <div className="mb-20 max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Latech vs WordPress
            </p>
            <h2
              className="font-display text-balance text-4xl md:text-6xl"
              style={{ letterSpacing: '-0.04em', fontWeight: 800 }}
            >
              Por qué no usamos WordPress.
            </h2>
            <p className="mt-5 text-base text-white/60">
              El 90% de las agencias te venderá una plantilla. Nosotros programamos tu web desde cero.
              Esta es la diferencia, punto por punto.
            </p>
          </div>
        </Reveal>

        <div className="relative">
          {CLAIMS.map((c, i) => (
            <ClaimCard key={c.label} {...c} i={i} />
          ))}
        </div>

        <Reveal>
          <p className="mt-16 text-center text-xs text-white/40">
            Esta misma animación está programada a medida con nuestro stack — el que usaríamos en tu web.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
