/** Technical, local-only ring buffer. No photos, tokens, SDP, URLs or user profiles. */
type Diagnostic={at:number;event:string;detail:string|number};
const KEY='latech-arcade-diagnostics';const entries:Diagnostic[]=[];
export function recordArcade(event:string,detail:string|number=''){
  entries.push({at:Date.now(),event:event.slice(0,48),detail:typeof detail==='string'?detail.slice(0,80):detail});if(entries.length>80)entries.shift();
  try{sessionStorage.setItem(KEY,JSON.stringify(entries));}catch{/* Diagnostics never interrupt a game. */}
}
export function arcadeFrameProbe(game:string){let start=0,frames=0;return(now:number)=>{if(!start)start=now;frames++;if(now-start>=10000){recordArcade(`${game}:fps`,Math.round(frames*1000/(now-start)));start=now;frames=0;}};}
export function readArcadeDiagnostics(){return entries.map(entry=>({...entry}));}
