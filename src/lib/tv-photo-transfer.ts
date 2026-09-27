export const TV_PHOTO_MAX=500_000;
const CHUNK=16_000;
export async function sendTvPhoto(channel:RTCDataChannel|null,blob:Blob){
  if(!channel||channel.readyState!=='open')throw new Error('La señal directa todavía no está lista.');
  if(blob.type!=='image/jpeg'||blob.size>TV_PHOTO_MAX||blob.size<4)throw new Error('La foto no tiene un tamaño compatible.');
  const bytes=await blob.arrayBuffer(),id=crypto.randomUUID();let confirm:(ok:boolean)=>void=()=>{};const confirmation=new Promise<boolean>(resolve=>{confirm=resolve;});const timer=setTimeout(()=>confirm(false),15000);
  const ack=(event:MessageEvent)=>{if(typeof event.data!=='string'||event.data.length>100)return;try{const value=JSON.parse(event.data);if(value.type==='photo-ack'&&value.id===id)confirm(true);}catch{/* Ignore unrelated messages. */}};channel.addEventListener('message',ack);
  try{channel.send(JSON.stringify({type:'photo',id,size:bytes.byteLength}));
  for(let offset=0;offset<bytes.byteLength;offset+=CHUNK){
    if(channel.readyState!=='open')throw new Error('La señal se ha interrumpido. Vuelve a intentarlo.');
    if(channel.bufferedAmount>128_000)await new Promise<void>((resolve,reject)=>{channel.bufferedAmountLowThreshold=64_000;const timer=setTimeout(()=>{channel.removeEventListener('bufferedamountlow',done);reject(new Error('La foto está tardando demasiado. Vuelve a intentarlo.'));},6000);function done(){clearTimeout(timer);resolve();}channel.addEventListener('bufferedamountlow',done,{once:true});});
    channel.send(bytes.slice(offset,offset+CHUNK));
  }
  if(!await confirmation)throw new Error('La televisión no ha confirmado la foto. Comprueba la conexión y vuelve a enviarla.');
  }finally{clearTimeout(timer);channel.removeEventListener('message',ack);}
}
/** Ordered binary channel; bounded in memory and never persisted or uploaded. */
export function receiveTvPhotos(channel:RTCDataChannel,onPhoto:(blob:Blob)=>void){
  let size=0,total=0,started=0,last=-Infinity,id='';let chunks:ArrayBuffer[]=[];channel.binaryType='arraybuffer';
  const reset=()=>{size=0;total=0;chunks=[];id='';};
  channel.onmessage=event=>{
    const now=performance.now();
    if(typeof event.data==='string'){
      reset();if(event.data.length>120||now-last<1000)return;
      try{const value=JSON.parse(event.data);if(value.type==='photo'&&Number.isInteger(value.size)&&value.size>=4&&value.size<=TV_PHOTO_MAX){size=value.size;started=now;if(typeof value.id==='string'&&/^[a-f0-9-]{36}$/.test(value.id))id=value.id;}}catch{/* Ignore malformed frame. */}return;
    }
    if(!(event.data instanceof ArrayBuffer)||!size||now-started>10000||event.data.byteLength>CHUNK||total+event.data.byteLength>size){reset();return;}
    chunks.push(event.data);total+=event.data.byteLength;
    if(total===size){
      const byteAt=(index:number)=>{for(const chunk of chunks){if(index<chunk.byteLength)return new Uint8Array(chunk)[index];index-=chunk.byteLength;}return -1;};
      if(byteAt(0)===255&&byteAt(1)===216&&byteAt(size-2)===255&&byteAt(size-1)===217){last=now;onPhoto(new Blob(chunks,{type:'image/jpeg'}));if(id&&channel.readyState==='open')channel.send(JSON.stringify({type:'photo-ack',id}));}reset();
    }
  };channel.onclose=reset;return()=>{reset();channel.onmessage=null;channel.onclose=null;};
}
