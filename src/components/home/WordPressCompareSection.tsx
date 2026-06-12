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

function FillClaim({ label, text }: { label: string; text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'start 35%'] });
  const clipPath = useTransform(
    scrollYProgress,
    [0, 1],
    ['inset(0 100% 0 0)', 'inset(0 0% 0 0)']
  );

  return (
    <div ref={ref} className="border-t py-10 md:py-14" style={{ borderColor: 'var(--border-subtle)' }}>
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">{label}</p>
      <div className="relative">
        <p
          className="font-display text-balance text-2xl text-white md:text-4xl"
          style={{ letterSpacing: '-0.03em', fontWeight: 700, lineHeight: 1.2 }}
        >
          {text}
        </p>
        <motion.p
          aria-hidden
          className="absolute inset-0 font-display text-balance text-2xl text-transparent md:text-4xl"
          style={{
            letterSpacing: '-0.03em',
            fontWeight: 700,
            lineHeight: 1.2,
            backgroundImage: 'var(--grad-signature)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            clipPath,
          }}
        >
          {text}
        </motion.p>
      </div>
    </div>
  );
}

export default function WordPressCompareSection() {
  return (
    <section className="relative z-10 py-32">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <div className="mb-16 max-w-3xl">
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

        <div className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          {CLAIMS.map((c) => (
            <FillClaim key={c.label} {...c} />
          ))}
        </div>
      </div>
    </section>
  );
}
