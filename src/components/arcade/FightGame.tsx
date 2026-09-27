'use client';
import {useEffect,useRef,useState,type MutableRefObject} from 'react';
import {consumeInput,type RemoteInput} from '@/lib/arcade-peer';
import {newFightWorld,stepFight,FIGHT_FLOOR} from '@/lib/fight-engine';
import styles from './Arcade.module.css';
import {playArcadeSound} from '@/lib/arcade-audio';
import {arcadeFrameProbe,recordArcade} from '@/lib/arcade-diagnostics';
const CROPS=[[50,18,287,352],[408,22,281,352],[790,16,276,322],[40,374,344,342],[405,373,388,346],[777,380,282,337],[46,723,290,366],[416,727,281,365],[805,714,259,345],[40,1087,347,350],[410,1090,394,352],[774,1084,287,354]];
export default function FightGame({remote,pauseSignal=0,onFinished,onRestart,demo=false}:{remote:MutableRefObject<[RemoteInput,RemoteInput]>;pauseSignal?:number;onFinished?:()=>void;onRestart?:()=>void;demo?:boolean}){
  const canvas=useRef<HTMLCanvasElement>(null);const world=useRef(newFightWorld());const keys=useRef<[number,number]>([0,0]);
  const [ready,setReady]=useState(false);const[error,setError]=useState(false);const[paused,setPaused]=useState(false);const pause=useRef(false);
  const[hud,setHud]=useState(()=>({health:[100,100],energy:[35,35],wins:[0,0],clock:60,round:1,phase:'intro',winner:null as number|string|null}));
  useEffect(()=>{pause.current=paused;},[paused]);
  const previousPause=useRef(pauseSignal);useEffect(()=>{if(previousPause.current!==pauseSignal)setPaused(true);previousPause.current=pauseSignal;},[pauseSignal]);
  useEffect(()=>{if(hud.phase==='complete')onFinished?.();},[hud.phase,onFinished]);
  useEffect(()=>{
    const element=canvas.current;const ctx=element?.getContext('2d');if(!element||!ctx)return;
    let disposed=false,frame=0,last=performance.now(),accumulator=0,lastHud=0,oldHealth=200;const probe=arcadeFrameProbe('fight');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stage=new Image();stage.src='/arcade/fight-stage.webp';const atlas=new Image();atlas.src='/arcade/fight-fighters.webp';
    const map:Record<string,[number,number]>={KeyA:[0,1],KeyD:[0,2],KeyW:[0,4],KeyF:[0,8],KeyG:[0,16],KeyH:[0,32],KeyR:[0,64],ArrowLeft:[1,1],ArrowRight:[1,2],ArrowUp:[1,4],KeyJ:[1,8],KeyK:[1,16],KeyL:[1,32],KeyO:[1,64]};
    const down=(e:KeyboardEvent)=>{if(e.target instanceof HTMLElement&&e.target.closest('button,a,input,textarea'))return;const key=map[e.code];if(key){e.preventDefault();keys.current[key[0]]|=key[1];}if(e.code==='KeyP'&&!e.repeat)setPaused(p=>!p);};
    const up=(e:KeyboardEvent)=>{const key=map[e.code];if(key){e.preventDefault();keys.current[key[0]]&=~key[1];}};
    const blur=()=>{keys.current=[0,0];if(document.hidden)setPaused(true);};
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);document.addEventListener('visibilitychange',blur);
    function draw(now:number){
      if(disposed)return;probe(now);const elapsed=Math.min(.05,(now-last)/1000);last=now;const w=world.current;const c=ctx!;
      if(!pause.current&&!document.hidden){accumulator+=elapsed;while(accumulator>=1/120){const input:[number,number]=[keys.current[0]|consumeInput(remote.current[0],now),keys.current[1]|consumeInput(remote.current[1],now)];if(demo)for(const slot of[0,1]){const p=w.fighters[slot],q=w.fighters[1-slot];const tick=Math.floor(w.time*5+slot*1.7);input[slot]=Math.abs(p.x-q.x)>85?(q.x>p.x?2:1):tick%4===0?8:tick%5===0?16:tick%7===0?32:0;if(tick%17===0)input[slot]|=64;if(tick%23===0)input[slot]|=4;}stepFight(w,input,1/120);accumulator-=1/120;}if(demo&&w.phase==='complete'&&w.time%3<.025)world.current=newFightWorld();}else accumulator=0;
      c.clearRect(0,0,1024,576);c.save();if(!reduced)c.translate(Math.sin(w.time*133)*w.shake,Math.cos(w.time*117)*w.shake*.5);
      c.drawImage(stage,0,0,1024,576);c.fillStyle='rgba(2,12,28,.15)';c.fillRect(0,0,1024,576);
      const health=w.fighters[0].health+w.fighters[1].health;if(health<oldHealth&&!demo)playArcadeSound('hit');oldHealth=health;
      if(!reduced){c.strokeStyle='rgba(177,231,242,.15)';c.lineWidth=1;for(let n=0;n<24;n++){const x=(n*137+w.time*12)%1080,y=(n*79+w.time*200)%600;c.beginPath();c.moveTo(x,y);c.lineTo(x-3,y+11);c.stroke();}}
      for(const[slot,p]of w.fighters.entries()){
        c.fillStyle='rgba(0,5,12,.45)';c.beginPath();c.ellipse(p.x,FIGHT_FLOOR+4,66,10,0,0,Math.PI*2);c.fill();
        let pose=p.y<FIGHT_FLOOR-8?2:p.blocking?5:p.move==='punch'||p.move==='special'?3:p.move==='kick'?4:Math.abs(p.vx)>20&&Math.floor(w.time*8)%2?1:0;
        if(p.move==='hurt')pose=5;
        const[sx,sy,sw,sh]=CROPS[slot*6+pose];const scale=.57;const width=sw*scale,height=sh*scale;
        const bob=p.move==='idle'&&p.y===FIGHT_FLOOR&&!reduced?Math.sin(w.time*4+slot)*1.5:0;
        c.save();c.translate(p.x,p.y+bob);c.scale(p.facing,1);
        if(p.move==='hurt')c.filter='brightness(1.6)';
        if(p.move==='special'&&!reduced){c.globalAlpha=.18;c.drawImage(atlas,sx,sy,sw,sh,-width/2-18,-height,width,height);c.globalAlpha=1;}
        const stretch=p.move==='punch'&&p.age<.1?1-p.age*.5:1;c.scale(stretch,1);
        c.drawImage(atlas,sx,sy,sw,sh,-width/2,-height,width,height);c.restore();
        if(p.combo>=2){c.font='italic 900 30px sans-serif';c.textAlign=slot?'right':'left';c.fillStyle=slot?'#ffc277':'#8df5ff';c.strokeStyle='#061421';c.lineWidth=4;c.strokeText(`${p.combo} HITS`,slot?930:94,190);c.fillText(`${p.combo} HITS`,slot?930:94,190);}
      }
      for(const p of w.projectiles){c.save();c.translate(p.x,p.y);c.scale(p.direction,1);c.shadowColor=p.owner?'#ff9345':'#28dfff';c.shadowBlur=reduced?0:25;const g=c.createLinearGradient(-60,0,20,0);g.addColorStop(0,'transparent');g.addColorStop(1,p.owner?'#ffb45e':'#8cffff');c.fillStyle=g;c.beginPath();c.ellipse(-15,0,43,21,0,0,Math.PI*2);c.fill();c.fillStyle='#fff9df';c.beginPath();c.ellipse(10,0,12,14,0,0,Math.PI*2);c.fill();c.restore();}
      for(const s of w.sparks){c.globalAlpha=s.life/.3;c.fillStyle=s.color;c.fillRect(s.x,s.y,5,3);}c.globalAlpha=1;c.restore();
      if(w.phase==='intro'||w.phase==='round'){
        c.fillStyle='rgba(3,12,24,.2)';c.fillRect(0,0,1024,576);c.textAlign='center';c.font='italic 900 72px sans-serif';c.strokeStyle='#05111b';c.lineWidth=9;c.fillStyle='#fff2d4';
        const text=w.phase==='intro'?(w.phaseTime>.45?`ROUND ${w.round}`:'¡LUCHA!'):w.winner==='draw'?'EMPATE':`JUGADOR ${Number(w.winner)+1}`;c.strokeText(text,512,265);c.fillText(text,512,265);
        c.font='700 16px monospace';c.fillStyle='#b8d3e3';c.fillText(w.phase==='intro'?'NEON CLASH / PRIMERO EN GANAR DOS RONDAS':'SIGUIENTE RONDA',512,305);
      }
      if(now-lastHud>80){setHud({health:w.fighters.map(p=>p.health),energy:w.fighters.map(p=>p.energy),wins:w.wins.slice(),clock:Math.ceil(w.clock),round:w.round,phase:w.phase,winner:w.winner});lastHud=now;}
      frame=requestAnimationFrame(draw);
    }
    Promise.all([stage.decode(),atlas.decode()]).then(()=>{if(!disposed){recordArcade('fight:ready');setReady(true);last=performance.now();frame=requestAnimationFrame(draw);}}).catch(()=>{if(!disposed){recordArcade('fight:asset-error');setError(true);}});
    return()=>{disposed=true;cancelAnimationFrame(frame);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',blur);};
  },[remote,demo]);
  return <div className={styles.platform}><canvas ref={canvas} className={styles.canvas} width={1024} height={576} tabIndex={0} aria-label="Neon Clash, lucha para dos. Jugador uno A D W, F puño G patada H bloqueo R especial. Jugador dos flechas, J puño K patada L bloqueo O especial. P pausa."/>
    <div className={styles.fightHud}>{[0,1].map(slot=><div key={slot} className={styles.fighterHud} data-player={slot}><div><b>{slot?'EMBER':'VOLT'}</b><span>{'●'.repeat(hud.wins[slot])}{'○'.repeat(2-hud.wins[slot])}</span></div><progress aria-label={`Salud jugador ${slot+1}`} max={100} value={hud.health[slot]}/><meter aria-label={`Energía jugador ${slot+1}`} min={0} max={100} low={60} high={60} optimum={100} value={hud.energy[slot]}/><small>{hud.energy[slot]>=60?'ESPECIAL LISTO':'CARGANDO ESPECIAL'}</small></div>)}<b className={styles.fightClock}>{hud.clock}</b></div>
    <div className={styles.runnerHelp}>J1 · A D W / F G H R<br/>J2 · FLECHAS / J K L O · PUÑO / PATADA / BLOQUEO / ESPECIAL</div>
    <div className={styles.gameActions}><button className={styles.button} onClick={()=>setPaused(p=>!p)}>{paused?'Continuar':'Pausa'}</button></div>
    {!ready&&<div className={styles.gameIntro}><small>NEON CLASH / DOS JUGADORES</small><h3>{error?'La señal no ha llegado.':'La azotea os espera.'}</h3><p>{error?'Reabre el juego para volver a cargar el escenario.':'Cargando escenario y luchadores…'}</p></div>}
    {(paused||hud.phase==='complete')&&<div className={styles.result}><small>NEON CLASH</small><h3>{paused?'Tiempo muerto.':`${hud.winner===0?'Volt':'Ember'} gana.`}</h3><p>{paused?'La partida espera a los dos jugadores.':`${hud.wins[0]} — ${hud.wins[1]} · Una revancha lo cambia todo.`}</p><button className={styles.button} onClick={()=>{if(!paused){if(onRestart){onRestart();return;}world.current=newFightWorld();}setPaused(false);canvas.current?.focus();}}>{paused?'Continuar combate':'Revancha →'}</button></div>}
  </div>;
}
