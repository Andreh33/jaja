'use client';

import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { CATALOG, formatEUR, pickAiPhone, pickAiWeb, pickBlogPost, pickHosting, pickSocial, pickTienda, pickWebCreation } from '@/config/catalog';
import { OptionCard, StepHeader, ToggleGroup } from './StepShell';
import type { AiAgent, ContactState, WizardState } from '../_lib/state';

const ACCENT = 'var(--accent-calc)';

type Dispatch = (action: import('../_lib/state').WizardAction) => void;

/* ============ PASO 1: PÁGINA WEB (FORZADO) ============ */
export function Step1Web({ state, dispatch }: { state: WizardState; dispatch: Dispatch }) {
  const le8 = pickWebCreation(false);
  const gt8 = pickWebCreation(true);
  return (
    <div>
      <StepHeader
        index={1}
        total={9}
        title="Página web"
        subtitle="La base de todo. Diseño profesional, SEO técnico y entrega en 24-48h. Este servicio está incluido en tu pack."
        forced
      />
      <p className="mb-4 text-sm text-white/70">¿Vas a necesitar más de 8 páginas?</p>
      <ToggleGroup>
        <OptionCard
          selected={!state.webPagesOver8}
          onClick={() => dispatch({ type: 'SET_WEB_OVER8', value: false })}
          ariaLabel="Hasta 8 páginas"
        >
          <p className="font-display text-lg text-white">No, hasta 8 páginas</p>
          <p className="mt-1 text-xs text-white/55">{le8.description}</p>
          <p className="mt-3 font-mono text-base" style={{ color: ACCENT }}>{formatEUR(le8.amount)} <span className="text-white/45">pago único</span></p>
        </OptionCard>
        <OptionCard
          selected={state.webPagesOver8}
          onClick={() => dispatch({ type: 'SET_WEB_OVER8', value: true })}
          ariaLabel="Más de 8 páginas"
        >
          <p className="font-display text-lg text-white">Sí, más de 8 páginas</p>
          <p className="mt-1 text-xs text-white/55">{gt8.description}</p>
          <p className="mt-3 font-mono text-base" style={{ color: ACCENT }}>{formatEUR(gt8.amount)} <span className="text-white/45">pago único</span></p>
        </OptionCard>
      </ToggleGroup>
    </div>
  );
}

