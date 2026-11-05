/* ================= world: textures, terrain, mesh, picking ================= */
const W=20,H=11,Dp=20,SEA=1.72;
const B={AIR:0,GRASS:1,DIRT:2,STONE:3,SAND:4,LOG:5,LEAVES:6,PLANK:7,GLASS:8,BRICK:9,GOLD:10,DIAMOND:11,RAINBOW:12,TABLE:13,BEDROCK:14,ORE:15,PIC:16,PUMPKIN:17,SNOW:18};
const BNAME={1:'grass',2:'dirt',3:'stone',4:'sand',5:'log',6:'leaves',7:'planks',8:'glass',9:'brick',10:'gold',11:'diamond',12:'rainbow',17:'pumpkin',18:'snow'};
const PLACEABLE=[1,2,3,4,5,6,7,8,9,10,11,12,17,18];
/* atlas tile per face: [top,bottom,side] */
const FACES={1:[0,2,1],2:[2,2,2],3:[3,3,3],4:[4,4,4],5:[6,6,5],6:[7,7,7],7:[8,8,8],8:[9,9,9],9:[10,10,10],10:[11,11,11],11:[12,12,12],12:[13,13,13],13:[14,8,15],14:[16,16,16],15:[17,17,17],17:[18,8,19],18:[20,2,21]};
const TRANSP=new Set([B.LEAVES,B.GLASS,B.PIC]);
let G=new Uint8Array(W*H*Dp);
const idx=(x,y,z)=>(y*Dp+z)*W+x;
const inB=(x,y,z)=>x>=0&&y>=0&&z>=0&&x<W&&y<H&&z<Dp;
const get=(x,y,z)=>inB(x,y,z)?G[idx(x,y,z)]:0;
function setB(x,y,z,v){if(inB(x,y,z))G[idx(x,y,z)]=v}
const solid=v=>v!==0;
const opaque=v=>v!==0&&!TRANSP.has(v);

