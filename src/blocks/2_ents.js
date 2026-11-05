/* ================= creatures: player, Sir Clucks, crafted animals, Burplings ================= */
const ENTS=[];let player=null,clucks=null;
const lam=c=>new THREE.MeshLambertMaterial({color:c});
const matCache={};const M=c=>matCache[c]||(matCache[c]=lam(c));
function box(w,h,d,c,x=0,y=0,z=0,p){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),Array.isArray(c)?c:M(c));m.position.set(x,y,z);if(p)p.add(m);return m}
function faceTex(draw){const c=document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d');draw(x);const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;return t}
function faceMats(base,draw){const f=new THREE.MeshLambertMaterial({map:faceTex(draw)});const b=M(base);return[b,b,b,b,f,b]}

/* ---------- the player: a blocky kid in an orange hoodie ---------- */
function makePlayer(){const g=new THREE.Group();const skin='#F2C29B';
 const head=box(.5,.5,.5,faceMats(skin,x=>{x.fillStyle=skin;x.fillRect(0,0,16,16);x.fillStyle='#5A3420';x.fillRect(0,0,16,5);x.fillRect(0,0,2,9);x.fillRect(14,0,2,9);x.fillStyle='#fff';x.fillRect(3,7,3,3);x.fillRect(10,7,3,3);x.fillStyle='#2A4A8A';x.fillRect(4,8,2,2);x.fillRect(11,8,2,2);x.fillStyle='#C8645A';x.fillRect(5,12,6,2);x.fillStyle='#F5A090';x.fillRect(2,11,2,1);x.fillRect(12,11,2,1)}),0,1.32,0,g);
 box(.52,.14,.52,'#5A3420',0,1.6,-.02,g);
 const body=box(.5,.56,.28,'#F08A2A',0,.82,0,g);box(.5,.08,.29,'#D06A1A',0,.6,0,g);
 const arm=(s)=>{const p=new THREE.Group();p.position.set(s*.34,1.08,0);box(.18,.5,.18,'#F08A2A',0,-.2,0,p);box(.18,.1,.18,skin,0,-.48,0,p);g.add(p);return p};
 const leg=(s)=>{const p=new THREE.Group();p.position.set(s*.13,.54,0);box(.22,.5,.24,'#3A5EB8',0,-.25,0,p);box(.23,.08,.27,'#2A2A2A',0,-.5,.01,p);g.add(p);return p};
 const P={g,head,armL:arm(-1),armR:arm(1),legL:leg(-1),legR:leg(1),hat:null};
 const pick=new THREE.Group();box(.06,.5,.06,'#8A5A2B',0,-.2,.0,pick);box(.36,.08,.08,'#9AA2B8',0,.05,0,pick);pick.position.set(0,-.45,.12);pick.rotation.x=Math.PI/2;P.armR.add(pick);P.pick=pick;
 return P}
const HATS={crown:{e:'👑',n:'crown'},party:{e:'🥳',n:'party hat'},chef:{e:'👨‍🍳',n:'chef hat'},cowboy:{e:'🤠',n:'cowboy hat'},propeller:{e:'🚁',n:'propeller hat'},pirate:{e:'🏴‍☠️',n:'pirate hat'},bucket:{e:'🪣',n:'bucket hat'}};
const HAT_ORDER=['crown','party','propeller','chef','cowboy','pirate','bucket'];
function makeHat(k){const g=new THREE.Group();
 if(k==='crown'){box(.54,.14,.54,'#F4C430',0,0,0,g);[[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2],[0,-.2],[0,.2]].forEach(([a,b])=>box(.1,.14,.1,'#F4C430',a,.13,b,g));box(.1,.08,.04,'#E8473A',0,.03,.27,g)}
 else if(k==='party'){const c=new THREE.Mesh(new THREE.ConeGeometry(.2,.5,4),M('#E85AB0'));c.position.y=.2;c.rotation.y=Math.PI/4;g.add(c);box(.12,.12,.12,'#FFE04A',0,.48,0,g)}
 else if(k==='chef'){box(.5,.16,.5,'#FFFFFF',0,0,0,g);box(.58,.26,.58,'#FFFFFF',0,.22,0,g)}
 else if(k==='cowboy'){box(.9,.05,.9,'#8A5A2B',0,-.02,0,g);box(.5,.24,.5,'#8A5A2B',0,.12,0,g);box(.51,.06,.51,'#3A2A1A',0,.04,0,g)}
 else if(k==='propeller'){box(.52,.16,.52,'#4A8AE8',0,0,0,g);box(.52,.06,.52,'#E8473A',0,.06,0,g);box(.04,.16,.04,'#666',0,.16,0,g);const pr=box(.8,.03,.1,'#FFE04A',0,.25,0,g);g.userData.spin=pr}
 else if(k==='pirate'){box(.7,.2,.4,'#222222',0,.05,0,g);box(.12,.1,.02,'#FFFFFF',0,.07,.21,g)}
 else if(k==='bucket'){box(.56,.3,.56,'#9AA2B8',0,.1,0,g);box(.06,.06,.6,'#6A6A6A',.3,.1,0,g)}
 return g}
function wearHat(P,k){if(P.hat){P.head.parent.remove(P.hat);P.hat=null}if(!k)return;const h=makeHat(k);h.position.set(0,1.64,0);P.g.add(h);P.hat=h}

/* ---------- animal models ---------- */
const ANIMALS={
 cat:{t:'quad',c:'#F0A040',h:'#F0A040',s:.7,ears:'#F0A040',tail:'up',face:'cat'},
 dog:{t:'quad',c:'#C08850',h:'#C08850',s:.8,ears:'#8A5A2B',flop:1,tail:'up',face:'dog'},
 fox:{t:'quad',c:'#E86A2A',h:'#E86A2A',s:.75,ears:'#E86A2A',tail:'bush',tailTip:'#FFFFFF',face:'fox'},
 rat:{t:'quad',c:'#8A8A92',h:'#8A8A92',s:.45,ears:'#E8A0A8',tail:'thin',face:'mouse'},
 mouse:{t:'quad',c:'#B4B4BC',h:'#B4B4BC',s:.4,ears:'#F0A8B8',bigEars:1,tail:'thin',face:'mouse'},
 pig:{t:'quad',c:'#F4A0B0',h:'#F4A0B0',s:.85,snout:'#E87890',tail:'curl',face:'pig',toot:1},
 hog:{t:'quad',c:'#6A4A3A',h:'#6A4A3A',s:.85,snout:'#4A3428',tusks:1,tail:'curl',face:'pig',toot:1},
 cow:{t:'quad',c:'#FFFFFF',h:'#FFFFFF',s:1.05,spots:'#2A2A2A',horns:'#EEE6C8',snout:'#F0B4B4',face:'cow',toot:1},
 ox:{t:'quad',c:'#8A5A34',h:'#8A5A34',s:1.1,horns:'#EEE6C8',snout:'#5A3A20',face:'cow'},
 ram:{t:'quad',c:'#EDE6D6',h:'#6A5A4A',s:.85,wool:1,curl:'#8A7A5A',face:'sheep'},
 sheep:{t:'quad',c:'#F4F2EA',h:'#EAD8C0',s:.85,wool:1,face:'sheep'},
 goat:{t:'quad',c:'#E8E2D4',h:'#E8E2D4',s:.8,horns:'#8A7A6A',beard:1,face:'goat'},
 horse:{t:'quad',c:'#9A6234',h:'#9A6234',s:1.15,tall:1,mane:'#3A2414',face:'horse'},
 skunk:{t:'quad',c:'#2A2A2E',h:'#2A2A2E',s:.6,stripe:'#FFFFFF',tail:'bush',tailTip:'#FFFFFF',face:'cat',toot:1},
 hen:{t:'bird',c:'#FFFFFF',s:.6,comb:'#E8473A',beak:'#F4B030'},
 chick:{t:'bird',c:'#FFE04A',s:.38,beak:'#F48A30'},
 duck:{t:'bird',c:'#F4F4F4',h:'#2E8A4A',s:.6,beak:'#F4A030',bill:1,swim:1},
 owl:{t:'bird',c:'#9A7048',s:.6,beak:'#E8B040',owl:1},
 bat:{t:'fly',c:'#4A3A5A',s:.5,wing:'#3A2A4A'},
 bee:{t:'fly',c:'#FFD030',s:.35,stripe:'#2A2A2A',wing:'#E8F4FF'},
 bug:{t:'crawl',c:'#E8302A',s:.35,spots:'#1A1A1A'},
 crab:{t:'crawl',c:'#E8583A',s:.5,claws:1},
 snail:{t:'crawl',c:'#C8B080',s:.45,shell:'#B4683A'},
 frog:{t:'hop',c:'#5AC83A',s:.5},
 snake:{t:'snake',c:'#5AB040',s:.35,stripe:'#F4D040'},
 fish:{t:'swim',c:'#F49030',s:.5,fin:'#F4C060'},
 shark:{t:'swim',c:'#7A8A9E',s:1.2,fin:'#5A6A7E',belly:'#E8ECF0',dorsal:1},
 seal:{t:'swim',c:'#7A7A82',s:.9,fin:'#5A5A62',seal:1}
};
function eyesTex(kind,base){return x=>{x.fillStyle=base;x.fillRect(0,0,16,16);x.fillStyle='#fff';x.fillRect(2,4,4,4);x.fillRect(10,4,4,4);x.fillStyle='#1A1A1A';x.fillRect(3,5,2,3);x.fillRect(11,5,2,3);
 if(kind==='cat'||kind==='fox'){x.fillStyle='#E87890';x.fillRect(7,9,2,2);x.fillStyle='#1A1A1A';x.fillRect(6,12,4,1)}
 else if(kind==='dog'){x.fillStyle='#1A1A1A';x.fillRect(6,9,4,3);x.fillStyle='#E87890';x.fillRect(7,13,2,2)}
 else if(kind==='mouse'){x.fillStyle='#E87890';x.fillRect(7,9,2,2)}
 else if(kind==='horse'||kind==='goat'||kind==='sheep'){x.fillStyle='rgba(0,0,0,.25)';x.fillRect(5,11,6,3)}}}
function makeAnimal(type){const A=ANIMALS[type];const g=new THREE.Group(),body=new THREE.Group();g.add(body);const s=A.s;const P={g,body,legs:[],wings:[],type,A};
 if(A.t==='quad'){const bl=s*.9,bh=s*(A.tall?.5:.45),bw=s*.55,legH=s*(A.tall?.55:.35);
  const bodyMat=A.spots?faceMats(A.c,x=>{x.fillStyle=A.c;x.fillRect(0,0,16,16);x.fillStyle=A.spots;[[2,3,5,4],[9,8,5,5],[4,11,3,3],[11,1,3,3]].forEach(r=>x.fillRect(...r))}):A.c;
  const bm=box(bw,bh,bl,bodyMat,0,legH+bh/2,0,body);if(A.spots){bm.material=[bm.material[4],bm.material[4],bm.material[4],M(A.c),bm.material[4],bm.material[4]]}
  if(A.wool)box(bw*1.15,bh*1.15,bl*1.05,A.c,0,legH+bh/2+.02,0,body);
  if(A.stripe)box(bw*.3,.03,bl*1.01,A.stripe,0,legH+bh+.01,0,body);
  const hs=s*.42,hy=legH+bh*(A.tall?1.25:.95),hz=bl/2+hs*.35;
  const head=box(hs,hs,hs,faceMats(A.h,eyesTex(A.face,A.h)),0,hy,hz,body);P.head=head;
  if(A.snout)box(hs*.55,hs*.38,.08,A.snout,0,hy-hs*.15,hz+hs/2+.03,body);
  if(A.tusks){box(.04,.08,.04,'#FFFFFF',-hs*.2,hy-hs*.3,hz+hs/2+.06,body);box(.04,.08,.04,'#FFFFFF',hs*.2,hy-hs*.3,hz+hs/2+.06,body)}
  if(A.ears){const e=A.bigEars?hs*.45:hs*.25;[-1,1].forEach(k=>{const m=box(e,A.flop?e*1.3:e,.06,A.ears,k*hs*.35,A.flop?hy+hs*.15:hy+hs*.6,hz-hs*.1,body);if(A.flop)m.position.x=k*hs*.55})}
  if(A.horns)[-1,1].forEach(k=>box(.06,hs*.4,.06,A.horns,k*hs*.38,hy+hs*.6,hz-hs*.1,body));
  if(A.curl)[-1,1].forEach(k=>box(.1,hs*.45,hs*.45,A.curl,k*hs*.55,hy+hs*.1,hz-hs*.1,body));
  if(A.beard)box(hs*.3,hs*.35,.06,'#D8D0C0',0,hy-hs*.6,hz+hs*.35,body);
  if(A.mane)box(.08,hs*.9,bl*.6,A.mane,0,legH+bh+hs*.2,bl*.15,body);
  if(A.tail){const t=new THREE.Group();t.position.set(0,legH+bh*.8,-bl/2);body.add(t);P.tail=t;
   if(A.tail==='bush'){box(s*.2,s*.2,s*.5,A.c,0,s*.08,-s*.22,t);box(s*.2,s*.2,s*.14,A.tailTip,0,s*.08,-s*.5,t)}else if(A.tail==='curl'){box(.06,.12,.06,A.snout||A.c,0,.06,-.04,t)}else if(A.tail==='thin'){box(.04,.04,s*.6,A.ears||A.c,0,0,-s*.3,t)}else box(.08,s*.4,.08,A.c,0,s*.18,-.04,t)}
  [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([a,b])=>{const l=new THREE.Group();l.position.set(a*bw*.3,legH,b*bl*.32);box(s*.16,legH,s*.16,A.h===A.c?A.c:A.c,0,-legH/2,0,l);body.add(l);P.legs.push(l)})}
 else if(A.t==='bird'){const bs=s;box(bs*.6,bs*.55,bs*.7,A.c,0,bs*.55,0,body);const hs=bs*.42,hy=bs*.95;
  const head=box(hs,hs,hs,faceMats(A.h||A.c,x=>{x.fillStyle=A.h||A.c;x.fillRect(0,0,16,16);x.fillStyle=A.owl?'#FFE070':'#fff';const e=A.owl?5:3;x.fillRect(2,4,e,e);x.fillRect(14-e,4,e,e);x.fillStyle='#1A1A1A';x.fillRect(3,5,2,2);x.fillRect(11,5,2,2)}),0,hy,bs*.25,body);P.head=head;
  box(A.bill?hs*.6:hs*.3,hs*.2,hs*.4,A.beak,0,hy-hs*.12,bs*.25+hs*.6,body);if(A.comb)box(.05,hs*.35,hs*.5,A.comb,0,hy+hs*.6,bs*.25,body);
  [-1,1].forEach(k=>{const w=new THREE.Group();w.position.set(k*bs*.31,bs*.7,0);box(.05,bs*.35,bs*.5,A.c,0,-bs*.15,0,w);body.add(w);P.wings.push(w)});
  [-1,1].forEach(k=>{const l=new THREE.Group();l.position.set(k*bs*.14,bs*.28,0);box(.05,bs*.28,.05,A.beak,0,-bs*.14,0,l);body.add(l);P.legs.push(l)})}
 else if(A.t==='fly'){box(s*.5,s*.45,s*.7,A.stripe?faceMats(A.c,x=>{x.fillStyle=A.c;x.fillRect(0,0,16,16)}):A.c,0,0,0,body);if(A.stripe){box(s*.52,s*.47,s*.1,A.stripe,0,0,0,body);box(s*.52,s*.47,s*.1,A.stripe,0,0,-s*.2,body)}
  const head=box(s*.36,s*.36,s*.2,faceMats(A.c,eyesTex('mouse',A.c)),0,s*.05,s*.42,body);P.head=head;
  [-1,1].forEach(k=>{const w=new THREE.Group();w.position.set(k*s*.25,s*.2,0);const m=box(s*.6,.03,s*.4,A.wing,k*s*.3,0,0,w);if(type==='bee'){m.material=new THREE.MeshLambertMaterial({color:A.wing,transparent:true,opacity:.7})}body.add(w);P.wings.push(w)})}
 else if(A.t==='crawl'){if(A.shell){box(s*.4,s*.25,s*.9,A.c,0,s*.12,0,body);box(s*.5,s*.6,s*.55,A.shell,0,s*.5,-s*.1,body);box(s*.3,s*.3,s*.3,faceMats(A.c,eyesTex('mouse',A.c)),0,s*.25,s*.5,body)}
  else{box(s*.9,s*.35,s*.7,A.c,0,s*.3,0,body);if(A.spots){box(s*.92,.02,s*.05,'#1A1A1A',0,s*.48,0,body);[[-.2,.1],[.2,-.1],[.25,.2],[-.2,-.2]].forEach(([a,b])=>box(s*.15,.03,s*.15,'#1A1A1A',a*s,s*.48,b*s,body))}
   box(s*.4,s*.25,s*.2,faceMats(A.spots?'#1A1A1A':A.c,eyesTex('mouse',A.spots?'#1A1A1A':A.c)),0,s*.3,s*.42,body);
   if(A.claws)[-1,1].forEach(k=>box(s*.25,s*.2,s*.25,A.c,k*s*.6,s*.35,s*.35,body));
   [-1,1].forEach(k=>[0,1,2].forEach(i=>{const l=new THREE.Group();l.position.set(k*s*.45,s*.2,(i-1)*s*.22);box(s*.25,.04,.04,A.claws?A.c:'#1A1A1A',k*s*.12,-s*.05,0,l);body.add(l);P.legs.push(l)}))}}
 else if(A.t==='hop'){box(s*.8,s*.45,s*.75,A.c,0,s*.3,0,body);[-1,1].forEach(k=>{box(s*.25,s*.25,s*.25,'#FFFFFF',k*s*.22,s*.6,s*.18,body);box(s*.12,s*.12,s*.05,'#1A1A1A',k*s*.22,s*.62,s*.31,body)});box(s*.5,.04,.04,'#2A6A1A',0,s*.25,s*.38,body);
  [-1,1].forEach(k=>{const l=new THREE.Group();l.position.set(k*s*.42,s*.15,-s*.15);box(s*.2,s*.15,s*.4,'#4AA82A',0,0,0,l);body.add(l);P.legs.push(l)})}
 else if(A.t==='snake'){P.segs=[];for(let i=0;i<6;i++){const sg=box(s*.5,s*.4,s*.5,i===0?faceMats(A.c,eyesTex('mouse',A.c)):(i%2?A.stripe:A.c),0,s*.2,-i*s*.45,body);P.segs.push(sg)}P.head=P.segs[0];box(.04,.02,.2,'#E8302A',0,s*.12,s*.35,body)}
 else if(A.t==='swim'){box(s*.45,s*.4,s*1,A.c,0,0,0,body);if(A.belly)box(s*.4,s*.12,s*.9,A.belly,0,-s*.16,0,body);const head=box(s*.42,s*.38,s*.3,faceMats(A.c,eyesTex('mouse',A.c)),0,0,s*.6,body);P.head=head;
  const t=new THREE.Group();t.position.set(0,0,-s*.5);box(.05,s*.5,s*.3,A.fin,0,0,-s*.15,t);body.add(t);P.tail=t;if(A.dorsal)box(.05,s*.4,s*.3,A.fin,0,s*.35,0,body);if(A.seal){[-1,1].forEach(k=>box(s*.3,.05,s*.2,A.fin,k*s*.3,-s*.1,s*.25,body))}}
 return P}

/* ---------- Sir Clucks: a very big hen with a crown ---------- */
function makeClucks(){const P=makeAnimal('hen');P.g.scale.setScalar(2.3);const crown=makeHat('crown');crown.scale.setScalar(.55);crown.position.set(0,1.18,.14);P.body.add(crown);box(.62,.4,.08,'#C8302A',0,.62,-.34,P.body);
 const bang=makeEmojiSprite('❗',.45);bang.position.set(0,1.7,0);P.g.add(bang);P.bang=bang;return P}
/* ---------- Burpling: a green cube that burps on things ---------- */
function makeBurpling(){const g=new THREE.Group(),body=new THREE.Group();g.add(body);
 const m=box(.8,.8,.8,faceMats('#7ACC3A',x=>{x.fillStyle='#7ACC3A';x.fillRect(0,0,16,16);x.fillStyle='#5AA82A';x.fillRect(0,13,16,3);x.fillStyle='#fff';x.fillRect(2,3,5,5);x.fillRect(9,3,5,5);x.fillStyle='#1A1A1A';x.fillRect(4,5,2,3);x.fillRect(10,4,2,3);x.fillStyle='#3A1A1A';x.fillRect(4,10,8,4);x.fillStyle='#E87890';x.fillRect(6,12,4,2);x.fillStyle='#fff';x.fillRect(5,10,2,1);x.fillRect(9,10,2,1)}),0,.4,0,body);
 box(.2,.2,.2,'#7ACC3A',0,.9,0,body);return{g,body,type:'burpling'}}

/* ---------- entities ---------- */
function addEnt(kind,P,x,z,extra){const e=Object.assign({kind,P,x,z,y:standY(Math.floor(x),Math.floor(z)),ry:rnd()*6,path:null,t:0,cd:rnd()*3,bob:rnd()*6,vy:0,hopY:0},extra||{});if(e.y<0)e.y=3;P.g.position.set(x,e.y,z);P.g.userData.ent=e;scene.add(P.g);ENTS.push(e);return e}
function removeEnt(e){scene.remove(e.P.g);const i=ENTS.indexOf(e);if(i>=0)ENTS.splice(i,1)}
function spawnMob(type,x,z,silent){const P=makeAnimal(type);const A=ANIMALS[type];let e;
 if(A.t==='swim'||A.swim&&false){const a=rnd()*Math.PI*2;e=addEnt('mob',P,CX+.5+Math.cos(a)*10,CZ+.5+Math.sin(a)*10,{type,ang:a,rad:9.6+rnd()*1.6,dir:rnd()<.5?1:-1})}
 else{const s=nearestLand(x,z);e=addEnt('mob',P,s.x+.5,s.z+.5,{type})}
 if(!silent){poof(e.x,e.y+.5,e.z,0xFFFFFF);e.vy=4}return e}
function nearestLand(x,z){x=Math.round(x-.5);z=Math.round(z-.5);for(let r=0;r<12;r++)for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;if(standY(x+dx,z+dz)>0)return{x:x+dx,z:z+dz}}return{x:HOME.spawn.x,z:HOME.spawn.z}}
function packMobs(){return ENTS.filter(e=>e.kind==='mob').map(e=>[e.type,+e.x.toFixed(2),+e.z.toFixed(2)])}

