'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Check, AlertCircle } from 'lucide-react';

type Status = 'pendiente' | 'contactado' | 'descartado' | 'contratado';

const STATUS_OPTIONS: Array<{ value: Status; label: string }> = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'contactado', label: 'Contactado' },
  { value: 'descartado', label: 'Descartado' },
  { value: 'contratado', label: 'Contratado' },
];

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function StatusAndNotes({
  applicationId,
  initialStatus,
  initialNotes,
}: {
  applicationId: string;
  initialStatus: Status;
  initialNotes: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [state, setState] = useState<SaveState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function save() {
    setState('saving');
    setErrorMsg('');
    try {
      const res = await fetch(`/api/admin/job-applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes: notes }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setState('error');
        setErrorMsg(body.error ?? 'No hemos podido guardar.');
        return;
      }
      setState('saved');
      setTimeout(() => setState((s) => (s === 'saved' ? 'idle' : s)), 2000);
      router.refresh();
    } catch {
      setState('error');
      setErrorMsg('Error de red.');
    }
  }

  return (
    <div className="rounded-2xl glass p-6 md:p-8">
      <h2 className="font-display text-xl text-white" style={{ letterSpacing: '-0.02em', fontWeight: 700 }}>
        Estado y notas internas
      </h2>

      <div className="mt-5">
        <label htmlFor="appl-status" className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">
          Estado
        </label>
        <select
          id="appl-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as Status)}
          className="w-full rounded-xl border bg-transparent px-4 py-3 text-base text-white focus:outline-none focus-visible:ring-2 md:max-w-xs md:text-sm"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value} style={{ background: 'var(--bg-elevated)' }}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5">
        <label htmlFor="appl-notes" className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">
          Notas internas
        </label>
        <textarea
          id="appl-notes"
          rows={5}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anotaciones del proceso (visibles solo al equipo)…"
          className="w-full rounded-xl border bg-transparent px-4 py-3 text-base text-white placeholder-white/30 focus:outline-none focus-visible:ring-2 md:text-sm"
          style={{ borderColor: 'var(--border-subtle)' }}
        />
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={state === 'saving'}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
          style={{ background: 'var(--accent-calc)' }}
        >
          {state === 'saved' ? (
            <>
              <Check size={14} /> Guardado
            </>
          ) : (
            <>
              <Save size={14} /> {state === 'saving' ? 'Guardando…' : 'Guardar'}
            </>
          )}
        </button>
        {state === 'error' && (
          <span className="inline-flex items-center gap-1.5 text-xs text-red-300">
            <AlertCircle size={12} /> {errorMsg}
          </span>
        )}
      </div>
    </div>
  );
}