/* ---------- pixel textures ---------- */
const TS=16,ACOLS=8,AROWS=3;
let atlasTex=null;const tileCanvas={};
function px(x,c,a,b,w,h){x.fillStyle=c;x.fillRect(a,b,w||1,h||1)}
function speck(x,r,cols,n){for(let i=0;i<n;i++){x.fillStyle=cols[(r()*cols.length)|0];x.fillRect((r()*16)|0,(r()*16)|0,1,1)}}
function drawTile(i,x){const r=mulberry(1000+i*77);
 const fill=c=>{x.fillStyle=c;x.fillRect(0,0,16,16)};
 switch(i){
  case 0:fill('#62B83E');speck(x,r,['#4FA02E','#78CC52','#5AAE38','#86D65E'],90);break;
  case 1:fill('#8A5A34');speck(x,r,['#7A4C2A','#9A6A40','#6E4424'],70);x.fillStyle='#62B83E';x.fillRect(0,0,16,4);for(let k=0;k<16;k++)if(r()<.55)px(x,'#62B83E',k,4,1,1+((r()*2)|0));speck(x,mulberry(5),['#4FA02E','#78CC52'],10);break;
  case 2:fill('#8A5A34');speck(x,r,['#7A4C2A','#9A6A40','#6E4424','#A8784C'],90);break;
  case 3:fill('#8E8E8E');speck(x,r,['#7A7A7A','#A2A2A2','#6E6E6E','#B0B0B0'],90);break;
  case 4:fill('#E8D79A');speck(x,r,['#DCC888','#F2E2A8','#D4BE7A'],80);break;
  case 5:fill('#6E4C2A');for(let k=0;k<16;k+=3)px(x,'#5A3C20',k,0,1,16);speck(x,r,['#7E5A34','#4E341C'],30);break;
  case 6:fill('#A8844E');x.strokeStyle='#8A6A3A';for(let k=2;k<8;k+=2){x.strokeRect(8-k+.5,8-k+.5,k*2-1,k*2-1)}px(x,'#6E4C2A',0,0,16,1);px(x,'#6E4C2A',0,15,16,1);px(x,'#6E4C2A',0,0,1,16);px(x,'#6E4C2A',15,0,1,16);break;
  case 7:x.clearRect(0,0,16,16);for(let a=0;a<16;a++)for(let b=0;b<16;b++){const v=r();if(v<.86)px(x,v<.3?'#2E7A2A':v<.6?'#3E9234':'#4FA640',a,b)}break;
  case 8:fill('#B88A50');for(let k=0;k<4;k++){px(x,'#946A38',0,k*4+3,16,1);px(x,'#946A38',(k%2?4:11),k*4,1,3)}speck(x,r,['#C89A5E','#A87C44'],25);break;
  case 9:x.clearRect(0,0,16,16);x.fillStyle='rgba(200,235,255,.0)';px(x,'#DFF4FF',0,0,16,1);px(x,'#DFF4FF',0,15,16,1);px(x,'#DFF4FF',0,0,1,16);px(x,'#DFF4FF',15,0,1,16);px(x,'#FFFFFF',3,3,1,3);px(x,'#FFFFFF',4,2,2,1);px(x,'#FFFFFF',11,10,3,1);px(x,'#FFFFFF',12,9,1,1);break;
  case 10:fill('#B4523E');for(let k=0;k<4;k++){px(x,'#E0D2C2',0,k*4+3,16,1);const o=k%2?0:4;px(x,'#E0D2C2',o+3,k*4,1,3);px(x,'#E0D2C2',o+11,k*4,1,3)}speck(x,r,['#A04434','#C4624A'],20);break;
  case 11:fill('#F4C430');speck(x,r,['#FFE070','#E0A820','#FFF0A0'],40);px(x,'#FFF6C8',1,1,14,1);px(x,'#FFF6C8',1,1,1,14);px(x,'#C08A10',0,15,16,1);px(x,'#C08A10',15,0,1,16);break;
  case 12:fill('#5FE3E8');speck(x,r,['#A0F6FA','#3CC8D0','#E8FFFF'],40);px(x,'#E8FFFF',1,1,14,1);px(x,'#E8FFFF',1,1,1,14);px(x,'#2A9AA8',0,15,16,1);px(x,'#2A9AA8',15,0,1,16);break;
  case 13:{const C=['#FF5A5A','#FF9A3A','#FFE04A','#5AD85A','#4AA8FF','#9A6AF0'];for(let k=0;k<16;k++){x.fillStyle=C[Math.floor(k/16*6)];x.fillRect(0,k,16,1)}speck(x,r,['#FFFFFF'],10);break}
  case 14:fill('#B88A50');px(x,'#6E4C2A',0,0,16,2);px(x,'#6E4C2A',0,14,16,2);px(x,'#6E4C2A',0,0,2,16);px(x,'#6E4C2A',14,0,2,16);px(x,'#8E8E8E',4,4,8,3);px(x,'#6E4C2A',7,7,2,6);px(x,'#B0B0B0',4,4,8,1);break;
  case 15:fill('#B88A50');px(x,'#6E4C2A',0,0,16,3);px(x,'#946A38',0,7,16,1);px(x,'#6E4C2A',2,9,3,7);px(x,'#6E4C2A',11,9,3,7);px(x,'#E8E8E8',6,10,4,2);break;
  case 16:fill('#4A4A4A');speck(x,r,['#2A2A2A','#6A6A6A','#3A3A3A'],100);break;
  case 17:fill('#8E8E8E');speck(x,r,['#7A7A7A','#A2A2A2','#6E6E6E'],60);for(let k=0;k<6;k++){const a=2+((r()*11)|0),b=2+((r()*11)|0);px(x,'#2B1D10',a-1,b-1,4,4);px(x,'#FFD447',a,b,2,2);px(x,'#FFFFFF',a,b,1,1)}break;
  case 18:fill('#E8862A');for(let k=1;k<16;k+=4)px(x,'#C86A1A',k,0,1,16);px(x,'#4E7A2A',6,0,4,3);break;
  case 19:fill('#E8862A');for(let k=1;k<16;k+=4)px(x,'#C86A1A',k,0,1,16);px(x,'#3A2010',3,5,3,3);px(x,'#3A2010',10,5,3,3);px(x,'#3A2010',4,10,8,2);px(x,'#3A2010',5,12,2,1);px(x,'#3A2010',9,12,2,1);break;
  case 20:fill('#F6FAFF');speck(x,r,['#E2ECF6','#FFFFFF','#D6E2EE'],50);break;
  case 21:fill('#8A5A34');speck(x,r,['#7A4C2A','#9A6A40'],60);px(x,'#F6FAFF',0,0,16,5);for(let k=0;k<16;k++)if(r()<.5)px(x,'#F6FAFF',k,5,1,1+((r()*2)|0));break;
 }}
