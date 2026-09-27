'use client';
import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { consumeInput, type RemoteInput } from '@/lib/arcade-peer';
import { newPlatformWorld, setPlatformCoop, stepPlatform, PLATFORM_HEIGHT, PLATFORM_WIDTH } from '@/lib/platform-engine';
import styles from './Arcade.module.css';
import {playArcadeSound} from '@/lib/arcade-audio';
import {arcadeFrameProbe,recordArcade} from '@/lib/arcade-diagnostics';
const CROPS = [[49,87,298,339],[440,102,350,328],[854,70,355,340],[58,536,324,290],[508,493,287,322],[918,498,270,311],[80,890,275,270],[405,943,437,215],[883,850,338,332]];
export default function PlatformGame({ remote, pairedSecond = false,pauseSignal=0,onFinished,onRestart }: { remote: MutableRefObject<[RemoteInput, RemoteInput]>; pairedSecond?: boolean;pauseSignal?:number;onFinished?:()=>void;onRestart?:()=>void }) {
  const canvas = useRef<HTMLCanvasElement>(null); const world = useRef(newPlatformWorld()); const keyboard = useRef<[number,number]>([0,0]);
  const [localCoop, setCoop] = useState(pairedSecond);const coop=pairedSecond||localCoop; const coopRef = useRef(coop);
  const [hud, setHud] = useState(()=>({ score: 0, lives: 3, level: 1, title: newPlatformWorld().title, state: 'playing', combo: 0, waiting: false }));
  const [paused, setPaused] = useState(false); const pausedRef = useRef(false); const [artError, setArtError] = useState(false);
  const [loading, setLoading] = useState(true); const [intro, setIntro] = useState(true); const introRef = useRef(true);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  const previousPause=useRef(pauseSignal);useEffect(()=>{if(previousPause.current!==pauseSignal)setPaused(true);previousPause.current=pauseSignal;},[pauseSignal]);
  useEffect(()=>{if(hud.state==='dead'||hud.state==='complete'&&hud.level===4)onFinished?.();},[hud.state,hud.level,onFinished]);
  useEffect(() => { coopRef.current = coop; setPlatformCoop(world.current, coop); keyboard.current = [0,0]; }, [coop]);
  useEffect(() => { introRef.current = intro; }, [intro]);
  useEffect(() => {
    const element = canvas.current; const ctx = element?.getContext('2d'); if (!element || !ctx) return;
    let frame = 0; let disposed = false; let last = performance.now(); let accumulator = 0; let lastHud = 0; let heard=0; let introTimer: ReturnType<typeof setTimeout>;const probe=arcadeFrameProbe('platform');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const backdrops = [1,2,3,4].map(level => { const image = new Image(); image.src = `/arcade/platform-world${level === 1 ? '' : `-${level}`}.webp`; return image; });
    const sprites = new Image(); sprites.src = '/arcade/platform-sprites.webp';
    const mapping: Record<string, [number,number]> = { KeyA:[0,1],KeyD:[0,2],Space:[0,4],KeyW:[0,4],ShiftLeft:[0,8],ArrowLeft:[1,1],ArrowRight:[1,2],ArrowUp:[1,4],ShiftRight:[1,8] };
    const down = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest('button,a,input,select,textarea,[contenteditable=true]')) return;
      const key = mapping[event.code]; if (key) { event.preventDefault(); keyboard.current[coopRef.current ? key[0] : 0] |= key[1]; }
      if (event.code === 'KeyP' && !event.repeat) setPaused(value => !value);
    };
    const up = (event: KeyboardEvent) => { const key = mapping[event.code]; if (key) { event.preventDefault(); keyboard.current[coopRef.current ? key[0] : 0] &= ~key[1]; } };
    const blur = () => { keyboard.current = [0,0]; if (document.hidden) setPaused(true); };
    window.addEventListener('keydown',down); window.addEventListener('keyup',up); window.addEventListener('blur',blur); document.addEventListener('visibilitychange',blur);
    const sprite = (index: number, x: number, y: number, width: number, height: number, flip = false) => {
      const [sx,sy,sw,sh] = CROPS[index]; ctx.save(); if (flip) { ctx.translate(x+width,y); ctx.scale(-1,1); x=0; y=0; }
      ctx.drawImage(sprites,sx,sy,sw,sh,x,y,width,height); ctx.restore();
    };
    function draw(now: number) {
      if (disposed) return;probe(now); const elapsed = Math.min((now-last)/1000,.05); last=now; const w=world.current; const context=ctx!;
      if (!pausedRef.current && !introRef.current && !document.hidden) {
        accumulator+=elapsed;
        while(accumulator>=1/120) { stepPlatform(w,[keyboard.current[0]|consumeInput(remote.current[0],now),keyboard.current[1]|consumeInput(remote.current[1],now)],1/120); accumulator-=1/120; }
      } else accumulator=0;
      context.clearRect(0,0,PLATFORM_WIDTH,PLATFORM_HEIGHT);
      const pan=reduced?0:w.camera*.025;
      context.drawImage(backdrops[Math.min(3,w.level-1)],-pan%100-50,-25,1224,640);
      context.fillStyle='rgba(3,15,30,.09)'; context.fillRect(0,0,1024,576);
      if(!reduced)for(let n=0;n<9;n++){const t=w.time*.3+n*2.1;context.save();context.translate((n*173+Math.sin(t)*40-w.camera*.13+2048)%1080,((w.time*18+n*71)%610)-20);context.rotate(t);context.fillStyle=n%3?'#d3da8677':'#e5ae6677';context.beginPath();context.ellipse(0,0,5,2,0,0,Math.PI*2);context.fill();context.restore();}
      if(w.eventId<heard)heard=0;for(const event of w.events)if(event.id>heard){playArcadeSound(event.kind);heard=event.id;}
      context.save(); context.translate(-w.camera,0);
      for(const [i,p] of w.platforms.entries()) {
        if(p.x+p.w<w.camera-100||p.x>w.camera+1100) continue;
        if(p.brick) for(let x=p.x;x<p.x+p.w;x+=34) sprite(6,x,p.y,35,35);
        else {
          for(let x=p.x;x<p.x+p.w;x+=108) sprite(7,x-1,p.y-8,Math.min(112,p.x+p.w-x+2),75);
        }
        if(p.checkpoint) {
          const active=i<=w.checkpoint; context.strokeStyle=active?'#77ffe6':'#fff2b0'; context.lineWidth=3;
          context.beginPath();context.moveTo(p.x+30,p.y);context.lineTo(p.x+30,p.y-66);context.stroke();
          context.fillStyle=active?'#55eacb':'#ffc861';context.beginPath();context.moveTo(p.x+32,p.y-66);context.lineTo(p.x+65,p.y-55);context.lineTo(p.x+32,p.y-43);context.fill();
        }
      }
      for(const coin of w.coins) if(!coin.taken&&coin.x>w.camera-40&&coin.x<w.camera+1060) sprite(5,coin.x-12,coin.y-14+(reduced?0:Math.sin(w.time*4+coin.x)*3),24,28);
      for(const core of w.cores) if(!core.taken&&core.x>w.camera-40&&core.x<w.camera+1060) {
        context.save();context.translate(core.x,core.y);context.rotate(reduced?Math.PI/4:w.time);context.shadowColor='#6ceaff';context.shadowBlur=18;context.fillStyle='#95f7ff';context.fillRect(-10,-10,20,20);context.strokeStyle='#ffffff';context.strokeRect(-6,-6,12,12);context.restore();
      }
      for(const enemy of w.enemies) if(!enemy.dead&&enemy.x>w.camera-60&&enemy.x<w.camera+1080) sprite(enemy.drone?4:3,enemy.x-6,enemy.y-8,50,44,enemy.direction>0);
      sprite(8,w.width-210,335,125,145);
      for(const [slot,p] of w.players.entries()) {
        context.fillStyle='rgba(5,20,28,.2)'; context.beginPath();context.ellipse(p.x+19,p.y+53,24,5,0,0,Math.PI*2);context.fill();
        if(p.shield>0) {context.strokeStyle=slot?'#ffc66e':'#8cffff';context.lineWidth=2;context.beginPath();context.ellipse(p.x+19,p.y+26,35,39,0,0,Math.PI*2);context.stroke();}
        context.globalAlpha=p.invulnerable>0?.6+Math.sin(w.time*16)*.2:1;
        const index=!p.grounded?2:Math.abs(p.vx)>20&&Math.floor(w.time*10)%2?1:0;
        if(slot)context.filter='hue-rotate(155deg) saturate(1.25)';
        const breath=!reduced&&p.grounded&&Math.abs(p.vx)<20?Math.sin(w.time*3+slot)*1.2:0;
        sprite(index,p.x-8,p.y-5-breath,55,57+breath,p.facing<0);context.filter='none';context.globalAlpha=1;
        if(w.players.length===2) {context.font='bold 12px monospace';context.textAlign='center';context.fillStyle=slot?'#ffcd79':'#b6ffff';context.fillText(`J${slot+1}`,p.x+19,p.y-15);}
      }
      for(const item of w.particles) {context.globalAlpha=Math.min(1,item.life*2);context.fillStyle=item.color;context.fillRect(item.x,item.y,4,4);}context.globalAlpha=1;
      context.font='bold 14px monospace';context.textAlign='center';
      for(const item of w.events) if(item.text) {context.globalAlpha=Math.min(1,item.life*2);context.fillStyle=item.kind==='checkpoint'?'#7cffee':'#fff3bc';context.strokeStyle='#092535';context.lineWidth=4;const y=item.y-(1-Math.min(1,item.life))*28;context.strokeText(item.text,item.x,y);context.fillText(item.text,item.x,y);}
      context.globalAlpha=1;context.restore();
      if(now-lastHud>100) {setHud({score:w.score,lives:w.lives,level:w.level,title:w.title,state:w.state,combo:w.combo,waiting:w.waiting});lastHud=now;}
      frame=requestAnimationFrame(draw);
    }
    Promise.all([...backdrops.map(image=>image.decode()),sprites.decode()]).then(()=>{if(!disposed){recordArcade('platform:ready');setLoading(false);last=performance.now();frame=requestAnimationFrame(draw);introTimer=setTimeout(()=>setIntro(false),1200);}}).catch(()=>{if(!disposed){recordArcade('platform:asset-error');setLoading(false);setArtError(true);}});
    return()=>{disposed=true;cancelAnimationFrame(frame);clearTimeout(introTimer);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',blur);keyboard.current=[0,0];};
  },[remote]);
  function restart(next:boolean) {if(!next&&onRestart){onRestart();return;}const old=world.current;world.current=newPlatformWorld(next?old.level+1:1,next?old.score:0,next?Math.min(6,old.lives+1):3);setPlatformCoop(world.current,coop);setPaused(false);setIntro(true);canvas.current?.focus();}
  return <div className={styles.platform}><canvas ref={canvas} className={styles.canvas} width={PLATFORM_WIDTH} height={PLATFORM_HEIGHT} aria-label="Salto Zero cooperativo. Jugador uno: A, D, W y Shift izquierdo. Jugador dos: flechas y Shift derecho. Pulsa salto de nuevo para doble salto. P pausa." tabIndex={0}/>
    <div className={styles.runnerHud}><span>0{hud.level} / {hud.title}</span><span>★ {hud.score.toLocaleString('es-ES')} · ♥ {hud.lives}{hud.combo>=5?` · CADENA ×${Math.min(4,1+Math.floor((hud.combo-1)/5))}`:''}</span></div>
    <div className={styles.runnerHelp}>{coop?'J1 · A D W + SHIFT IZQ. / J2 · FLECHAS + SHIFT DER.':'A D / ← → · ESPACIO salta · SHIFT corre'}<br/>DOBLE SALTO · 20 MONEDAS = +1 VIDA {hud.waiting?'· ESPERA A TU COMPAÑERO EN EL PORTAL':''}</div>
    <div className={styles.gameActions}><button className={styles.button} onClick={()=>setCoop(value=>!value)} disabled={pairedSecond}>{coop?'2 jugadores':'Activar 2 jugadores'}</button><button className={styles.button} onClick={()=>setPaused(value=>!value)}>{paused?'Continuar':'Pausa'}</button></div>
    {(loading||intro)&&!artError&&<div className={styles.gameIntro}><small>SALTO ZERO / MUNDO 0{hud.level}</small><h3>{hud.title}</h3><p>{loading?'Preparando el mundo…':'Doble salto. Escudos. Una aventura compartida.'}</p>{!loading&&<button className={styles.button} onClick={()=>{setIntro(false);canvas.current?.focus();}}>Entrar en el mundo →</button>}</div>}
    {(paused||hud.state!=='playing'||artError)&&<div className={styles.result}><h3>{artError?'El mundo no ha cargado.':paused?'Toma aire.':hud.state==='dead'?'Otra vida. Otra idea.':hud.level<4?'Un salto más lejos.':'Habéis roto el molde.'}</h3><p>{artError?'Comprueba la conexión y vuelve a abrir el juego.':`Puntuación: ${hud.score.toLocaleString('es-ES')} · Nivel ${hud.level} / 4`}</p>{paused?<button className={styles.button} onClick={()=>{setPaused(false);canvas.current?.focus();}}>Seguir jugando</button>:!artError&&<button className={styles.button} onClick={()=>restart(hud.state==='complete'&&hud.level<4)}>{hud.state==='complete'&&hud.level<4?'Siguiente mundo →':'Volver a empezar'}</button>}</div>}
  </div>;
}
