import * as THREE from 'three';
import { BLOCK_SIZE, BLOCK_WATER, getBlock, surface, type BlockWorld, type Builder } from './blocks-engine';

function box(w:number,h:number,d:number,color:string,x=0,y=0,z=0) {
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color}));
  mesh.position.set(x,y,z);return mesh;
}
export function createBuilderAvatar(slot:number) {
  const group=new THREE.Group(),shirt=slot?'#d97832':'#248fbd';
  const body=box(.5,.65,.32,shirt,0,1.04);group.add(body);
  group.add(box(.51,.09,.33,'#26384a',0,.72),box(.13,.07,.035,'#d5b16c',0,.72,-.18));
  const head=new THREE.Group();head.position.y=1.6;head.add(box(.42,.42,.42,'#e8bc92'));
  head.add(box(.44,.12,.44,slot?'#714b2d':'#303035',0,.19),box(.43,.25,.09,slot?'#714b2d':'#303035',0,.045,.18));
  // Faces look along local -Z, in the same direction as the camera.
  for(const x of[-.105,.105]){head.add(box(.075,.075,.016,'#f3f8f0',x,.015,-.217));head.add(box(.036,.06,.02,'#283547',x,-.002,-.23));head.add(box(.085,.024,.02,'#553c30',x,.086,-.23));}
  head.add(box(.06,.06,.04,'#d29d78',0,-.055,-.228),box(.095,.022,.018,'#8c5846',0,-.126,-.219));group.add(head);
  const limbs:THREE.Group[]=[];
  for(const side of[-1,1]){
    const arm=new THREE.Group();arm.position.set(side*.34,1.3,0);arm.add(box(.19,.44,.25,shirt,0,-.2),box(.17,.2,.23,'#e8bc92',0,-.5));group.add(arm);limbs.push(arm);
    const leg=new THREE.Group();leg.position.set(side*.145,.72,0);leg.add(box(.22,.56,.28,'#2d465c',0,-.28),box(.24,.17,.35,'#313434',0,-.61,-.025));group.add(leg);limbs.push(leg);
  }
  group.add(box(.34,.4,.17,'#886644',0,1.04,.25));
  let previousSteps=0,stride=0;
  return {group,update(p:Builder,time:number,reduced:boolean){const walking=Math.abs(p.steps-previousSteps)>.0001;previousSteps=p.steps;stride+=(Number(walking)-stride)*.18;group.position.set(p.x,p.y,p.z);group.rotation.y=p.yaw;head.rotation.x=-p.pitch*.55;head.position.y=1.6+(reduced?0:Math.sin(time*2.8+slot)*.01);limbs.forEach((limb,i)=>{limb.rotation.x=reduced?0:Math.sin(p.steps+(i===0||i===3?0:Math.PI))*(i%2?.5:.4)*stride+(i%2?0:Math.sin(time*2+slot)*.018);});}};
}

