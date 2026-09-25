'use client';

import { useCallback, useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';

const SEEN_KEY = 'latech-intro-v1';
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Brief desktop welcome. Mobile and reduced-motion visitors go straight to the hero. */
export default function IntroCinematic() {
  const [show, setShow] = useState(false);
  const dismiss = useCallback(() => {
    try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* Storage is optional. */ }
    setShow(false);
  }, []);

  useEffect(() => {
    const eligible = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');
    if (!eligible.matches) return;
    try { if (localStorage.getItem(SEEN_KEY) === '1') return; } catch { return; }
    const frame = requestAnimationFrame(() => setShow(true));
    const timeout = setTimeout(dismiss, 1800);
    const changed = () => { if (!eligible.matches) dismiss(); };
    eligible.addEventListener('change', changed);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
      eligible.removeEventListener('change', changed);
    };
  }, [dismiss]);

  return (
    <Dialog.Root open={show} onOpenChange={(open) => { if (!open) dismiss(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[10000] bg-[#05040c]" />
        <Dialog.Content className="fixed inset-0 z-[10001] flex flex-col items-center justify-center overflow-hidden outline-none">
          <div aria-hidden className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at center, rgba(59,130,246,.24), rgba(103,196,255,.07) 45%, transparent 70%)' }} />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-25" />
          <div className="relative flex flex-col items-center text-center">
            <Dialog.Title asChild>
              <motion.p className="font-display text-8xl font-extrabold tracking-tight text-gradient"
                initial={{ opacity: 0, transform: 'translateY(16px)' }}
                animate={{ opacity: 1, transform: 'translateY(0)' }}
                transition={{ duration: .5, ease: EASE_OUT }}>
                Latech
              </motion.p>
            </Dialog.Title>
            <Dialog.Description asChild>
              <motion.p className="mt-4 text-2xl text-white/80"
                initial={{ opacity: 0, transform: 'translateY(8px)' }}
                animate={{ opacity: 1, transform: 'translateY(0)' }}
                transition={{ delay: .12, duration: .5, ease: EASE_OUT }}>
                Tu imaginación, <span className="text-white">nuestro límite.</span>
              </motion.p>
            </Dialog.Description>
            <p className="mt-2 text-xs uppercase tracking-[0.35em] text-white/60">cero plantillas · cero límites</p>
            <motion.div aria-hidden className="mt-7 h-px w-44 rounded-full"
              initial={{ transform: 'scaleX(.1)', opacity: 0 }}
              animate={{ transform: 'scaleX(1)', opacity: 1 }}
              transition={{ delay: .2, duration: .6, ease: EASE_OUT }}
              style={{ background: 'linear-gradient(90deg, transparent, var(--brand-400), var(--accent-ia), transparent)' }} />
          </div>
          <Dialog.Close className="absolute bottom-8 right-8 min-h-11 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-400">
            Saltar intro →
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