/* ---------- paths across block tops ---------- */
function findPath(sx,sz,goal){/* goal(x,z) -> true when reached; BFS over columns; step up/down at most 1 */
 const k=(x,z)=>x+z*W;const prev=new Map();const q=[[sx,sz]];prev.set(k(sx,sz),null);let end=null;
 while(q.length){const [x,z]=q.shift();if(goal(x,z)){end=[x,z];break}const h=standY(x,z);
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz;if(prev.has(k(nx,nz)))continue;const nh=standY(nx,nz);if(nh<1||h<0||Math.abs(nh-h)>1)continue;prev.set(k(nx,nz),[x,z]);q.push([nx,nz])}}
 if(!end)return null;const path=[];let c=end;while(c){path.unshift(c);c=prev.get(k(c[0],c[1]))}return path}

/* ---------- moving + animating ---------- */
function walkTick(e,dt,speed){if(!e.path||!e.path.length)return false;const [tx,tz]=e.path[0];const gx=tx+.5,gz=tz+.5;const dx=gx-e.x,dz=gz-e.z,d=Math.hypot(dx,dz);
 if(d<.06){e.x=gx;e.z=gz;e.path.shift();return true}const st=Math.min(d,speed*dt);e.x+=dx/d*st;e.z+=dz/d*st;e.ry=Math.atan2(dx,dz);return true}