function buildAtlas(){const c=document.createElement('canvas');c.width=ACOLS*TS;c.height=AROWS*TS;const x=c.getContext('2d');
 for(let i=0;i<ACOLS*AROWS;i++){const t=document.createElement('canvas');t.width=t.height=16;drawTile(i,t.getContext('2d'));tileCanvas[i]=t;x.drawImage(t,(i%ACOLS)*TS,Math.floor(i/ACOLS)*TS)}
 atlasTex=new THREE.CanvasTexture(c);atlasTex.magFilter=THREE.NearestFilter;atlasTex.minFilter=THREE.NearestFilter;atlasTex.generateMipmaps=false}
function iconFor(id){const f=FACES[id];if(!f)return null;const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
 /* little isometric block icon */
 const top=tileCanvas[f[0]],side=tileCanvas[f[2]];x.save();x.setTransform(1,.5,-1,.5,16,1);x.drawImage(top,0,0,16,16,0,0,16,16);x.restore();
 x.save();x.setTransform(1,.5,0,1,0,9);x.drawImage(side,0,0);x.fillStyle='rgba(0,0,0,.15)';x.fillRect(0,0,16,16);x.restore();
 x.save();x.setTransform(1,-.5,0,1,16,17);x.drawImage(side,0,0);x.fillStyle='rgba(0,0,0,.32)';x.fillRect(0,0,16,16);x.restore();return c}

