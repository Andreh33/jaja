'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Check } from 'lucide-react';

type State = 'idle' | 'submitting' | 'error';

export default function PhoneAgentProvisionButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleClick() {
    setState('submitting');
    setErrorMsg('');
    try {
      const res = await fetch(`/api/admin/clientes/${userId}/phone-agent-provisioned`, {
        method: 'POST',
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setErrorMsg(body.error ?? 'Error');
        setState('error');
        return;
      }
      router.refresh();
    } catch {
      setErrorMsg('Error de red');
      setState('error');
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={state === 'submitting'}
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-black transition disabled:opacity-50"
        style={{ background: '#eab308' }}
      >
        {state === 'submitting' ? (
          <>
            <Phone size={14} /> Marcando…
          </>
        ) : (
          <>
            <Check size={14} /> Marcar como aprovisionado
          </>
        )}
      </button>
      {state === 'error' && <p className="mt-2 text-xs text-red-300">{errorMsg}</p>}
    </div>
  );
}