function settleY(e,dt){const sy=standY(Math.floor(e.x),Math.floor(e.z));if(sy<0)return;if(e.y<sy-.05){e.y=Math.min(sy,e.y+dt*7)}else if(e.y>sy+.02){e.vy-=20*dt;e.y=Math.max(sy,e.y+e.vy*dt);if(e.y===sy)e.vy=0}else{e.y=sy}}
function limbs(P,t,moving){const a=moving?Math.sin(t*10)*.7:0;if(P.legL){P.legL.rotation.x=a;P.legR.rotation.x=-a;if(!P.busy){P.armL.rotation.x=-a*.8;P.armR.rotation.x=a*.8}}
 if(P.legs)P.legs.forEach((l,i)=>l.rotation.x=moving?Math.sin(t*12+(i%2?Math.PI:0)+(i>1?Math.PI/2:0))*.6:0)}
const _tmp=new THREE.Vector3();
function entsTick(dt,t){for(const e of ENTS.slice()){const P=e.P;e.cd-=dt;e.t+=dt;
  if(e===player)playerTick(e,dt,t);
  else if(e.kind==='mob')mobTick(e,dt,t);
  else if(e.kind==='clucks'){P.body.rotation.y=Math.sin(t*.7)*.3;P.head.rotation.x=Math.max(0,Math.sin(t*2.3))*.5*(Math.sin(t*.37)>.6?1:0);P.wings.forEach((w,i)=>w.rotation.z=(i?-1:1)*(e.flap>0?Math.abs(Math.sin(t*20))*.9:0));if(e.flap>0)e.flap-=dt;P.bang.visible=!!e.hasNews;P.bang.position.y=1.7+Math.sin(t*4)*.08;settleY(e,dt)}
  else if(e.kind==='burpling')burpTick(e,dt,t);
  if(e.hopY>0){e.hopV-=22*dt;e.hopY=Math.max(0,e.hopY+e.hopV*dt)}else if(e.hopV>0){e.hopY+=e.hopV*dt}
  P.g.position.set(e.x,e.y+(e.hopY||0),e.z);if(e.kind!=='mob'||!ANIMALS[e.type]||ANIMALS[e.type].t!=='swim')P.g.rotation.y+=angDiff(P.g.rotation.y,e.ry)*Math.min(1,dt*10)}}