/* ============ PASO 2: HOSTING (FORZADO) ============ */
export function Step2Hosting({ state, dispatch }: { state: WizardState; dispatch: Dispatch }) {
  const m = pickHosting('monthly');
  const y = pickHosting('yearly');
  const equivalentMonthly = y.amount / 12;
  const yearlyMonthlyEquiv = m.amount * 12;
  const savings = yearlyMonthlyEquiv - y.amount;

  return (
    <div>
      <StepHeader
        index={2}
        total={9}
        title="Hosting + dominio + SEO básico"
        subtitle="Hosting profesional, dominio incluido y SEO básico mensual. Este servicio está incluido en tu pack — solo eliges la cadencia."
        forced
      />
      <ToggleGroup>
        <OptionCard
          selected={state.hostingCadence === 'monthly'}
          onClick={() => dispatch({ type: 'SET_CADENCE', value: 'monthly' })}
          ariaLabel="Hosting mensual"
        >
          <p className="font-display text-lg text-white">Mensual</p>
          <p className="mt-1 text-xs text-white/55">Pago cada mes, sin compromiso anual.</p>
          <p className="mt-3 font-mono text-base" style={{ color: ACCENT }}>{formatEUR(m.amount)} <span className="text-white/45">/mes</span></p>
        </OptionCard>
        <OptionCard
          selected={state.hostingCadence === 'yearly'}
          onClick={() => dispatch({ type: 'SET_CADENCE', value: 'yearly' })}
          ariaLabel="Hosting anual"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="font-display text-lg text-white">Anual</p>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}50` }}
            >
              Recomendado
            </span>
          </div>
          <p className="mt-1 text-xs text-white/55">
            Equivale a {formatEUR(equivalentMonthly)}/mes — ahorras {formatEUR(savings)}.
          </p>
          <p className="mt-3 font-mono text-base" style={{ color: ACCENT }}>{formatEUR(y.amount)} <span className="text-white/45">/año</span></p>
        </OptionCard>
      </ToggleGroup>
    </div>
  );
}

/* ============ PASO 3: TIENDA ============ */
export function Step3Tienda({ state, dispatch }: { state: WizardState; dispatch: Dispatch }) {
  const item = pickTienda(state.hostingCadence);
  const yearly = state.hostingCadence === 'yearly';
  return (
    <div>
      <StepHeader
        index={3}
        total={9}
        title="Tienda online"
        subtitle="Pasarela de pago, login de clientes, subir productos y carrito. Opcional — añádelo solo si vas a vender."
      />
      <ToggleGroup>
        <OptionCard selected={!state.tienda} onClick={() => dispatch({ type: 'SET_TIENDA', value: false })} ariaLabel="Sin tienda online">
          <p className="font-display text-lg text-white">No, gracias</p>
          <p className="mt-1 text-xs text-white/55">No necesitas vender online por ahora.</p>
        </OptionCard>
        <OptionCard selected={state.tienda} onClick={() => dispatch({ type: 'SET_TIENDA', value: true })} ariaLabel="Añadir tienda online">
          <p className="font-display text-lg text-white">Sí, añadir tienda</p>
          <p className="mt-1 text-xs text-white/55">{item.description}</p>
          <p className="mt-3 font-mono text-base" style={{ color: ACCENT }}>
            {yearly ? `${formatEUR(item.amount)} /año` : `${formatEUR(item.amount)} /mes`}
          </p>
          {yearly && (
            <p className="mt-1 text-[11px] text-white/55">
              Antes 240€/año, ahora 120€/año por tener hosting anual.
            </p>
          )}
        </OptionCard>
      </ToggleGroup>
    </div>
  );
}

/* ============ PASO 4: REDES ============ */
export function Step4Redes({ state, dispatch }: { state: WizardState; dispatch: Dispatch }) {
  const item = pickSocial(state.hostingCadence);
  const yearly = state.hostingCadence === 'yearly';
  return (
    <div>
      <StepHeader
        index={4}
        total={9}
        title="Gestión de redes sociales"
        subtitle="Damos visibilidad a tu marca. 2-3 publicaciones por semana, gestión completa de cuentas y comunidad."
      />
      <ToggleGroup>
        <OptionCard selected={!state.social} onClick={() => dispatch({ type: 'SET_SOCIAL', value: false })} ariaLabel="Sin gestión de redes">
          <p className="font-display text-lg text-white">No, gracias</p>
          <p className="mt-1 text-xs text-white/55">Gestiono mis redes por mi cuenta.</p>
        </OptionCard>
        <OptionCard selected={state.social} onClick={() => dispatch({ type: 'SET_SOCIAL', value: true })} ariaLabel="Añadir gestión de redes">
          <p className="font-display text-lg text-white">Sí, añadir redes</p>
          <p className="mt-1 text-xs text-white/55">2-3 publicaciones/semana, gestión completa.</p>
          <p className="mt-3 font-mono text-base" style={{ color: ACCENT }}>
            {yearly ? `${formatEUR(item.amount)} /año` : `${formatEUR(item.amount)} /mes`}
          </p>
        </OptionCard>
      </ToggleGroup>
    </div>
  );
}

/* ============ PASO 5: AGENTE IA ============ */
export function Step5AgenteIa({ state, dispatch }: { state: WizardState; dispatch: Dispatch }) {
  const web = pickAiWeb(state.hostingCadence);
  const phone = pickAiPhone(state.hostingCadence);
  const yearly = state.hostingCadence === 'yearly';
  const set = (v: AiAgent) => dispatch({ type: 'SET_AI', value: v });
  return (
    <div>
      <StepHeader
        index={5}
        total={9}
        title="Agente IA"
        subtitle="Atención automática 24/7 con voz natural. Elige uno (o ninguno)."
      />
      <div role="radiogroup" className="grid gap-3 md:grid-cols-3">
        <OptionCard selected={state.aiAgent === 'none'} onClick={() => set('none')} ariaLabel="Sin agente IA">
          <p className="font-display text-lg text-white">No, gracias</p>
          <p className="mt-1 text-xs text-white/55">No necesitas un agente IA por ahora.</p>
        </OptionCard>
        <OptionCard selected={state.aiAgent === 'web'} onClick={() => set('web')} ariaLabel="Agente IA en la web">
          <p className="font-display text-lg text-white">En la web</p>
          <p className="mt-1 text-xs text-white/55">Widget conversacional integrado en tu sitio.</p>
          <p className="mt-3 font-mono text-base" style={{ color: ACCENT }}>
            {yearly ? `${formatEUR(web.amount)} /año` : `${formatEUR(web.amount)} /mes`}
          </p>
        </OptionCard>
        <OptionCard selected={state.aiAgent === 'phone'} onClick={() => set('phone')} ariaLabel="Agente IA por teléfono">
          <p className="font-display text-lg text-white">Por teléfono</p>
          <p className="mt-1 text-xs text-white/55">Con número virtual incluido. Provisión manual tras el primer pago.</p>
          <p className="mt-3 font-mono text-base" style={{ color: ACCENT }}>
            {yearly ? `${formatEUR(phone.amount)} /año` : `${formatEUR(phone.amount)} /mes`}
          </p>
        </OptionCard>
      </div>
      <Link
        href="/tienda/agente-ia"
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ color: ACCENT }}
      >
        Conoce el agente IA en detalle <ArrowRight size={14} />
      </Link>
    </div>
  );
}

/* ============ PASO 6: BLOG ============ */
export function Step6Blog({ state, dispatch }: { state: WizardState; dispatch: Dispatch }) {
  const item = pickBlogPost(state.hostingCadence);
  const yearly = state.hostingCadence === 'yearly';
  const total = item.amount * state.blogPosts;
  return (
    <div>
      <StepHeader
        index={6}
        total={9}
        title="Blog"
        subtitle="El blog está incluido gratis. Si quieres que escribamos posts SEO para ti, indícanos cuántos al mes (0 si no quieres este servicio)."
      />
      <p className="mb-3 text-xs leading-relaxed text-white/55">
        Los posts incluyen copywriting analizando tu web para que te encuentren en Google. Cuantos más publiques,
        más probabilidades de aparecer cuando alguien busque temas relacionados.
      </p>
      <label htmlFor="blog-posts" className="mb-2 block text-sm text-white/70">
        Posts al mes
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <input
          id="blog-posts"
          type="number"
          min={0}
          max={100}
          step={1}
          inputMode="numeric"
          value={state.blogPosts}
          onChange={(e) => dispatch({ type: 'SET_BLOG_POSTS', value: parseInt(e.target.value || '0', 10) })}
          className="w-32 rounded-xl border bg-transparent px-4 py-3 text-center font-mono text-lg text-white focus:outline-none focus-visible:ring-2"
          style={{ borderColor: 'var(--border-subtle)' }}
          aria-describedby="blog-posts-hint"
        />
        <div className="flex flex-col gap-1">
          <p className="text-[11px]" style={{ color: ACCENT }}>
            Recomendamos 12 posts/mes para mejor SEO
          </p>
          <p id="blog-posts-hint" className="text-sm text-white/55">
            {state.blogPosts === 0 ? (
              <>Blog incluido gratis, sin posts gestionados.</>
            ) : (
              <>
                {state.blogPosts} × {formatEUR(item.amount)} ={' '}
                <span className="font-mono" style={{ color: ACCENT }}>
                  {formatEUR(total)}
                  {yearly ? '/año' : '/mes'}
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============ PASO 7: LOGO ============ */
export function Step7Logo({ state, dispatch }: { state: WizardState; dispatch: Dispatch }) {
  return (
    <div>
      <StepHeader
        index={7}
        total={9}
        title="Logo profesional"
        subtitle="Logo adaptado a la identidad de tu marca. Pago único, opcional."
      />
      <ToggleGroup>
        <OptionCard selected={!state.logo} onClick={() => dispatch({ type: 'SET_LOGO', value: false })} ariaLabel="Sin logo">
          <p className="font-display text-lg text-white">No, gracias</p>
          <p className="mt-1 text-xs text-white/55">Ya tengo logo o no lo necesito.</p>
        </OptionCard>
        <OptionCard selected={state.logo} onClick={() => dispatch({ type: 'SET_LOGO', value: true })} ariaLabel="Añadir logo">
          <p className="font-display text-lg text-white">Sí, añadir logo</p>
          <p className="mt-1 text-xs text-white/55">Logo adaptado a la identidad de tu marca.</p>
          <p className="mt-3 font-mono text-base" style={{ color: ACCENT }}>
            {formatEUR(CATALOG.logo.amount)} <span className="text-white/45">pago único</span>
          </p>
        </OptionCard>
      </ToggleGroup>
    </div>
  );
}

/* ============ PASO 8: CONTACTO ============ */
export function Step8Cuenta({ state, dispatch }: { state: WizardState; dispatch: Dispatch }) {
  const c = state.contact;
  const set = (patch: Partial<ContactState>) => dispatch({ type: 'SET_CONTACT', patch });

  // Comprobación ligera de email contra el endpoint cuando sale del campo.
  const onEmailBlur = async () => {
    const email = c.email.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      set({ isExistingEmail: null });
      return;
    }
    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        set({ isExistingEmail: null });
        return;
      }
      const data = (await res.json()) as { exists: boolean };
      set({ isExistingEmail: data.exists });
    } catch {
      set({ isExistingEmail: null });
    }
  };

  return (
    <div>
      <StepHeader
        index={8}
        total={9}
        title="Tus datos"
        subtitle="Necesitamos crear (o reconocer) tu cuenta antes del pago. Si ya tienes cuenta, te identificamos al instante."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Field id="c-name" label="Nombre completo" value={c.name} onChange={(v) => set({ name: v })} autoComplete="name" required />
        <Field id="c-email" type="email" label="Email" value={c.email} onChange={(v) => set({ email: v })} onBlur={onEmailBlur} autoComplete="email" required />
        <Field id="c-phone" type="tel" label="Teléfono" value={c.phone} onChange={(v) => set({ phone: v })} autoComplete="tel" required />
        <Field id="c-company" label="Empresa (opcional)" value={c.company} onChange={(v) => set({ company: v })} autoComplete="organization" />
      </div>

      {c.isExistingEmail !== null && (
        <p
          className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs"
          style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}40`, color: ACCENT }}
        >
          {c.isExistingEmail ? (
            <>
              <Check size={12} /> Reconocemos tu cuenta. Introduce tu contraseña.
            </>
          ) : (
            <>
              <Check size={12} /> Email nuevo. Te crearemos una cuenta.
            </>
          )}
        </p>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field id="c-pass" type="password" label="Contraseña" value={c.password} onChange={(v) => set({ password: v })} autoComplete={c.isExistingEmail ? 'current-password' : 'new-password'} required />
        {c.isExistingEmail !== true && (
          <Field id="c-pass2" type="password" label="Confirmar contraseña" value={c.confirmPassword} onChange={(v) => set({ confirmPassword: v })} autoComplete="new-password" required />
        )}
      </div>
      <p className="mt-2 text-[11px] text-white/45">Mínimo 8 caracteres con al menos una letra y un número.</p>

      <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm text-white/70">
        <input
          type="checkbox"
          checked={c.acceptTerms}
          onChange={(e) => set({ acceptTerms: e.target.checked })}
          className="mt-1 h-4 w-4 rounded"
          style={{ accentColor: '#FBBF24' }}
        />
        <span>
          Acepto los{' '}
          <Link href="/terminos" target="_blank" className="underline" style={{ color: ACCENT }}>términos</Link>{' '}
          y la{' '}
          <Link href="/privacidad" target="_blank" className="underline" style={{ color: ACCENT }}>política de privacidad</Link>.
        </span>
      </label>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  onBlur,
  type = 'text',
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">
        {label} {required && <span className="text-white/30">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoComplete={autoComplete}
        className="w-full rounded-xl border bg-transparent px-4 py-3 text-base text-white placeholder-white/30 focus:outline-none focus-visible:ring-2 md:text-sm"
        style={{ borderColor: 'var(--border-subtle)' }}
      />
    </div>
  );
}

