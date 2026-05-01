'use client';

import type { ReactNode } from 'react';

const ACCENT = 'var(--accent-calc)';

export function StepHeader({
  index,
  total,
  title,
  subtitle,
  forced,
}: {
  index: number;
  total: number;
  title: string;
  subtitle?: string;
  forced?: boolean;
}) {
  return (
    <header className="mb-7">
      <div className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
        <span style={{ color: ACCENT }}>Paso {index} / {total}</span>
        {forced && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px]"
            style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}40` }}
          >
            Incluido en tu pack
          </span>
        )}
      </div>
      <h2 className="font-display text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
        {title}
      </h2>
      {subtitle && <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/65">{subtitle}</p>}
    </header>
  );
}

export function OptionCard({
  selected,
  onClick,
  children,
  ariaLabel,
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className="group w-full rounded-2xl p-5 text-left transition-all focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        background: selected ? `${ACCENT}12` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${selected ? ACCENT + '60' : 'var(--border-subtle)'}`,
        boxShadow: selected ? `0 0 0 1px ${ACCENT}40, 0 0 30px ${ACCENT}20` : 'none',
      }}
    >
      {children}
    </button>
  );
}

export function ToggleGroup({ children }: { children: ReactNode }) {
  return (
    <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
      {children}
    </div>
  );
}
