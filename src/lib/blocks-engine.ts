/** Deterministic archipelago. One authoritative world, two local cameras. */
export const BLOCK_SIZE=128,BLOCK_HEIGHT=64,CHUNK_SIZE=16,BLOCK_WATER=8,BLOCK_SAVE_VERSION=2;
export const BLOCK_NAMES=['Aire','Hierba','Tierra','Piedra','Tronco','Arena','Hojas','Ladrillo','Tablones','Nieve','Hielo','Carbón','Cobre','Oro','Cristal','Cuarzo','Terracota'];
export const BLOCK_COLORS=['#000','#6da448','#806040','#929b9e','#855839','#dfcf9c','#428953','#b7654b','#ba8b52','#e5f5f5','#88cde0','#545b62','#b87852','#d5b656','#52cbd3','#eee3cb','#c98556'];
export type BlockWorld={cells:Uint8Array;edits:Map<number,number>;dirty:Set<string>};
export type Builder={x:number;y:number;z:number;vy:number;yaw:number;pitch:number;grounded:boolean;last:number;cooldown:number;material:number;flying:boolean;steps:number};
export type BlockHit={x:number;y:number;z:number;before:[number,number,number]};
export const blockIndex=(x:number,y:number,z:number)=>x+z*BLOCK_SIZE+y*BLOCK_SIZE*BLOCK_SIZE;
export function getBlock(w:BlockWorld,x:number,y:number,z:number){return x<0||z<0||y<0||x>=BLOCK_SIZE||z>=BLOCK_SIZE||y>=BLOCK_HEIGHT?0:w.cells[blockIndex(x,y,z)];}
export function setBlock(w:BlockWorld,x:number,y:number,z:number,value:number,record=true){
  if(![x,y,z,value].every(Number.isInteger)||x<0||z<0||y<1||x>=BLOCK_SIZE||z>=BLOCK_SIZE||y>=BLOCK_HEIGHT||value<0||value>=BLOCK_NAMES.length)return false;
  const index=blockIndex(x,y,z);if(w.cells[index]===value)return false;w.cells[index]=value;if(record)w.edits.set(index,value);
  for(const[dx,dz]of[[0,0],[-1,0],[1,0],[0,-1],[0,1]]){const cx=Math.floor((x+dx)/CHUNK_SIZE),cz=Math.floor((z+dz)/CHUNK_SIZE);if(cx>=0&&cz>=0&&cx<BLOCK_SIZE/CHUNK_SIZE&&cz<BLOCK_SIZE/CHUNK_SIZE)w.dirty.add(`${cx},${cz}`);}return true;
}
export function newBlockWorld():BlockWorld{
  const w:BlockWorld={cells:new Uint8Array(BLOCK_SIZE*BLOCK_SIZE*BLOCK_HEIGHT),edits:new Map(),dirty:new Set()};
  const heights=new Uint8Array(BLOCK_SIZE*BLOCK_SIZE);
  const hash=(x:number,y:number,z:number)=>{let v=Math.imul(x+19,73856093)^Math.imul(y+43,19349663)^Math.imul(z+71,83492791);v=Math.imul(v^(v>>>13),1274126177);return(v>>>0)/4294967295;};
  for(let z=0;z<BLOCK_SIZE;z++)for(let x=0;x<BLOCK_SIZE;x++){
    const edge=Math.min(x,z,BLOCK_SIZE-1-x,BLOCK_SIZE-1-z);
    const peak=25*Math.exp(-((x-88)**2+(z-32)**2)/490);
    let height=Math.floor(17+Math.sin(x*.065)*4+Math.cos(z*.075)*3+Math.sin((x+z)*.14)*1.7+peak);
    height=Math.max(3,Math.min(height,Math.floor(4+edge*.9)));
    if(Math.hypot(x-64,z-77)<8)height=18;
    // A winding river cuts down to the sea; its banks are still buildable.
    const river=45+Math.sin(z*.067)*8;
    if(z<68&&Math.abs(x-river)<2.4)height=Math.min(height,7);
    heights[x+z*BLOCK_SIZE]=height;
    const desert=x<31&&z>28&&z<105;
    for(let y=0;y<=height;y++){
      let material=y===height?(height<=BLOCK_WATER+2||desert?5:height>33?9:1):y>height-4?(desert?16:2):3;
      const cave=y>4&&y<height-4&&(Math.sin(x*.18+y*.24)+Math.cos(z*.16-y*.23)+Math.sin((x+z)*.105))>1.65;
      if(cave)material=0;
      else if(y<height-5&&y>1&&hash(x,y,z)>.974)material=y<9?14:y<13?13:y<18?12:11;
      if(y===0)material=3;
      w.cells[blockIndex(x,y,z)]=material;
    }
  }
  // Trees are placed after terrain, so later columns cannot erase their crowns.
  for(let z=6;z<BLOCK_SIZE-6;z+=5)for(let x=6;x<BLOCK_SIZE-6;x+=5){
    const height=heights[x+z*BLOCK_SIZE];const meadow=((x-70)/15)**2+((z-67)/22)**2<1;
    if(getBlock(w,x,height,z)!==1||hash(x,0,z)<.78||meadow||Math.hypot(x-64,z-77)<11)continue;
    const trunk=4+Math.floor(hash(x,1,z)*3);
    for(let y=height+1;y<=height+trunk;y++)w.cells[blockIndex(x,y,z)]=4;
    for(let dy=-1;dy<=2;dy++)for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++)if(Math.abs(dx)+Math.abs(dz)+Math.max(0,dy)<5&&!(dx===0&&dz===0&&dy<1))w.cells[blockIndex(x+dx,height+trunk+dy,z+dz)]=6;
  }
  // Open a discoverable entrance into the mountain's cave network.
  for(let z=39;z<54;z++)for(let y=16;y<21;y++)for(let x=83;x<88;x++)w.cells[blockIndex(x,y,z)]=0;
  // Small original ruins, paths and a wooden lookout give the landscape landmarks.
  for(let z=61;z<70;z++)for(let x=61;x<69;x++){const h=heights[x+z*BLOCK_SIZE];w.cells[blockIndex(x,h+1,z)]=8;if((x===61||x===68)&&(z===61||z===69))for(let y=h+2;y<h+6;y++)w.cells[blockIndex(x,y,z)]=4;}
  for(let n=0;n<7;n++){const x=89+n,z=87;const h=heights[x+z*BLOCK_SIZE];for(let y=h+1;y<h+2+n%3;y++)w.cells[blockIndex(x,y,z)]=15;}
  for(let z=37;z<42;z++)for(let x=85;x<91;x++){const h=heights[x+z*BLOCK_SIZE];if(h>33)w.cells[blockIndex(x,h,z)]=10;}
  for(let n=0;n<5;n++){const x=25+n,z=90,h=heights[x+z*BLOCK_SIZE];w.cells[blockIndex(x,h+1,z)]=7;}
  for(let x=0;x<BLOCK_SIZE/CHUNK_SIZE;x++)for(let z=0;z<BLOCK_SIZE/CHUNK_SIZE;z++)w.dirty.add(`${x},${z}`);return w;
}
export function surface(w:BlockWorld,x:number,z:number){for(let y=BLOCK_HEIGHT-1;y>=0;y--)if(getBlock(w,Math.floor(x),y,Math.floor(z)))return y+1;return 1;}
export function newBuilder(w:BlockWorld,slot:number):Builder{const x=62.5+slot*3,z=77.5;return{x,y:surface(w,x,z)+.02,z,vy:0,yaw:slot?-.42:-.32,pitch:.06,grounded:false,last:0,cooldown:0,material:slot?8:1,flying:false,steps:0};}
export function builderIntersects(p:Builder,x:number,y:number,z:number){return p.x+.28>x&&p.x-.28<x+1&&p.z+.28>z&&p.z-.28<z+1&&p.y+1.7>y&&p.y<y+1;}
function collides(w:BlockWorld,p:Builder){
  for(let y=Math.floor(p.y+.001);y<=Math.floor(p.y+1.69);y++)for(let z=Math.floor(p.z-.28);z<=Math.floor(p.z+.28);z++)for(let x=Math.floor(p.x-.28);x<=Math.floor(p.x+.28);x++)if(getBlock(w,x,y,z))return true;return false;
}
export function lookBuilder(p:Builder,x:number,y:number){p.yaw-=x;p.pitch=Math.max(-1.45,Math.min(1.45,p.pitch-y));}
export function stepBuilder(w:BlockWorld,p:Builder,mask:number,look:readonly[number,number],delta:number){
  const dt=Math.min(Math.max(delta,0),1/30),pressed=mask&~p.last;p.last=mask;p.cooldown=Math.max(0,p.cooldown-dt);
  lookBuilder(p,look[0]*dt*2.3,look[1]*dt*2.0);
  if(pressed&32)p.material=p.material%(BLOCK_NAMES.length-1)+1;
  if(pressed&64){p.flying=!p.flying;p.vy=0;}
  const strafe=(mask&2?1:0)-(mask&1?1:0),forward=(mask&128?1:0)-(mask&256?1:0),length=Math.hypot(strafe,forward)||1;
  const speed=p.flying?11:5.8;const dx=(Math.cos(p.yaw)*strafe-Math.sin(p.yaw)*forward)/length*speed*dt;const dz=(-Math.sin(p.yaw)*strafe-Math.cos(p.yaw)*forward)/length*speed*dt;
  const oldX=p.x;p.x=Math.max(.3,Math.min(BLOCK_SIZE-.3,p.x+dx));if(collides(w,p))p.x=oldX;
  const oldZ=p.z;p.z=Math.max(.3,Math.min(BLOCK_SIZE-.3,p.z+dz));if(collides(w,p))p.z=oldZ;
  if(p.flying)p.vy=(mask&4?4:0);else{if(pressed&4&&p.grounded)p.vy=7;p.vy=Math.max(-18,p.vy-20*dt);}
  const oldY=p.y;p.y=Math.min(BLOCK_HEIGHT+8,p.y+p.vy*dt);p.grounded=false;
  if(collides(w,p)){p.y=oldY;if(p.vy<0)p.grounded=true;p.vy=0;}
  if(p.y<.1){p.y=surface(w,p.x,p.z)+.05;p.vy=0;}
  p.steps+=Math.hypot(p.x-oldX,p.z-oldZ)*2.7;
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
  try{const parsed=JSON.parse(raw);if(parsed.version!==BLOCK_SAVE_VERSION||!Array.isArray(parsed.edits)||parsed.edits.length>w.cells.length)return false;
    if(!parsed.edits.every((entry:unknown)=>Array.isArray(entry)&&entry.length===2&&Number.isInteger(entry[0])&&entry[0]>=BLOCK_SIZE*BLOCK_SIZE&&entry[0]<w.cells.length&&Number.isInteger(entry[1])&&entry[1]>=0&&entry[1]<BLOCK_NAMES.length))return false;
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
      const start=positions.length/3;const tile=(block===1&&dy!==1?2:block)-1;const column=tile%4,row=Math.floor(tile/4);const pad=.04;
      for(const[i,corner]of face.corners.entries()){
        positions.push(x+corner[0],y+corner[1],z+corner[2]);normals.push(dx,dy,dz);
        const shade=face.light*(.76+.24*Math.min(1,(y+3)/22));colors.push(shade,shade,shade);
        const u=(i>=2?1:0),v=(i%2);const rows=[0,.25,.5,.735,1],top=rows[row],bottom=rows[row+1];uvs.push((column+pad+u*(1-2*pad))/4,1-(bottom-pad/4-v*(bottom-top-pad/2)));
      }indices.push(start,start+1,start+2,start+2,start+1,start+3);
    }
  }return{positions,normals,colors,uvs,indices};
}
