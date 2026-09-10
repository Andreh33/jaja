'use client';

import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Layers, RotateCcw, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, List } from 'lucide-react';

type Layer = { label: string; tag: string };

export default function XRayMode({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [list, setList] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const rotation = useRef({ x: -14, y: -26 });
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const found = Array.from(document.querySelectorAll<HTMLElement>('main section'))
      .filter((section) => !section.closest('.escape-overlay, .xray-overlay'))
      .slice(0, 9)
      .map((section, index) => ({
        label: (section.querySelector('h1, h2, h3')?.textContent || `Sección ${index + 1}`).replace(/\s+/g, ' ').trim().slice(0, 70),
        tag: '<section>',
      }));
    queueMicrotask(() => {
      if (!cancelled) setLayers(found.length ? found : [{ label: 'Latech', tag: '<main>' }]);
    });
    rotation.current = { x: -14, y: -26 };
    return () => { cancelled = true; pointer.current = null; };
  }, [open]);

  function turn(x: number, y: number) {
    rotation.current = { x: Math.max(-65, Math.min(35, rotation.current.x + x)), y: rotation.current.y + y };
    if (stageRef.current) stageRef.current.style.transform = `rotateX(${rotation.current.x}deg) rotateY(${rotation.current.y}deg)`;
  }
  const buttonClass = 'flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-[#171125] px-3 text-sm text-white/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300';

  return (
    <Dialog.Root open={open} onOpenChange={(value) => { if (!value) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[10000] bg-[#05040c]/95" />
        <Dialog.Content
          onOpenAutoFocus={() => { returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }}
          onCloseAutoFocus={(event) => { event.preventDefault(); if (returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true }); }}
          className="latech-demo-dialog xray-overlay fixed inset-0 z-[10001] flex flex-col overflow-y-auto px-5 py-6 outline-none sm:px-8" style={{ background: 'radial-gradient(ellipse at center, rgba(20,12,40,.8), transparent)' }}>
          <div className="relative z-10 mx-auto w-full max-w-4xl pr-12">
            <Dialog.Title className="flex items-center gap-2 font-display text-xl font-bold text-white"><Layers size={20} className="text-purple-300" aria-hidden /> Rayos X · la web por dentro</Dialog.Title>
            <Dialog.Description className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">Una representación de las secciones de esta página. Las capas muestran su orden y sus títulos; no reproducen la geometría completa del DOM.</Dialog.Description>
          </div>
          <div className="xray-controls relative z-10 mx-auto mt-5 flex flex-wrap justify-center gap-2">
            <button type="button" className={buttonClass} aria-label="Girar a la izquierda" onClick={() => turn(0, -15)}><ArrowLeft size={18} /></button>
            <button type="button" className={buttonClass} aria-label="Girar a la derecha" onClick={() => turn(0, 15)}><ArrowRight size={18} /></button>
            <button type="button" className={buttonClass} aria-label="Inclinar hacia arriba" onClick={() => turn(-10, 0)}><ArrowUp size={18} /></button>
            <button type="button" className={buttonClass} aria-label="Inclinar hacia abajo" onClick={() => turn(10, 0)}><ArrowDown size={18} /></button>
            <button type="button" className={buttonClass} aria-label="Restablecer perspectiva" onClick={() => { rotation.current = { x: -14, y: -26 }; turn(0, 0); }}><RotateCcw size={17} /></button>
            <button type="button" className={buttonClass} aria-pressed={list} onClick={() => setList((value) => !value)}><List size={17} /> {list ? 'Ver capas' : 'Ver lista'}</button>
          </div>
          <div className={`xray-stage min-h-[480px] flex-1 ${list ? 'hidden' : 'flex'}`} aria-hidden style={{ perspective: '1400px', touchAction: 'none', cursor: 'grab' }}
            onPointerDown={(event) => { if (!event.isPrimary || event.button !== 0) return; pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); }}
            onPointerMove={(event) => { const previous = pointer.current; if (!previous || previous.id !== event.pointerId) return; turn(-(event.clientY - previous.y) * .3, (event.clientX - previous.x) * .4); pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY }; }}
            onPointerUp={() => { pointer.current = null; }} onPointerCancel={() => { pointer.current = null; }} onLostPointerCapture={() => { pointer.current = null; }}>
            <div ref={stageRef} className="relative m-auto" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-14deg) rotateY(-26deg)' }}>
              {layers.map((layer, i) => <div key={`${layer.label}-${i}`} className="absolute left-1/2 top-1/2 flex h-[150px] w-[380px] flex-col justify-between rounded-2xl border border-purple-300/50 p-4"
                style={{ transform: `translate(-50%, -50%) translateZ(${(i - (layers.length - 1) / 2) * 100}px)`, backfaceVisibility: 'hidden', background: 'linear-gradient(135deg, rgba(139,92,246,.28), rgba(249,115,22,.06))', boxShadow: '0 0 40px -8px rgba(139,92,246,.35)' }}>
                <span className="font-display text-sm font-semibold text-white">{layer.label}</span>
                <span className="font-mono text-xs text-purple-200">{String(i + 1).padStart(2, '0')} · {layer.tag}</span>
                <span className="h-1.5 w-2/3 rounded-full bg-white/20" />
              </div>)}
            </div>
          </div>
          <ol className={`xray-list mx-auto my-6 w-full max-w-3xl space-y-3 ${list ? '' : 'sr-only'}`}>
            {layers.map((layer, i) => <li key={`${layer.label}-${i}`} className="rounded-2xl border border-purple-300/25 bg-white/[.04] p-5"><span className="mr-3 font-mono text-xs text-purple-300">{String(i + 1).padStart(2, '0')}</span><span className="font-display text-base font-semibold">{layer.label}</span><p className="mt-2 text-xs text-white/55">Sección HTML · {layer.tag}</p></li>)}
          </ol>
          <p className="relative z-10 mx-auto mt-auto max-w-3xl rounded-xl bg-[#0c0815]/90 p-3 text-center text-xs leading-relaxed text-white/65">{layers.length} secciones representadas. En escritorio puedes arrastrar o usar los botones. En móvil y con movimiento reducido tienes una lista completa.</p>
          <Dialog.Close className={`${buttonClass} absolute right-4 top-4 z-20`} aria-label="Cerrar Rayos X"><X size={18} /></Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
