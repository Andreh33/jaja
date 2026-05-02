'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const ACCENT = 'var(--accent-calc)';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d\s]{6,20}$/;
const MAX_CV_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTS = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp'];

type OfferProps = {
  id: string;
  title: string;
  slug: string;
  requiresComputer: 'si' | 'no' | 'depende';
};

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'uploading' }
  | { kind: 'sending' }
  | { kind: 'success' }
  | { kind: 'error'; message: string };

type FieldErrors = Partial<{
  fullName: string;
  email: string;
  phone: string;
  city: string;
  message: string;
  hasComputer: string;
  cv: string;
  gdpr: string;
}>;

export default function ApplicationForm({ offer }: { offer?: OfferProps }) {
  const askComputer = offer?.requiresComputer === 'si' || offer?.requiresComputer === 'depende';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [hasComputer, setHasComputer] = useState<'si' | 'no' | ''>('');
  const [cv, setCv] = useState<File | null>(null);
  const [gdpr, setGdpr] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<SubmitState>({ kind: 'idle' });

  const isBusy = state.kind === 'uploading' || state.kind === 'sending';

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (!fullName.trim()) e.fullName = 'Indica tu nombre.';
    if (!EMAIL_RE.test(email.trim())) e.email = 'Email no válido.';
    if (!PHONE_RE.test(phone.trim())) e.phone = 'Teléfono no válido.';
    if (!city.trim()) e.city = 'Indica tu ciudad.';
    if (message.length > 1000) e.message = 'El mensaje no puede superar 1000 caracteres.';
    if (askComputer && !hasComputer) e.hasComputer = 'Indica si tienes ordenador propio.';
    if (!cv) {
      e.cv = 'Sube tu CV.';
    } else {
      if (cv.size === 0) e.cv = 'El archivo está vacío.';
      else if (cv.size > MAX_CV_SIZE) e.cv = 'El archivo supera 10 MB.';
      else {
        const ext = cv.name.split('.').pop()?.toLowerCase() ?? '';
        if (!ALLOWED_EXTS.includes(ext)) e.cv = 'Formato no permitido. Usa PDF, DOC, DOCX, JPG, PNG o WebP.';
      }
    }
    if (!gdpr) e.gdpr = 'Debes aceptar la política de privacidad.';
    return e;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (!cv) return;

    // 1. Upload CV
    setState({ kind: 'uploading' });
    let cvUrl = '';
    let cvFilename = '';
    let cvSizeBytes = 0;
    try {
      const fd = new FormData();
      fd.append('file', cv);
      const res = await fetch('/api/upload/cv', { method: 'POST', body: fd });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        url?: string;
        filename?: string;
        size?: number;
        error?: string;
      };
      if (!res.ok || !body.ok || !body.url) {
        setState({ kind: 'error', message: body.error ?? 'No hemos podido subir tu CV.' });
        return;
      }
      cvUrl = body.url;
      cvFilename = body.filename ?? cv.name;
      cvSizeBytes = body.size ?? cv.size;
    } catch {
      setState({ kind: 'error', message: 'Error de red al subir el CV.' });
      return;
    }

    // 2. Send application
    setState({ kind: 'sending' });
    try {
      const res = await fetch('/api/empleo/candidatura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobOfferId: offer?.id ?? null,
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          city: city.trim(),
          message: message.trim() || null,
          hasComputer: askComputer ? hasComputer : null,
          cvBlobUrl: cvUrl,
          cvFilename,
          cvSizeBytes,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setState({ kind: 'error', message: body.error ?? 'No hemos podido enviar tu candidatura.' });
        return;
      }
      setState({ kind: 'success' });
    } catch {
      setState({ kind: 'error', message: 'Error de red al enviar la candidatura.' });
    }
  }

  if (state.kind === 'success') {
    return (
      <div
        className="rounded-2xl border p-8 text-center"
        style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.35)' }}
      >
        <CheckCircle2 size={42} className="mx-auto" style={{ color: '#22c55e' }} />
        <h3 className="mt-4 font-display text-xl text-white" style={{ letterSpacing: '-0.02em', fontWeight: 700 }}>
          Candidatura enviada
        </h3>
        <p className="mt-2 text-sm text-white/70">
          Si encajas con nosotros, te contactaremos por WhatsApp o email.
        </p>
      </div>
    );
  }

  const inputBase =
    'w-full rounded-xl border bg-transparent px-4 py-3 text-base text-white placeholder-white/30 focus:outline-none focus-visible:ring-2 md:text-sm';

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      noValidate
      aria-label={offer ? `Candidatura para ${offer.title}` : 'Candidatura espontánea'}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          id="apl-name"
          label="Nombre y apellidos"
          required
          value={fullName}
          onChange={setFullName}
          error={errors.fullName}
          autoComplete="name"
          inputClass={inputBase}
        />
        <Field
          id="apl-email"
          type="email"
          label="Email"
          required
          value={email}
          onChange={setEmail}
          error={errors.email}
          autoComplete="email"
          inputClass={inputBase}
        />
        <Field
          id="apl-phone"
          type="tel"
          label="Teléfono"
          required
          value={phone}
          onChange={setPhone}
          error={errors.phone}
          autoComplete="tel"
          placeholder="+34 600 000 000"
          inputClass={inputBase}
        />
        <Field
          id="apl-city"
          label="Ciudad"
          required
          value={city}
          onChange={setCity}
          error={errors.city}
          autoComplete="address-level2"
          inputClass={inputBase}
        />
      </div>

      <div>
        <label htmlFor="apl-msg" className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">
          Mensaje (opcional)
        </label>
        <textarea
          id="apl-msg"
          rows={4}
          maxLength={1000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${inputBase} resize-none`}
          style={{ borderColor: 'var(--border-subtle)' }}
          placeholder="Cuéntanos por qué encajas, links a tu portfolio, lo que quieras…"
        />
        <div className="mt-1 flex items-center justify-between text-[11px] text-white/40">
          <span>{errors.message}</span>
          <span>{message.length}/1000</span>
        </div>
      </div>

      {askComputer && (
        <fieldset>
          <legend className="mb-2 block text-xs uppercase tracking-wider text-white/50">
            ¿Tienes ordenador propio? <span className="text-white/30">*</span>
          </legend>
          <div className="flex gap-3">
            {(['si', 'no'] as const).map((v) => (
              <label
                key={v}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                  hasComputer === v ? 'text-white' : 'text-white/65'
                }`}
                style={{
                  background: hasComputer === v ? `${ACCENT}1A` : 'rgba(255,255,255,0.02)',
                  borderColor: hasComputer === v ? `${ACCENT}80` : 'var(--border-subtle)',
                }}
              >
                <input
                  type="radio"
                  name="has-computer"
                  value={v}
                  checked={hasComputer === v}
                  onChange={() => setHasComputer(v)}
                  className="sr-only"
                />
                {v === 'si' ? 'Sí' : 'No'}
              </label>
            ))}
          </div>
          {errors.hasComputer && (
            <p className="mt-2 inline-flex items-center gap-1 text-xs text-red-300">
              <AlertCircle size={12} /> {errors.hasComputer}
            </p>
          )}
        </fieldset>
      )}

      <div>
        <label htmlFor="apl-cv" className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">
          CV <span className="text-white/30">*</span>
          <span className="ml-2 text-[10px] normal-case text-white/40">PDF/DOC/DOCX/JPG/PNG/WebP, máx 10 MB</span>
        </label>
        <label
          htmlFor="apl-cv"
          className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border bg-transparent px-4 py-3 text-sm text-white/70 hover:bg-white/5"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <span className="flex items-center gap-2 truncate">
            <Upload size={14} className="shrink-0" style={{ color: ACCENT }} />
            {cv ? <span className="truncate">{cv.name}</span> : <span>Seleccionar archivo…</span>}
          </span>
          {cv && (
            <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px]" style={{ background: `${ACCENT}1A`, color: ACCENT }}>
              Cambiar
            </span>
          )}
        </label>
        <input
          id="apl-cv"
          type="file"
          accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp"
          onChange={(e) => setCv(e.target.files?.[0] ?? null)}
          className="sr-only"
        />
        {errors.cv && (
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-red-300">
            <AlertCircle size={12} /> {errors.cv}
          </p>
        )}
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm text-white/70">
        <input
          type="checkbox"
          checked={gdpr}
          onChange={(e) => setGdpr(e.target.checked)}
          className="mt-1 h-4 w-4 rounded"
          style={{ accentColor: '#FBBF24' }}
        />
        <span>
          Acepto la{' '}
          <Link href="/privacidad" target="_blank" className="underline" style={{ color: ACCENT }}>
            política de privacidad
          </Link>{' '}
          y el tratamiento de mis datos para procesos de selección. Mis datos serán eliminados a
          los 30 días si no soy contratado.
        </span>
      </label>
      {errors.gdpr && (
        <p className="-mt-3 inline-flex items-center gap-1 text-xs text-red-300">
          <AlertCircle size={12} /> {errors.gdpr}
        </p>
      )}

      {state.kind === 'error' && (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{ background: 'rgba(239,68,68,0.10)', borderColor: 'rgba(239,68,68,0.35)', color: '#fca5a5' }}
        >
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isBusy}
        className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-black transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
        style={{ background: ACCENT }}
      >
        {state.kind === 'uploading' ? (
          <><Loader2 size={14} className="animate-spin" /> Subiendo CV…</>
        ) : state.kind === 'sending' ? (
          <><Loader2 size={14} className="animate-spin" /> Enviando…</>
        ) : (
          'Enviar candidatura'
        )}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  type = 'text',
  required,
  value,
  onChange,
  onBlur,
  error,
  autoComplete,
  placeholder,
  inputClass,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
  inputClass: string;
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
        placeholder={placeholder}
        aria-invalid={!!error}
        className={inputClass}
        style={{ borderColor: 'var(--border-subtle)' }}
      />
      {error && (
        <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-red-300">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}
