'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useRef } from 'react';
import { X, Code2 } from 'lucide-react';

// Simplified illustration of the existing stack, not a live code inspector.
const LINES: React.ReactNode[] = [
  <span key="0" className="text-white/35">{'// app/page.tsx · se renderiza en el servidor'}</span>,
  <span key="1"><span className="text-purple-300">export default async function</span> <span className="text-emerald-300">Home</span>() {'{'}</span>,
  <span key="2">{'  '}<span className="text-purple-300">const</span> posts = <span className="text-purple-300">await</span> db.<span className="text-sky-300">select</span>().<span className="text-sky-300">from</span>(blog)</span>,
  <span key="3">{'  '}<span className="text-purple-300">return</span> (</span>,
  <span key="4">{'    '}<span className="text-white/50">&lt;</span><span className="text-emerald-300">main</span><span className="text-white/50">&gt;</span></span>,
  <span key="5">{'      '}<span className="text-white/50">&lt;</span><span className="text-emerald-300">Hero</span> <span className="text-white/50">/&gt;</span> <span className="text-white/50">&lt;</span><span className="text-emerald-300">ServicesGrid</span> <span className="text-white/50">/&gt;</span></span>,
  <span key="6">{'      '}<span className="text-white/50">&lt;</span><span className="text-emerald-300">PlaygroundSection</span> <span className="text-white/50">/&gt;</span> <span className="text-amber-300/70">{'// 👈 este juego'}</span></span>,
  <span key="7">{'    '}<span className="text-white/50">&lt;/</span><span className="text-emerald-300">main</span><span className="text-white/50">&gt;</span></span>,
  <span key="8">{'  '})</span>,
  <span key="9">{'}'}</span>,
];


export default function HoodReveal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const returnFocus = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root open={open} onOpenChange={(value) => { if (!value) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm" />
        <Dialog.Content
          onOpenAutoFocus={() => { returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }}
          onCloseAutoFocus={(event) => { event.preventDefault(); if (returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true }); }}
          className="latech-demo-dialog fixed left-1/2 top-1/2 z-[10001] max-h-[calc(100dvh-2rem)] w-[calc(100%_-_2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-white/15 bg-[#0c0a16] shadow-2xl outline-none">
          <div className="flex items-center gap-2 border-b border-white/10 bg-white/[.03] px-5 py-4 pr-16">
            <Code2 size={18} className="text-purple-300" aria-hidden />
            <Dialog.Title className="font-display text-lg font-semibold">Abre el capó</Dialog.Title>
            <span className="ml-auto hidden font-mono text-xs text-white/50 sm:inline">page.tsx</span>
          </div>
          <Dialog.Description className="px-5 pt-5 text-sm leading-relaxed text-white/65">
            Un ejemplo simplificado de cómo se conectan las piezas de Latech. Ilustra nuestra arquitectura; no muestra datos ni código privado en tiempo real.
          </Dialog.Description>
          <div className="overflow-x-auto px-5 py-5 font-mono text-xs leading-7 sm:text-[13px]" role="region" aria-label="Ejemplo de código" tabIndex={0}>
            <code>{LINES.map((line, i) => <span key={i} className="flex min-w-max gap-3"><span aria-hidden className="w-5 select-none text-right text-white/35">{i + 1}</span><span className="whitespace-pre text-white/85">{line}</span></span>)}</code>
          </div>
          <div className="border-t border-white/10 px-5 py-5">
            <h3 className="font-display text-base font-semibold">Lo que hay detrás</h3>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="font-medium text-purple-300">Next.js y React</dt><dd className="mt-1 leading-relaxed text-white/60">Páginas renderizadas en el servidor e interacción donde hace falta.</dd></div>
              <div><dt className="font-medium text-orange-300">Turso</dt><dd className="mt-1 leading-relaxed text-white/60">Contenido persistente con acceso controlado desde el servidor.</dd></div>
              <div><dt className="font-medium text-purple-300">Movimiento a medida</dt><dd className="mt-1 leading-relaxed text-white/60">CSS, Motion y GSAP, con una alternativa de movimiento reducido.</dd></div>
              <div><dt className="font-medium text-orange-300">Rendimiento medible</dt><dd className="mt-1 leading-relaxed text-white/60">Los tiempos varían por dispositivo y conexión. Esta demo no es una prueba de velocidad.</dd></div>
            </dl>
          </div>
          <Dialog.Close className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#171125] text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300" aria-label="Cerrar el capó"><X size={18} /></Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
