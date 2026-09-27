/** Original local two-player fighter. All combat is resolved on the TV. */
export type FightMove = 'idle' | 'punch' | 'kick' | 'special' | 'hurt';
export type Fighter = { x:number; y:number; vx:number; vy:number; facing:number; health:number; energy:number; move:FightMove; age:number; hit:boolean; last:number; blocking:boolean; combo:number; comboTime:number };
export type FightWorld = { fighters:[Fighter,Fighter]; wins:[number,number]; round:number; clock:number; phase:'intro'|'playing'|'round'|'complete'; phaseTime:number; winner:0|1|'draw'|null; time:number; freeze:number; shake:number; projectiles:{x:number;y:number;direction:number;owner:0|1;dead:boolean}[]; sparks:{x:number;y:number;vx:number;vy:number;life:number;color:string}[] };
export const FIGHT_FLOOR=478;
const MOVES={punch:{start:.075,active:.095,end:.32,damage:7,reach:88},kick:{start:.15,active:.12,end:.49,damage:12,reach:125},special:{start:.2,active:.02,end:.63,damage:18,reach:0}};
function fighter(x:number,facing:number):Fighter{return{x,y:FIGHT_FLOOR,vx:0,vy:0,facing,health:100,energy:35,move:'idle',age:0,hit:false,last:0,blocking:false,combo:0,comboTime:0};}
export function newFightWorld():FightWorld{return{fighters:[fighter(300,1),fighter(724,-1)],wins:[0,0],round:1,clock:60,phase:'intro',phaseTime:1.25,winner:null,time:0,freeze:0,shake:0,projectiles:[],sparks:[]};}
function hit(world:FightWorld,attacker:0|1,damage:number,direction:number){
  const p=world.fighters[attacker];const rival=world.fighters[attacker===0?1:0];
  const blocked=rival.blocking&&rival.y===FIGHT_FLOOR&&rival.facing===-direction;
  rival.health=Math.max(0,rival.health-(blocked?Math.ceil(damage*.18):damage));
  rival.energy=Math.min(100,rival.energy+(blocked?6:10));p.energy=Math.min(100,p.energy+(blocked?3:8));
  rival.vx=direction*(blocked?85:230);
  if(!blocked){rival.move='hurt';rival.age=0;rival.hit=true;p.combo=p.comboTime>0?p.combo+1:1;p.comboTime=1.1;}
  world.freeze=blocked?.025:.045;world.shake=blocked?1:4;
  for(let n=0;n<14;n++){const a=n*Math.PI/7;world.sparks.push({x:rival.x-direction*25,y:rival.y-90,vx:Math.cos(a)*150,vy:Math.sin(a)*150,life:.3,color:blocked?'#a7e7ff':attacker?'#ffb558':'#6ff6ff'});}
}
export function stepFight(world:FightWorld,inputs:readonly[number,number],delta:number){
  const dt=Math.min(Math.max(delta,0),1/30);world.time+=dt;world.shake=Math.max(0,world.shake-dt*22);
  world.sparks=world.sparks.filter(s=>(s.life-=dt)>0);for(const s of world.sparks){s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=150*dt;}
  if(world.phase==='complete')return;
  if(world.phase!=='playing'){
    world.phaseTime-=dt;world.fighters.forEach((p,i)=>{p.last=inputs[i];});
    if(world.phaseTime<=0){
      if(world.phase==='intro')world.phase='playing';
      else{world.round++;world.clock=60;world.fighters=[fighter(300,1),fighter(724,-1)];world.projectiles=[];world.phase='intro';world.phaseTime=1.25;world.winner=null;}
    }return;
  }
  if(world.freeze>0){world.freeze=Math.max(0,world.freeze-dt);return;}
  world.clock=Math.max(0,world.clock-dt);
  for(const slot of [0,1] as const){
    const p=world.fighters[slot];const rival=world.fighters[slot===0?1:0];const mask=inputs[slot];const pressed=mask&~p.last;p.last=mask;
    p.comboTime=Math.max(0,p.comboTime-dt);if(!p.comboTime)p.combo=0;
    if(p.move==='idle')p.facing=rival.x>=p.x?1:-1;
    p.age+=dt;
    if(p.move==='hurt'&&p.age>=.26||p.move!=='idle'&&p.move!=='hurt'&&p.age>=MOVES[p.move].end){p.move='idle';p.age=0;}
    p.blocking=!!(mask&32)&&p.move==='idle'&&p.y===FIGHT_FLOOR;
    const direction=(mask&2?1:0)-(mask&1?1:0);
    if(p.move==='idle'){
      p.vx=direction*(p.blocking?65:250);
      if((pressed&4)&&p.y===FIGHT_FLOOR&&!p.blocking){p.vy=-620;}
      const move:FightMove=(pressed&64)&&p.energy>=60?'special':pressed&16?'kick':pressed&8?'punch':'idle';
      if(move!=='idle'&&!p.blocking){p.move=move;p.age=0;p.hit=false;if(move==='special')p.energy-=60;p.vx*=.3;}
    }else p.vx*=Math.exp(-6*dt);
    p.x=Math.max(65,Math.min(959,p.x+p.vx*dt));p.vy+=1900*dt;p.y=Math.min(FIGHT_FLOOR,p.y+p.vy*dt);if(p.y===FIGHT_FLOOR)p.vy=0;
    if(p.move!=='idle'&&p.move!=='hurt'){
      const move=MOVES[p.move];
      if(!p.hit&&p.age>=move.start&&p.age<move.start+move.active){
        if(p.move==='special'){p.hit=true;world.projectiles.push({x:p.x+p.facing*60,y:p.y-85,direction:p.facing,owner:slot,dead:false});}
        else if((rival.x-p.x)*p.facing>0&&Math.abs(rival.x-p.x)<move.reach&&Math.abs(rival.y-p.y)<105){p.hit=true;hit(world,slot,move.damage,p.facing);}
      }
    }
  }
  const[a,b]=world.fighters;
  if(Math.abs(a.y-b.y)<100&&Math.abs(a.x-b.x)<58){const center=(a.x+b.x)/2;const direction=a.x<=b.x?1:-1;a.x=Math.max(65,Math.min(959,center-29*direction));b.x=Math.max(65,Math.min(959,center+29*direction));}
  for(const projectile of world.projectiles){
    projectile.x+=projectile.direction*600*dt;const target=world.fighters[projectile.owner===0?1:0];
    if(Math.abs(projectile.x-target.x)<42&&projectile.y>target.y-150&&projectile.y<target.y){hit(world,projectile.owner,18,projectile.direction);projectile.dead=true;}
  }
  world.projectiles=world.projectiles.filter(p=>!p.dead&&p.x>-40&&p.x<1064);
  if(a.health===0||b.health===0||world.clock===0){
    world.winner=a.health===b.health?'draw':a.health>b.health?0:1;
    if(world.winner!=='draw')world.wins[world.winner]++;
    world.phase=world.wins.some(w=>w>=2)?'complete':'round';world.phaseTime=2;world.projectiles=[];
  }
}
