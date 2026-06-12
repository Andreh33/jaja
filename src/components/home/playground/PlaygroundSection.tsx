'use client';

import dynamic from 'next/dynamic';
import { Reveal } from '../../effects/Reveal';

// Canvas y juego solo cargan cuando la sección se acerca al viewport.
const DrawingBoard = dynamic(() => import('./DrawingBoard'), { ssr: false });
const StumbleRunner = dynamic(() => import('./StumbleRunner'), { ssr: false });

export default function PlaygroundSection() {
  return (
    <section className="relative z-10 py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mb-16 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Zona de juego
            </p>
            <h2
              className="font-display text-balance text-4xl md:text-6xl"
              style={{ letterSpacing: '-0.04em', fontWeight: 800 }}
            >
              Tu imaginación,<br />
              <span className="text-gradient">nuestro límite.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base text-white/60">
              ¿Qué empresa te pone un lápiz para que dibujes en su web, así, como si nada?
              ¿Y cuál te esconde un videojuego en mitad de la página?
              Cuando programas desde cero, puedes hacer lo que quieras.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="flex h-[480px] flex-col rounded-3xl glass p-5 md:p-6">
              <div className="mb-4 flex items-baseline justify-between">
                <h3 className="font-display text-xl text-white">El lápiz 🖍️</h3>
                <span className="text-[11px] uppercase tracking-widest text-white/35">demo en vivo</span>
              </div>
              <DrawingBoard />
            </div>
          </Reveal>
          <Reveal>
            <div className="flex h-[480px] flex-col rounded-3xl glass p-5 md:p-6">
              <div className="mb-4 flex items-baseline justify-between">
                <h3 className="font-display text-xl text-white">El juego 🏃</h3>
                <span className="text-[11px] uppercase tracking-widest text-white/35">demo en vivo</span>
              </div>
              <StumbleRunner />
            </div>
          </Reveal>
        </div>

        <Reveal>
          <p className="mt-12 text-center text-sm text-white/50">
            Esto es lo que pasa cuando tu web no es una plantilla.{' '}
            <span className="text-white/80">Imagina lo que podemos hacer con tu negocio.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
