'use client';

import { formatEUR } from '@/config/catalog';
import type { Cart } from '../_lib/state';

const ACCENT = 'var(--accent-calc)';

export default function Summary({ cart }: { cart: Cart }) {
  const cadenceLabel = cart.cadence === 'yearly' ? '/año' : '/mes';
  const recurringLabel = cart.cadence === 'yearly' ? 'Suscripción anual' : 'Suscripción mensual';
  const hasRecurring = cart.recurringTotal > 0;
  const hasOneTime = cart.oneTimeTotal > 0;

  return (
    <aside
      aria-label="Resumen de tu plan"
      className="rounded-2xl glass p-6 md:sticky md:top-24"
      style={{ border: `1px solid ${ACCENT}30` }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Tu plan</p>
      <h3 className="mt-2 font-display text-xl text-white" style={{ letterSpacing: '-0.02em', fontWeight: 700 }}>
        Resumen
      </h3>

      <div className="mt-5 space-y-2 text-sm">
        {cart.oneTime.length === 0 && cart.recurring.length === 0 ? (
          <p className="text-white/50">Aún no hay servicios añadidos.</p>
        ) : (
          <>
            {cart.oneTime.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-wider text-white/40">Pago único</p>
                <ul className="space-y-1.5">
                  {cart.oneTime.map((l) => (
                    <li key={l.catalogId} className="flex items-baseline justify-between gap-3 text-white/75">
                      <span className="min-w-0 truncate">{l.item.name}</span>
                      <span className="shrink-0 font-mono text-white">{formatEUR(l.lineTotal)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {cart.recurring.length > 0 && (
              <div className={cart.oneTime.length > 0 ? 'mt-4' : ''}>
                <p className="mb-2 text-[11px] uppercase tracking-wider text-white/40">{recurringLabel}</p>
                <ul className="space-y-1.5">
                  {cart.recurring.map((l) => (
                    <li key={l.catalogId} className="flex items-baseline justify-between gap-3 text-white/75">
                      <span className="min-w-0 truncate">
                        {l.item.name}
                        {l.quantity > 1 && <span className="text-white/45"> ×{l.quantity}</span>}
                      </span>
                      <span className="shrink-0 font-mono text-white">
                        {formatEUR(l.lineTotal)}
                        <span className="text-white/45">{cadenceLabel}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-6 space-y-2 border-t pt-5 text-sm" style={{ borderColor: 'var(--border-subtle)' }}>
        <Row label="Pago único hoy" value={formatEUR(cart.oneTimeTotal)} />
        <Row
          label={recurringLabel}
          value={hasRecurring ? `${formatEUR(cart.recurringTotal)}${cadenceLabel}` : '—'}
        />
      </div>

      <div className="mt-5 rounded-xl px-4 py-4" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}40` }}>
        <p className="text-[11px] uppercase tracking-wider text-white/55">Total a pagar hoy</p>
        <p className="mt-1 font-display text-3xl tabular-nums text-white" style={{ letterSpacing: '-0.02em', fontWeight: 800 }}>
          {formatEUR(cart.todayTotal)}
        </p>
        {hasRecurring && hasOneTime && (
          <p className="mt-1 text-[11px] text-white/50">
            Pago único + primer cargo {cart.cadence === 'yearly' ? 'anual' : 'mensual'}.
          </p>
        )}
        {hasRecurring && !hasOneTime && (
          <p className="mt-1 text-[11px] text-white/50">
            Primer cargo {cart.cadence === 'yearly' ? 'anual' : 'mensual'}.
          </p>
        )}
      </div>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-white/55">{label}</span>
      <span className="font-mono text-white">{value}</span>
    </div>
  );
}