const angDiff=(a,b)=>{let d=b-a;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d};
function hop(e,v=5){if(e.hopY<=0){e.hopY=.001;e.hopV=v}}
function mobTick(e,dt,t){const A=ANIMALS[e.type],P=e.P;
 if(A.t==='swim'){e.ang+=dt*e.dir*(A.s>1?.12:.2);e.x=CX+.5+Math.cos(e.ang)*e.rad;e.z=CZ+.5+Math.sin(e.ang)*e.rad;e.y=SEA-.25+Math.sin(t*2+e.bob)*.08+(e.type==='fish'?-.1:0);P.g.rotation.y=Math.atan2(-Math.sin(e.ang)*e.dir,Math.cos(e.ang)*e.dir);if(P.tail)P.tail.rotation.y=Math.sin(t*8)*.5;if(e.jump>0){e.jump-=dt;e.y+=Math.sin((1-e.jump)*Math.PI)*1.2}return}
 if(A.t==='fly'){if(!e.tx||Math.hypot(e.tx-e.x,e.tz-e.z)<.3||e.cd<0){const s=nearestLand(e.x+ri(-4,4),e.z+ri(-4,4));e.tx=s.x+.5;e.tz=s.z+.5;e.cd=4+rnd()*3}const dx=e.tx-e.x,dz=e.tz-e.z,d=Math.hypot(dx,dz)||1;e.x+=dx/d*dt*1.2;e.z+=dz/d*dt*1.2;e.ry=Math.atan2(dx,dz);
  const gy=Math.max(standY(Math.floor(e.x),Math.floor(e.z)),SEA);e.y+=((gy+1.6+Math.sin(t*2+e.bob)*.3)-e.y)*dt*2;P.wings.forEach((w,i)=>w.rotation.z=(i?-1:1)*Math.sin(t*(e.type==='bee'?40:14))*.7);return}
 const moving=walkTick(e,dt,e.type==='snail'?.35:A.t==='hop'?1.4:1.1);
 if(!moving&&e.cd<0){e.cd=2+rnd()*4;const tx=Math.floor(e.x)+ri(-3,3),tz=Math.floor(e.z)+ri(-3,3);const p=findPath(Math.floor(e.x),Math.floor(e.z),(x,z)=>x===tx&&z===tz);if(p&&p.length<9){p.shift();e.path=p}
  if(A.t==='bird'&&rnd()<.4&&P.head)e.peck=.6;if(A.t==='hop'&&e.path)hop(e,6)}
 if(A.t==='hop'&&moving&&e.hopY<=0)hop(e,6);
 settleY(e,dt);limbs(P,t,moving);if(P.tail&&A.tail)P.tail.rotation.y=Math.sin(t*6)*.4;
 if(e.peck>0){e.peck-=dt;if(P.head)P.head.rotation.x=Math.abs(Math.sin(e.peck*12))*.7}
 if(P.segs)P.segs.forEach((s,i)=>{s.position.x=Math.sin(t*6-i*.9)*.12*(moving?1:.3)});
 if(P.wings.length)P.wings.forEach((w,i)=>w.rotation.z=(i?-1:1)*(e.flap>0?Math.abs(Math.sin(t*25))*.9:0));if(e.flap>0)e.flap-=dt;
 if(A.toot&&e.cd<.5&&e.cd>0&&rnd()<dt*.05)tootPuff(e)}