/* ---------- terrain ---------- */
const CX=9.5,CZ=9.5;
const HOME={table:{x:11,z:8},clucks:{x:8,z:8},spawn:{x:10,z:10}};
function genWorld(seed){G=new Uint8Array(W*H*Dp);const r=mulberry(seed);const ph=[r()*6,r()*6,r()*6,r()*6];
 const nz=(x,z)=>Math.sin(x*.55+ph[0])*Math.cos(z*.47+ph[1])*.6+Math.sin(x*.21+z*.33+ph[2])*.4+Math.cos(x*.9-z*.7+ph[3])*.15;
 const tops={};
 for(let z=0;z<Dp;z++)for(let x=0;x<W;x++){const d=Math.hypot(x-CX,z-CZ)+nz(x*1.7,z*1.3)*.7;if(d>8.6)continue;
  let h;if(d>7.1)h=1;else{h=2+Math.round(clamp(nz(x,z)*1.4+(7-d)*.12,0,2));if(Math.hypot(x-CX,z-CZ)<3.2)h=2}
  setB(x,0,z,B.BEDROCK);for(let y=1;y<=h;y++)setB(x,y,z,y===h?(h===1?B.SAND:B.GRASS):y<h-1?B.STONE:B.DIRT);tops[x+','+z]=h}
 /* stone hills */
 for(let k=0;k<3;k++){const a=r()*Math.PI*2,rr=4.5+r()*2,x0=Math.round(CX+Math.cos(a)*rr),z0=Math.round(CZ+Math.sin(a)*rr);for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const x=x0+dx,z=z0+dz,h=tops[x+','+z];if(!h||h<2||(dx&&dz&&r()<.5))continue;const add=(dx||dz)?1:2;for(let y=h+1;y<=h+add;y++)setB(x,y,z,B.STONE);tops[x+','+z]=h+add}}
 /* trees */
 const trees=[];let tries=0;while(trees.length<5&&tries++<400){const x=ri(2,W-3),z=ri(2,Dp-3),h=tops[x+','+z];if(!h||h<2||get(x,h,z)!==B.GRASS)continue;const dh=Math.hypot(x-CX,z-CZ);if(dh<4||dh>6.8)continue;if(trees.some(t=>Math.abs(t.x-x)<3&&Math.abs(t.z-z)<3))continue;trees.push({x,z,h})}
 trees.forEach(t=>{const th=3+(r()<.4?1:0);for(let y=t.h+1;y<=t.h+th;y++)setB(t.x,y,t.z,B.LOG);const ly=t.h+th;
  for(let y=ly-1;y<=ly;y++)for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dz)continue;if(dx&&dz&&y===ly&&r()<.6)continue;if(!get(t.x+dx,y,t.z+dz))setB(t.x+dx,y,t.z+dz,B.LEAVES)}
  setB(t.x,ly+1,t.z,B.LEAVES);[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dz])=>{if(r()<.7)setB(t.x+dx,ly+1,t.z+dz,B.LEAVES)})});
 /* pumpkins */
 for(let k=0;k<3;k++){const x=ri(3,W-4),z=ri(3,Dp-4),h=tops[x+','+z];if(h>=2&&get(x,h,z)===B.GRASS&&!get(x,h+1,z)&&Math.hypot(x-CX,z-CZ)>3.5)setB(x,h+1,z,B.PUMPKIN)}
 /* home: flat pad, crafting table */
 for(let dz=-2;dz<=2;dz++)for(let dx=-3;dx<=3;dx++){const x=10+dx,z=9+dz;for(let y=3;y<H;y++)setB(x,y,z,0);setB(x,1,z,B.DIRT);setB(x,2,z,B.GRASS)}
 setB(HOME.table.x,3,HOME.table.z,B.TABLE);
 for(let k=0;k<6;k++)spawnOre(r)}
function topY(x,z){for(let y=H-1;y>=0;y--)if(G[idx(x,y,z)])return y;return -1}
/* where a creature stands in this column (y of feet), or -1 if it's water / no room */
function standY(x,z){if(x<0||z<0||x>=W||z>=Dp)return -1;const t=topY(x,z);if(t<0)return -1;const v=G[idx(x,t,z)];if(v===B.TABLE)return -1;if(t+2<H&&G[idx(x,t+1,z)])return -1;return t+1}
function oreCount(){let n=0;for(let i=0;i<G.length;i++)if(G[i]===B.ORE)n++;return n}
function oreList(){const L=[];for(let y=0;y<H;y++)for(let z=0;z<Dp;z++)for(let x=0;x<W;x++)if(G[idx(x,y,z)]===B.ORE)L.push({x,y,z});return L}
function spawnOre(r=Math.random){for(let t=0;t<200;t++){const x=Math.floor(r()*W),z=Math.floor(r()*Dp);const y=topY(x,z);if(y<1)continue;const v=get(x,y,z);if(![B.GRASS,B.DIRT,B.STONE,B.SAND].includes(v))continue;
  const dh=Math.hypot(x-HOME.spawn.x,z-HOME.spawn.z);if(Math.hypot(x-HOME.clucks.x,z-HOME.clucks.z)<2||dh<1.5)continue;if(Math.hypot(x-HOME.table.x,z-HOME.table.z)<2.5||dh>6.5)continue;let leafy=false;for(let yy=y+1;yy<H;yy++)for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++)if(get(x+dx,yy,z+dz)===B.LEAVES)leafy=true;if(leafy)continue;if(oreList().some(o=>Math.abs(o.x-x)+Math.abs(o.z-z)<3))continue;setB(x,y,z,B.ORE);return{x,y,z}}return null}
