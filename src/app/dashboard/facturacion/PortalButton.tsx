'use client';

import { useState } from 'react';
import { Settings, AlertCircle } from 'lucide-react';

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string };

export default function PortalButton({ disabled = false }: { disabled?: boolean }) {
  const [state, setState] = useState<State>({ kind: 'idle' });

  async function handleClick() {
    setState({ kind: 'loading' });
    try {
      const res = await fetch('/api/dashboard/billing/portal', { method: 'POST' });
      const body = (await res.json().catch(() => ({}))) as {
        url?: string;
        message?: string;
        error?: string;
      };
      if (!res.ok || !body.url) {
        setState({
          kind: 'error',
          message: body.message ?? 'No hemos podido abrir el portal.',
        });
        return;
      }
      window.location.href = body.url;
    } catch {
      setState({
        kind: 'error',
        message: 'Error de red. Inténtalo de nuevo.',
      });
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || state.kind === 'loading'}
        className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50"
      >
        <Settings size={14} />
        {state.kind === 'loading' ? 'Abriendo…' : 'Gestionar suscripción'}
      </button>
      {state.kind === 'error' && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-300/90">
          <AlertCircle size={12} /> {state.message}
        </p>
      )}
    </div>
  );
}
