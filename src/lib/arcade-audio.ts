let context:AudioContext|null=null;let enabled=false;let last=0;const listeners=new Set<()=>void>();
export function arcadeSoundEnabled(){return enabled;}
export function subscribeArcadeSound(callback:()=>void){listeners.add(callback);return()=>listeners.delete(callback);}
export async function toggleArcadeSound(){
  if(enabled){enabled=false;listeners.forEach(fn=>fn());return false;}
  try{context??=new AudioContext();await context.resume();enabled=true;listeners.forEach(fn=>fn());playArcadeSound('select');return true;}catch{enabled=false;listeners.forEach(fn=>fn());return false;}
}
export function playArcadeSound(kind:string){
  if(!enabled||!context||context.state!=='running'||document.hidden)return;
  const now=context.currentTime;if(now-last<.035)return;last=now;
  const settings:Record<string,[number,number,number]>={jump:[280,650,.12],coin:[880,1320,.1],hit:[130,55,.13],checkpoint:[520,1040,.26],power:[440,990,.3],finish:[660,1320,.4],select:[240,320,.06],block:[300,180,.08]};
  const[from,to,duration]=settings[kind]??settings.select;const tone=context.createOscillator();const gain=context.createGain();tone.type=kind==='hit'?'sawtooth':'triangle';tone.frequency.setValueAtTime(from,now);tone.frequency.exponentialRampToValueAtTime(to,now+duration);gain.gain.setValueAtTime(.001,now);gain.gain.linearRampToValueAtTime(kind==='hit'?.045:.065,now+.008);gain.gain.exponentialRampToValueAtTime(.001,now+duration);tone.connect(gain);gain.connect(context.destination);tone.start(now);tone.stop(now+duration+.01);tone.onended=()=>{tone.disconnect();gain.disconnect();};
}