function packWorld(){let s='',last=-1,run=0;const out=[];for(let i=0;i<G.length;i++){const v=G[i];if(v===last&&run<250)run++;else{if(run)out.push(last,run);last=v;run=1}}out.push(last,run);return out.join(',')}
function unpackWorld(s){const a=s.split(',').map(Number);const g=new Uint8Array(W*H*Dp);let p=0;for(let i=0;i<a.length;i+=2){for(let k=0;k<a[i+1];k++)g[p++]=a[i]}if(p!==g.length)return false;G=g;return true}

/* ---------- meshing ---------- */
let scene,cam,R,worldMesh=null,waterMesh,seabed;
const FD=[{n:[1,0,0],c:[[1,0,1],[1,0,0],[1,1,0],[1,1,1]],s:.8},{n:[-1,0,0],c:[[0,0,0],[0,0,1],[0,1,1],[0,1,0]],s:.8},{n:[0,1,0],c:[[0,1,1],[1,1,1],[1,1,0],[0,1,0]],s:1},{n:[0,-1,0],c:[[0,0,0],[1,0,0],[1,0,1],[0,0,1]],s:.55},{n:[0,0,1],c:[[0,0,1],[1,0,1],[1,1,1],[0,1,1]],s:.9},{n:[0,0,-1],c:[[1,0,0],[0,0,0],[0,1,0],[1,1,0]],s:.7}];
function rebuildWorld(){const pos=[],uv=[],col=[],ind=[];let vi=0;const e=.02/ (ACOLS*TS);
 for(let y=0;y<H;y++)for(let z=0;z<Dp;z++)for(let x=0;x<W;x++){const v=G[idx(x,y,z)];if(!v||v===B.PIC)continue;const f=FACES[v];if(!f)continue;
  for(let fi=0;fi<6;fi++){const F=FD[fi],nx=x+F.n[0],ny=y+F.n[1],nz=z+F.n[2];if(ny<0)continue;const nv=get(nx,ny,nz);if(opaque(nv))continue;if(nv===v&&TRANSP.has(v))continue;
   const tile=fi===2?f[0]:fi===3?f[1]:f[2];const u0=(tile%ACOLS)/ACOLS,v0=1-(Math.floor(tile/ACOLS)+1)/AROWS,du=1/ACOLS,dv=1/AROWS;
   /* tiny bit of corner darkening from neighbours = cheap ambient occlusion */
   F.c.forEach((c,k)=>{pos.push(x+c[0],y+c[1],z+c[2]);let ao=1;if(fi!==3){const ox=c[0]?1:-1,oz=c[2]?1:-1,oy=c[1]?1:-1;if(fi===2){if(opaque(get(x+ox,y+1,z))||opaque(get(x,y+1,z+oz)))ao=.82}else if(c[1]===0&&opaque(get(nx,y-1,nz)))ao=.86}
    const s=F.s*ao;col.push(s,s,s);const uu=[[0,0],[1,0],[1,1],[0,1]][k];uv.push(u0+(uu[0]?du-e:e),v0+(uu[1]?dv-e:e))});
   ind.push(vi,vi+1,vi+2,vi,vi+2,vi+3);vi+=4}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(ind);g.computeBoundingSphere();
 if(worldMesh){worldMesh.geometry.dispose();worldMesh.geometry=g}else{worldMesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:atlasTex,vertexColors:true,alphaTest:.5,side:THREE.FrontSide}));scene.add(worldMesh)}
 syncPics();syncOres()}

/* ---------- picture blocks (things you crafted, like a cake block) ---------- */
const picTex={},picMesh={};
function picTexture(word){if(picTex[word])return picTex[word];const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
 x.fillStyle='#B88A50';x.fillRect(0,0,128,128);x.fillStyle='#FFF8EA';x.fillRect(12,12,104,104);x.fillStyle='#6E4C2A';x.fillRect(0,0,128,8);x.fillRect(0,120,128,8);x.fillRect(0,0,8,128);x.fillRect(120,0,8,128);
 x.font='80px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(WORDS[word]?WORDS[word].em:'❓',64,70);
 const t=new THREE.CanvasTexture(c);t.magFilter=THREE.LinearFilter;picTex[word]=t;return t}
