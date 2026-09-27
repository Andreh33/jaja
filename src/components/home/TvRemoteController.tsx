'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Expand, Home, Power, Radio, RotateCcw } from 'lucide-react';
import { channelNumber, tvChannels } from '@/lib/tv-channels';
import { remoteFetch, RemoteHttpError, tokenSchema, type RemoteCommand, type RemoteCredentials, type RemoteState } from '@/lib/tv-remote-protocol';
import TvChannelGuide from './TvChannelGuide';
import styles from './TvRemote.module.css';

const storageKey = 'latech-tv-controller-v1';
type Saved = RemoteCredentials & { invite?: string };
function save(value: Saved | null) { try { if (value) sessionStorage.setItem(storageKey, JSON.stringify(value)); else sessionStorage.removeItem(storageKey); } catch { /* The in-memory controller still works when storage is disabled. */ } }
function token() { return Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join(''); }

export default function TvRemoteController() {
  const [credentials, setCredentials] = useState<RemoteCredentials | null>(null);
  const [state, setState] = useState<RemoteState | null>(null);
  const [connecting, setConnecting] = useState(true); const [error, setError] = useState(''); const [ended, setEnded] = useState(false);
  const [sending, setSending] = useState(false); const [network, setNetwork] = useState(true); const [retry, setRetry] = useState(0);
  const pending = useRef(false); const latestVersion = useRef(0);
  const wakePoll = useRef<(() => void) | null>(null); const awaitingAck = useRef(false);
  const [now, setNow] = useState(0);
  const remaining = state ? Math.max(0, Math.ceil((state.expiresAt - now) / 60_000)) : 0;

  useEffect(() => {
    let stopped = false;
    async function connect() {
      setConnecting(true); setError(''); setEnded(false);
      let saved: Saved | null = null;
      let stored: Saved | null = null;
      try {
        const raw = JSON.parse(sessionStorage.getItem(storageKey) || 'null') as Saved | null;
        if (raw && /^[a-f0-9-]{36}$/.test(raw.id) && tokenSchema.safeParse(raw.token).success) stored = { id: raw.id, token: raw.token, ...(raw.invite && tokenSchema.safeParse(raw.invite).success ? { invite: raw.invite } : {}) };
      } catch { /* No session to restore. */ }
      const fragment = window.location.hash.slice(1).split('.');
      if (fragment.length === 2 && /^[a-f0-9-]{36}$/.test(fragment[0]) && tokenSchema.safeParse(fragment[1]).success) {
        saved = { id: fragment[0], token: stored?.id === fragment[0] ? stored.token : token(), invite: fragment[1] }; save(saved);
      } else saved = stored;
      window.history.replaceState(null, '', window.location.pathname);
      if (!saved) { if (!stopped) { setConnecting(false); setError('Abre la web en otra pantalla y escanea su QR para conectar este mando.'); } return; }
      try {
        const result = saved.invite ? await remoteFetch({ action: 'join', id: saved.id, invite: saved.invite, controller: saved.token })
          : await remoteFetch({ action: 'poll', id: saved.id, role: 'controller' }, saved.token);
        save({ id: saved.id, token: saved.token });
        if (stopped) return;
        setCredentials({ id: saved.id, token: saved.token }); setState(result); latestVersion.current = result.commandVersion; setNetwork(true); setNow(Date.now());
      } catch (cause) {
        if (stopped) return;
        setError(cause instanceof Error ? cause.message : 'No se pudo conectar.');
        if (cause instanceof RemoteHttpError && [400, 401, 409, 410].includes(cause.status)) { save(null); setEnded(true); }
      } finally { if (!stopped) setConnecting(false); }
    }
    void connect(); return () => { stopped = true; };
  }, [retry]);

  useEffect(() => {
    if (!credentials) return;
    let stopped = false; let polling = false; let timer: ReturnType<typeof setTimeout>; const abort = new AbortController();
    async function poll() {
      if (stopped || polling) return;
      if (document.hidden || !navigator.onLine) { if (!navigator.onLine) setNetwork(false); timer = setTimeout(poll, 1500); return; }
      polling = true;
      try {
        const result = await remoteFetch({ action: 'poll', id: credentials!.id, role: 'controller' }, credentials!.token, abort.signal);
        if (stopped) return;
        if (result.commandVersion >= latestVersion.current) { setState(result); latestVersion.current = result.commandVersion; awaitingAck.current = result.appliedVersion < result.commandVersion; }
        setNetwork(true); setNow(Date.now());
      } catch (cause) {
        if (stopped) return;
        setNetwork(false);
        if (cause instanceof RemoteHttpError && [401, 410].includes(cause.status)) { save(null); setEnded(true); setCredentials(null); setState(null); setError(cause.message); return; }
      } finally { polling = false; }
      timer = setTimeout(poll, awaitingAck.current ? 200 : 1600);
    }
    wakePoll.current = () => { clearTimeout(timer); if (!polling) timer = setTimeout(poll, 80); };
    void poll(); return () => { stopped = true; wakePoll.current = null; clearTimeout(timer); abort.abort(); };
  }, [credentials]);

  async function command(action: RemoteCommand, channel?: string) {
    if (!credentials || pending.current) return;
    pending.current = true; setSending(true); setError('');
    try {
      const result = await remoteFetch({ action: 'command', id: credentials.id, command: action, ...(channel ? { channel } : {}) }, credentials.token);
      latestVersion.current = result.commandVersion; setState(result); setNetwork(true); awaitingAck.current = true; wakePoll.current?.();
      if (navigator.vibrate) navigator.vibrate(12);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo enviar la señal.'); }
    finally { pending.current = false; setSending(false); }
  }
  async function disconnect() {
    if (!credentials || pending.current) return;
    pending.current = true; setSending(true);
    try { await remoteFetch({ action: 'disconnect', id: credentials.id, role: 'controller' }, credentials.token); save(null); setCredentials(null); setState(null); setEnded(true); setError('Mando desconectado. La televisión vuelve a estar en tus manos.'); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo confirmar la desconexión.'); }
    finally { pending.current = false; setSending(false); }
  }
  const awaiting = !!state && state.appliedVersion < state.commandVersion;
  const disabled = !state || !state.hostOnline || !network || sending || awaiting;
  const selected = tvChannels.find(item => item.id === (awaiting ? state?.channel : state?.displayedChannel)) ?? tvChannels[0];
  return <main id="main-content" className={styles.remotePage}>
    <header className={styles.remotePageHeader}><Link href="/" aria-label="Latech inicio"><Image src="/brand/latech-logo.webp" alt="Latech" width={66} height={35} /></Link><span>NO MIRES. TOMA EL CONTROL.</span></header>
    <div className={styles.remoteShell} data-connected={!!state && network && state.hostOnline}>
      <div className={styles.remoteWear} aria-hidden="true" />
      <div className={styles.remoteTop}><span>LATECH<small>REMOTE CONTROL SYSTEM</small></span><button type="button" className={styles.power} onClick={disconnect} disabled={!credentials || sending} aria-label="Desconectar mando"><Power size={21} /></button></div>
      <div className={styles.receiver} aria-hidden="true"><i /></div>
      <div className={styles.lcd} role="status" aria-live="polite"><div><span>{connecting ? 'SINTONIZANDO' : ended ? 'SEÑAL CERRADA' : !state ? 'SIN CONEXIÓN' : !network ? 'RECONECTANDO' : !state.hostOnline ? 'TV EN PAUSA' : awaiting ? 'ENVIANDO SEÑAL' : 'SEÑAL CONECTADA'}</span><Radio size={14} /></div><strong>{state ? `CH ${channelNumber(selected.id)}` : '— —'}</strong><p>{state ? selected.name : connecting ? 'Buscando tu televisión…' : 'Escanea el QR de la tele'}</p><footer><span>{state ? (awaiting ? 'ESPERANDO A LA TV' : 'EN PANTALLA') : 'LATECH TV'}</span><span>{state ? `${remaining} MIN` : 'LT—96'}</span></footer></div>
      {!state && <div className={styles.connectionMessage}><p>{error || 'La conexión se inicia automáticamente al escanear.'}</p>{!connecting && !ended && <button type="button" onClick={() => setRetry(value => value + 1)}><RotateCcw size={15} />Reintentar conexión</button>}</div>}
      <div className={styles.controlLabel}>TELEVISIÓN / CANALES</div>
      <div className={styles.rocker}><button type="button" disabled={disabled} onClick={() => command('previous')} aria-label="Canal anterior"><ChevronLeft size={24} /><span>CH −</span></button><button type="button" disabled={disabled} onClick={() => command('next')} aria-label="Canal siguiente"><span>CH +</span><ChevronRight size={24} /></button></div>
      <div className={styles.remoteShortcuts}><button type="button" disabled={disabled} onClick={() => command('channel', 'studio')}><Home size={17} /><span>STUDIO</span></button><button type="button" disabled={disabled} onClick={() => command('expand')}><Expand size={17} /><span>{state?.expanded ? 'REDUCIR' : 'AMPLIAR'}</span></button></div>
      <div className={styles.keypad}>{tvChannels.map(item => <button type="button" key={item.id} disabled={disabled} aria-label={`Canal ${channelNumber(item.id)}: ${item.name}`} aria-pressed={state?.displayedChannel === item.id} onClick={() => command('channel', item.id)}>{channelNumber(item.id)}<small>{item.id === 'studio' ? 'LATECH' : item.name.replace('Monopatín ', '').slice(0, 14)}</small></button>)}</div>
      <TvChannelGuide channel={state?.displayedChannel ?? ''} disabled={disabled} onSelect={id => command('channel', id)} />
      <div className={styles.controlLabel}>{state?.expanded ? 'LA PANTALLA / RECORRIDO' : 'LA WEB / RECORRIDO'}</div>
      <div className={styles.scrollPad}><button type="button" disabled={disabled} onClick={() => command('scroll-up')} aria-label="Subir en la web"><ArrowUp size={23} /><span>SUBIR</span></button><button type="button" disabled={disabled} onClick={() => command('scroll-down')} aria-label="Bajar en la web"><ArrowDown size={23} /><span>BAJAR</span></button></div>
      <div className={styles.colorKeys}>{(['visit-home', 'visit-projects', 'visit-lab', 'visit-contact'] as const).map((action, index) => <button type="button" key={action} disabled={disabled} onClick={() => command(action)}><i /><span>{['INICIO', 'TRABAJO', 'JUEGOS', 'HABLEMOS'][index]}</span></button>)}</div>
      {state && <p className={styles.remoteHint}>{!network ? 'Sin red. La conexión se recuperará automáticamente.' : !state.hostOnline ? 'Vuelve a la pestaña de la televisión para continuar.' : state.expanded ? 'SUBIR y BAJAR recorren Studio dentro de la pantalla ampliada. Los proyectos externos necesitan compatibilidad propia.' : 'SUBIR y BAJAR recorren la web del ordenador. Amplía Studio para navegar dentro de su pantalla.'}</p>}
      {state && error && <p role="alert" className={styles.error}>{error}</p>}
      <div className={styles.remoteFoot}><span>LT—96</span><span>IMAGINATION, UNLIMITED.</span><i aria-hidden="true" /></div>
    </div>
    <p className={styles.remoteBottom}>Tu imaginación es nuestro límite.<br />Una tele de otra época. Una web de otro mundo.</p>
  </main>;
}
