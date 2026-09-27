'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { arcadeFetch, ArcadeHttpError, arcadeToken, type ArcadeCredentials, type ArcadeState } from '@/lib/arcade-protocol';
import { useControllerPeer } from './useArcadePeers';
import ArcadeBoard from './ArcadeBoard';
import ArcadeLiveControls from './ArcadeLiveControls';
import TvPhotoCapture from './TvPhotoCapture';
import styles from './Arcade.module.css';
const KEY = 'latech-arcade-controller';
function savedController(): (ArcadeCredentials & { invite?: string }) | null {
  try { const raw = sessionStorage.getItem(KEY); if (!raw) return null; const value = JSON.parse(raw);
    if (!/^[a-f0-9-]{36}$/.test(value.id) || !/^[a-f0-9]{64}$/.test(value.token) || ![0, 1].includes(value.slot) || value.role !== (value.slot === 0 ? 'p0' : 'p1')) return null;
    return { id: value.id, token: value.token, role: value.role, slot: value.slot, ...(typeof value.invite === 'string' && /^[a-f0-9]{64}$/.test(value.invite) ? { invite: value.invite } : {}) };
  } catch { return null; }
}
function saveController(value: ArcadeCredentials & { invite?: string }) { try { sessionStorage.setItem(KEY, JSON.stringify(value)); } catch { /* Pairing still works without persistence. */ } }
function forgetController() { try { sessionStorage.removeItem(KEY); } catch { /* Storage may be disabled. */ } }
const names: Record<string, string> = { lobby: 'Elige en la televisión', platform: 'Salto Zero', fight:'Neon Clash', blocks:'Isla libre',photo:'Tu foto en la tele', space: 'Space Wars', naval: 'Mar abierto', orbit: 'Cuatro en órbita' };
export default function ArcadeController() {
  const [credentials, setCredentials] = useState<ArcadeCredentials | null>(null); const [state, setState] = useState<ArcadeState | null>(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const initialized = useRef(false);
  const peer = useControllerPeer(credentials, state);
  useEffect(()=>{if(!credentials||!navigator.wakeLock)return;let stopped=false,pending=false;let lock:WakeLockSentinel|null=null;const acquire=async()=>{if(document.hidden||lock||pending||stopped)return;pending=true;try{const next=await navigator.wakeLock.request('screen');if(stopped){await next.release();return;}lock=next;next.addEventListener('release',()=>{if(lock===next)lock=null;});}catch{/* The OS may deny wake lock in battery saving mode. */}finally{pending=false;}};void acquire();document.addEventListener('visibilitychange',acquire);return()=>{stopped=true;document.removeEventListener('visibilitychange',acquire);void lock?.release();};},[credentials]);
  useEffect(() => {
    if (initialized.current) return; initialized.current = true;
    async function start() {
      const fragment = location.hash.slice(1); if (fragment) history.replaceState(null, '', location.pathname);
      const match = fragment.match(/^([a-f0-9-]{36})\.([01])\.([a-f0-9]{64})$/);
      try {
        const stored = savedController();
        if (match) {
          const slot = Number(match[2]) as 0 | 1; const credential: ArcadeCredentials = { id: match[1], token: stored?.id === match[1] && stored.slot === slot ? stored.token : arcadeToken(), role: slot === 0 ? 'p0' : 'p1', slot };
          // Save the controller secret before joining so retries cannot claim a different seat.
          saveController({ ...credential, invite: match[3] });
          let result = await arcadeFetch({ action: 'join', id: credential.id, slot, invite: match[3], controller: credential.token });
          if (stored?.id === credential.id && stored.slot === slot && !stored.invite) result = await arcadeFetch({ action: 'reconnect', id: credential.id, role: credential.role as 'p0' | 'p1' }, credential.token);
          saveController(credential); setCredentials(credential); setState(result);
        } else {
          if (!stored) return; const credential = stored;
          const result = credential.invite ? await arcadeFetch({ action: 'join', id: credential.id, slot: credential.slot!, invite: credential.invite, controller: credential.token }) : await arcadeFetch({ action: 'reconnect', id: credential.id, role: credential.role as 'p0' | 'p1' }, credential.token);
          delete credential.invite; saveController(credential); setCredentials(credential); setState(result);
        }
      } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo conectar.'); if (cause instanceof ArcadeHttpError && [401, 410].includes(cause.status)) forgetController(); }
    }
    void start();
  }, []);
  useEffect(() => {
    if (!credentials) return; let stopped = false; let timer: ReturnType<typeof setTimeout>; const abort = new AbortController();const started=Date.now();
    async function poll() { if (stopped) return;
      if (!document.hidden && navigator.onLine) try { const result = await arcadeFetch({ action: 'poll', id: credentials!.id, role: credentials!.role }, credentials!.token, abort.signal); if (!stopped) { setState(previous => !previous || result.version >= previous.version ? result : previous); setError(''); } }
      catch (cause) { if (!stopped) { setError(cause instanceof Error ? cause.message : 'Señal interrumpida.'); if (cause instanceof ArcadeHttpError && [401, 410].includes(cause.status)) { setCredentials(null); setState(null); forgetController(); return; } } }
      timer = setTimeout(poll, Date.now()-started<20000?500:1000);
    }
    void poll(); return () => { stopped = true; clearTimeout(timer); abort.abort(); };
  }, [credentials]);
  async function move(cell: number) {
    if (!credentials || !state || busy) return; setBusy(true); setError('');
    try { const result = await arcadeFetch({ action: 'move', id: credentials.id, role: credentials.role as 'p0' | 'p1', cell, version: state.version }, credentials.token); setState(result); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'La jugada no ha llegado.'); } finally { setBusy(false); }
  }
  async function reconnect() { if (!credentials) return; setBusy(true); try { const result = await arcadeFetch({ action: 'reconnect', id: credentials.id, role: credentials.role as 'p0' | 'p1' }, credentials.token); setState(result); } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo reconectar.'); } finally { setBusy(false); } }
  async function rematch(){if(!credentials||!state||busy)return;setBusy(true);try{setState(await arcadeFetch({action:'rematch',id:credentials.id,role:credentials.role as'p0'|'p1',version:state.version},credentials.token));}catch(cause){setError(cause instanceof Error?cause.message:'No ha llegado la confirmación.');}finally{setBusy(false);}}
  return <main className={styles.phone}><div className={styles.gamepad}><div className={styles.padBrand}>LATECH <small>WIRELESS / 1999</small></div><div className={styles.lcd}><small>{credentials ? `JUGADOR ${(credentials.slot ?? 0) + 1} / ${state?.hostOnline ? 'TELEVISIÓN CONECTADA' : 'TELEVISIÓN EN PAUSA'}` : 'BUSCANDO UNA NUEVA PARTIDA'}</small><b>{state ? names[state.mode] : 'Tu móvil. Tu mando.'}</b><small>{state && ['platform','fight','blocks'].includes(state.mode) ? peer.status : state?.game ? state.game.winner !== null ? 'Partida terminada' : `Turno del jugador ${state.game.turn + 1}` : 'Escanea el QR de la televisión para conectar.'}</small></div>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {state?.canRematch&&<div className={styles.padActions}><button className={styles.button} disabled={busy||state.players[credentials?.slot??0].rematchReady} onClick={()=>void rematch()}>{state.players[credentials?.slot??0].rematchReady?'Listo. Esperando al otro jugador…':'¡Revancha! Estoy listo'}</button></div>}
    {state?.mode==='photo'?<TvPhotoCapture sendPhoto={peer.sendPhoto} disabled={!state.hostOnline||!peer.status.includes('lista')}/>:state?.game && credentials ? <div className={styles.phoneBoard}><ArcadeBoard game={state.game} player={credentials.slot ?? 0} onMove={cell => void move(cell)} busy={busy || !state.hostOnline || !state.players.every(player => player.connected)} /></div> : <ArcadeLiveControls mode={state?.mode??'lobby'} disabled={!credentials||!state?.hostOnline} setInput={peer.setInput} setLook={peer.setLook}/>}
    <div className={styles.padActions}>{credentials ? <button className={styles.button} disabled={busy} onClick={() => void reconnect()}>Reconectar señal</button> : <>{error && <button className={styles.button} onClick={() => location.reload()}>Reintentar conexión</button>}<Link className={styles.button} href="/">Volver a Latech ↗</Link></>}</div><p className={styles.padCaption}>{state?.game ? 'Los turnos se confirman en la televisión.' : 'Para jugar, deja esta pantalla encendida.'}</p>
  </div></main>;
}
