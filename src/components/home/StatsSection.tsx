'use client';

import BeamBorder from '../effects/BeamBorder';
import NumberFlow from '../effects/NumberFlow';
import { Reveal } from '../effects/Reveal';

const STATS = [
  { value: 50, suffix: '+', label: 'Proyectos entregados' },
  { value: 24, suffix: 'h', label: 'Tiempo medio de entrega' },
  { value: 99, suffix: '%', label: 'Uptime garantizado' },
  { value: 5, suffix: '★', label: 'Valoración media' },
];

export default function StatsSection() {
  return (
    <section className="relative z-10 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <BeamBorder rounded="rounded-[2.5rem]">
            <div
              className="relative overflow-hidden rounded-[2.5rem] holographic"
              style={{ padding: 'clamp(2rem, 5vw, 4.5rem)' }}
            >
              <div className="grid items-center gap-10 md:grid-cols-2">
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Datos</p>
                  <h2 className="font-display text-4xl md:text-5xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
                    Números que respaldan<br />
                    <span style={{ color: 'var(--purple-300)' }}>cada promesa.</span>
                  </h2>
                  <p className="mt-5 max-w-md text-sm leading-relaxed text-white/60">
                    No prometemos lo que no podemos cumplir. Estos son los números reales de los proyectos
                    que hemos entregado en el último año.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {STATS.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-2xl p-6 transition-transform hover:-translate-y-1"
                      style={{ background: 'rgba(7,5,14,0.4)', border: '1px solid var(--border-subtle)' }}
                    >
                      <div className="font-display text-5xl tabular-nums leading-none text-white">
                        <NumberFlow value={s.value} suffix={s.suffix} />
                      </div>
                      <div className="mt-3 text-xs uppercase tracking-wider text-white/50">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </BeamBorder>
        </Reveal>
      </div>
    </section>
  );
}
