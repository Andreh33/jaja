/** WebRTC carries only a four-bit control mask. No camera or microphone. */
export const PEER_CONFIGURATION: RTCConfiguration = { iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }] };
export function gatherCandidates(pc: RTCPeerConnection) {
  if (pc.iceGatheringState === 'complete') return Promise.resolve();
  return new Promise<void>(resolve => {
    const finish = () => { clearTimeout(timer); pc.removeEventListener('icegatheringstatechange', change); resolve(); };
    const change = () => { if (pc.iceGatheringState === 'complete' || pc.signalingState === 'closed') finish(); };
    const timer = setTimeout(finish, 4500); pc.addEventListener('icegatheringstatechange', change);
  });
}
export type RemoteInput = { mask: number; at: number; sequence: number };
export function decodeInput(raw: unknown, previous: number): { mask: number; sequence: number } | null {
  if (typeof raw !== 'string' || raw.length > 100) return null;
  try { const input = JSON.parse(raw); if (!Number.isSafeInteger(input.s) || input.s <= previous || !Number.isInteger(input.m) || input.m < 0 || input.m > 15) return null; return { mask: input.m, sequence: input.s }; } catch { return null; }
}
export function activeInput(input: RemoteInput, now: number) { return now - input.at < 320 ? input.mask : 0; }
