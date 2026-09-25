'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { track } from '@vercel/analytics';
import { contactSchema, contactFieldErrors, type ContactErrors, type ContactField } from '@/lib/contact-validation';

const EMPTY_FORM = { name: '', email: '', phone: '', service: 'web', message: '' };

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const focusAfterValidation = useRef<ContactField | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<{ error: boolean; text: string } | null>(null);

  useEffect(() => {
    if (loading) return;
    if (focusAfterValidation.current) {
      formRef.current?.querySelector<HTMLElement>('[name="' + focusAfterValidation.current + '"]')?.focus();
      focusAfterValidation.current = null;
    }
  }, [errors, loading]);

  const showErrors = (fields: ContactErrors) => {
    focusAfterValidation.current = (Object.keys(EMPTY_FORM) as ContactField[]).find((field) => fields[field]) ?? null;
    setErrors(fields);
  };

  const update = (field: ContactField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setStatus(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setStatus(null);
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      showErrors(contactFieldErrors(parsed.error));
      setStatus({ error: true, text: 'Revisa los campos indicados antes de enviar.' });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const response = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        if (data?.fields) showErrors(data.fields);
        setStatus({ error: true, text: response.status === 429
          ? 'Has enviado varios mensajes seguidos. Espera un minuto y vuelve a intentarlo.'
          : response.status === 400
            ? 'Revisa los campos indicados. Tu mensaje sigue aquí.'
            : 'No hemos podido enviar el mensaje. Tu texto se conserva; puedes volver a intentarlo.' });
        return;
      }
      // Analytics failure must never turn a saved message into an apparent failure.
      try { track('contact_form_submit', { service: parsed.data.service ?? 'web' }); } catch { /* optional analytics */ }
      setForm(EMPTY_FORM);
      setStatus({ error: false, text: 'Mensaje enviado. Te respondemos en menos de 24 horas.' });
    } catch {
      setStatus({ error: true, text: 'No se pudo conectar. Tu mensaje se conserva; revisa la conexión e inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const inputProps = (field: ContactField) => ({
    id: 'contact-' + field,
    name: field,
    'aria-invalid': Boolean(errors[field]),
    'aria-describedby': errors[field] ? 'contact-' + field + '-error' : undefined,
  });

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="space-y-4" aria-busy={loading}>
      <fieldset disabled={loading} className="space-y-4 disabled:opacity-70">
        <legend className="sr-only">Cuéntanos tu proyecto</legend>
        <div className="grid gap-4 md:grid-cols-2">
          <Field field="name" label="Nombre" error={errors.name}>
            <input {...inputProps('name')} className="input" autoComplete="name" required minLength={2} maxLength={120} placeholder="Tu nombre" value={form.name} onChange={(e) => update('name', e.target.value)} />
          </Field>
          <Field field="email" label="Email" error={errors.email}>
            <input {...inputProps('email')} className="input" type="email" autoComplete="email" required maxLength={254} placeholder="tu@email.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field field="phone" label="Teléfono (opcional)" error={errors.phone}>
            <input {...inputProps('phone')} className="input" type="tel" autoComplete="tel" maxLength={40} placeholder="Tu teléfono" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          </Field>
          <Field field="service" label="Servicio" error={errors.service}>
            <select {...inputProps('service')} className="input" value={form.service} onChange={(e) => update('service', e.target.value)}>
              <option value="web">Página web</option>
              <option value="tienda">Tienda online</option>
              <option value="ia">Agente IA</option>
              <option value="otro">Otro</option>
            </select>
          </Field>
        </div>
        <Field field="message" label="Mensaje" error={errors.message}>
          <textarea {...inputProps('message')} className="input min-h-[140px] py-3" required minLength={10} maxLength={4000} placeholder="Cuéntanos qué necesitas (al menos 10 caracteres)..." value={form.message} onChange={(e) => update('message', e.target.value)} />
        </Field>
        <p className="text-xs leading-relaxed text-white/55">
          Usaremos tus datos para responder a esta consulta. Consulta nuestra{' '}
          <a href="/privacidad" className="underline underline-offset-4 hover:text-white">política de privacidad</a>.
        </p>
        <button type="submit" disabled={loading} className="group inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-60 glow-purple" style={{ background: 'var(--grad-signature)' }}>
          {loading ? 'Enviando…' : 'Enviar mensaje'} <ArrowRight size={16} />
        </button>
      </fieldset>
      <div role="status" aria-live="polite" aria-atomic="true" className="text-center text-sm">
        {status && <p className={status.error ? 'text-rose-300' : 'text-emerald-300'}>{status.text}</p>}
      </div>
      <p className="text-center text-xs text-white/40">Te respondemos en menos de 24h con propuesta o asesoramiento.</p>
      <style jsx>{`
        .input { width:100%; height:48px; padding:0 14px; border-radius:14px; background:rgba(3,9,20,0.5); border:1px solid var(--border-subtle); color:var(--text-primary); font-size:16px; transition:border-color .2s,box-shadow .2s; }
        .input::placeholder { color:rgba(255,255,255,0.4); }
        .input:focus { outline:none; border-color:var(--brand-400); box-shadow:0 0 0 3px rgba(59,130,246,0.18); }
        .input[aria-invalid="true"] { border-color:#fda4af; }
        textarea.input { min-height:140px; padding-top:12px; }
      `}</style>
    </form>
  );
}

function Field({ field, label, error, children }: { field: ContactField; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={'contact-' + field} className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/55">{label}</label>
      {children}
      {error && <p id={'contact-' + field + '-error'} className="mt-2 text-xs text-rose-300">{error}</p>}
    </div>
  );
}
