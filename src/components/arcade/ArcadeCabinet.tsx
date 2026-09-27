'use client';
/* eslint-disable @next/next/no-img-element -- Local game artwork and ephemeral QR codes retain exact textures. */
import { useCallback,useEffect, useRef, useState, type CSSProperties } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Gamepad2, Grid2X2, RotateCcw, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { arcadeFetch, selectArcadeMode, ArcadeHttpError, type ArcadeCredentials, type ArcadeMode, type ArcadeState } from '@/lib/arcade-protocol';
import { useHostPeers } from './useArcadePeers';
import ArcadeBoard from './ArcadeBoard';
import styles from './Arcade.module.css';
import ArcadeSoundToggle from './ArcadeSoundToggle';
import {playArcadeSound} from '@/lib/arcade-audio';
const loadingGame=()=> <p className={styles.message} role="status">Preparando una nueva frecuencia…</p>;
const PlatformGame=dynamic(()=>import('./PlatformGame'),{ssr:false,loading:loadingGame});
const FightGame=dynamic(()=>import('./FightGame'),{ssr:false,loading:loadingGame});
const BlocksGame=dynamic(()=>import('./BlocksGame'),{ssr:false,loading:loadingGame});
const ASSETS = ['platform-world', 'platform-world-2', 'platform-world-3', 'platform-world-4', 'platform-sprites', 'fight-stage', 'fight-fighters', 'blocks-cover', 'blocks-atlas-v2', 'space-world', 'naval-world', 'tactical-sprites', 'worn-plastic'];
const GAMES: { id: ArcadeMode; name: string; type: string; text: string; image: string }[] = [
  { id: 'platform', name: 'Salto Zero', type: '01 / PLATAFORMAS · 1–2 JUGADORES', text: 'Doble salto, impulso y reliquias escondidas. Cuatro mundos para recorrer juntos.', image: 'platform-world' },
  { id: 'fight', name: 'Neon Clash', type: '02 / LUCHA · 1–2 JUGADORES', text: 'Combos, esquivas y defensa perfecta. Reta a un amigo o entrena con la CPU.', image: 'fight-stage' },
  { id: 'blocks', name: 'Isla libre', type: '03 / CREATIVO · 2 JUGADORES', text: 'Montañas, cuevas y 16 materiales. Un archipiélago enorme para construir juntos.', image: 'blocks-cover' },
  { id: 'space', name: 'Space Wars', type: '04 / COOPERATIVO · 2 JUGADORES', text: 'Dos pilotos, diez misiones. La galaxia necesita una buena estrategia.', image: 'space-world' },
  { id: 'naval', name: 'Mar abierto', type: '05 / ESTRATEGIA · 2 JUGADORES', text: 'Oculta tu flota. Lee al rival. Cada coordenada puede cambiarlo todo.', image: 'naval-world' },
];
export default function ArcadeCabinet({ onClose, origin }: { onClose: () => void; origin: CSSProperties }) {
  const [booting, setBooting] = useState(true); const [bootText, setBootText] = useState('SINTONIZANDO OTRO MUNDO');
  const [credentials, setCredentials] = useState<ArcadeCredentials | null>(null); const [state, setState] = useState<ArcadeState | null>(null);
  const [mode, setMode] = useState<ArcadeMode>('lobby'); const [room, setRoom] = useState(false); const [qrs, setQrs] = useState<string[]>([]); const [links, setLinks] = useState<string[]>([]);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const closing = useRef(false); const current = useRef(state); const creds = useRef(credentials);
  useEffect(() => { current.current = state; creds.current = credentials; }, [state, credentials]);
  const peers = useHostPeers(credentials, state);
  const[pauseSignal,setPauseSignal]=useState(0);const previousStatus=useRef(peers.status);const reportedEnd=useRef('');const[attract,setAttract]=useState(false);
  const finishRetry=useRef<ReturnType<typeof setTimeout>|null>(null);const finishAttempts=useRef({key:'',count:0});
  useEffect(()=>()=>{if(finishRetry.current)clearTimeout(finishRetry.current);},[]);
  useEffect(()=>{if(peers.status.some((value,i)=>previousStatus.current[i]==='Señal directa'&&value!=='Señal directa'))setPauseSignal(value=>value+1);previousStatus.current=peers.status;},[peers.status]);
  const finished=useCallback(function report(){const c=creds.current,s=current.current;if(!c||!s||closing.current)return;const key=`${c.id}:${s.version}`;if(reportedEnd.current===key)return;if(finishAttempts.current.key!==key)finishAttempts.current={key,count:0};reportedEnd.current=key;finishAttempts.current.count++;void arcadeFetch({action:'finished',id:c.id,role:'host',version:s.version},c.token).then(result=>{if(!closing.current)setState(old=>old&&old.version>result.version?old:result);}).catch(()=>{reportedEnd.current='';if(!closing.current&&current.current?.version===s.version&&creds.current?.id===c.id&&finishAttempts.current.count<3)finishRetry.current=setTimeout(report,1500);});},[]);
  useEffect(()=>{if(mode!=='lobby'||room||booting)return;let timer:ReturnType<typeof setTimeout>;const reset=()=>{setAttract(false);clearTimeout(timer);timer=setTimeout(()=>setAttract(true),45000);};reset();window.addEventListener('pointerdown',reset);window.addEventListener('keydown',reset);window.addEventListener('pointermove',reset);return()=>{clearTimeout(timer);window.removeEventListener('pointerdown',reset);window.removeEventListener('keydown',reset);window.removeEventListener('pointermove',reset);};},[mode,room,booting]);
  useEffect(() => {
    let stopped = false; let loaded = false; const images = ASSETS.map(name => { const image = new Image(); image.src = `/arcade/${name}.webp`; return image.decode(); });
    const finish = Promise.allSettled(images).then(() => { loaded = true; });
    const timer = setTimeout(() => { if (stopped) return; if (loaded) setBooting(false); else { setBootText('CARGANDO LOS ÚLTIMOS RECURSOS'); void finish.then(() => { if (!stopped) setBooting(false); }); } }, 4000);
    const deadline = setTimeout(() => { if (!stopped) { setBooting(false); if (!loaded) setError('La conexión está tardando. Algunos recursos pueden seguir cargándose.'); } }, 12000);
    return () => { stopped = true; clearTimeout(timer); clearTimeout(deadline); };
  }, []);
  useEffect(() => {
    if (!credentials) return; let stopped = false; let timer: ReturnType<typeof setTimeout>; const abort = new AbortController();const started=Date.now();
    async function poll() {
      if (stopped) return;
      if (!document.hidden && navigator.onLine) try { const result = await arcadeFetch({ action: 'poll', id: credentials!.id, role: 'host' }, credentials!.token, abort.signal);
        if (!stopped) setState(previous => !previous || result.version >= previous.version ? result : previous);
      } catch (cause) { if (!stopped) { setError(cause instanceof Error ? cause.message : 'Señal interrumpida.'); if (cause instanceof ArcadeHttpError && [401, 410].includes(cause.status)) { setCredentials(null); setState(null); setQrs([]); setLinks([]); return; } } }
      timer = setTimeout(poll, Date.now()-started<20000?500:1000);
    }
    void poll(); return () => { stopped = true; abort.abort(); clearTimeout(timer); };
  }, [credentials]);
  useEffect(() => () => { const credential = creds.current; if (credential && !closing.current) void fetch('/api/tv-arcade', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${credential.token}` }, body: JSON.stringify({ action: 'close', id: credential.id, role: 'host' }), keepalive: true }).catch(() => {}); }, []);
  async function connect() {
    if (busy) return null; if (credentials) { setRoom(true); return { credential: credentials, snapshot: current.current! }; }
    setBusy(true); setError('');
    try { const result = await arcadeFetch({ action: 'create' }); if (!result.token || !result.invites) throw new Error('No se pudo crear la sala.');
      if (closing.current) { await arcadeFetch({ action: 'close', id: result.id, role: 'host' }, result.token).catch(() => {}); return null; }
      const credential: ArcadeCredentials = { id: result.id, token: result.token, role: 'host' }; setCredentials(credential); setState(result); creds.current = credential; current.current = result;
      const urls = result.invites.map((invite, slot) => `${location.origin}/mando/jugar#${result.id}.${slot}.${invite}`); const qr = await import('qrcode');
      setLinks(urls); setQrs(await Promise.all(urls.map(url => qr.toDataURL(url, { width: 280, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#061527', light: '#ffffff' } })))); setRoom(true);
      return { credential, snapshot: result };
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo crear la sala.'); return null; } finally { setBusy(false); }
  }
  async function select(next: ArcadeMode) {
    if (busy) return; setError('');setAttract(false);playArcadeSound('select');
    if (['platform','fight','blocks'].includes(next) && !credentials) { setMode(next); return; }
    if (next === 'lobby' && !credentials) { setMode(next); return; }
    const connection = credentials && current.current ? { credential: credentials, snapshot: current.current } : await connect();
    if (!connection) return; setBusy(true);
    try { const result = await selectArcadeMode(connection.credential, next, connection.snapshot.version); setState(result); current.current = result; setMode(next); if (result.players.every(player => player.connected)) setRoom(false); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo iniciar la partida.'); } finally { setBusy(false); }
  }
  async function close() { closing.current = true; const credential = creds.current; if (credential) void arcadeFetch({ action: 'close', id: credential.id, role: 'host' }, credential.token).catch(() => {}); onClose(); }
  async function openRoom() { const connection = await connect(); if (connection && mode !== connection.snapshot.mode) { const result = await selectArcadeMode(connection.credential, mode, connection.snapshot.version).catch(() => null); if (result) setState(result); } }
  const actualMode = credentials && state ? state.mode : mode;
  const gameKey=`${actualMode}-${state?.version??0}`;
  return <Dialog.Root open onOpenChange={open => { if (!open) void close(); }}><Dialog.Portal><Dialog.Overlay className={styles.overlay} /><Dialog.Content className={styles.cabinet} style={origin} onEscapeKeyDown={event=>{if(document.pointerLockElement){event.preventDefault();document.exitPointerLock();}}} onCloseAutoFocus={event => { event.preventDefault(); document.querySelector<HTMLAnchorElement>('a[aria-label="Latech, inicio"]')?.focus(); }}>
    <Dialog.Title className="sr-only">Latech Arcade: canal secreto</Dialog.Title><Dialog.Description className="sr-only">Cinco juegos y un bonus oculto. Conecta dos teléfonos mediante QR o juega con el teclado. Escape sale del arcade.</Dialog.Description>
    <header className={styles.topbar}><div className={styles.brand}><i className={styles.led} />LATECH / ARCADE<span className={styles.eyebrow}>CH 99</span></div><div className={styles.controls}>{actualMode !== 'lobby' && <button className={styles.iconButton} onClick={() => void select('lobby')} aria-label="Volver a los juegos"><Grid2X2 size={17} /></button>}{state?.game && <button className={styles.iconButton} disabled={busy} onClick={() => void select(actualMode)} aria-label="Reiniciar partida"><RotateCcw size={16} /></button>}<ArcadeSoundToggle className={styles.soundButton}/><button className={styles.button} disabled={busy} onClick={() => void openRoom()}><Gamepad2 size={14} style={{ display: 'inline', marginRight: 7 }} />{credentials ? 'Mis mandos' : 'Conectar mandos'}</button><Dialog.Close className={styles.iconButton} aria-label="Salir del arcade"><X size={18} /></Dialog.Close></div></header>
    {error && <p className={styles.error} role="alert">{error}</p>}
    <div className={styles.content}>
      {actualMode==='lobby'?<div className={styles.menu} inert={attract}>
        <span className={styles.eyebrow}>HAS ENCONTRADO EL CANAL SECRETO</span><h2>Las mejores ideas<br/>también se juegan.</h2><p className={styles.menuIntro}>Tu televisión acaba de convertirse en una consola. Un móvil, un mando. Dos móviles, una buena rivalidad.</p>
        <div className={styles.games}>{GAMES.map(game=><button className={styles.gameCard} key={game.id} disabled={busy} onClick={()=>void select(game.id)}><img src={`/arcade/${game.image}.webp`} alt=""/><span className={styles.cartridgeLabel}>LATECH ORIGINAL / INSERT & PLAY</span><span className={styles.cardCopy}><small>{game.type}</small><strong>{game.name} ↗</strong><span>{game.text}</span></span></button>)}</div>
        <div className={styles.bonus}><span>Arte propio. Mandos con historia. Ganas de jugar.</span><button className={styles.button} disabled={busy} onClick={()=>void select('orbit')}>BONUS / Cuatro en órbita ↗</button></div>
      </div>:actualMode==='platform'?<PlatformGame key={gameKey} remote={peers.inputs} pairedSecond={state?.players[1].connected} pauseSignal={pauseSignal} onFinished={finished} onRestart={credentials?()=>void select('platform'):undefined}/>:actualMode==='fight'?<FightGame key={gameKey} remote={peers.inputs} pairedSecond={state?.players[1].connected} pauseSignal={pauseSignal} onFinished={finished} onRestart={credentials?()=>void select('fight'):undefined}/>:actualMode==='blocks'?<BlocksGame key={gameKey} remote={peers.inputs} pauseSignal={pauseSignal}/>:state?.game?<ArcadeBoard game={state.game}/>:<p className={styles.message}>Conecta los mandos para preparar la partida.</p>}
      {attract&&actualMode==='lobby'&&<div className={styles.attract}><div inert><FightGame remote={peers.inputs} demo/></div><button className={styles.attractPrompt} onClick={()=>setAttract(false)}>MODO DEMOSTRACIÓN · TOCA PARA ELEGIR TU JUEGO</button></div>}
    </div>
    {room && <aside className={styles.room} aria-label="Conectar los dos mandos"><div className={styles.roomHead}><h3>Dos mandos. Una pantalla.</h3><button className={styles.iconButton} onClick={() => setRoom(false)} aria-label="Ocultar códigos QR"><X size={16} /></button></div><p>Escanea tu QR con la cámara del móvil. Se conecta automáticamente. Mantén abierta esta televisión.</p><div className={styles.qrGrid}>{[0, 1].map(slot => <div className={styles.qrSeat} key={slot}><b>JUGADOR {slot + 1}</b>{state?.players[slot].connected ? <div className={styles.connected}>✓<small>{state.players[slot].online ? 'Mando conectado' : 'Mando en pausa'}</small></div> : qrs[slot] ? <img src={qrs[slot]} alt={`Código QR para el jugador ${slot + 1}`} /> : <p>Preparando QR…</p>}<small>{state?.players[slot].connected ? peers.status[slot] : 'QR válido durante 5 minutos'}</small>{!state?.players[slot].connected && links[slot] && <a href={links[slot]} target="_blank" rel="noopener noreferrer">Abrir este mando ↗</a>}</div>)}</div><p>Salto Zero, Neon Clash e Isla libre: dos mandos o teclado. Space Wars, Mar abierto y Cuatro en órbita: por turnos. La conexión directa depende de tu red.</p></aside>}
    {booting && <div className={styles.boot} role="status"><img className={styles.bootLogo} src="/brand/latech-logo.webp" alt="Latech" /><p className={styles.bootTitle}>Otra frecuencia.</p><small>{bootText}</small><div className={styles.bootTrack} aria-hidden><i /></div></div>}
  </Dialog.Content></Dialog.Portal></Dialog.Root>;
}
