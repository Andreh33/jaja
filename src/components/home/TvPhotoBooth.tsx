'use client';
/* eslint-disable @next/next/no-img-element -- Ephemeral QR codes are generated locally. */
import{useEffect,useRef,useState}from'react';
import*as Dialog from'@radix-ui/react-dialog';
import{Camera,X}from'lucide-react';
import{arcadeFetch,ArcadeHttpError,type ArcadeCredentials,type ArcadeState}from'@/lib/arcade-protocol';
import{useHostPeers}from'../arcade/useArcadePeers';
import type{StudioExperience}from'./useStudioExperience';
import styles from'./TvRemote.module.css';
export default function TvPhotoBooth({studio}:{studio:StudioExperience}){
  const[open,setOpen]=useState(false);const[credentials,setCredentials]=useState<ArcadeCredentials|null>(null);const[state,setState]=useState<ArcadeState|null>(null);const[qr,setQr]=useState('');const[link,setLink]=useState('');const[busy,setBusy]=useState(false);const[error,setError]=useState('');const current=useRef(credentials);const peers=useHostPeers(credentials,state);
  const mounted=useRef(true);const starting=useRef(false);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
  useEffect(()=>{current.current=credentials;},[credentials]);
  useEffect(()=>()=>{const c=current.current;if(c)void fetch('/api/tv-arcade',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${c.token}`},body:JSON.stringify({action:'close',id:c.id,role:'host'}),keepalive:true}).catch(()=>{});},[]);
  useEffect(()=>{if(!credentials)return;let stopped=false;let timer:ReturnType<typeof setTimeout>;const abort=new AbortController();async function poll(){try{const result=await arcadeFetch({action:'poll',id:credentials!.id,role:'host'},credentials!.token,abort.signal);if(!stopped)setState(result);}catch(cause){if(!stopped){setError('La señal temporal se ha interrumpido. Puedes abrir otra conexión.');if(cause instanceof ArcadeHttpError&&[401,404,410].includes(cause.status)){setCredentials(null);setState(null);setQr('');return;}}}if(!stopped)timer=setTimeout(poll,1200);}void poll();return()=>{stopped=true;clearTimeout(timer);abort.abort();};},[credentials]);
  const setPhoto=studio.setPhoto;
  useEffect(()=>{if(!peers.photo)return;const url=URL.createObjectURL(peers.photo);const image=new Image();image.src=url;let stopped=false;let timer:ReturnType<typeof setTimeout>;void image.decode().then(()=>{if(stopped)return;setPhoto({src:url,until:Date.now()+60000});setOpen(false);timer=setTimeout(()=>setPhoto(old=>old?.src===url?null:old),60000);}).catch(()=>{if(!stopped)setError('La foto recibida no se ha podido abrir.');});return()=>{stopped=true;clearTimeout(timer);setPhoto(old=>old?.src===url?null:old);URL.revokeObjectURL(url);};},[peers.photo,setPhoto]);
  async function start(){
    if(starting.current)return;starting.current=true;setBusy(true);setError('');
    let createdCredentials:ArcadeCredentials|null=null;
    try{
      if(credentials)await arcadeFetch({action:'close',id:credentials.id,role:'host'},credentials.token).catch(()=>{});
      current.current=null;setCredentials(null);setState(null);setQr('');
      const created=await arcadeFetch({action:'create'});
      if(!created.token||!created.invites)throw new Error('No se ha podido abrir la cámara de la televisión.');
      const c:ArcadeCredentials={id:created.id,token:created.token,role:'host'};createdCredentials=c;
      if(!mounted.current)return;
      const selected=await arcadeFetch({action:'select',id:c.id,role:'host',mode:'photo',version:created.version},c.token);
      const url=`${location.origin}/mando/jugar#${c.id}.0.${created.invites[0]}`;
      const qrcode=await import('qrcode');
      const image=await qrcode.toDataURL(url,{width:320,margin:4,errorCorrectionLevel:'M',color:{dark:'#061421',light:'#ffffff'}});
      if(!mounted.current)return;
      current.current=c;setState(selected);setCredentials(c);setLink(url);setQr(image);createdCredentials=null;
    }catch(cause){if(mounted.current)setError(cause instanceof Error?cause.message:'No se pudo conectar.');}
    finally{
      if(createdCredentials)void arcadeFetch({action:'close',id:createdCredentials.id,role:'host'},createdCredentials.token).catch(()=>{});
      starting.current=false;if(mounted.current)setBusy(false);
    }
  }
  return<Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Trigger className={styles.remoteTrigger}><Camera size={17}/>Tu foto en la tele</Dialog.Trigger><Dialog.Portal><Dialog.Overlay className={styles.overlay}/><Dialog.Content className={`${styles.dialog} ${styles.pairDialog}`}><div className={styles.dialogHeading}><div><p className={styles.eyebrow}>LATECH / INSTANT CAMERA</p><Dialog.Title>Ahora salís vosotros.</Dialog.Title></div><Dialog.Close className={styles.close} aria-label="Cerrar foto temporal"><X size={18}/></Dialog.Close></div><Dialog.Description className={styles.description}>Escanea el QR, haz una foto y elige mostrarla. Aparecerá en esta tele durante 60 segundos. No se guarda en el servidor ni se publica en Instagram.</Dialog.Description>{qr?<div className={styles.pairing}><div className={styles.qr}><img src={qr} alt="QR para mostrar una foto temporal en la televisión"/></div><div><strong>60 s</strong><p>{state?.players[0].connected?peers.status[0]:'Abre la cámara del móvil y escanea.'}</p><a href={link} target="_blank" rel="noopener noreferrer" className={styles.copy}>Abrir cámara del móvil ↗</a></div></div>:null}<button className={styles.primary} disabled={busy} onClick={()=>void start()}>{busy?'Abriendo señal…':qr?'Nueva conexión':'Abrir mi conexión'}</button>{studio.photo&&<button className={styles.disconnect} onClick={()=>setPhoto(null)}>Quitar foto ahora</button>}{error&&<p className={styles.error} role="alert">{error}</p>}</Dialog.Content></Dialog.Portal></Dialog.Root>;
}
