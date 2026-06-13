'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers } from 'lucide-react';

type Layer = { label: string; tag: string; note: string };

// Anotaciones rotativas (el mensaje anti-WordPress de siempre, repartido por capas).
const NOTES = [
  'React Server Component',
  'HTML listo al instante',
  '0 plugins',
  'Datos desde Turso · edge',
  'CSS a medida',
  'Sin plantillas',
  'Animaciones por GPU',
  'Programado a mano',
];

export default function XRayMode({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [layers, setLayers] = useState<Layer[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);

  // Construye las capas a partir de las secciones REALES de la página.
  useEffect(() => {
    if (!open) return;
    const found: Layer[] = [];
    document.querySelectorAll<HTMLElement>('main section').forEach((sec, i) => {
      if (sec.closest('.escape-overlay, .xray-overlay')) return;
      const head = sec.querySelector('h1, h2, h3');
      const label = (head?.textContent || `Sección ${i + 1}`).replace(/\s+/g, ' ').trim().slice(0, 32);
      found.push({ label, tag: '<section>', note: NOTES[found.length % NOTES.length] });
    });
    if (!found.length) found.push({ label: 'Latech', tag: '<main>', note: NOTES[0] });
    const list = found.slice(0, 9);
    queueMicrotask(() => setLayers(list));
  }, [open]);

  // overflow, cursor nativo (el cursor personalizado del sitio queda detrás del portal) y ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const hadCustomCursor = document.body.classList.contains('has-custom-cursor');
    if (hadCustomCursor) document.body.classList.remove('has-custom-cursor');
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (hadCustomCursor) document.body.classList.add('has-custom-cursor');
    };
  }, [open, onClose]);

  // rotación: arrastre con el ratón + giro lento en reposo (manipula transform directo, sin re-render)
  useEffect(() => {
    if (!open) return;
    const stage = stageRef.current; if (!stage) return;
    const rot = { x: -14, y: -26 }; const target = { x: -14, y: -26 };
    let dragging = false; let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!dragging) target.y += 0.14;
      rot.x += (target.x - rot.x) * 0.12; rot.y += (target.y - rot.y) * 0.12;
      stage.style.transform = `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`;
    };
    raf = requestAnimationFrame(tick);
    let lastX = 0, lastY = 0;
    const down = (e: PointerEvent) => { dragging = true; lastX = e.clientX; lastY = e.clientY; };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      target.y += (e.clientX - lastX) * 0.4; target.x = Math.max(-65, Math.min(35, target.x - (e.clientY - lastY) * 0.35));
      lastX = e.clientX; lastY = e.clientY;
    };
    const up = () => { dragging = false; };
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    // no depende de `layers` (solo usa stageRef); evita reiniciar la rotación al poblarse
  }, [open]);

  if (typeof document === 'undefined') return null;
  const n = layers.length;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="xray-overlay fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ background: 'radial-gradient(ellipse at center, rgba(20,12,40,0.92), rgba(5,4,12,0.97))', backdropFilter: 'blur(10px)', cursor: 'grab', touchAction: 'none' }}>

          <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 text-center">
            <p className="flex items-center justify-center gap-2 font-display text-lg text-white">
              <Layers size={18} className="text-purple-300" /> Rayos X · la web por dentro
            </p>
            <p className="mt-1 text-xs text-white/45">arrastra para girar · cada capa es un componente real, sin plantillas</p>
          </div>

          {/* escenario 3D */}
          <div style={{ perspective: '1400px' }} className="pointer-events-none">
            <div ref={stageRef} style={{ transformStyle: 'preserve-3d', transition: 'none' }} className="relative">
              {layers.map((l, i) => {
                const z = (i - (n - 1) / 2) * 135;
                const hue = 262 - i * 6;
                return (
                  <div key={i}
                    style={{
                      transform: `translate(-50%, -50%) translateZ(${z}px)`,
                      transformStyle: 'preserve-3d', backfaceVisibility: 'hidden',
                      background: `linear-gradient(135deg, hsla(${hue},70%,55%,0.16), hsla(${hue + 30},70%,45%,0.05))`,
                      border: '1px solid hsla(' + hue + ',80%,70%,0.5)',
                      boxShadow: `0 0 40px -8px hsla(${hue},80%,55%,0.4)`,
                    }}
                    className="absolute left-1/2 top-1/2 flex h-[150px] w-[320px] flex-col justify-between rounded-2xl p-4 sm:w-[420px]">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm font-semibold text-white">{l.label}</span>
                      <span className="font-mono text-[10px] text-white/40">{l.tag}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="h-1.5 w-1/3 rounded-full bg-white/25" />
                      <span className="h-1.5 w-2/3 rounded-full bg-white/12" />
                      <span className="h-1.5 w-1/2 rounded-full bg-white/12" />
                    </div>
                    <span className="self-start rounded-full px-2.5 py-1 text-[10px] font-medium"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.8)' }}>
                      {l.note}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-xs text-white/40">
            {n} componentes · ensamblados a mano. <span className="text-white/70">Un WordPress cargaría decenas de plugins para esto.</span>
          </p>

          <button onClick={onClose} aria-label="Cerrar"
            className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full text-white/85 transition-transform hover:scale-110"
            style={{ background: 'var(--bg-glass-strong)', border: '1px solid var(--border-subtle)' }}>
            <X size={17} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
