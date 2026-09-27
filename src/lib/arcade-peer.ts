/** Bounded buttons and look rates only. No camera, microphone or coordinates. */
export const PEER_CONFIGURATION: RTCConfiguration = { iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }] };
export function gatherCandidates(pc: RTCPeerConnection) {
  if (pc.iceGatheringState === 'complete') return Promise.resolve();
  return new Promise<void>(resolve => {
    const finish = () => { clearTimeout(timer); pc.removeEventListener('icegatheringstatechange', change); resolve(); };
    const change = () => { if (pc.iceGatheringState === 'complete' || pc.signalingState === 'closed') finish(); };
    const timer = setTimeout(finish, 4500); pc.addEventListener('icegatheringstatechange', change);
  });
}
export type RemoteInput = { mask: number; at: number; sequence: number; lookX?: number; lookY?: number; pressed?:number;pressedAt?:number };
export function decodeInput(raw: unknown, previous: number): Omit<RemoteInput,'at'> | null {
  if (typeof raw !== 'string' || raw.length > 100) return null;
  try { const input = JSON.parse(raw); if (!input || !Number.isSafeInteger(input.s) || input.s <= previous || !Number.isInteger(input.m) || input.m < 0 || input.m > 511) return null;
    if (input.x !== undefined && (!Number.isFinite(input.x) || Math.abs(input.x)>1) || input.y !== undefined && (!Number.isFinite(input.y) || Math.abs(input.y)>1)) return null;
    return { mask: input.m, sequence: input.s, ...(input.x !== undefined ? {lookX:input.x}:{}), ...(input.y !== undefined ? {lookY:input.y}:{}) };
  } catch { return null; }
}
export function activeInput(input: RemoteInput, now: number) { return now - input.at < 320 ? input.mask : 0; }
/** Preserve a tap arriving between render frames, but consume it only once. */
export function consumeInput(input:RemoteInput,now:number){const mask=now-input.at<320?input.mask|(now-(input.pressedAt??input.at)<320?input.pressed??0:0):0;input.pressed=0;return mask;}
export function bufferInput(previous:RemoteInput,next:Omit<RemoteInput,'at'>,now:number):RemoteInput{const pressed=next.mask&~previous.mask;return{...next,at:now,pressed:(now-(previous.pressedAt??previous.at)<320?previous.pressed??0:0)|pressed,pressedAt:pressed?now:previous.pressedAt};}
export function activeLook(input:RemoteInput,now:number):[number,number] {return now-input.at<320?[input.lookX??0,input.lookY??0]:[0,0];}
