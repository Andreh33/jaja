'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { arcadeFetch, type ArcadeCredentials, type ArcadeState } from '@/lib/arcade-protocol';
import { decodeInput, gatherCandidates, PEER_CONFIGURATION, type RemoteInput } from '@/lib/arcade-peer';
import type { Player } from '@/lib/arcade-engine';
type Link = { pc: RTCPeerConnection; channel?: RTCDataChannel; signalId: string; sending?: boolean; applied?: boolean };
export function useHostPeers(credentials: ArcadeCredentials | null, state: ArcadeState | null) {
  const peers = useRef<[Link | null, Link | null]>([null, null]);
  const inputs = useRef<[RemoteInput, RemoteInput]>([{ mask: 0, at: 0, sequence: -1 }, { mask: 0, at: 0, sequence: -1 }]);
  const [status, setStatus] = useState<[string, string]>(['Sin mando', 'Sin mando']);
  useEffect(() => { const inputArray = inputs.current; return () => { peers.current.forEach(peer => peer?.pc.close()); peers.current = [null, null]; inputArray.forEach(input => { input.mask = 0; input.at = 0; }); }; }, [credentials?.id]);
  useEffect(() => {
    if (!credentials || !state || typeof RTCPeerConnection === 'undefined') return;
    const update = (slot: Player, value: string) => setStatus(old => old.map((item, index) => index === slot ? value : item) as [string, string]);
    for (const slot of [0, 1] as Player[]) {
      if (!state.players[slot].connected) continue;
      let link = peers.current[slot]; const signal = state.signals[slot];
      if (link && !signal.signalId && !link.sending) { link.pc.close(); peers.current[slot] = null; link = null; }
      if (!link) {
        const pc = new RTCPeerConnection(PEER_CONFIGURATION); const channel = pc.createDataChannel('latech-input', { ordered: false, maxRetransmits: 0 });
        const current: Link = { pc, channel, signalId: crypto.randomUUID(), sending: true }; peers.current[slot] = current;
        inputs.current[slot] = { mask: 0, at: 0, sequence: -1 }; update(slot, 'Conectando señal directa…');
        channel.onopen = () => update(slot, 'Señal directa');
        channel.onclose = () => { inputs.current[slot].mask = 0; update(slot, 'Sin señal directa'); };
        channel.onmessage = event => { const decoded = decodeInput(event.data, inputs.current[slot].sequence); if (decoded) inputs.current[slot] = { ...decoded, at: performance.now() }; };
        pc.onconnectionstatechange = () => { if (['failed', 'disconnected', 'closed'].includes(pc.connectionState)) { inputs.current[slot].mask = 0; update(slot, 'Sin señal directa'); } };
        void (async () => {
          try { await pc.setLocalDescription(await pc.createOffer()); await gatherCandidates(pc); if (pc.signalingState === 'closed') return;
            await arcadeFetch({ action: 'signal', id: credentials.id, role: 'host', slot, signalId: current.signalId, sdp: pc.localDescription!.sdp }, credentials.token);
          } catch { if (pc.signalingState !== 'closed') update(slot, 'Solo juegos por turnos'); } finally { current.sending = false; }
        })();
        const timer = setTimeout(() => { if (channel.readyState !== 'open' && pc.signalingState !== 'closed') update(slot, 'Solo juegos por turnos'); }, 16000);
        pc.addEventListener('connectionstatechange', () => { if (pc.connectionState === 'closed' || pc.connectionState === 'connected') clearTimeout(timer); });
      } else if (signal.answer && signal.signalId === link.signalId && !link.applied) {
        peers.current[slot] = { ...link, applied: true };
        void link.pc.setRemoteDescription({ type: 'answer', sdp: signal.answer }).catch(() => update(slot, 'Solo juegos por turnos'));
      }
    }
  }, [credentials, state]);
  return { inputs, status };
}
export function useControllerPeer(credentials: ArcadeCredentials | null, state: ArcadeState | null) {
  const mask = useRef(0); const channel = useRef<RTCDataChannel | null>(null); const sequence = useRef(0);
  const [status, setStatus] = useState('Conectando señal directa…'); const slot = credentials?.slot ?? 0;
  const signalId = state?.signals[slot].signalId; const offer = state?.signals[slot].offer;
  useEffect(() => { mask.current = 0; }, [state?.mode]);
  useEffect(() => {
    if (!credentials || !offer || !signalId || typeof RTCPeerConnection === 'undefined') return;
    let disposed = false; const pc = new RTCPeerConnection(PEER_CONFIGURATION);
    const reset = () => { mask.current = 0; if (channel.current?.readyState === 'open') channel.current.send(JSON.stringify({ m: 0, s: ++sequence.current })); };
    pc.ondatachannel = event => { channel.current = event.channel; event.channel.onopen = () => { if (!disposed) setStatus('Señal directa · lista'); }; event.channel.onclose = () => { if (!disposed) setStatus('Señal directa interrumpida'); }; };
    const timer = setTimeout(() => { if (!disposed && channel.current?.readyState !== 'open') setStatus('Esta red no permite señal directa. Los juegos por turnos sí funcionan.'); }, 16000);
    const send = setInterval(() => { if (channel.current?.readyState === 'open' && channel.current.bufferedAmount < 4096) channel.current.send(JSON.stringify({ m: document.hidden ? 0 : mask.current, s: ++sequence.current })); }, 40);
    void (async () => { try { await pc.setRemoteDescription({ type: 'offer', sdp: offer }); await pc.setLocalDescription(await pc.createAnswer()); await gatherCandidates(pc); if (disposed) return;
      await arcadeFetch({ action: 'signal', id: credentials.id, role: credentials.role, slot, signalId, sdp: pc.localDescription!.sdp }, credentials.token);
    } catch { if (!disposed) setStatus('Solo juegos por turnos disponibles en esta red.'); } })();
    window.addEventListener('blur', reset); document.addEventListener('visibilitychange', reset);
    return () => { disposed = true; reset(); clearTimeout(timer); clearInterval(send); pc.close(); channel.current = null; window.removeEventListener('blur', reset); document.removeEventListener('visibilitychange', reset); };
  }, [credentials, offer, signalId, slot]);
  const setInput = useCallback((bit: number, pressed: boolean) => { if (pressed) mask.current |= bit; else mask.current &= ~bit; }, []);
  return { setInput, status };
}
