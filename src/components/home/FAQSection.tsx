'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Reveal } from '../effects/Reveal';
import { FAQS } from './faq-data';

function Item({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: i * 0.04 }}
      className="overflow-hidden rounded-2xl border transition-colors"
      style={{
        background: open ? 'var(--bg-glass-strong)' : 'var(--bg-glass)',
        borderColor: open ? 'var(--border-glow)' : 'var(--border-subtle)',
      }}
    >
      <button
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        aria-controls={`faq-panel-${i}`}
        id={`faq-trigger-${i}`}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors"
      >
        <span className="text-sm font-medium text-white md:text-base">{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
          <Plus size={18} className="text-white/60" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
            id={`faq-panel-${i}`}
            role="region"
            aria-labelledby={`faq-trigger-${i}`}
          >
            <div className="px-6 pb-5 pr-12 text-sm leading-relaxed text-white/65">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  return (
    <section className="relative z-10 py-32">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal>
          <div className="mb-16 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">FAQ</p>
            <h2 className="font-display text-balance text-4xl md:text-6xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
              Las preguntas<br />
              <span style={{ color: 'var(--purple-300)' }}>que recibimos siempre.</span>
            </h2>
          </div>
        </Reveal>

        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <Item key={i} {...f} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
