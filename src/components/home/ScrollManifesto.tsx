'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';

/** Cada palabra pasa de tenue a brillante según el progreso de scroll. */
function Word({
  children,
  range,
  progress,
  accent,
}: {
  children: string;
  range: [number, number];
  progress: MotionValue<number>;
  accent?: boolean;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <span aria-hidden className="relative mr-[0.26em] inline-block">
      <motion.span style={{ opacity }} className={accent ? 'text-gradient' : 'text-white'}>
        {children}
      </motion.span>
    </span>
  );
}

const TOKENS: { t: string; a?: boolean }[] = [
  { t: 'No' }, { t: 'hacemos' }, { t: 'webs.' },
  { t: 'Diseñamos' }, { t: 'máquinas' }, { t: 'de' },
  { t: 'convertir', a: true }, { t: 'visitas', a: true }, { t: 'en', a: true }, { t: 'clientes.', a: true },
  { t: 'Diseño,' }, { t: 'código' }, { t: 'y' }, { t: 'la' }, { t: 'IA' }, { t: 'que' },
  { t: 'tu' }, { t: 'negocio' }, { t: 'necesita' }, { t: '—' }, { t: 'en' }, { t: '48' }, { t: 'horas,' },
  { t: 'sin' }, { t: 'permanencia.' },
];

export default function ScrollManifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.55'],
  });
  const n = TOKENS.length;

  return (
    <section ref={ref} className="relative z-10 px-6 py-32 md:py-48">
      <div className="mx-auto max-w-5xl">
        <p
          aria-label="No hacemos webs. Diseñamos máquinas de convertir visitas en clientes. Diseño, código y la IA que tu negocio necesita — en 48 horas, sin permanencia."
          className="font-display flex flex-wrap text-pretty"
          style={{
            fontSize: 'clamp(1.9rem, 4.6vw, 3.6rem)',
            lineHeight: 1.18,
            letterSpacing: '-0.025em',
            fontWeight: 700,
          }}
        >
          {TOKENS.map((tok, i) => {
            const start = i / n;
            const end = start + 1 / n;
            return (
              <Word key={i} range={[start, end]} progress={scrollYProgress} accent={tok.a}>
                {tok.t}
              </Word>
            );
          })}
        </p>
      </div>
    </section>
  );
}