/* ============ PASO 9: RESUMEN FINAL ============ */
export function Step9Resumen({
  state,
  cart,
  loading,
  error,
  onSubmit,
}: {
  state: WizardState;
  cart: ReturnType<typeof import('../_lib/state').buildCart>;
  loading: boolean;
  error: string | null;
  onSubmit: () => void;
}) {
  const cadenceLabel = cart.cadence === 'yearly' ? '/año' : '/mes';
  return (
    <div>
      <StepHeader
        index={9}
        total={9}
        title="Tu plan, listo"
        subtitle="Revisa el desglose final. Al pulsar Ir a pagar te enviamos al checkout seguro de Stripe."
      />

      <div className="space-y-6">
        {cart.oneTime.length > 0 && (
          <Section title="Pago único">
            {cart.oneTime.map((l) => (
              <SummaryLine key={l.catalogId} name={l.item.name} value={`${formatEUR(l.lineTotal)}`} />
            ))}
            <SummaryLine
              name={<span className="text-white/55">Subtotal pago único</span>}
              value={<span className="font-mono text-white">{formatEUR(cart.oneTimeTotal)}</span>}
            />
          </Section>
        )}
        {cart.recurring.length > 0 && (
          <Section title={cart.cadence === 'yearly' ? 'Suscripción anual' : 'Suscripción mensual'}>
            {cart.recurring.map((l) => (
              <SummaryLine
                key={l.catalogId}
                name={
                  <>
                    {l.item.name}
                    {l.quantity > 1 && <span className="text-white/45"> ×{l.quantity}</span>}
                  </>
                }
                value={`${formatEUR(l.lineTotal)}${cadenceLabel}`}
              />
            ))}
            <SummaryLine
              name={<span className="text-white/55">Subtotal {cart.cadence === 'yearly' ? 'anual' : 'mensual'}</span>}
              value={<span className="font-mono text-white">{formatEUR(cart.recurringTotal)}{cadenceLabel}</span>}
            />
          </Section>
        )}

        <div className="rounded-2xl px-5 py-5" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}50` }}>
          <p className="text-[11px] uppercase tracking-wider text-white/55">Total a pagar hoy</p>
          <p className="mt-1 font-display text-4xl tabular-nums text-white" style={{ letterSpacing: '-0.02em', fontWeight: 800 }}>
            {formatEUR(cart.todayTotal)}
          </p>
        </div>

        {error && (
          <p className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)' }}>
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-4 text-base font-semibold text-black transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 md:w-auto md:px-12"
          style={{ background: ACCENT }}
        >
          {loading ? 'Redirigiendo…' : (<>Ir a pagar <ArrowRight size={18} /></>)}
        </button>
        <p className="text-[11px] text-white/45">
          Pago seguro mediante Stripe. Te crearemos la cuenta al confirmar el pago si aún no la tenías.
        </p>
        {/* Datos compactos para confirmar selección */}
        <details className="rounded-xl border px-4 py-3 text-sm text-white/65" style={{ borderColor: 'var(--border-subtle)' }}>
          <summary className="cursor-pointer">Ver datos de contacto</summary>
          <div className="mt-3 grid gap-1 font-mono text-xs">
            <span>{state.contact.name}</span>
            <span>{state.contact.email}</span>
            <span>{state.contact.phone}</span>
            {state.contact.company && <span>{state.contact.company}</span>}
          </div>
        </details>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl glass p-5">
      <p className="mb-3 text-[11px] uppercase tracking-wider text-white/45">{title}</p>
      <ul className="space-y-2 text-sm">{children}</ul>
    </div>
  );
}

function SummaryLine({ name, value }: { name: React.ReactNode; value: React.ReactNode }) {
  return (
    <li className="flex items-baseline justify-between gap-3 text-white/80">
      <span>{name}</span>
      <span className="font-mono text-white">{value}</span>
    </li>
  );
}