export function createBlockAtmosphere(scene:THREE.Scene,world:BlockWorld) {
  const sky=new THREE.Color('#a6d7e8');scene.background=sky;scene.fog=new THREE.Fog('#a6d7e8',50,145);
  const hemi=new THREE.HemisphereLight('#def3ff','#636446',1.6);scene.add(hemi);
  const light=new THREE.DirectionalLight('#ffe5b4',2);light.position.set(105,100,-45);scene.add(light);
  const sun=new THREE.Group();sun.position.set(105,64,-45);sun.add(new THREE.Mesh(new THREE.BoxGeometry(8,8,2),new THREE.MeshBasicMaterial({color:'#fff5bf',fog:false})));
  const halo=new THREE.Mesh(new THREE.PlaneGeometry(18,18),new THREE.MeshBasicMaterial({color:'#ffd786',transparent:true,opacity:.12,depthWrite:false,fog:false,side:THREE.DoubleSide}));sun.add(halo);scene.add(sun);
  const waterMaterial=new THREE.MeshPhongMaterial({color:'#4ab9cf',transparent:true,opacity:.76,shininess:80,depthWrite:false});
  const water=new THREE.Mesh(new THREE.PlaneGeometry(230,230,1,1),waterMaterial);water.rotation.x=-Math.PI/2;water.position.set(BLOCK_SIZE/2,BLOCK_WATER+.1,BLOCK_SIZE/2);scene.add(water);
  const ripples=new THREE.Group();for(let n=0;n<22;n++){const line=new THREE.Mesh(new THREE.PlaneGeometry(2+n%4,.055),new THREE.MeshBasicMaterial({color:'#d7f8ef',transparent:true,opacity:.25,depthWrite:false}));line.rotation.x=-Math.PI/2;line.position.set(n*17%160-14,BLOCK_WATER+.13,n*37%160-14);ripples.add(line);}scene.add(ripples);
  const clouds=new THREE.Group();const cloudMaterial=new THREE.MeshLambertMaterial({color:'#fffdf3'});
  for(let n=0;n<20;n++){const cloud=new THREE.Group();for(let part=0;part<4;part++){const m=new THREE.Mesh(new THREE.BoxGeometry(5+part%3*2,1.8+part%2,4),cloudMaterial);m.position.set(part*3,part%2*.7,(part%3)*1.5);cloud.add(m);}cloud.position.set((n*47)%180-25,52+n%4*3,(n*61)%180-25);clouds.add(cloud);}scene.add(clouds);
  // Instanced wildflowers and grass, only on exposed grass blocks.
  const plants:THREE.Vector3[]=[];for(let z=10;z<118;z+=4)for(let x=10;x<118;x+=4){const y=surface(world,x,z);if(getBlock(world,x,y-1,z)===1)plants.push(new THREE.Vector3(x+.3,y,z+.4));}
  const flowers=new THREE.InstancedMesh(new THREE.BoxGeometry(.22,.22,.22),new THREE.MeshLambertMaterial({color:'#fff0a2'}),plants.length);
  const stems=new THREE.InstancedMesh(new THREE.BoxGeometry(.07,.42,.07),new THREE.MeshLambertMaterial({color:'#56863c'}),plants.length);const dummy=new THREE.Object3D();
  plants.forEach((p,n)=>{dummy.position.set(p.x,p.y+.24,p.z);dummy.updateMatrix();stems.setMatrixAt(n,dummy.matrix);dummy.position.y=p.y+.5;dummy.updateMatrix();flowers.setMatrixAt(n,dummy.matrix);flowers.setColorAt(n,new THREE.Color(n%3?'#ffdb7d':'#ef9ca2'));});scene.add(stems,flowers);
  const leaves=new THREE.InstancedMesh(new THREE.PlaneGeometry(.13,.22),new THREE.MeshBasicMaterial({color:'#c4d669',side:THREE.DoubleSide}),24);scene.add(leaves);
  const birds=new THREE.Group();for(let n=0;n<7;n++){const bird=box(.2,.08,.8,'#304b5e');bird.position.set(45+n*3,42+n%3,40+n*2);birds.add(bird);}scene.add(birds);
  return{update(time:number,reduced:boolean){
    const t=reduced?0:time;clouds.position.x=Math.sin(t*.016)*6;water.position.y=BLOCK_WATER+.1+Math.sin(t*.6)*.028;ripples.position.x=Math.sin(t*.15)*.35;
    birds.position.set(Math.sin(t*.045)*20,Math.sin(t*.3)*.7,Math.cos(t*.045)*12);birds.rotation.y=t*.018;
    for(let n=0;n<24;n++){dummy.position.set(52+n*3%24+Math.sin(t*.45+n),21+((n*1.7-t*.6)%9+9)%9,60+n*7%32);dummy.rotation.set(t*.3+n,n,0);dummy.updateMatrix();leaves.setMatrixAt(n,dummy.matrix);}leaves.instanceMatrix.needsUpdate=true;
    halo.material.opacity=.12+Math.sin(t*.1)*.025;
  }};
}
