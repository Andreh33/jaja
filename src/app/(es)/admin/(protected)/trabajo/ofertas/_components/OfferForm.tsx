'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Send, XCircle, AlertCircle, Trash2 } from 'lucide-react';
import { slugify } from '@/lib/slug';

const ACCENT = 'var(--accent-calc)';

export type OfferFormData = {
  id?: string;
  slug?: string;
  title: string;
  description: string;
  location: string;
  contractType: '' | 'indefinido' | 'temporal' | 'practicas' | 'freelance';
  schedule: '' | 'completa' | 'parcial' | 'flexible';
  salary: string;
  experienceRequired: string;
  languages: string;
  extras: string;
  requiresComputer: 'si' | 'no' | 'depende';
  positionsCount: number;
  status: 'borrador' | 'publicada' | 'cerrada';
};

type Mode = 'create' | 'edit';
type SaveState = 'idle' | 'saving' | 'error';

export default function OfferForm({
  mode,
  initial,
}: {
  mode: Mode;
  initial: OfferFormData;
}) {
  const router = useRouter();
  const [data, setData] = useState<OfferFormData>(initial);
  const [slugManual, setSlugManual] = useState<boolean>(mode === 'edit');
  const [state, setState] = useState<SaveState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const isEdit = mode === 'edit';

  function onTitleChange(v: string) {
    setData((d) => ({
      ...d,
      title: v,
      // Auto-genera slug solo si el user no lo ha tocado a mano (modo create).
      slug: !slugManual ? slugify(v) : d.slug,
    }));
  }

  async function submit(action: 'save' | 'publish' | 'close') {
    setState('saving');
    setErrorMsg('');

    let nextStatus: OfferFormData['status'] = data.status;
    if (action === 'publish') nextStatus = 'publicada';
    if (action === 'close') nextStatus = 'cerrada';
    const payload: Partial<OfferFormData> = { ...data, status: nextStatus };

    // Normaliza enums vacíos a null en backend.
    const body = {
      ...payload,
      contractType: payload.contractType === '' ? null : payload.contractType,
      schedule: payload.schedule === '' ? null : payload.schedule,
      salary: payload.salary?.trim() || null,
      experienceRequired: payload.experienceRequired?.trim() || null,
      languages: payload.languages?.trim() || null,
      extras: payload.extras?.trim() || null,
    };

    const url = isEdit ? `/api/admin/job-offers/${data.id}` : '/api/admin/job-offers';
    const method = isEdit ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const respBody = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        id?: string;
        error?: string;
      };
      if (!res.ok || !respBody.ok) {
        setState('error');
        setErrorMsg(respBody.error ?? 'No hemos podido guardar la oferta.');
        return;
      }
      setState('idle');
      const id = respBody.id ?? data.id;
      if (!isEdit && id) {
        router.replace(`/admin/trabajo/ofertas/${id}`);
      } else {
        router.refresh();
      }
    } catch {
      setState('error');
      setErrorMsg('Error de red.');
    }
  }

  async function onDelete() {
    if (!isEdit || !data.id) return;
    if (!confirm('¿Borrar esta oferta? Si tiene candidaturas se cerrará en lugar de borrarse.')) return;
    try {
      const res = await fetch(`/api/admin/job-offers/${data.id}`, { method: 'DELETE' });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; deleted?: boolean; closed?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setErrorMsg(body.error ?? 'No hemos podido borrar la oferta.');
        setState('error');
        return;
      }
      if (body.closed) {
        alert('La oferta tenía candidaturas, así que se ha cerrado en lugar de borrarse.');
        router.refresh();
      } else {
        router.replace('/admin/trabajo/ofertas');
      }
    } catch {
      setErrorMsg('Error de red al borrar.');
      setState('error');
    }
  }

  function handleSubmitDefault(e: FormEvent) {
    e.preventDefault();
    submit('save');
  }

  const inputClass =
    'w-full rounded-xl border bg-transparent px-4 py-3 text-base text-white placeholder-white/30 focus:outline-none focus-visible:ring-2 md:text-sm';

  return (
    <form onSubmit={handleSubmitDefault} className="space-y-6">
      <Field id="of-title" label="Título" required value={data.title} onChange={onTitleChange} placeholder="Ej. Desarrollador/a Full Stack" />

      <div>
        <label htmlFor="of-slug" className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">
          Slug (URL)
        </label>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-white/40">/empleo/</span>
          <input
            id="of-slug"
            type="text"
            value={data.slug ?? ''}
            onChange={(e) => {
              setSlugManual(true);
              setData((d) => ({ ...d, slug: e.target.value }));
            }}
            className={inputClass}
            style={{ borderColor: 'var(--border-subtle)' }}
            placeholder="auto desde el título"
          />
        </div>
        <p className="mt-1 text-[11px] text-white/40">
          {slugManual ? 'Editado manualmente.' : 'Se autogenera del título mientras no lo edites.'}
        </p>
      </div>

      <div>
        <label htmlFor="of-desc" className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">
          Descripción <span className="text-white/30">*</span>
        </label>
        <textarea
          id="of-desc"
          rows={8}
          required
          value={data.description}
          onChange={(e) => setData((d) => ({ ...d, description: e.target.value }))}
          className={`${inputClass} resize-y`}
          style={{ borderColor: 'var(--border-subtle)' }}
          placeholder="Saltos de línea respetados. Sin HTML."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field id="of-location" label="Ubicación" required value={data.location} onChange={(v) => setData((d) => ({ ...d, location: v }))} placeholder="Madrid / Remoto / Híbrido" />
        <Field id="of-salary" label="Retribución (texto libre)" value={data.salary} onChange={(v) => setData((d) => ({ ...d, salary: v }))} placeholder="Ej. 24-30 K/año" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Select
          id="of-contract"
          label="Tipo de contrato"
          value={data.contractType}
          onChange={(v) => setData((d) => ({ ...d, contractType: v as OfferFormData['contractType'] }))}
          options={[
            { value: '', label: '— Sin especificar —' },
            { value: 'indefinido', label: 'Indefinido' },
            { value: 'temporal', label: 'Temporal' },
            { value: 'practicas', label: 'Prácticas' },
            { value: 'freelance', label: 'Freelance' },
          ]}
        />
        <Select
          id="of-schedule"
          label="Jornada"
          value={data.schedule}
          onChange={(v) => setData((d) => ({ ...d, schedule: v as OfferFormData['schedule'] }))}
          options={[
            { value: '', label: '— Sin especificar —' },
            { value: 'completa', label: 'Completa' },
            { value: 'parcial', label: 'Parcial' },
            { value: 'flexible', label: 'Flexible' },
          ]}
        />
        <div>
          <label htmlFor="of-positions" className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">
            Personas a contratar <span className="text-white/30">*</span>
          </label>
          <input
            id="of-positions"
            type="number"
            min={1}
            max={50}
            required
            value={data.positionsCount}
            onChange={(e) => setData((d) => ({ ...d, positionsCount: Math.max(1, parseInt(e.target.value || '1', 10)) }))}
            className={inputClass}
            style={{ borderColor: 'var(--border-subtle)' }}
          />
        </div>
      </div>

      <Select
        id="of-computer"
        label="Requiere ordenador propio"
        value={data.requiresComputer}
        onChange={(v) => setData((d) => ({ ...d, requiresComputer: v as OfferFormData['requiresComputer'] }))}
        options={[
          { value: 'no', label: 'No (lo aporta la empresa)' },
          { value: 'si', label: 'Sí (lo aporta el candidato)' },
          { value: 'depende', label: 'Depende' },
        ]}
        required
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Field id="of-experience" label="Experiencia requerida" value={data.experienceRequired} onChange={(v) => setData((d) => ({ ...d, experienceRequired: v }))} placeholder="Ej. 2+ años" />
        <Field id="of-languages" label="Idiomas" value={data.languages} onChange={(v) => setData((d) => ({ ...d, languages: v }))} placeholder="Ej. Español + inglés alto" />
      </div>

      <div>
        <label htmlFor="of-extras" className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">
          Extras / lo que ofrecemos
        </label>
        <textarea
          id="of-extras"
          rows={4}
          value={data.extras}
          onChange={(e) => setData((d) => ({ ...d, extras: e.target.value }))}
          className={`${inputClass} resize-y`}
          style={{ borderColor: 'var(--border-subtle)' }}
          placeholder="Vacaciones, horario flexible, formación, etc."
        />
      </div>

      <Select
        id="of-status"
        label="Estado"
        value={data.status}
        onChange={(v) => setData((d) => ({ ...d, status: v as OfferFormData['status'] }))}
        options={[
          { value: 'borrador', label: 'Borrador (oculto)' },
          { value: 'publicada', label: 'Publicada (visible y abierta a candidaturas)' },
          { value: 'cerrada', label: 'Cerrada (visible, sin formulario)' },
        ]}
        required
      />

      {errorMsg && (
        <div
          className="flex items-start gap-2 rounded-xl border px-4 py-3 text-sm"
          style={{ background: 'rgba(239,68,68,0.10)', borderColor: 'rgba(239,68,68,0.35)', color: '#fca5a5' }}
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> {errorMsg}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t pt-6" style={{ borderColor: 'var(--border-subtle)' }}>
        <button
          type="button"
          onClick={() => submit('save')}
          disabled={state === 'saving'}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/5 disabled:opacity-50"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)' }}
        >
          <Save size={14} /> {state === 'saving' ? 'Guardando…' : 'Guardar cambios'}
        </button>

        {data.status !== 'publicada' && (
          <button
            type="button"
            onClick={() => submit('publish')}
            disabled={state === 'saving'}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-black transition disabled:opacity-50"
            style={{ background: ACCENT }}
          >
            <Send size={14} /> Publicar
          </button>
        )}

        {data.status === 'publicada' && (
          <button
            type="button"
            onClick={() => submit('close')}
            disabled={state === 'saving'}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-black transition disabled:opacity-50"
            style={{ background: '#eab308' }}
          >
            <XCircle size={14} /> Cerrar plaza
          </button>
        )}

        {isEdit && (
          <button
            type="button"
            onClick={onDelete}
            className="ml-auto inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2 text-sm text-red-300 transition hover:text-red-200"
          >
            <Trash2 size={14} /> Borrar oferta
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  required,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">
        {label} {required && <span className="text-white/30">*</span>}
      </label>
      <input
        id={id}
        type="text"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border bg-transparent px-4 py-3 text-base text-white placeholder-white/30 focus:outline-none focus-visible:ring-2 md:text-sm"
        style={{ borderColor: 'var(--border-subtle)' }}
      />
    </div>
  );
}

function Select<T extends string>({
  id,
  label,
  required,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  required?: boolean;
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">
        {label} {required && <span className="text-white/30">*</span>}
      </label>
      <select
        id={id}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-xl border bg-transparent px-4 py-3 text-base text-white focus:outline-none focus-visible:ring-2 md:text-sm"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: 'var(--bg-elevated)' }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
