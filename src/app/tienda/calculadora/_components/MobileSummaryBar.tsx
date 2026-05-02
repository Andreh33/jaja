'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, X } from 'lucide-react';
import { formatEUR } from '@/config/catalog';
import type { Cart } from '../_lib/state';
import Summary from './Summary';

const ACCENT = 'var(--accent-calc)';

/**
 * Bar sticky bottom visible solo en mobile (md:hidden).
 *
 *   - Estado cerrado: ~80px alto, muestra total hoy + recurring + chevron.
 *   - Pulsar cualquier parte del bar abre un drawer con el Summary completo.
 *   - Drawer se cierra por: tap en overlay, swipe down (drag-to-dismiss),
 *     botón X, o tecla Escape.
 *   - Mientras el drawer está abierto: body scroll bloqueado y el bar se oculta.
 *   - Accesibilidad: drawer con role=dialog, aria-modal, aria-labelledby.
 */
export default function MobileSummaryBar({ cart }: { cart: Cart }) {
  const [open, setOpen] = useState(false);
  const cadenceLabel = cart.cadence === 'yearly' ? '/año' : '/mes';
  const hasRecurring = cart.recurringTotal > 0;
  const hasContent = cart.todayTotal > 0;

  // Body scroll lock + Escape key cuando el drawer está abierto.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!hasContent) return null;

  return (
    <>
      {/* === Bar (oculto cuando drawer abierto para que no aparezca solapado) === */}
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'tween', duration: 0.2 }}
            aria-label="Ver detalle del resumen"
            aria-expanded={open}
            className="fixed inset-x-0 bottom-0 z-40 flex w-full items-center justify-between gap-4 border-t px-5 pt-3 pb-[max(env(safe-area-inset-bottom),12px)] text-left md:hidden"
            style={{
              background: 'rgba(7,5,14,0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderColor: `${ACCENT}30`,
            }}
          >
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                Total a pagar hoy
              </p>
              <p
                className="mt-0.5 font-display text-xl tabular-nums text-white"
                style={{ letterSpacing: '-0.02em', fontWeight: 800 }}
              >
                {formatEUR(cart.todayTotal)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-right">
              {hasRecurring && (
                <p className="text-[11px] leading-tight text-white/65">
                  luego{' '}
                  <span className="font-mono text-white">
                    {formatEUR(cart.recurringTotal)}
                    <span className="text-white/45">{cadenceLabel}</span>
                  </span>
                </p>
              )}
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: `${ACCENT}1A`, color: ACCENT, border: `1px solid ${ACCENT}40` }}
                aria-hidden="true"
              >
                <ChevronUp size={16} />
              </span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* === Drawer + overlay === */}
      <AnimatePresence>
        {open && (
          <div className="md:hidden">
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.div
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-summary-title"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500) setOpen(false);
              }}
              className="fixed inset-x-0 bottom-0 z-[51] max-h-[80vh] overflow-y-auto rounded-t-3xl border-t pb-[max(env(safe-area-inset-bottom),16px)]"
              style={{
                background: 'rgba(13,9,24,0.98)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                borderColor: `${ACCENT}40`,
              }}
            >
              {/* Drag handle */}
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b px-5 py-3" style={{ background: 'inherit', borderColor: 'var(--border-subtle)' }}>
                <div className="mx-auto h-1 w-12 rounded-full bg-white/20" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar resumen"
                  className="absolute right-4 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5">
                <h2 id="mobile-summary-title" className="sr-only">
                  Resumen de tu plan
                </h2>
                <Summary cart={cart} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
