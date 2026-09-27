'use client';
/* eslint-disable @next/next/no-img-element -- This is an ephemeral, local QR data URI, never an image network request. */
import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Check, Copy, Power, QrCode, RefreshCw, Smartphone, X } from 'lucide-react';
import { remoteFetch, RemoteHttpError, type RemoteCredentials, type RemoteState } from '@/lib/tv-remote-protocol';
import { tvProjects } from '@/lib/tv-channels';
import type { StudioExperience } from './useStudioExperience';
import TvChannelGuide from './TvChannelGuide';
import styles from './TvRemote.module.css';

export default function TvRemoteHost({ studio }: { studio: StudioExperience }) {
  const [open, setOpen] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [credentials, setCredentials] = useState<RemoteCredentials | null>(null);
  const [state, setState] = useState<RemoteState | null>(null);
  const [link, setLink] = useState(''); const [qr, setQr] = useState('');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(0);
  const latest = useRef(studio); const applied = useRef(0); const generation = useRef(0); const paired = useRef(false);
  useEffect(() => { latest.current = studio; });
  const channel = studio.browsing ? tvProjects[studio.project].slug : 'studio';
  function select(id: string) {
    const current = latest.current;
    if (id === 'studio') { current.setBrowsing(false); current.navigate('home'); }
    else { const index = tvProjects.findIndex(project => project.slug === id); if (index >= 0) { current.setProject(index); current.setBrowsing(true); } }
  }
  const selectRef = useRef(select);
  useEffect(() => { selectRef.current = select; });
  useEffect(() => { if (!state) return; const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, [state?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!credentials) return;
    let stopped = false; let timer: ReturnType<typeof setTimeout>; const abort = new AbortController();
    async function poll() {
      if (stopped) return;
      if (document.hidden || !navigator.onLine) { timer = setTimeout(poll, 1500); return; }
      try {
        const current = latest.current;
        const result = await remoteFetch({ action: 'poll', id: credentials!.id, role: 'host', appliedVersion: applied.current, channel: current.browsing ? tvProjects[current.project].slug : 'studio', expanded: current.expanded }, credentials!.token, abort.signal);
        if (stopped) return;
        setState(result); setError(''); setNow(Date.now());
        if (result.paired && !paired.current) { paired.current = true; setLink(''); setQr(''); setOpen(false); }
        if (result.commandVersion > applied.current) {
          selectRef.current(result.channel); current.setExpanded(result.expanded);
          if (result.lastAction.startsWith('visit-') || result.lastAction.startsWith('scroll-')) {
            requestAnimationFrame(() => requestAnimationFrame(() => {
              const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
              const targets: Record<string, string> = { 'visit-home': 'hero-title', 'visit-projects': 'proyectos', 'visit-lab': 'laboratorio', 'visit-contact': 'remote-contact' };
              if (result.lastAction.startsWith('scroll-')) window.scrollBy({ top: window.innerHeight * .72 * (result.lastAction === 'scroll-up' ? -1 : 1), behavior });
              else document.getElementById(targets[result.lastAction])?.scrollIntoView({ behavior, block: 'start' });
            }));
          }
          applied.current = result.commandVersion;
        }
      } catch (cause) {
        if (stopped) return;
        setError(cause instanceof Error ? cause.message : 'Señal interrumpida. Reintentando…');
        if (cause instanceof RemoteHttpError && [401, 410].includes(cause.status)) { setCredentials(null); setState(null); setLink(''); setQr(''); return; }
      }
      timer = setTimeout(poll, 900);
    }
    void poll();
    return () => { stopped = true; clearTimeout(timer); abort.abort(); };
  }, [credentials]);

  async function disconnect() {
    generation.current++;
    if (!credentials) return;
    setBusy(true);
    try { await remoteFetch({ action: 'disconnect', id: credentials.id, role: 'host' }, credentials.token); setCredentials(null); setState(null); setLink(''); setQr(''); setError(''); }
    catch (cause) { if (cause instanceof RemoteHttpError && [401, 410].includes(cause.status)) { setCredentials(null); setState(null); } else setError('No se pudo confirmar la desconexión. Vuelve a intentarlo.'); }
    finally { setBusy(false); }
  }
  async function create() {
    const attempt = ++generation.current; setBusy(true); setError(''); setCopied(false);
    try {
      if (credentials) await remoteFetch({ action: 'disconnect', id: credentials.id, role: 'host' }, credentials.token).catch(cause => { if (!(cause instanceof RemoteHttpError && [401, 410].includes(cause.status))) throw cause; });
      setCredentials(null); setState(null); setQr(''); setLink('');
      const result = await remoteFetch({ action: 'create', channel, expanded: studio.expanded });
      if (!result.token || !result.invite || attempt !== generation.current) return;
      const url = `${window.location.origin}/mando#${result.id}.${result.invite}`;
      applied.current = 0; paired.current = false; setState(result); setNow(Date.now()); setCredentials({ id: result.id, token: result.token }); setLink(url);
      const QRCode = await import('qrcode');
      const data = await QRCode.toDataURL(url, { errorCorrectionLevel: 'M', margin: 4, width: 520, color: { dark: '#061421', light: '#ffffff' } });
      if (attempt === generation.current) setQr(data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo crear el mando.'); }
    finally { setBusy(false); }
  }
  const expired = !!state && !state.paired && now >= state.inviteExpiresAt;
  const remaining = state ? Math.max(0, Math.ceil(((state.paired ? state.expiresAt : state.inviteExpiresAt) - now) / 1000)) : 0;
  return <div className={styles.hostTools}>
    <TvChannelGuide channel={channel} onSelect={select} />
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className={styles.remoteTrigger} onClick={event => setKeyboard(event.detail === 0)}><Smartphone size={17} /><span>{state?.paired ? 'Mando conectado' : 'Usa tu móvil de mando'}</span>{state?.paired && <i className={styles.led} />}</Dialog.Trigger>
      <Dialog.Portal><Dialog.Overlay data-keyboard={keyboard} className={styles.overlay} /><Dialog.Content data-keyboard={keyboard} className={`${styles.dialog} ${styles.pairDialog}`}>
        <div className={styles.dialogHeading}><div><p className={styles.eyebrow}>LATECH / REMOTE CONTROL</p><Dialog.Title>La tele aquí.<br />El mando en tu mano.</Dialog.Title></div><Dialog.Close className={styles.close} aria-label="Cerrar conexión del mando"><X size={20} /></Dialog.Close></div>
        <Dialog.Description className={styles.description}>Escanea con la cámara de tu móvil. Conecta al instante y cambia de canal desde el sofá.</Dialog.Description>
        {state?.paired ? <div className={styles.paired}><Check size={32} /><strong>{state.controllerOnline ? 'Tu móvil tiene el control.' : 'Esperando a tu móvil…'}</strong><p>Sesión temporal · {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')} restantes</p><button type="button" className={styles.primary} onClick={() => setOpen(false)}>Seguir explorando</button><button type="button" className={styles.disconnect} disabled={busy} onClick={disconnect}><Power size={16} />Desconectar mando</button></div> : <>
          {link && !expired ? <div className={styles.pairing}><div className={styles.qr}>{qr ? <img src={qr} alt="QR para conectar el mando de esta televisión" width={260} height={260} /> : <QrCode size={80} />}</div><div><span className={styles.signalLabel}>SEÑAL ABIERTA</span><strong>{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</strong><p>Un QR. Un móvil.<br />20 minutos para explorarlo todo.</p><button type="button" className={styles.copy} onClick={async () => { try { await navigator.clipboard.writeText(link); setCopied(true); } catch { setError('No se pudo copiar. Escanea el QR con la cámara.'); } }}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copiado' : 'Copiar enlace'}</button></div></div> : <div className={styles.pairIntro}><QrCode size={52} strokeWidth={1.3} /><p>{expired ? 'La señal ha caducado. Genera un QR nuevo.' : 'Sintoniza proyectos, amplía la pantalla y recorre la web sin tocar el ordenador.'}</p><button type="button" className={styles.primary} disabled={busy} onClick={create}>{busy ? 'Abriendo señal…' : expired ? 'Generar otro QR' : 'Generar mi QR'}<RefreshCw size={16} /></button></div>}
          {link && !expired && <><a className={styles.copy} href={link} target="_blank" rel="noreferrer">Abrir enlace del mando ↗</a><button type="button" className={styles.disconnect} disabled={busy} onClick={disconnect}>Cancelar conexión</button></>}
        </>}
        {error && <p className={styles.error} role="alert">{error}</p>}
      </Dialog.Content></Dialog.Portal>
    </Dialog.Root>
    {state?.paired && <button type="button" className={styles.quickDisconnect} disabled={busy} onClick={disconnect} aria-label="Desconectar mando móvil"><Power size={16} /></button>}
  </div>;
}
