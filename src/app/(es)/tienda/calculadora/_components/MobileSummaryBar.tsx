'use client';
import { useRef } from 'react';
import { List, X } from 'lucide-react';
import { formatEUR } from '@/lib/quotes/catalog';
import type { Cart } from '../_lib/state';
import Summary from './Summary';
import styles from '../quote.module.css';
export default function MobileSummaryBar({ cart }: { cart: Cart }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return <><button type="button" className={styles.mobileBar} onClick={() => dialog.current?.showModal()} aria-haspopup="dialog" aria-label={`Ver presupuesto: ${formatEUR(cart.oneTimeTotal)} de creación y extras, más ${formatEUR(cart.recurringTotal)} al mes. IVA no incluido.`}><span><span className="block text-[10px] uppercase tracking-widest text-white/60">Tu presupuesto · sin IVA</span><span className="mt-1 block font-mono text-sm">{formatEUR(cart.oneTimeTotal)} + <strong className="text-amber-300">{formatEUR(cart.recurringTotal)}/mes</strong></span></span><List size={20} aria-hidden="true" /></button><dialog ref={dialog} className={styles.dialog} aria-labelledby="mobile-quote-title" onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}><div className="mb-4 flex items-center justify-between gap-4"><h2 id="mobile-quote-title" className="font-display text-xl font-bold">Todo, desglosado</h2><button type="button" className={styles.button} onClick={() => dialog.current?.close()} aria-label="Cerrar presupuesto"><X size={18} /></button></div><Summary cart={cart} /></dialog></>;
}
