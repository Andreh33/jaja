'use client';
import { createContext, useContext, useId, type ReactNode } from 'react';
import styles from '../quote.module.css';

const RadioName = createContext('quote-choice');
export function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return <header className="mb-7"><h2 id="quote-step-title" tabIndex={-1} className={`${styles.heading} font-display text-2xl font-extrabold tracking-tight text-white md:text-4xl`}>{title}</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">{subtitle}</p></header>;
}
export function OptionCard({ selected, onClick, children, ariaLabel }: { selected: boolean; onClick: () => void; children: ReactNode; ariaLabel: string }) {
  const name = useContext(RadioName); const id = useId();
  return <label className={styles.option} data-selected={selected}><input className={styles.radio} type="radio" name={name} value={id} checked={selected} onChange={onClick} aria-label={ariaLabel} /><span className={styles.marker} aria-hidden="true" />{children}</label>;
}
export function ToggleGroup({ children, label, columns = 2 }: { children: ReactNode; label: string; columns?: 2 | 3 }) {
  const name = useId();
  return <fieldset><legend className="mb-3 text-sm font-semibold text-white/85">{label}</legend><RadioName.Provider value={name}><div className={`grid gap-3 ${columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>{children}</div></RadioName.Provider></fieldset>;
}