const picGeo=new THREE.BoxGeometry(1,1,1);
function syncPics(){Object.keys(picMesh).forEach(k=>{const [x,y,z]=k.split(',').map(Number);if(get(x,y,z)!==B.PIC||!D.pics[k]){scene.remove(picMesh[k]);delete picMesh[k]}});
 Object.entries(D.pics).forEach(([k,w])=>{const [x,y,z]=k.split(',').map(Number);if(get(x,y,z)!==B.PIC){delete D.pics[k];return}if(picMesh[k]&&picMesh[k].userData.word===w)return;if(picMesh[k])scene.remove(picMesh[k]);
  const m=new THREE.Mesh(picGeo,new THREE.MeshBasicMaterial({map:picTexture(w)}));m.position.set(x+.5,y+.5,z+.5);m.userData={pic:k,word:w};scene.add(m);picMesh[k]=m})}

/* ---------- glowing ores ---------- */
const oreGlow={};let oreGlowMat;
function syncOres(){if(!oreGlowMat)oreGlowMat=new THREE.MeshBasicMaterial({color:0xFFE066,transparent:true,opacity:.35,depthWrite:false});const L=oreList(),keys=new Set(L.map(o=>o.x+','+o.y+','+o.z));
 Object.keys(oreGlow).forEach(k=>{if(!keys.has(k)){scene.remove(oreGlow[k]);delete oreGlow[k]}});
 L.forEach(o=>{const k=o.x+','+o.y+','+o.z;if(oreGlow[k])return;const g=new THREE.Group();const box=new THREE.Mesh(new THREE.BoxGeometry(1.12,1.12,1.12),oreGlowMat);g.add(box);
  const s=makeEmojiSprite('✨',1.2);s.position.y=1.3;g.add(s);const beam=new THREE.Mesh(new THREE.CylinderGeometry(.18,.32,4,8,1,true),beamMat());beam.position.y=2.4;g.add(beam);g.userData.beam=beam;g.position.set(o.x+.5,o.y+.5,o.z+.5);g.userData={ph:rnd()*6,spark:s};scene.add(g);oreGlow[k]=g})}
let _beamMat=null;function beamMat(){return _beamMat||(_beamMat=new THREE.MeshBasicMaterial({color:0xFFF0A0,transparent:true,opacity:.28,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}))}
function oresTick(t){if(_beamMat)_beamMat.opacity=.2+.1*Math.sin(t*3);Object.values(oreGlow).forEach(g=>{const p=t*3+g.userData.ph;g.children[0].scale.setScalar(1+.06*Math.sin(p));g.userData.spark.position.y=1.1+.12*Math.sin(p*.7);g.userData.spark.material.rotation=Math.sin(p*.5)*.3})}

