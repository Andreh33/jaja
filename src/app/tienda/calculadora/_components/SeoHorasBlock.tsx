'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowRight, Check, MessageCircle } from 'lucide-react';
import { CATALOG, formatEUR } from '@/config/catalog';
import { whatsappLink } from '@/lib/stripe-links';

const ACCENT = 'var(--accent-calc)';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d\s]{6,20}$/;
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

type ContactState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  isExistingEmail: boolean | null;
};

const INITIAL_CONTACT: ContactState = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
  isExistingEmail: null,
};

export default function SeoHorasBlock() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isLoadingSession = status === 'loading';

  const [hours, setHours] = useState(4);
  const [contact, setContact] = useState<ContactState>(INITIAL_CONTACT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = CATALOG.seoHour.amount * hours;
  const hoursValid = Number.isInteger(hours) && hours >= 1;
  const contactValid = isAuthenticated || isContactValid(contact);
  const valid = hoursValid && contactValid && !isLoadingSession;

  const onEmailBlur = async () => {
    const email = contact.email.trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email)) {
      setContact((c) => ({ ...c, isExistingEmail: null }));
      return;
    }
    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setContact((c) => ({ ...c, isExistingEmail: null }));
        return;
      }
      const data = (await res.json()) as { exists: boolean };
      setContact((c) => ({ ...c, isExistingEmail: data.exists }));
    } catch {
      setContact((c) => ({ ...c, isExistingEmail: null }));
    }
  };

  const onSubmit = async () => {
    if (!valid) return;
    setLoading(true);
    setError(null);
    try {
      const body: { hours: number; contact?: Omit<ContactState, 'confirmPassword' | 'acceptTerms'> } = { hours };
      if (!isAuthenticated) {
        body.contact = {
          name: contact.name.trim(),
          email: contact.email.trim().toLowerCase(),
          phone: contact.phone.trim(),
          password: contact.password,
          isExistingEmail: contact.isExistingEmail,
        };
      }
      const res = await fetch('/api/checkout/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error || 'No se pudo iniciar el pago.');
        setLoading(false);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError('Error de red. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl p-6 md:p-12" style={{ background: 'rgba(7,5,14,0.55)', border: `1px solid ${ACCENT}30` }}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>SEO para web existente</p>
      <h2 className="font-display text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
        ¿Ya tienes web? Te mejoramos el SEO.
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/65">
        Auditoría técnica, palabras clave, contenido y enlaces. Pagas solo las horas que necesitas.
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-5">
        <div>
          <label htmlFor="seo-hours" className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">
            Horas
          </label>
          <input
            id="seo-hours"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            value={hours}
            onChange={(e) => setHours(Math.max(1, parseInt(e.target.value || '1', 10)))}
            className="w-32 rounded-xl border bg-transparent px-4 py-3 text-center font-mono text-lg text-white focus:outline-none focus-visible:ring-2"
            style={{ borderColor: 'var(--border-subtle)' }}
          />
        </div>
        <p className="text-sm text-white/65">
          {hours} h × {formatEUR(CATALOG.seoHour.amount)} ={' '}
          <span className="font-mono" style={{ color: ACCENT }}>{formatEUR(total)}</span>
        </p>
      </div>

      <p className="mt-5 text-xs text-white/55">
        ¿No sabes cuántas horas necesitas?{' '}
        <a
          href={whatsappLink('Hola, quiero asesoramiento sobre horas de SEO para mi web existente')}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 underline"
          style={{ color: ACCENT }}
        >
          Escríbenos y te asesoramos <MessageCircle size={12} />
        </a>
      </p>

      {/* Sub-form de contacto solo si no hay sesión activa. */}
      {!isLoadingSession && !isAuthenticated && (
        <ContactSubForm contact={contact} setContact={setContact} onEmailBlur={onEmailBlur} />
      )}

      {isAuthenticated && (
        <p
          className="mt-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs"
          style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}40`, color: ACCENT }}
        >
          <Check size={12} /> Comprarás como tu cuenta logueada.
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)' }}>
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!valid || loading}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-black transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2"
        style={{ background: ACCENT }}
      >
        {loading ? 'Redirigiendo…' : (<>Pagar {formatEUR(total)} <ArrowRight size={16} /></>)}
      </button>
    </section>
  );
}

function isContactValid(c: ContactState): boolean {
  if (!c.name.trim()) return false;
  if (!EMAIL_RE.test(c.email.trim())) return false;
  if (!PHONE_RE.test(c.phone.trim())) return false;
  if (!c.acceptTerms) return false;
  if (!PASSWORD_RE.test(c.password)) return false;
  if (c.isExistingEmail === false && c.password !== c.confirmPassword) return false;
  return true;
}

function ContactSubForm({
  contact: c,
  setContact,
  onEmailBlur,
}: {
  contact: ContactState;
  setContact: (updater: (prev: ContactState) => ContactState) => void;
  onEmailBlur: () => void;
}) {
  const set = (patch: Partial<ContactState>) => setContact((prev) => ({ ...prev, ...patch }));
  return (
    <div className="mt-7 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/50">Tus datos</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Field id="seo-c-name" label="Nombre completo" value={c.name} onChange={(v) => set({ name: v })} autoComplete="name" required />
        <Field id="seo-c-email" type="email" label="Email" value={c.email} onChange={(v) => set({ email: v })} onBlur={onEmailBlur} autoComplete="email" required />
        <Field id="seo-c-phone" type="tel" label="Teléfono" value={c.phone} onChange={(v) => set({ phone: v })} autoComplete="tel" required />
      </div>
      {c.isExistingEmail !== null && (
        <p
          className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs"
          style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}40`, color: ACCENT }}
        >
          {c.isExistingEmail ? (<><Check size={12} /> Reconocemos tu cuenta. Introduce tu contraseña.</>) : (<><Check size={12} /> Email nuevo. Te crearemos una cuenta.</>)}
        </p>
      )}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field id="seo-c-pass" type="password" label="Contraseña" value={c.password} onChange={(v) => set({ password: v })} autoComplete={c.isExistingEmail ? 'current-password' : 'new-password'} required />
        {c.isExistingEmail !== true && (
          <Field id="seo-c-pass2" type="password" label="Confirmar contraseña" value={c.confirmPassword} onChange={(v) => set({ confirmPassword: v })} autoComplete="new-password" required />
        )}
      </div>
      <p className="mt-2 text-[11px] text-white/45">Mínimo 8 caracteres con al menos una letra y un número.</p>

      <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-white/70">
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

