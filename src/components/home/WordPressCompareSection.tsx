'use client';

import { useCallback, useRef } from 'react';
import { Reveal } from '../effects/Reveal';
import { useDesktopScrollEffect } from '../effects/Breathe';

const CLAIMS = [
  {
    label: 'Seguridad',
    text: 'Menos dependencias innecesarias, permisos revisados y mantenimiento continuo. La seguridad se trabaja en cada capa.',
  },
  {
    label: 'Velocidad',
    text: 'Optimizamos imágenes, carga de código y respuesta al tocar. La velocidad se comprueba en dispositivos reales.',
  },
  {
    label: 'Posibilidades',
    text: 'Una plantilla te obliga a encajar tu negocio en ella. El código a medida hace exactamente lo que necesitas.',
  },
  {
    label: 'Mantenimiento',
    text: 'Nos ocupamos de las actualizaciones, las copias y la evolución de tu web. Con un equipo al que puedes escribir.',
  },
  {
    label: 'SEO',
    text: 'Contenido útil, estructura clara y una base técnica cuidada. El posicionamiento se construye y se mide con el tiempo.',
  },
];

function ClaimCard({ label, text, i }: { label: string; text: string; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const gradient = useRef<HTMLParagraphElement>(null);
  const even = i % 2 === 0;
  const tilt = even ? -2.8 : 2.4;
  const render = useCallback((rect: DOMRect, height: number) => {
    const progress = Math.max(0, Math.min(1, (height * .95 - rect.top) / (height * .5)));
    const x = (even ? -90 : 90) * (1 - progress);
    const rotate = tilt * (2.6 - progress * 1.6);
    if (ref.current) ref.current.style.transform = `translateX(${x.toFixed(2)}px) rotate(${rotate.toFixed(2)}deg)`;
    if (gradient.current) {
      gradient.current.style.display = 'block';
      const reveal = Math.max(0, Math.min(1, (progress - .3) / .7));
      gradient.current.style.clipPath = `inset(0 ${((1 - reveal) * 100).toFixed(2)}% 0 0)`;
    }
  }, [even, tilt]);
  const reset = useCallback(() => {
    ref.current?.style.removeProperty('transform');
    gradient.current?.style.removeProperty('clip-path');
    gradient.current?.style.removeProperty('display');
  }, []);
  useDesktopScrollEffect(ref, render, reset);

  return (
    <div
      ref={ref}
      style={{ zIndex: 10 + i }}
      className={`compare-card relative w-full md:w-[62%] ${even ? 'md:mr-auto' : 'md:ml-auto'} ${
        i > 0 ? 'mt-6 md:-mt-8' : ''
      }`}
    >
      <div
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
          <p
            ref={gradient}
            aria-hidden
            className="absolute inset-0 hidden font-display text-balance text-xl text-transparent md:text-3xl"
            style={{
              letterSpacing: '-0.03em',
              fontWeight: 700,
              lineHeight: 1.22,
              backgroundImage: 'var(--grad-signature)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
            }}
          >
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WordPressCompareSection() {
  return (
    <section className="relative z-10 overflow-x-clip py-32">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <div className="mb-20 max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Latech vs WordPress
            </p>
            <h2
              className="font-display text-balance text-4xl md:text-6xl"
              style={{ letterSpacing: '-0.04em', fontWeight: 800 }}
            >
              Por qué no usamos WordPress.
            </h2>
            <p className="mt-5 text-base text-white/60">
              Programamos tu web a medida para conectar diseño, negocio e integraciones.
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
          <p className="mt-16 text-center text-xs text-white/60">
            Esta misma animación está programada a medida con nuestro stack — el que usaríamos en tu web.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
