'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

/**
 * Banner verde tras volver del checkout.
 *
 * Comportamiento:
 *   1. Detecta `?status=success` en la URL.
 *   2. Una vez (sessionStorage flag por session_id) recarga la página
 *      silenciosamente ~1.5s después para refrescar datos del webhook
 *      recién procesado. La recarga limpia el query string en el href
 *      para que un F5 posterior no vuelva a disparar todo esto.
 *   3. Si ya recargamos (flag presente), auto-dismiss a 5s.
 */

function readInitialState(): { visible: boolean; needsReload: boolean; sessionId: string } {
  if (typeof window === 'undefined') {
    return { visible: false, needsReload: false, sessionId: '' };
  }
  const params = new URLSearchParams(window.location.search);
  if (params.get('status') !== 'success') {
    return { visible: false, needsReload: false, sessionId: '' };
  }
  const sessionId = params.get('session_id') ?? '';
  const RELOAD_KEY = 'latech_billing_reloaded';
  const previouslyReloaded = sessionStorage.getItem(RELOAD_KEY) === sessionId;
  return { visible: true, needsReload: !previouslyReloaded, sessionId };
}

export default function SuccessBanner() {
  const [state, setState] = useState(readInitialState);

  useEffect(() => {
    if (!state.visible) return;

    if (state.needsReload) {
      const RELOAD_KEY = 'latech_billing_reloaded';
      sessionStorage.setItem(RELOAD_KEY, state.sessionId);
      const t = setTimeout(() => {
        window.location.replace(window.location.pathname);
      }, 1500);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => setState((s) => ({ ...s, visible: false })), 5000);
    return () => clearTimeout(t);
  }, [state.visible, state.needsReload, state.sessionId]);

  if (!state.visible) return null;

  return (
    <div
      role="status"
      className="mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm"
      style={{ borderColor: 'rgba(34, 197, 94, 0.35)', background: 'rgba(34, 197, 94, 0.10)' }}
    >
      <CheckCircle2 size={18} style={{ color: '#22c55e', marginTop: 1 }} />
      <div>
        <p className="font-medium text-white">Pago confirmado</p>
        <p className="mt-1 text-white/65">
          Tu plan estará activo en unos segundos. Estamos refrescando los datos…
        </p>
      </div>
    </div>
  );
}
