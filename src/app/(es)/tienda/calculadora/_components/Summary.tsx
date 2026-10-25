'use client';
import { QUOTE_TAX_LABEL, formatEUR } from '@/lib/quotes/catalog';
import type { Cart } from '../_lib/state';
import styles from '../quote.module.css';
export default function Summary({ cart }: { cart: Cart }) {
  return <aside aria-label="Desglose de tu presupuesto" className={styles.summary}>
    <p className="text-xs font-semibold uppercase tracking-[.2em] text-amber-300">Tu presupuesto</p>
    <p className="mt-2 text-xs leading-relaxed text-white/60">Selecciona lo que necesitas. El desglose cambia contigo.</p>
    <div className="mt-6 space-y-6">{[{ title: 'Creación y extras · pago único', lines: cart.oneTime }, { title: 'Servicios · cada mes', lines: cart.recurring }].map(group => <div key={group.title}><h3 className="mb-3 text-xs font-medium text-white/60">{group.title}</h3><ul className="space-y-3 text-sm">{group.lines.map(l => <li key={l.catalogId} className="flex items-start justify-between gap-3"><span className="min-w-0 text-white/85">{l.item.name}{l.quantity > 1 ? ` × ${l.quantity}` : ''}</span><span className={`${styles.amount} font-mono text-white`}>{formatEUR(l.lineTotal)}</span></li>)}</ul></div>)}</div>
    <dl className={`mt-6 space-y-3 ${styles.priceBox}`}><div className="flex justify-between gap-3"><dt className="text-sm text-white/65">Pago único</dt><dd className={`${styles.amount} font-mono text-white`}>{formatEUR(cart.oneTimeTotal)}</dd></div><div className="flex items-baseline justify-between gap-3"><dt className="text-sm text-white/65">Cuota mensual</dt><dd className={`${styles.amount} font-display text-3xl font-bold text-amber-300`}>{formatEUR(cart.recurringTotal)}<span className="text-sm font-normal">/mes</span></dd></div></dl>
    <p className="mt-4 flex justify-between gap-3 text-xs text-white/70"><span>Primer mes con creación</span><strong className={styles.amount}>{formatEUR(cart.firstMonthTotal)}</strong></p>
    <p className="mt-4 text-xs font-semibold text-white/85">{QUOTE_TAX_LABEL}.</p><p className="mt-2 text-xs leading-relaxed text-white/55">Importes orientativos. Confirmamos alcance y calendario contigo antes de contratar.</p>
  </aside>;
}