/* ---------- emoji sprites ---------- */
const emoTex={};
function emojiTexture(e){if(emoTex[e])return emoTex[e];const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.font='100px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(e,64,72);const t=new THREE.CanvasTexture(c);emoTex[e]=t;return t}
function makeEmojiSprite(e,s){const m=new THREE.Sprite(new THREE.SpriteMaterial({map:emojiTexture(e),depthTest:true,transparent:true}));m.scale.set(s,s,s);return m}

/* ---------- scene ---------- */
function setupScene(){R=new THREE.WebGLRenderer({canvas:$('#gl'),antialias:true});R.setPixelRatio(Math.min(2,devicePixelRatio||1));R.setSize(innerWidth,innerHeight);
 scene=new THREE.Scene();scene.background=new THREE.Color(0x8FD3FF);scene.fog=new THREE.Fog(0x8FD3FF,34,70);
 cam=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.1,200);
 scene.add(new THREE.HemisphereLight(0xFFFFFF,0x6A8A5A,.9));const sun=new THREE.DirectionalLight(0xFFFFFF,.55);sun.position.set(6,12,4);scene.add(sun);
 buildAtlas();
 /* water: gently wobbling plane */
 const wc=document.createElement('canvas');wc.width=wc.height=16;const wx=wc.getContext('2d');wx.fillStyle='#3E9AE8';wx.fillRect(0,0,16,16);speck(wx,mulberry(9),['#5AB0F2','#3088DA','#6EC0F8'],40);
 const wt=new THREE.CanvasTexture(wc);wt.magFilter=THREE.NearestFilter;wt.wrapS=wt.wrapT=THREE.RepeatWrapping;wt.repeat.set(90,90);
 waterMesh=new THREE.Mesh(new THREE.PlaneGeometry(90,90),new THREE.MeshBasicMaterial({map:wt,transparent:true,opacity:.82,depthWrite:false}));waterMesh.rotation.x=-Math.PI/2;waterMesh.position.set(CX+.5,SEA,CZ+.5);waterMesh.renderOrder=2;scene.add(waterMesh);
 const sc=document.createElement('canvas');sc.width=sc.height=16;const sx=sc.getContext('2d');sx.fillStyle='#C8B478';sx.fillRect(0,0,16,16);speck(sx,mulberry(4),['#B8A468','#D8C488'],60);const st=new THREE.CanvasTexture(sc);st.magFilter=THREE.NearestFilter;st.wrapS=st.wrapT=THREE.RepeatWrapping;st.repeat.set(90,90);
 seabed=new THREE.Mesh(new THREE.PlaneGeometry(90,90),new THREE.MeshBasicMaterial({map:st,color:0x9AB8C8}));seabed.rotation.x=-Math.PI/2;seabed.position.set(CX+.5,.9,CZ+.5);scene.add(seabed);
 /* clouds */
 for(let i=0;i<9;i++){const c=new THREE.Group();const m=new THREE.MeshBasicMaterial({color:0xFFFFFF,transparent:true,opacity:.92});const n=ri(2,4);for(let k=0;k<n;k++){const b=new THREE.Mesh(new THREE.BoxGeometry(ri(2,4),.8,ri(2,3)),m);b.position.set(k*1.6-n*.8,0,(rnd()-.5)*1.5);c.add(b)}c.position.set(rnd()*60-20,27+rnd()*4,rnd()*60-20);c.scale.setScalar(1.6);c.userData.v=.3+rnd()*.4;scene.add(c);CLOUDS.push(c)}
 addEventListener('resize',()=>{R.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()})}
const CLOUDS=[];
function skyTick(dt,t){CLOUDS.forEach(c=>{c.position.x+=c.userData.v*dt;if(c.position.x>40)c.position.x=-25});if(waterMesh){waterMesh.material.map.offset.set(t*.01,Math.sin(t*.3)*.02);waterMesh.position.y=SEA+Math.sin(t*1.2)*.02}}

/* ---------- picking ---------- */
const ray=new THREE.Raycaster(),_v2=new THREE.Vector2();
function pickAt(px,py,extra){_v2.set(px/innerWidth*2-1,-(py/innerHeight)*2+1);ray.setFromCamera(_v2,cam);
 const objs=[worldMesh,...Object.values(picMesh),...(extra||[])];const hits=ray.intersectObjects(objs,true);if(!hits.length)return null;const h=hits[0];
 let o=h.object;while(o&&!o.userData.ent&&!o.userData.pic&&o!==worldMesh)o=o.parent;
 if(o&&o.userData.ent)return{ent:o.userData.ent,point:h.point};
 const n=h.face.normal.clone();if(o&&o.userData.pic){n.transformDirection(o.matrixWorld);const [x,y,z]=o.userData.pic.split(',').map(Number);return{x,y,z,n:[Math.round(n.x),Math.round(n.y),Math.round(n.z)],point:h.point}}
 const p=h.point.clone().addScaledVector(n,-.5);return{x:Math.floor(p.x),y:Math.floor(p.y),z:Math.floor(p.z),n:[Math.round(n.x),Math.round(n.y),Math.round(n.z)],point:h.point}}
