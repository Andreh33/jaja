'use client';

import { useEffect, useReducer, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  buildCart,
  clearStorage,
  INITIAL_STATE,
  isStepValid,
  loadFromStorage,
  reducer,
  saveToStorage,
  TOTAL_STEPS,
} from './_lib/state';
import ProgressBar from './_components/ProgressBar';
import Summary from './_components/Summary';
import MobileSummaryBar from './_components/MobileSummaryBar';
import SeoHorasBlock from './_components/SeoHorasBlock';
import {
  Step1Web,
  Step2Hosting,
  Step3Tienda,
  Step4Redes,
  Step5AgenteIa,
  Step6Blog,
  Step7Logo,
  Step8Cuenta,
  Step9Resumen,
} from './_components/Steps';

const ACCENT = 'var(--accent-calc)';

export default function CalculadoraClient() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Hidratar desde sessionStorage en cliente.
  useEffect(() => {
    const restored = loadFromStorage();
    if (restored) dispatch({ type: 'HYDRATE', state: restored });
    setHydrated(true);
  }, []);

  // Persistir cada cambio (excepto antes de hidratar para no sobrescribir).
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(state);
  }, [state, hydrated]);

  const cart = buildCart(state);
  const stepValid = isStepValid(state.step, state);

  const handleNext = () => {
    if (!stepValid) return;
    if (state.step < TOTAL_STEPS) dispatch({ type: 'NEXT' });
  };
  const handlePrev = () => {
    if (state.step > 1) dispatch({ type: 'PREV' });
  };

  // Enter global: avanza solo si el foco NO está en un input/textarea/select.
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter') return;
    const target = e.target as HTMLElement;
    const tag = target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (target.isContentEditable) return;
    e.preventDefault();
    if (state.step < TOTAL_STEPS) handleNext();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selection: {
            webPagesOver8: state.webPagesOver8,
            hostingCadence: state.hostingCadence,
            tienda: state.tienda,
            social: state.social,
            aiAgent: state.aiAgent,
            blogPosts: state.blogPosts,
            logo: state.logo,
          },
          contact: {
            name: state.contact.name.trim(),
            email: state.contact.email.trim().toLowerCase(),
            phone: state.contact.phone.trim(),
            company: state.contact.company.trim() || undefined,
            password: state.contact.password,
            isExistingEmail: state.contact.isExistingEmail,
          },
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setSubmitError(data.error || 'No se pudo iniciar el pago.');
        setSubmitting(false);
        return;
      }
      clearStorage();
      window.location.assign(data.url);
    } catch {
      setSubmitError('Error de red. Inténtalo de nuevo.');
      setSubmitting(false);
    }
  };

  return (
    <div onKeyDown={handleKeyDown}>
      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <ProgressBar step={state.step} total={TOTAL_STEPS} />

          <div className="mt-8 rounded-3xl glass p-6 md:p-10">
            {state.step === 1 && <Step1Web state={state} dispatch={dispatch} />}
            {state.step === 2 && <Step2Hosting state={state} dispatch={dispatch} />}
            {state.step === 3 && <Step3Tienda state={state} dispatch={dispatch} />}
            {state.step === 4 && <Step4Redes state={state} dispatch={dispatch} />}
            {state.step === 5 && <Step5AgenteIa state={state} dispatch={dispatch} />}
            {state.step === 6 && <Step6Blog state={state} dispatch={dispatch} />}
            {state.step === 7 && <Step7Logo state={state} dispatch={dispatch} />}
            {state.step === 8 && <Step8Cuenta state={state} dispatch={dispatch} />}
            {state.step === 9 && (
              <Step9Resumen
                state={state}
                cart={cart}
                loading={submitting}
                error={submitError}
                onSubmit={handleSubmit}
              />
            )}
          </div>

          {/* Navegación */}
          {state.step < TOTAL_STEPS && (
            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrev}
                disabled={state.step === 1}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 py-3 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 md:py-2.5"
                aria-label="Paso anterior"
              >
                <ArrowLeft size={14} /> Anterior
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!stepValid}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-black transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 md:py-3"
                style={{ background: ACCENT }}
                aria-label="Paso siguiente"
              >
                Siguiente <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>

        <div>
          <Summary cart={cart} />
        </div>
      </div>

      <div className="mt-20">
        <SeoHorasBlock />
      </div>

      {/* Sticky bottom bar solo en mobile */}
      <MobileSummaryBar cart={cart} />
    </div>
  );
}
