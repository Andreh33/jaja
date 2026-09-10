import { Plus } from 'lucide-react';
import { Reveal } from '../effects/Reveal';
import { FAQS } from './faq-data';

function Item({ q, a, i }: { q: string; a: string; i: number }) {
  return (
    <Reveal delay={i * .04}>
      <details className="group overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-glass)] transition-colors open:border-[var(--border-glow)] open:bg-[var(--bg-glass-strong)]">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-purple-300 [&::-webkit-details-marker]:hidden">
          <span className="text-sm font-medium text-white md:text-base">{q}</span>
          <Plus size={18} aria-hidden className="shrink-0 text-white/60 transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none" />
        </summary>
        <div className="px-6 pb-5 pr-12 text-sm leading-relaxed text-white/65">{a}</div>
      </details>
    </Reveal>
  );
}

export default function FAQSection() {
  return (
    <section className="relative z-10 py-32">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal>
          <div className="mb-16 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">FAQ</p>
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
