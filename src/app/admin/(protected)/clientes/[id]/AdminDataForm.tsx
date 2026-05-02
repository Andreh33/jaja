'use client';

import { useState, useTransition } from 'react';
import { Save, Check } from 'lucide-react';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function AdminDataForm({
  userId,
  initial,
}: {
  userId: string;
  initial: {
    comercial: string;
    dominio: string;
    tareas: string;
  };
}) {
  const [comercial, setComercial] = useState(initial.comercial);
  const [dominio, setDominio] = useState(initial.dominio);
  const [tareas, setTareas] = useState(initial.tareas);
  const [state, setState] = useState<SaveState>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('saving');
    setErrorMsg('');
    try {
      const res = await fetch(`/api/admin/clientes/${userId}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comercial, dominio, tareas }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setErrorMsg(body.error ?? 'Error al guardar');
        setState('error');
        return;
      }
      setState('saved');
      startTransition(() => {
        setTimeout(() => setState((s) => (s === 'saved' ? 'idle' : s)), 2000);
      });
    } catch {
      setErrorMsg('Error de red');
      setState('error');
    }
  }

  const inputClass =
    'w-full rounded-xl border bg-transparent px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus-visible:ring-2';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="ad-comercial" className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">
          Comercial que vendió
        </label>
        <input
          id="ad-comercial"
          type="text"
          value={comercial}
          onChange={(e) => setComercial(e.target.value)}
          maxLength={200}
          className={inputClass}
          style={{ borderColor: 'var(--border-subtle)' }}
        />
      </div>
      <div>
        <label htmlFor="ad-dominio" className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">
          Dominio elegido
        </label>
        <input
          id="ad-dominio"
          type="text"
          value={dominio}
          onChange={(e) => setDominio(e.target.value)}
          placeholder="ej: ejemplo.com"
          maxLength={200}
          className={inputClass}
          style={{ borderColor: 'var(--border-subtle)' }}
        />
      </div>
      <div>
        <label htmlFor="ad-tareas" className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">
          Tareas pendientes
        </label>
        <textarea
          id="ad-tareas"
          rows={6}
          value={tareas}
          onChange={(e) => setTareas(e.target.value)}
          maxLength={5000}
          placeholder={'Una tarea por línea, p. ej.:\nSubir logo\nRecopilar fotos del local'}
          className={`${inputClass} resize-none`}
          style={{ borderColor: 'var(--border-subtle)' }}
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={state === 'saving'}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-black transition disabled:opacity-50"
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
          <span className="text-xs text-red-300">{errorMsg}</span>
        )}
      </div>
    </form>
  );
}
