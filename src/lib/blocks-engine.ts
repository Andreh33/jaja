/** Small deterministic creative world; one authoritative world, two local cameras. */
export const BLOCK_SIZE=48,BLOCK_HEIGHT=24,CHUNK_SIZE=12;
export const BLOCK_NAMES=['Aire','Hierba','Tierra','Piedra','Madera','Arena','Hojas'];
export type BlockWorld={cells:Uint8Array;edits:Map<number,number>;dirty:Set<string>};
export type Builder={x:number;y:number;z:number;vy:number;yaw:number;pitch:number;grounded:boolean;last:number;cooldown:number;material:number;flying:boolean};
export type BlockHit={x:number;y:number;z:number;before:[number,number,number]};
export const blockIndex=(x:number,y:number,z:number)=>x+z*BLOCK_SIZE+y*BLOCK_SIZE*BLOCK_SIZE;
export function getBlock(w:BlockWorld,x:number,y:number,z:number){return x<0||z<0||y<0||x>=BLOCK_SIZE||z>=BLOCK_SIZE||y>=BLOCK_HEIGHT?0:w.cells[blockIndex(x,y,z)];}
export function setBlock(w:BlockWorld,x:number,y:number,z:number,value:number,record=true){
  if(![x,y,z,value].every(Number.isInteger)||x<0||z<0||y<1||x>=BLOCK_SIZE||z>=BLOCK_SIZE||y>=BLOCK_HEIGHT||value<0||value>6)return false;
  const index=blockIndex(x,y,z);if(w.cells[index]===value)return false;w.cells[index]=value;if(record)w.edits.set(index,value);
  for(const[dx,dz]of[[0,0],[-1,0],[1,0],[0,-1],[0,1]]){const cx=Math.floor((x+dx)/CHUNK_SIZE),cz=Math.floor((z+dz)/CHUNK_SIZE);if(cx>=0&&cz>=0&&cx<BLOCK_SIZE/CHUNK_SIZE&&cz<BLOCK_SIZE/CHUNK_SIZE)w.dirty.add(`${cx},${cz}`);}return true;
}
export function newBlockWorld():BlockWorld{
  const w:BlockWorld={cells:new Uint8Array(BLOCK_SIZE*BLOCK_SIZE*BLOCK_HEIGHT),edits:new Map(),dirty:new Set()};
  for(let z=0;z<BLOCK_SIZE;z++)for(let x=0;x<BLOCK_SIZE;x++){
    const edge=Math.min(x,z,BLOCK_SIZE-1-x,BLOCK_SIZE-1-z);const height=Math.max(1,Math.min(Math.floor(6+Math.sin(x*.23)*1.5+Math.cos(z*.2)*1.4+Math.sin((x+z)*.16)),edge+1));
    for(let y=0;y<=height;y++)w.cells[blockIndex(x,y,z)]=y===height?(height<=3?5:1):y>height-3?2:3;
    if(height>4&&x>4&&z>4&&x<43&&z<43&&(x*17+z*31)%113===0&&Math.hypot(x-24,z-24)>7){
      for(let y=height+1;y<height+5;y++)w.cells[blockIndex(x,y,z)]=4;
      for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++)for(let dy=0;dy<3;dy++)if(Math.abs(dx)+Math.abs(dz)<4-dy)w.cells[blockIndex(x+dx,height+4+dy,z+dz)]=6;
    }
  }
  for(let x=0;x<4;x++)for(let z=0;z<4;z++)w.dirty.add(`${x},${z}`);return w;
}
export function surface(w:BlockWorld,x:number,z:number){for(let y=BLOCK_HEIGHT-1;y>=0;y--)if(getBlock(w,Math.floor(x),y,Math.floor(z)))return y+1;return 1;}
export function newBuilder(w:BlockWorld,slot:number):Builder{const x=23.5+slot*3,z=26.5;return{x,y:surface(w,x,z)+.02,z,vy:0,yaw:slot?-.3:.3,pitch:-.12,grounded:false,last:0,cooldown:0,material:slot?4:1,flying:false};}
export function builderIntersects(p:Builder,x:number,y:number,z:number){return p.x+.28>x&&p.x-.28<x+1&&p.z+.28>z&&p.z-.28<z+1&&p.y+1.7>y&&p.y<y+1;}
function collides(w:BlockWorld,p:Builder){
  for(let y=Math.floor(p.y+.001);y<=Math.floor(p.y+1.69);y++)for(let z=Math.floor(p.z-.28);z<=Math.floor(p.z+.28);z++)for(let x=Math.floor(p.x-.28);x<=Math.floor(p.x+.28);x++)if(getBlock(w,x,y,z))return true;return false;
}
export function lookBuilder(p:Builder,x:number,y:number){p.yaw-=x;p.pitch=Math.max(-1.45,Math.min(1.45,p.pitch-y));}
export function stepBuilder(w:BlockWorld,p:Builder,mask:number,look:readonly[number,number],delta:number){
  const dt=Math.min(Math.max(delta,0),1/30),pressed=mask&~p.last;p.last=mask;p.cooldown=Math.max(0,p.cooldown-dt);
  lookBuilder(p,look[0]*dt*2.3,look[1]*dt*2.0);
  if(pressed&32)p.material=p.material%6+1;
  if(pressed&64){p.flying=!p.flying;p.vy=0;}
  const strafe=(mask&2?1:0)-(mask&1?1:0),forward=(mask&128?1:0)-(mask&256?1:0),length=Math.hypot(strafe,forward)||1;
  const speed=p.flying?6:4.8;const dx=(Math.cos(p.yaw)*strafe-Math.sin(p.yaw)*forward)/length*speed*dt;const dz=(-Math.sin(p.yaw)*strafe-Math.cos(p.yaw)*forward)/length*speed*dt;
  const oldX=p.x;p.x=Math.max(.3,Math.min(BLOCK_SIZE-.3,p.x+dx));if(collides(w,p))p.x=oldX;
  const oldZ=p.z;p.z=Math.max(.3,Math.min(BLOCK_SIZE-.3,p.z+dz));if(collides(w,p))p.z=oldZ;
  if(p.flying)p.vy=(mask&4?4:0);else{if(pressed&4&&p.grounded)p.vy=7;p.vy=Math.max(-18,p.vy-20*dt);}
  const oldY=p.y;p.y=Math.min(BLOCK_HEIGHT+8,p.y+p.vy*dt);p.grounded=false;
  if(collides(w,p)){p.y=oldY;if(p.vy<0)p.grounded=true;p.vy=0;}
  if(p.y<.1){p.y=surface(w,p.x,p.z)+.05;p.vy=0;}
}
/** Voxel DDA: checks only cells crossed by the ray, up to six metres. */
export function raycastBlocks(w:BlockWorld,p:Builder,reach=6):BlockHit|null{
  const origin=[p.x,p.y+1.55,p.z];const cp=Math.cos(p.pitch);const dir=[-Math.sin(p.yaw)*cp,Math.sin(p.pitch),-Math.cos(p.yaw)*cp];
  const cell=origin.map(Math.floor);const step=dir.map(v=>v>=0?1:-1);const delta=dir.map(v=>Math.abs(v)<1e-9?Infinity:Math.abs(1/v));
  const next=dir.map((v,i)=>Math.abs(v)<1e-9?Infinity:((v>0?cell[i]+1:cell[i])-origin[i])/v);let distance=0;let before=cell.slice() as[number,number,number];
  for(let n=0;n<100&&distance<=reach;n++){
    if(getBlock(w,cell[0],cell[1],cell[2]))return{x:cell[0],y:cell[1],z:cell[2],before};
    before=cell.slice() as[number,number,number];const axis=next[0]<next[1]?(next[0]<next[2]?0:2):(next[1]<next[2]?1:2);distance=next[axis];cell[axis]+=step[axis];next[axis]+=delta[axis];
  }return null;
}
export function editFromBuilder(w:BlockWorld,players:Builder[],slot:number,mask:number){
  const p=players[slot];if(p.cooldown>0||!(mask&24))return false;const hit=raycastBlocks(w,p);if(!hit)return false;p.cooldown=.16;
  if(mask&8)return setBlock(w,hit.x,hit.y,hit.z,0);
  const[x,y,z]=hit.before;if(players.some(player=>builderIntersects(player,x,y,z)))return false;
  return setBlock(w,x,y,z,p.material);
}
export function restoreBlockEdits(w:BlockWorld,raw:string){
  if(raw.length>1_000_000)return false;
  try{const parsed=JSON.parse(raw);if(parsed.version!==1||!Array.isArray(parsed.edits)||parsed.edits.length>w.cells.length)return false;
    if(!parsed.edits.every((entry:unknown)=>Array.isArray(entry)&&entry.length===2&&Number.isInteger(entry[0])&&entry[0]>=BLOCK_SIZE*BLOCK_SIZE&&entry[0]<w.cells.length&&Number.isInteger(entry[1])&&entry[1]>=0&&entry[1]<=6))return false;
    for(const[index,value]of parsed.edits){const y=Math.floor(index/(BLOCK_SIZE*BLOCK_SIZE)),z=Math.floor(index/BLOCK_SIZE)%BLOCK_SIZE,x=index%BLOCK_SIZE;setBlock(w,x,y,z,value);}return true;
  }catch{return false;}
}
const FACES=[
  {dir:[1,0,0],corners:[[1,0,0],[1,1,0],[1,0,1],[1,1,1]],light:.78},
  {dir:[-1,0,0],corners:[[0,0,1],[0,1,1],[0,0,0],[0,1,0]],light:.64},
  {dir:[0,1,0],corners:[[0,1,1],[1,1,1],[0,1,0],[1,1,0]],light:1},
  {dir:[0,-1,0],corners:[[0,0,0],[1,0,0],[0,0,1],[1,0,1]],light:.5},
  {dir:[0,0,1],corners:[[1,0,1],[1,1,1],[0,0,1],[0,1,1]],light:.86},
  {dir:[0,0,-1],corners:[[0,0,0],[0,1,0],[1,0,0],[1,1,0]],light:.7},
];
export function blockChunkGeometry(w:BlockWorld,cx:number,cz:number){
  const positions:number[]=[],normals:number[]=[],colors:number[]=[],uvs:number[]=[],indices:number[]=[];
  for(let y=0;y<BLOCK_HEIGHT;y++)for(let z=cz*CHUNK_SIZE;z<(cz+1)*CHUNK_SIZE;z++)for(let x=cx*CHUNK_SIZE;x<(cx+1)*CHUNK_SIZE;x++){
    const block=getBlock(w,x,y,z);if(!block)continue;
    for(const face of FACES){const[dx,dy,dz]=face.dir;if(getBlock(w,x+dx,y+dy,z+dz))continue;
      const start=positions.length/3;const tile=(block===1&&dy!==1?2:block)-1;const column=tile%3,row=Math.floor(tile/3);const pad=.004;
      for(const[i,corner]of face.corners.entries()){
        positions.push(x+corner[0],y+corner[1],z+corner[2]);normals.push(dx,dy,dz);colors.push(face.light,face.light,face.light);
        const u=(i>=2?1:0),v=(i%2);uvs.push((column+pad+u*(1-2*pad))/3,1-(row+1-pad-v*(1-2*pad))/2);
      }indices.push(start,start+1,start+2,start+2,start+1,start+3);
    }
  }return{positions,normals,colors,uvs,indices};
}