function tootPuff(e){puff(e.x-Math.sin(e.ry)*.5,e.y+.35,e.z-Math.cos(e.ry)*.5,0xB8E070,.5);sfx('toot')}

/* ---------- particles and pop-up text ---------- */
const PARTS=[];const partGeo=new THREE.BoxGeometry(1,1,1);
function debris(x,y,z,id){const f=FACES[id]||[2];const c=tileCanvas[f[2]];const ctx=c&&c.getContext('2d');for(let i=0;i<12;i++){let col='#8A5A34';if(ctx){const d=ctx.getImageData(ri(0,15),ri(0,15),1,1).data;col=`rgb(${d[0]},${d[1]},${d[2]})`}
 const m=new THREE.Mesh(partGeo,new THREE.MeshBasicMaterial({color:col}));m.scale.setScalar(.14+rnd()*.08);m.position.set(x+.5+(rnd()-.5)*.6,y+.5+(rnd()-.5)*.6,z+.5+(rnd()-.5)*.6);scene.add(m);PARTS.push({m,vx:(rnd()-.5)*4,vy:2+rnd()*4,vz:(rnd()-.5)*4,life:.8+rnd()*.4,g:14})}}
function puff(x,y,z,col,s=.6,n=8){for(let i=0;i<n;i++){const m=new THREE.Mesh(partGeo,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.85}));m.scale.setScalar(s*(.4+rnd()*.5));m.position.set(x+(rnd()-.5)*.4,y+(rnd()-.5)*.3,z+(rnd()-.5)*.4);scene.add(m);PARTS.push({m,vx:(rnd()-.5)*1.6,vy:.6+rnd(),vz:(rnd()-.5)*1.6,life:1+rnd()*.5,g:-.5,fade:1})}}
function poof(x,y,z,col){puff(x,y,z,col||0xFFFFFF,.7,14)}
function confetti(x,y,z){const C=[0xFF5A5A,0xFFE04A,0x5AD85A,0x4AA8FF,0xE85AB0];for(let i=0;i<26;i++){const m=new THREE.Mesh(partGeo,new THREE.MeshBasicMaterial({color:pick(C)}));m.scale.set(.12,.12,.04);m.position.set(x,y,z);scene.add(m);PARTS.push({m,vx:(rnd()-.5)*5,vy:4+rnd()*4,vz:(rnd()-.5)*5,life:1.6,g:9,spin:1})}}
function partsTick(dt){for(let i=PARTS.length-1;i>=0;i--){const p=PARTS[i];p.life-=dt;if(p.life<=0){scene.remove(p.m);p.m.material.dispose();PARTS.splice(i,1);continue}p.vy-=p.g*dt;p.m.position.x+=p.vx*dt;p.m.position.y+=p.vy*dt;p.m.position.z+=p.vz*dt;if(p.fade){p.m.material.opacity=Math.min(.85,p.life);p.m.scale.multiplyScalar(1+dt*.6)}if(p.spin)p.m.rotation.x+=dt*9}}
function floatText(txt,x,y,z){_tmp.set(x,y,z).project(cam);const el=document.createElement('div');el.className='burst';el.textContent=txt;el.style.left=((_tmp.x*.5+.5)*innerWidth-30)+'px';el.style.top=((-_tmp.y*.5+.5)*innerHeight-30)+'px';document.body.appendChild(el);
 requestAnimationFrame(()=>{el.style.transform='translateY(-90px) scale(1.2)';el.style.opacity='0'});setTimeout(()=>el.remove(),1100)}
