'use client';

const ACCENT = 'var(--accent-calc)';

export default function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div
      role="progressbar"
      aria-valuenow={step}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Paso ${step} de ${total}`}
      className="relative h-1.5 w-full overflow-hidden rounded-full"
      style={{ background: 'rgba(255,255,255,0.08)' }}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${ACCENT}, #F97316)` }}
      />
    </div>
  );
}
