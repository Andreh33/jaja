'use client';
import { track } from '@vercel/analytics';
import { useEffect, useReducer, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { buildCart, clearStorage, INITIAL_STATE, isStepValid, loadFromStorage, reducer, saveToStorage, TOTAL_STEPS, type WizardAction } from './_lib/state';
import ProgressBar from './_components/ProgressBar';
import Summary from './_components/Summary';
import MobileSummaryBar from './_components/MobileSummaryBar';
import SeoHorasBlock from './_components/SeoHorasBlock';
import { StepProject, StepServices, StepContent, StepContact, StepReview } from './_components/Steps';
import styles from './quote.module.css';

export default function CalculadoraClient() {
  const [state, rawDispatch] = useReducer(reducer, INITIAL_STATE);
  const started = useRef(false);
  const recordedSteps = useRef(new Set<number>());
  function dispatch(action: WizardAction) {
    if (action.type !== 'HYDRATE' && action.type !== 'RESET' && !started.current) {
      started.current = true;
      try { track('calculator_start', { source: 'quote' }); } catch { /* Optional analytics. */ }
    }
    rawDispatch(action);
  }
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const shouldFocus = useRef(false);
  const workspace = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const restored = loadFromStorage();
    if (restored) rawDispatch({ type: 'HYDRATE', state: restored });
    // Browser-only recovery must finish before writing the initial server-rendered defaults.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) saveToStorage(state); }, [state, hydrated]);
  useEffect(() => {
    if (!shouldFocus.current) return;
    const heading = workspace.current?.querySelector<HTMLElement>('#quote-step-title');
    heading?.focus({ preventScroll: true });
    if (heading && (heading.getBoundingClientRect().top < 100 || heading.getBoundingClientRect().top > window.innerHeight * .6)) heading.scrollIntoView({ block: 'start', behavior: 'instant' });
    shouldFocus.current = false;
  }, [state]);
  const goTo = (step: number) => {
    if (step === TOTAL_STEPS && !isStepValid(4, state)) { setNotice('Revisa el email o el teléfono. Ambos pueden quedarse vacíos.'); step = 4; }
    else setNotice('');
    shouldFocus.current = true;
    dispatch({ type: 'GOTO', step });
    if (!recordedSteps.current.has(step)) {
      recordedSteps.current.add(step);
      try { track(step === TOTAL_STEPS ? 'calculator_complete' : 'calculator_step', { step, source: 'quote' }); } catch { /* Optional analytics. */ }
    }
  };
  const next = () => {
    if (!isStepValid(state.step, state)) { setNotice('Revisa el email o el teléfono. Ambos pueden quedarse vacíos.'); workspace.current?.querySelector<HTMLInputElement>('input[type="email"]')?.focus(); return; }
    goTo(state.step + 1);
  };
  const reset = () => { clearStorage(); started.current = false; recordedSteps.current.clear(); shouldFocus.current = true; dispatch({ type: 'RESET' }); setConfirmReset(false); setNotice('Presupuesto reiniciado.'); };
  const cart = buildCart(state);
  return <div ref={workspace} className={styles.workspace}>
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:gap-12"><div className="min-w-0"><ProgressBar step={state.step} onSelect={goTo} /><section aria-labelledby="quote-step-title" className={`${styles.panel} mt-6 p-5 sm:p-8 lg:p-9`}>
      {state.step === 1 && <StepProject state={state} dispatch={dispatch} />}{state.step === 2 && <StepServices state={state} dispatch={dispatch} />}{state.step === 3 && <StepContent state={state} dispatch={dispatch} />}{state.step === 4 && <StepContact state={state} dispatch={dispatch} />}{state.step === 5 && <StepReview state={state} cart={cart} onEdit={goTo} />}
      <p role="status" className="mt-4 text-sm text-amber-200">{notice}</p>
      <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/10 pt-6"><button type="button" onClick={() => goTo(state.step - 1)} disabled={state.step === 1} className={styles.button}><ArrowLeft size={16} /><span>Anterior</span></button>{state.step < TOTAL_STEPS && <button type="button" onClick={next} className={`${styles.button} ${styles.primary}`}><span>{state.step === 4 ? 'Ver presupuesto' : 'Continuar'}</span><ArrowRight size={16} /></button>}</div>
    </section><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="max-w-sm text-xs leading-relaxed text-white/50">Tus selecciones se conservan en esta pestaña. Los datos de contacto solo se mantienen mientras usas la página.</p><button type="button" onClick={() => setConfirmReset(v => !v)} className={`${styles.textButton} inline-flex items-center gap-2 text-xs`} aria-expanded={confirmReset}><RotateCcw size={13} />Empezar de nuevo</button></div>{confirmReset && <div className="mt-3 flex flex-wrap items-center gap-4 rounded-xl border border-white/15 p-4"><p className="text-sm text-white/75">¿Descartar las selecciones y el contexto?</p><button type="button" className={styles.button} onClick={() => setConfirmReset(false)}>Conservar</button><button type="button" className={`${styles.button} ${styles.primary}`} onClick={reset}>Reiniciar</button></div>}</div><div className="sticky top-28 hidden lg:block"><Summary cart={cart} /></div></div>
    {state.step !== TOTAL_STEPS && <MobileSummaryBar cart={cart} />}
    <SeoHorasBlock />
  </div>;
}
