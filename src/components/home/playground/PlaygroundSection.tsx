'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { suspendGames } from './game-session';
import { Reveal } from '../../effects/Reveal';

// Canvas y juego solo cargan cuando la sección se acerca al viewport.
const DrawingBoard = dynamic(() => import('./DrawingBoard'), { ssr: false });
const StumbleRunner = dynamic(() => import('./StumbleRunner'), { ssr: false });
const EscapeGame = dynamic(() => import('./EscapeGame'), { ssr: false });
const HoodReveal = dynamic(() => import('./HoodReveal'), { ssr: false });
const XRayMode = dynamic(() => import('../../effects/XRayMode'), { ssr: false });

function DeferredDemo({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!('IntersectionObserver' in window)) { queueMicrotask(() => setReady(true)); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setReady(true); observer.disconnect(); }
    }, { rootMargin: '240px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className="flex min-h-0 flex-1 flex-col">{ready ? children : <p className="m-auto text-center text-sm text-white/60">La demo se prepara al acercarte.<br /><Link className="inline-block py-3 text-purple-300 underline" href="/lab">Ver instrucciones en el laboratorio</Link></p>}</div>;
}

export default function PlaygroundSection() {
  const [active, setActive] = useState<'escape' | 'hood' | 'xray' | null>(null);
  function openDemo(demo: 'escape' | 'hood' | 'xray') { suspendGames(); setActive(demo); }

  return (
    <section className="relative z-10 py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mb-16 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
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
                <span className="text-[11px] uppercase tracking-widest text-white/60">demo en vivo</span>
              </div>
              <DeferredDemo><DrawingBoard /></DeferredDemo>
            </div>
          </Reveal>
          <Reveal>
            <div data-escape-origin className="flex h-[480px] flex-col rounded-3xl glass p-5 md:p-6">
              <div className="mb-4 flex items-baseline justify-between">
                <h3 className="font-display text-xl text-white">El juego 🏃</h3>
                <span className="text-[11px] uppercase tracking-widest text-white/60">demo en vivo</span>
              </div>
              <DeferredDemo><StumbleRunner /></DeferredDemo>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <div className="mt-8 text-center">
            <button
              onClick={() => openDemo('escape')}
              className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm text-white/70 lab-demo-trigger transition-colors hover:text-white"
              style={{ background: 'var(--bg-glass-strong)', border: '1px solid var(--border-subtle)', backdropFilter: 'blur(8px)' }}
            >
              ¿Te sigue pareciendo poco?{' '}
              <span className="font-semibold text-gradient">Pulsa aquí</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
            <p className="mt-3 text-xs text-white/60">el juego se escapa a toda la pantalla y esquivas tus propios componentes</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => openDemo('hood')}
                className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm text-white/65 lab-demo-trigger transition-colors hover:text-white"
                style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', backdropFilter: 'blur(8px)' }}
              >
                🔧 <span className="font-semibold text-white/90">Abre el capó</span> · mira esta web por dentro
              </button>
              <button
                onClick={() => openDemo('xray')}
                className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm text-white/65 lab-demo-trigger transition-colors hover:text-white"
                style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', backdropFilter: 'blur(8px)' }}
              >
                🔬 <span className="font-semibold text-white/90">Rayos X</span> · explora las secciones
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <p className="mt-12 text-center text-sm text-white/50">
            Esto es lo que pasa cuando tu web no es una plantilla.{' '}
            <span className="text-white/80">Imagina lo que podemos hacer con tu negocio.</span>
            <Link href="/lab" className="mx-auto mt-6 flex min-h-11 w-fit items-center gap-2 font-semibold text-purple-300">Entrar al laboratorio completo <span aria-hidden>→</span></Link>
          </p>
        </Reveal>
      </div>

      {active === 'escape' && <EscapeGame open onClose={() => setActive(null)} />}
      {active === 'hood' && <HoodReveal open onClose={() => setActive(null)} />}
      {active === 'xray' && <XRayMode open onClose={() => setActive(null)} />}
    </section>
  );
}
