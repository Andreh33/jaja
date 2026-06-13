'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap } from 'lucide-react';

// Líneas de código (representativas del stack real: Next.js App Router + Turso).
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

const NOTES = [
  { line: 1, text: 'React Server Component → HTML listo al instante, sin esperar a JavaScript' },
  { line: 2, text: 'Datos en vivo desde Turso (SQLite en el edge) — no una base lenta compartida' },
  { line: 6, text: 'Cada pieza programada a mano. Cero plugins, cero bloat.' },
];

export default function HoodReveal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    // el sitio oculta el cursor nativo (cursor personalizado que queda detrás del overlay);
    // mientras está abierto el capó, restauramos el cursor nativo para que se vea.
    const hadCustomCursor = document.body.classList.contains('has-custom-cursor');
    if (hadCustomCursor) document.body.classList.remove('has-custom-cursor');
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      if (hadCustomCursor) document.body.classList.add('has-custom-cursor');
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ background: 'rgba(5,4,12,0.78)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
          <motion.div onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, y: 24, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl"
            style={{ background: '#0c0a16', border: '1px solid var(--border-subtle)', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8)' }}>

            {/* chrome del editor */}
            <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
              <span className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full" style={{ background: '#ff5f57' }} />
                <span className="h-3 w-3 rounded-full" style={{ background: '#febc2e' }} />
                <span className="h-3 w-3 rounded-full" style={{ background: '#28c840' }} />
              </span>
              <span className="ml-2 rounded-md px-2 py-0.5 font-mono text-[11px] text-white/60" style={{ background: 'rgba(255,255,255,0.06)' }}>page.tsx</span>
              <span className="font-mono text-[11px] text-white/25">Hero.tsx</span>
              <span className="font-mono text-[11px] text-white/25">db.ts</span>
              <span className="ml-auto text-[11px] font-semibold uppercase tracking-widest text-white/35">así por dentro</span>
            </div>

            {/* código */}
            <div className="px-5 py-5 font-mono text-[13px] leading-7">
              {LINES.map((ln, i) => {
                const note = NOTES.find((n) => n.line === i);
                return (
                  <motion.div key={i} className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.09 }}>
                    <span className="w-5 select-none text-right text-white/20">{i + 1}</span>
                    <span className="whitespace-pre text-white/85">{ln}</span>
                    {note && (
                      <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 + LINES.length * 0.09 + 0.2 }}
                        className="ml-auto hidden max-w-[44%] rounded-full px-2.5 py-1 text-[10px] font-medium leading-tight md:inline-block"
                        style={{ background: 'var(--bg-glass-strong)', border: '1px solid var(--border-glow)', color: 'rgba(255,255,255,0.75)' }}>
                        ← {note.text}
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* comparativa de velocidad */}
            <motion.div className="border-t px-5 py-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 + LINES.length * 0.09 + 0.4 }}>
              <div className="mb-2 flex items-center gap-2 text-xs text-white/70"><Zap size={13} className="text-amber-300" /> Velocidad de carga</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="w-24 text-xs text-white/80">Esta web</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
                    <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, var(--purple-400), var(--accent-ia))' }}
                      initial={{ width: 0 }} animate={{ width: '11%' }} transition={{ delay: 0.9, duration: 0.6 }} />
                  </div>
                  <span className="w-12 text-right font-mono text-xs text-emerald-300">0.4s</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-24 text-xs text-white/45">WordPress medio</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
                    <motion.div className="h-full rounded-full bg-white/25" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 0.9, duration: 1.1 }} />
                  </div>
                  <span className="w-12 text-right font-mono text-xs text-white/45">3.8s</span>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-white/45">Sin plantillas. Sin plugins. <span className="text-white/80">Programado desde cero para tu negocio.</span></p>
            </motion.div>

            <button onClick={onClose} aria-label="Cerrar"
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition-transform hover:scale-110"
              style={{ background: 'var(--bg-glass-strong)', border: '1px solid var(--border-subtle)' }}>
              <X size={16} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
