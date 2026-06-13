'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const SEEN_KEY = 'latech-intro-v1';

// Intro de bienvenida SOLO en la primera visita. Skippable, corta y elegante.
// Si el usuario prefiere menos movimiento, no se muestra.
export default function IntroCinematic() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);

  const dismiss = useCallback(() => {
    try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* noop */ }
    document.body.style.overflow = '';
    setShow(false);
  }, []);

  useEffect(() => {
    if (reduce) return;
    let seen = false;
    try { seen = localStorage.getItem(SEEN_KEY) === '1'; } catch { seen = true; }
    if (seen) return;
    document.body.style.overflow = 'hidden';
    queueMicrotask(() => setShow(true));
    const t = setTimeout(() => dismiss(), 3400);
    return () => clearTimeout(t);
  }, [reduce, dismiss]);

  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.7, ease: 'easeInOut' } }}
          style={{ background: '#05040c' }}>

          {/* aurora de fondo que se expande */}
          <motion.div aria-hidden className="absolute h-[60vmax] w-[60vmax] rounded-full"
            initial={{ scale: 0.2, opacity: 0 }} animate={{ scale: 1.1, opacity: 0.5 }} transition={{ duration: 2.4, ease: 'easeOut' }}
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5), rgba(249,115,22,0.18) 45%, transparent 70%)', filter: 'blur(70px)' }} />
          <div aria-hidden className="absolute inset-0 bg-grid" style={{ opacity: 0.25 }} />

          <div className="relative flex flex-col items-center text-center">
            <motion.h1 className="font-display text-6xl font-extrabold tracking-tight text-gradient md:text-8xl"
              initial={{ opacity: 0, y: 24, filter: 'blur(14px)', letterSpacing: '0.3em' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)', letterSpacing: '-0.04em' }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
              Latech
            </motion.h1>
            <motion.p className="mt-4 text-lg text-white/80 md:text-2xl"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.8 }}>
              Tu imaginación, <span className="text-white">nuestro límite.</span>
            </motion.p>
            <motion.p className="mt-2 text-xs uppercase tracking-[0.35em] text-white/40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7, duration: 0.8 }}>
              cero plantillas · cero límites
            </motion.p>
            {/* línea que se dibuja */}
            <motion.div className="mt-7 h-px rounded-full"
              initial={{ width: 0, opacity: 0 }} animate={{ width: 180, opacity: 1 }} transition={{ delay: 1.2, duration: 1 }}
              style={{ background: 'linear-gradient(90deg, transparent, var(--purple-400), var(--accent-ia), transparent)' }} />
          </div>

          <button onClick={dismiss}
            className="absolute bottom-8 right-8 rounded-full px-4 py-2 text-xs font-semibold text-white/60 transition-all hover:scale-105 hover:text-white"
            style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', backdropFilter: 'blur(8px)' }}>
            Saltar intro →
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
