/** Original local two-player fighter. All combat is resolved on the TV. */
export type FightMove = 'idle' | 'punch' | 'kick' | 'special' | 'hurt';
export type Fighter = { x:number; y:number; vx:number; vy:number; facing:number; health:number; energy:number; move:FightMove; age:number; hit:boolean; last:number; blocking:boolean; combo:number; comboTime:number; guard:number; guardAge:number; guardLock:number; dash:number; dashCooldown:number; queued:FightMove; queueTime:number };
export type FightWorld = { fighters:[Fighter,Fighter]; wins:[number,number]; round:number; clock:number; phase:'intro'|'playing'|'round'|'complete'; phaseTime:number; winner:0|1|'draw'|null; time:number; freeze:number; shake:number; notice:string; noticeTime:number; parries:number; projectiles:{x:number;y:number;direction:number;owner:0|1;dead:boolean}[]; sparks:{x:number;y:number;vx:number;vy:number;life:number;color:string}[] };
export const FIGHT_FLOOR=478;
const MOVES={punch:{start:.075,active:.095,end:.32,damage:7,reach:88},kick:{start:.15,active:.12,end:.49,damage:12,reach:125},special:{start:.2,active:.02,end:.63,damage:18,reach:0}};
function fighter(x:number,facing:number):Fighter{return{x,y:FIGHT_FLOOR,vx:0,vy:0,facing,health:100,energy:35,move:'idle',age:0,hit:false,last:0,blocking:false,combo:0,comboTime:0,guard:100,guardAge:1,guardLock:0,dash:0,dashCooldown:0,queued:'idle',queueTime:0};}
export function newFightWorld():FightWorld{return{fighters:[fighter(300,1),fighter(724,-1)],wins:[0,0],round:1,clock:60,phase:'intro',phaseTime:1.25,winner:null,time:0,freeze:0,shake:0,notice:'',noticeTime:0,parries:0,projectiles:[],sparks:[]};}
function announce(world:FightWorld,text:string){world.notice=text;world.noticeTime=.8;}
/** A predictable sparring partner, not an opponent that reads the player's input. */
export function fightComputerInput(world:FightWorld,slot:0|1):number{
  const p=world.fighters[slot],rival=world.fighters[1-slot];const tick=Math.floor(world.time*5+slot*1.7),distance=Math.abs(p.x-rival.x);
  let input=distance>95?(rival.x>p.x?2:1):tick%4===0?8:tick%5===0?16:tick%7===0?32:0;
  if(tick%17===0&&distance>170)input|=64;if(tick%23===0)input|=4;if(tick%29===0&&distance<150)input|=128;return input;
}
function hit(world:FightWorld,attacker:0|1,damage:number,direction:number){
  const p=world.fighters[attacker];const rival=world.fighters[attacker===0?1:0];
  if(rival.dash>.06){announce(world,'ESQUIVA');return;}
  let blocked=rival.blocking&&rival.y===FIGHT_FLOOR&&rival.facing===-direction;
  const parry=blocked&&rival.guardAge<=.13;
  if(parry){
    rival.energy=Math.min(100,rival.energy+18);rival.guard=Math.min(100,rival.guard+8);p.move='hurt';p.age=-.1;p.vx=-direction*150;world.parries++;announce(world,'DEFENSA PERFECTA');
  }else{
  if(blocked){rival.guard=Math.max(0,rival.guard-damage*2.5);if(!rival.guard){blocked=false;rival.blocking=false;rival.guardLock=1.4;announce(world,'GUARDIA ROTA');}}
  rival.health=Math.max(0,rival.health-(blocked?Math.ceil(damage*.18):damage));
  rival.energy=Math.min(100,rival.energy+(blocked?6:10));p.energy=Math.min(100,p.energy+(blocked?3:8));
  rival.vx=direction*(blocked?85:230);
  if(!blocked){rival.move='hurt';rival.age=0;rival.hit=true;rival.queued='idle';rival.queueTime=0;p.combo=p.comboTime>0?p.combo+1:1;p.comboTime=1.1;}
  }
  world.freeze=parry?.07:blocked?.025:.045;world.shake=blocked?1:4;
  for(let n=0;n<14;n++){const a=n*Math.PI/7;world.sparks.push({x:rival.x-direction*25,y:rival.y-90,vx:Math.cos(a)*150,vy:Math.sin(a)*150,life:.3,color:blocked?'#a7e7ff':attacker?'#ffb558':'#6ff6ff'});}
}
export function stepFight(world:FightWorld,inputs:readonly[number,number],delta:number){
  const dt=Math.min(Math.max(delta,0),1/30);world.time+=dt;world.shake=Math.max(0,world.shake-dt*22);world.noticeTime=Math.max(0,world.noticeTime-dt);
  world.sparks=world.sparks.filter(s=>(s.life-=dt)>0);for(const s of world.sparks){s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=150*dt;}
  if(world.phase==='complete')return;
  if(world.phase!=='playing'){
    world.phaseTime-=dt;world.fighters.forEach((p,i)=>{p.last=inputs[i];});
    if(world.phaseTime<=0){
      if(world.phase==='intro')world.phase='playing';
      else{world.round++;world.clock=60;world.fighters=[fighter(300,1),fighter(724,-1)];world.projectiles=[];world.phase='intro';world.phaseTime=1.25;world.winner=null;}
    }return;
  }
  if(world.freeze>0){
    // A tap during hit-stop must survive until the animation resumes.
    for(const slot of[0,1]as const){const p=world.fighters[slot],pressed=inputs[slot]&~p.last;p.last=inputs[slot];const move:FightMove=(pressed&64)&&p.energy>=60?'special':pressed&16?'kick':pressed&8?'punch':'idle';if(move!=='idle'&&p.move!=='hurt'){p.queued=move;p.queueTime=.16;}}
    world.freeze=Math.max(0,world.freeze-dt);return;
  }
  world.clock=Math.max(0,world.clock-dt);
  // Sample both defences before resolving attacks: neither slot gets priority.
  for(const slot of [0,1] as const){const p=world.fighters[slot],mask=inputs[slot];p.guardLock=Math.max(0,p.guardLock-dt);p.dashCooldown=Math.max(0,p.dashCooldown-dt);p.dash=Math.max(0,p.dash-dt);const was=p.blocking;p.blocking=!!(mask&32)&&p.move==='idle'&&p.y===FIGHT_FLOOR&&p.guardLock===0&&p.dash===0;p.guardAge=p.blocking?(was?p.guardAge+dt:0):1;if(!p.blocking&&!p.guardLock)p.guard=Math.min(100,p.guard+21*dt);if((mask&~p.last&128)&&p.move==='idle'&&p.dashCooldown===0&&p.y===FIGHT_FLOOR&&!p.blocking){p.dash=.18;p.dashCooldown=.85;const direction=(mask&2?1:0)-(mask&1?1:0);p.vx=(direction||-p.facing)*630;}}
  for(const slot of [0,1] as const){
    const p=world.fighters[slot];const rival=world.fighters[slot===0?1:0];const mask=inputs[slot];const pressed=mask&~p.last;p.last=mask;
    p.comboTime=Math.max(0,p.comboTime-dt);if(!p.comboTime)p.combo=0;
    p.queueTime=Math.max(0,p.queueTime-dt);if(!p.queueTime)p.queued='idle';
    if(p.move==='idle'&&p.dash===0)p.facing=rival.x>=p.x?1:-1;
    p.age+=dt;
    if(p.move==='hurt'&&p.age>=.26||p.move!=='idle'&&p.move!=='hurt'&&p.age>=MOVES[p.move].end){p.move='idle';p.age=0;}
    const requested:FightMove=(pressed&64)&&p.energy>=60?'special':pressed&16?'kick':pressed&8?'punch':'idle';
    if(requested!=='idle'&&p.move!=='hurt'){p.queued=requested;p.queueTime=.16;}
    const direction=(mask&2?1:0)-(mask&1?1:0);
    const cancel=p.hit&&(p.move==='punch'&&p.queued==='kick'||p.move==='kick'&&p.queued==='special')&&p.age>=.14;
    if(p.move==='idle'||cancel){
      if(p.dash===0)p.vx=direction*(p.blocking?65:250);
      if((pressed&4)&&p.y===FIGHT_FLOOR&&!p.blocking&&p.dash===0){p.vy=-620;}
      const move=p.queued;
      if(move!=='idle'&&move!=='hurt'&&!p.blocking&&p.dash===0&&(move!=='special'||p.energy>=60)){p.move=move;p.age=0;p.hit=false;p.queued='idle';p.queueTime=0;if(move==='special')p.energy-=60;p.vx*=.3;}
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
