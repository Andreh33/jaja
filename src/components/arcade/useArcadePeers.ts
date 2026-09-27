'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { arcadeFetch, type ArcadeCredentials, type ArcadeState } from '@/lib/arcade-protocol';
import { bufferInput,decodeInput, gatherCandidates, peerConfiguration, type RemoteInput } from '@/lib/arcade-peer';
import type { Player } from '@/lib/arcade-engine';
import {receiveTvPhotos,sendTvPhoto} from '@/lib/tv-photo-transfer';
import {recordArcade} from '@/lib/arcade-diagnostics';
type Link = { pc: RTCPeerConnection; channel?: RTCDataChannel; signalId: string; sending?: boolean; applied?: boolean };
export function useHostPeers(credentials: ArcadeCredentials | null, state: ArcadeState | null) {
  const peers = useRef<[Link | null, Link | null]>([null, null]);
  const inputs = useRef<[RemoteInput, RemoteInput]>([{ mask: 0, at: 0, sequence: -1 }, { mask: 0, at: 0, sequence: -1 }]);
  const [status, setStatus] = useState<[string, string]>(['Sin mando', 'Sin mando']);
  const statusValue=useRef<[string,string]>(['Sin mando','Sin mando']);
  const [photo,setPhoto]=useState<Blob|null>(null);
  useEffect(() => { const inputArray = inputs.current; return () => { peers.current.forEach(peer => peer?.pc.close()); peers.current = [null, null]; inputArray.forEach(input => { input.mask = 0; input.at = 0; }); }; }, [credentials?.id]);
  useEffect(()=>{if(!credentials)return;const timer=setInterval(()=>{for(const slot of[0,1]as const)if(statusValue.current[slot]==='Señal directa'&&inputs.current[slot].at>0&&performance.now()-inputs.current[slot].at>800){statusValue.current[slot]='Señal en pausa';setStatus([...statusValue.current]);recordArcade('peer:heartbeat-paused',slot);}},250);return()=>clearInterval(timer);},[credentials]);
  useEffect(() => {
    if (!credentials || !state || typeof RTCPeerConnection === 'undefined') return;
    const update = (slot: Player, value: string) => {if(statusValue.current[slot]===value)return;statusValue.current[slot]=value;setStatus([...statusValue.current]);};
    for (const slot of [0, 1] as Player[]) {
      if (!state.players[slot].connected) continue;
      let link = peers.current[slot]; const signal = state.signals[slot];
      if (link && !signal.signalId && !link.sending) { link.pc.close(); peers.current[slot] = null; link = null; }
      if (!link) {
        const pc = new RTCPeerConnection(peerConfiguration(state.iceServers)); const channel = pc.createDataChannel('latech-input', { ordered: false, maxRetransmits: 0 });
        const current: Link = { pc, channel, signalId: crypto.randomUUID(), sending: true }; peers.current[slot] = current;
        if(state.mode==='photo'&&slot===0){const media=pc.createDataChannel('latech-photo',{ordered:true});receiveTvPhotos(media,blob=>{if(peers.current[slot]?.pc===pc){setPhoto(blob);recordArcade('photo:received',blob.size);}});}
        inputs.current[slot] = { mask: 0, at: 0, sequence: -1 }; update(slot, 'Conectando señal directa…');
        channel.onopen = () => {if(peers.current[slot]?.pc!==pc)return;update(slot, 'Señal directa');recordArcade('peer:connected',slot);};
        channel.onclose = () => {if(peers.current[slot]?.pc!==pc)return; inputs.current[slot].mask = 0; inputs.current[slot].pressed = 0; update(slot, 'Sin señal directa');recordArcade('peer:disconnected',slot);setTimeout(()=>{if(peers.current[slot]?.pc===pc&&channel.readyState==='closed'){pc.close();peers.current[slot]=null;recordArcade('peer:channel-reconnect',slot);}},1800); };
        channel.onmessage = event => {if(peers.current[slot]?.pc!==pc)return; const decoded = decodeInput(event.data, inputs.current[slot].sequence); if (decoded) {inputs.current[slot] = bufferInput(inputs.current[slot],decoded,performance.now());update(slot,'Señal directa');} };
        pc.onconnectionstatechange = () => {if(peers.current[slot]?.pc!==pc)return; if (['failed', 'disconnected', 'closed'].includes(pc.connectionState)) { inputs.current[slot].mask = 0; inputs.current[slot].pressed = 0; update(slot, 'Sin señal directa'); }
          if(['failed','disconnected'].includes(pc.connectionState))setTimeout(()=>{if(peers.current[slot]?.pc===pc&&['failed','disconnected'].includes(pc.connectionState)){pc.close();peers.current[slot]=null;recordArcade('peer:reconnect',slot);}},1800);
        };
        void (async () => {
          try { await pc.setLocalDescription(await pc.createOffer()); await gatherCandidates(pc); if (pc.signalingState === 'closed') return;
            await arcadeFetch({ action: 'signal', id: credentials.id, role: 'host', slot, signalId: current.signalId, sdp: pc.localDescription!.sdp }, credentials.token);
          } catch { if (pc.signalingState !== 'closed'&&peers.current[slot]?.pc===pc) update(slot, 'Solo juegos por turnos'); } finally { current.sending = false; }
        })();
        const timer = setTimeout(() => { if (channel.readyState !== 'open' && pc.signalingState !== 'closed'&&peers.current[slot]?.pc===pc) update(slot, 'Solo juegos por turnos'); }, 16000);
        pc.addEventListener('connectionstatechange', () => { if (pc.connectionState === 'closed' || pc.connectionState === 'connected') clearTimeout(timer); });
      } else if (signal.answer && signal.signalId === link.signalId && !link.applied) {
        peers.current[slot] = { ...link, applied: true };
        void link.pc.setRemoteDescription({ type: 'answer', sdp: signal.answer }).catch(() => update(slot, 'Solo juegos por turnos'));
      }
    }
  }, [credentials, state]);
  return { inputs, status, photo };
}
export function useControllerPeer(credentials: ArcadeCredentials | null, state: ArcadeState | null) {
  const mask = useRef(0); const look = useRef<[number,number]>([0,0]); const channel = useRef<RTCDataChannel | null>(null); const sequence = useRef(0);
  const edge=useRef({id:0,bit:0});
  const media=useRef<RTCDataChannel|null>(null);
  const configuration=useRef(state?.iceServers);
  useEffect(()=>{configuration.current=state?.iceServers;},[state?.iceServers]);
  const sendInput = useCallback(() => { const current = channel.current; if (current?.readyState === 'open' && current.bufferedAmount < 2048) { try { current.send(JSON.stringify({m:document.hidden?0:mask.current,x:document.hidden?0:look.current[0],y:document.hidden?0:look.current[1],s:++sequence.current,e:edge.current.id,b:document.hidden?0:edge.current.bit})); } catch { /* The next heartbeat retries after a transient channel close. */ } } },[]);
  const [status, setStatus] = useState('Conectando señal directa…'); const slot = credentials?.slot ?? 0;
  const signalId = state?.signals[slot].signalId; const offer = state?.signals[slot].offer;
  useEffect(() => { mask.current = 0; look.current = [0,0]; edge.current.bit=0;sendInput(); }, [state?.mode,sendInput]);
  useEffect(() => {
    if (!credentials || !offer || !signalId || typeof RTCPeerConnection === 'undefined') return;
    let disposed = false; let retrying=false;let lastRetry=0;const pc = new RTCPeerConnection(peerConfiguration(configuration.current));
    const reset = () => { mask.current = 0; look.current = [0,0]; edge.current.bit=0;sendInput(); };
    pc.ondatachannel = event => {if(event.channel.label==='latech-photo'){media.current=event.channel;return;} channel.current = event.channel; event.channel.onopen = () => { if (!disposed) setStatus('Señal directa · lista'); }; event.channel.onclose = () => { if (!disposed) setStatus('Señal directa interrumpida'); }; };
    const timer = setTimeout(() => { if (!disposed && channel.current?.readyState !== 'open') setStatus('Esta red no permite señal directa. Los juegos por turnos sí funcionan.'); }, 16000);
    const send = setInterval(()=>{if(!document.hidden)sendInput();}, 25);
    const wake=()=>{reset();if(!document.hidden&&navigator.onLine&&!retrying&&Date.now()-lastRetry>5000&&['failed','disconnected'].includes(pc.connectionState)){retrying=true;lastRetry=Date.now();setStatus('Recuperando tu mando…');void arcadeFetch({action:'reconnect',id:credentials.id,role:credentials.role as 'p0'|'p1'},credentials.token).catch(()=>{}).finally(()=>{retrying=false;});}};
    pc.onconnectionstatechange=()=>{if(!disposed&&['failed','disconnected'].includes(pc.connectionState))setStatus('Recuperando tu mando…');};
    void (async () => { try { await pc.setRemoteDescription({ type: 'offer', sdp: offer }); await pc.setLocalDescription(await pc.createAnswer()); await gatherCandidates(pc); if (disposed) return;
      await arcadeFetch({ action: 'signal', id: credentials.id, role: credentials.role, slot, signalId, sdp: pc.localDescription!.sdp }, credentials.token);
    } catch { if (!disposed) setStatus('Solo juegos por turnos disponibles en esta red.'); } })();
    window.addEventListener('blur', reset);window.addEventListener('online',wake);document.addEventListener('visibilitychange', wake);
    return () => { disposed = true; reset(); clearTimeout(timer); clearInterval(send); pc.close(); channel.current = null;media.current=null; window.removeEventListener('blur', reset);window.removeEventListener('online',wake); document.removeEventListener('visibilitychange', wake); };
  }, [credentials, offer, signalId, slot, sendInput]);
  const setInput = useCallback((bit: number, pressed: boolean) => { if (pressed) {if(!(mask.current&bit)){edge.current.id++;edge.current.bit=bit;}mask.current |= bit;} else mask.current &= ~bit; sendInput(); }, [sendInput]);
  const setLook = useCallback((x:number,y:number) => {look.current=[Math.max(-1,Math.min(1,x)),Math.max(-1,Math.min(1,y))];sendInput();},[sendInput]);
  const sendPhoto=useCallback((blob:Blob)=>sendTvPhoto(media.current,blob),[]);
  return { setInput, setLook, sendPhoto, status };
}
