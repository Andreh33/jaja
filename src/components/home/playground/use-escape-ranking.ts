'use client';

import { useEffect, useRef, useState } from 'react';

type Category = { mode: 'campana' | 'infinito'; difficulty: 'facil' | 'normal' };
type Session = { runId: string; runToken: string };
type Payload = Session & { name: string; score: number; durationMs: number };
type Entry = { id?: string | number; name: string; score: number };
type Status = 'idle' | 'connecting' | 'ready' | 'saving' | 'saved' | 'error' | 'unavailable';

/** Publishing is explicit. Retry keeps the exact payload and idempotent run ID. */
export function useEscapeRanking(category: Category) {
  const session = useRef<Session | null>(null);
  const result = useRef<{ score: number; durationMs: number } | null>(null);
  const payload = useRef<Payload | null>(null);
  const request = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [top, setTop] = useState<Entry[]>([]);
  const [aliasLocked, setAliasLocked] = useState(false);

  useEffect(() => {
    const abort = new AbortController();
    fetch(`/api/escape-leaderboard?mode=${category.mode}&difficulty=${category.difficulty}`, { signal: abort.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (!abort.signal.aborted) setTop(Array.isArray(data?.top) ? data.top : []); })
      .catch(() => { if (!abort.signal.aborted) setTop([]); });
    return () => abort.abort();
  }, [category.mode, category.difficulty]);

  useEffect(() => () => { generation.current++; request.current?.abort(); }, []);

  const begin = (selected: Category, practice = false) => {
    const current = ++generation.current;
    request.current?.abort();
    session.current = null;
    result.current = null;
    payload.current = null;
    setAliasLocked(false);
    setMessage(practice ? 'El entrenamiento guarda tu progreso sin entrar en el ranking.' : '');
    if (practice) { setStatus('unavailable'); return; }
    const abort = new AbortController();
    request.current = abort;
    setStatus('connecting');
    fetch('/api/escape-runs', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(selected), signal: abort.signal,
    }).then(async (response) => {
      if (!response.ok) throw new Error('session');
      return response.json();
    }).then((data) => {
      if (generation.current !== current || abort.signal.aborted) return;
      if (typeof data.runId !== 'string' || typeof data.runToken !== 'string') throw new Error('session');
      session.current = { runId: data.runId, runToken: data.runToken };
      setStatus('ready');
    }).catch(() => {
      if (generation.current !== current || abort.signal.aborted) return;
      setStatus('unavailable');
      setMessage('Esta partida se guarda solo en tu dispositivo. El ranking estará disponible cuando puedas iniciar otra partida con conexión.');
    });
  };

  const discard = () => {
    generation.current++;
    request.current?.abort();
    session.current = null;
    result.current = null;
    payload.current = null;
    setAliasLocked(false);
    setStatus('idle');
    setMessage('');
  };

  const finish = (score: number, durationMs: number) => { result.current = { score, durationMs: Math.round(durationMs) }; };
  const publish = async (name: string) => {
    if (status === 'saving' || status === 'saved' || !session.current || !result.current) return;
    if (!payload.current) payload.current = { ...session.current, ...result.current, name: name.trim().slice(0, 14) || 'Tú' };
    const current = generation.current;
    setAliasLocked(true);
    setStatus('saving');
    setMessage('');
    const abort = new AbortController();
    request.current = abort;
    try {
      const response = await fetch('/api/escape-leaderboard', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload.current), signal: abort.signal,
      });
      if (generation.current !== current || abort.signal.aborted) return;
      if (!response.ok) {
        const retryable = response.status === 429 || response.status >= 500;
        setStatus(retryable ? 'error' : 'unavailable');
        setMessage(response.status === 410 ? 'La sesión ha caducado. Tu récord local se conserva.'
          : retryable ? 'No se ha podido publicar. Puedes reintentar sin duplicar la puntuación.'
          : 'Esta partida no puede publicarse. Tu récord local se conserva.');
        return;
      }
      const data = await response.json();
      if (generation.current !== current || abort.signal.aborted) return;
      if (Array.isArray(data.top)) setTop(data.top);
      setStatus('saved');
      setMessage('Puntuación publicada en tu categoría.');
    } catch {
      if (generation.current !== current || abort.signal.aborted) return;
      setStatus('error');
      setMessage('Se ha interrumpido la conexión. Reintenta: esta partida se registra una sola vez.');
    }
  };

  return { begin, discard, finish, publish, status, message, top, aliasLocked };
}
