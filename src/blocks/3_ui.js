/* ================= play: actions, reading/spelling challenges, quests, Burplings, HUD, input, loop ================= */
let mode='title',buildMode=false,overlay=false,camPan={x:0,z:0},camDist=17,lastInput=0,title=true;

/* ---------- player ---------- */
function playerTick(e,dt,t){const P=e.P;const moving=walkTick(e,dt,2.6);settleY(e,dt);limbs(P,t,moving);if(moving&&Math.floor(t*4)!==Math.floor((t-dt)*4))sfx('step');
 if(!moving&&e.job){const j=e.job;e.ry=Math.atan2(j.tx+.5-e.x,j.tz+.5-e.z);j.t=(j.t||0)+dt;P.busy=true;P.armR.rotation.x=-1.6+Math.sin(j.t*16)*.9;
  if(j.t>(j.dur||.45)){e.job=null;P.busy=false;P.armR.rotation.x=0;j.fn()}}
 if(P.hat&&P.hat.userData.spin)P.hat.userData.spin.rotation.y+=dt*14}
/* walk next to a block, then do something with it */
function goDo(tx,ty,tz,fn,dur,noSame){const e=player;const px=Math.floor(e.x),pz=Math.floor(e.z);e.job=null;
 const near=(x,z)=>Math.abs(x-tx)+Math.abs(z-tz)===1||(!noSame&&x===tx&&z===tz&&ty>=standY(x,z));
 const reach=Math.hypot(tx+.5-e.x,tz+.5-e.z);if((near(px,pz)||(reach<=3.3&&Math.abs(ty-e.y)<=3&&!(noSame&&px===tx&&pz===tz)))){e.path=null;e.job={tx,tz,fn,dur};return}
 const path=findPath(px,pz,near);if(path&&path.length<40){path.shift();e.path=path;e.job={tx,tz,fn,dur}}
 else{/* can't walk there: use magic reach */e.path=null;sparkleLine(e,tx,ty,tz);e.job={tx,tz,fn,dur:.5}}}
function sparkleLine(e,tx,ty,tz){for(let i=1;i<=6;i++){const f=i/6;setTimeout(()=>puff(e.x+(tx+.5-e.x)*f,e.y+1+(ty+.5-e.y-1)*f,e.z+(tz+.5-e.z)*f,0xFFE066,.25,2),i*50)}}
function invAdd(k,n){D.inv[k]=(D.inv[k]||0)+n;if(D.inv[k]<=0)delete D.inv[k];if(buildMode)drawBar()}
function digBlock(x,y,z){const v=get(x,y,z);if(!v)return;if(v===B.BEDROCK){sfx('boing');say(`That's the bottom of the world! Too hard to dig.`);return}
 const k=x+','+y+','+z;let what;if(v===B.PIC){const w=D.pics[k];delete D.pics[k];what='w:'+w}else what=String(v===B.GRASS?B.DIRT:v);
 setB(x,y,z,0);rebuildWorld();debris(x,y,z,v===B.PIC?B.PLANK:v);sfx('dig');invAdd(what,1);D.stats.digs++;floatText('+1',x+.5,y+1,z+.5);questCheck();save()}
function canPlaceAt(x,y,z){if(!inB(x,y,z)||y<1)return 'edge';if(get(x,y,z))return 'full';for(const e of ENTS){if(e.kind==='mob'&&ANIMALS[e.type].t==='swim')continue;if(Math.floor(e.x)===x&&Math.floor(e.z)===z&&y>=Math.floor(e.y)-0&&y<=Math.floor(e.y)+1)return 'busy'}return ''}
function placeBlock(x,y,z){const sel=D.sel;if(!sel||!(D.inv[sel]>0)){say(`Pick a block from the bottom first!`);return}const why=canPlaceAt(x,y,z);if(why==='busy'){sfx('boing');say(`Oops! Someone is standing there.`);return}if(why){sfx('boing');return}
 if(sel.startsWith('w:')){setB(x,y,z,B.PIC);D.pics[x+','+y+','+z]=sel.slice(2)}else setB(x,y,z,+sel);
 rebuildWorld();sfx('place');puff(x+.5,y+.5,z+.5,0xFFFFFF,.35,5);invAdd(sel,-1);D.stats.placed++;if(!(D.inv[sel]>0)){const L=barItems();D.sel=L.length?L[0]:null;drawBar()}questCheck();save()}

/* ---------- picture choices that differ by just a sound or two ---------- */
function similar(a,b){let s=0;for(let i=0;i<Math.min(a.w.length,b.w.length);i++)if(a.w[i]===b.w[i])s+=2;for(const ch of new Set(a.w))if(b.w.includes(ch))s+=1;if(a.w[0]===b.w[0])s+=2;if(a.w.slice(-1)===b.w.slice(-1))s+=2;if(Math.abs(a.s-b.s)<=1)s+=2;if(a.w.length===b.w.length)s+=1;return s}
function choicesFor(word){const pool=WLIST.filter(o=>o.w!==word.w&&o.em!==word.em&&o.s<=Math.max(word.s+1,2));const scored=pool.map(o=>({o,v:similar(word,o)+rnd()*3})).sort((a,b)=>b.v-a.v);const out=[word];for(const {o} of scored){if(out.length>=3)break;if(out.some(x=>x.em===o.em))continue;out.push(o)}return shuffle(out)}

/* ---------- the card ---------- */
function openCard(html){overlay=true;$('#card').className='';$('#card').innerHTML=html;$('#ov').hidden=false}
function closeCard(){overlay=false;$('#ov').hidden=true;$('#card').innerHTML=''}
function shakeCard(){const c=$('#card');c.classList.remove('shake');void c.offsetWidth;c.classList.add('shake')}
const SOUT=Object.assign({},SND,{a:'ah',e:'eh',i:'ih',o:'aw',u:'uh'});
async function soundOut(segs,spans,word,slow){const g=++sayGen;try{if(TTS)speechSynthesis.cancel()}catch(e){}
 for(let i=0;i<segs.length;i++){if(g!==sayGen)return;spans.forEach(s=>s.classList.remove('lit'));spans[i]&&spans[i].classList.add('lit');const s=segs[i];if(s==='e~'){await wait(500);continue}await speakOne(SOUT[s]||tileText(s),{rate:.8});await wait(slow?260:140)}
 spans.forEach(s=>s.classList.remove('lit'));if(word&&g===sayGen){spans.forEach(s=>s.classList.add('lit'));await speakOne(word,{rate:.75});await wait(200);spans.forEach(s=>s.classList.remove('lit'))}}
const PRAISE=['Yes!','You got it!','Awesome reading!','Super reader!','Wow!','Bawk bawk, yes!','Nailed it!'];
let readCount=0;
function readWord(word,who){return new Promise(res=>{let tries=0,help=false,done=false;const opts=choicesFor(word);
 openCard(`<div class="chead"><div class="who">${who||'⛏️'}</div><div class="what">Read it, then tap the picture</div><button class="hear blk" id="helpB" aria-label="Help">💡</button></div>
  <div class="word" id="wd">${word.seg.map(s=>`<span class="${s==='e~'?'e':''}">${esc(tileText(s))}</span>`).join('')}</div>
  <div class="pics">${opts.map((o,i)=>`<button class="pic blk" data-i="${i}" aria-label="picture">${o.em}</button>`).join('')}</div>`);
 const spans=[...$('#wd').children],btns=[...document.querySelectorAll('.pic')];
 const intro=readCount++<2?`Read the word. Then tap the picture that matches!`:pick(['Read it!','What does it say?','Read it, then tap the picture!','Sound it out!']);say(intro);
 $('#helpB').onclick=()=>{help=true;sfx('tap');soundOut(word.seg,spans,null)};
 btns.forEach(b=>b.onclick=async()=>{if(done||b.classList.contains('no'))return;const o=opts[+b.dataset.i];
  if(o===word){done=true;b.classList.add('yes');btns.forEach(x=>{if(x!==b)x.classList.add('no')});sfx('yay');spans.forEach(s=>s.classList.add('lit'));await say([pick(PRAISE),word.w+'!']);await wait(250);closeCard();res({ok:tries===0,help})}
  else{tries++;b.classList.add('no');sfx('oops');shakeCard();
   if(tries===1){help=true;await say(pick(['Oops! Let’s sound it out.','Not that one! Listen.','Hmm, try again! Listen.']));await soundOut(word.seg,spans,null)}
   else{btns.forEach(x=>{if(opts[+x.dataset.i]!==word)x.classList.add('no')});await say('Listen.');await soundOut(word.seg,spans,word.w,true);const c=btns.find(x=>opts[+x.dataset.i]===word);c&&c.classList.add('glow');say('Tap the '+word.w+'!')}}})})}
let sillyCount=0;
function readSilly(item,who){const [text,silly,ms]=item;return new Promise(res=>{let tries=0,help=false,done=false;const toks=text.replace('.','').split(' ');
 openCard(`<div class="chead"><div class="who">${who||'⛏️'}</div><div class="what">Read it. Silly or makes sense?</div><span style="width:66px"></span></div>
  <div class="sent" id="st">${toks.map((w,i)=>`<span class="${SIGHT.includes(w.toLowerCase())?'sw':''}">${esc(w)}${i===toks.length-1?'.':''}</span>`).join('')}</div>
  <div class="yn"><button class="blk" id="ynS" aria-label="Silly">🤪</button><button class="blk" id="ynY" aria-label="Makes sense">👍</button></div>`);
 const spans=[...$('#st').children];
 say(sillyCount++<2?['Read it!','Is it silly? Tap the silly face.','Does it make sense? Tap the thumbs up.']:pick(['Read it! Silly, or does it make sense?','Silly? Or makes sense? Read it!']));
 spans.forEach((s,i)=>s.onclick=()=>{const w=toks[i].toLowerCase();if(!SIGHT.includes(w))help=true;sfx('tap');s.classList.add('lit');say(w,{remember:false}).then(()=>s.classList.remove('lit'))});
 const answer=async isSilly=>{if(done)return;const btn=isSilly?$('#ynS'):$('#ynY');
  if(isSilly===!!silly){done=true;btn.style.background='#B8F0A0';sfx('yay');await say([silly?'Ha ha! So silly!':'Yes! That makes sense.',text]);closeCard();res({ok:tries===0,help})}
  else{tries++;help=true;sfx('oops');shakeCard();btn.style.opacity=.35;if(tries===1){await say('Hmm. Listen.')}
   const g=++sayGen;for(let i=0;i<spans.length;i++){if(g!==sayGen)break;spans[i].classList.add('lit');await speakOne(toks[i],{rate:.85});spans[i].classList.remove('lit')}
   const other=isSilly?$('#ynY'):$('#ynS');other.classList.add('glow');other.style.animation='glow 1s infinite';say(silly?'That is silly!':'That makes sense!')}};
 $('#ynS').onclick=()=>answer(true);$('#ynY').onclick=()=>answer(false)})}
/* one reading turn: a word, or now and then a silly sentence */
async function readTurn(who){const E=D.rd;const s=chooseSkill(E);const sillyOK=E.placed&&focusOf(E)>=3;
 if(sillyOK&&rnd()<.28){const f=focusOf(E);const L=SILLY.filter(x=>x[2]<=f+1&&x[2]>=Math.max(3,f-3));if(L.length){const it=pick(L);const r=await readSilly(it,who);grade(E,{w:it[0],s:Math.min(it[2],SKILLS.length-1)},r.ok,r.help);return r}}
 const w=chooseWord(E,s);const r=await readWord(w,who);grade(E,w,r.ok,r.help);return r}

/* ---------- spelling at the crafting table ---------- */
function spellWord(word){return new Promise(res=>{let tries=0,done=false;const n=word.seg.length;const texts=word.seg.map(tileText);
 const extra=[];shuffle(word.seg.slice()).forEach(s=>{(CONF[s]||[]).forEach(c=>{if(!texts.includes(c)&&!extra.includes(c)&&c.length<=2)extra.push(c)})});
 const tiles=shuffle(texts.map((t,i)=>({t,seg:word.seg[i]})).concat(shuffle(extra).slice(0,n<=3?2:3).map(t=>({t,seg:t})))).map((o,i)=>Object.assign(o,{id:i,used:false}));
 const slot=Array(n).fill(null),locked=Array(n).fill(false);
 openCard(`<div class="chead"><div class="who">🔨</div><div class="what">Spell it with letter blocks</div><button class="hear blk" id="hearB" aria-label="Hear the word">🔊</button></div>
  <div class="target">${word.em}</div><div class="slots" id="sls">${word.seg.map((s,i)=>`<button class="sl" data-s="${i}"></button>`).join('')}</div>
  <div class="tiles" id="tls">${tiles.map(o=>`<button class="tile blk ${o.t.length>1?'d':isVowelTile(o.seg)||/^[aeiou]$/.test(o.t)?'v':'c'}" data-t="${o.id}">${esc(o.t)}</button>`).join('')}</div>`);
 const sl=[...document.querySelectorAll('.sl')],tl=[...document.querySelectorAll('.tile')];
 say([`Let's make ${/^[aeiou]/.test(word.w)?'an':'a'} ${word.w}!`,`Spell ${word.w}.`]);
 $('#hearB').onclick=()=>{sfx('tap');say(word.w,{rate:.7})};
 const draw=()=>{sl.forEach((b,i)=>{const o=slot[i];b.textContent=o?o.t:'';b.classList.toggle('full',!!o);b.classList.toggle('e',!!o&&word.seg[i]==='e~'&&o.t==='e')});tl.forEach(b=>b.classList.toggle('used',tiles[+b.dataset.t].used))};
 const check=async()=>{if(slot.some(x=>!x))return;const bad=slot.map((o,i)=>o.t!==texts[i]);
  if(!bad.some(Boolean)){done=true;sl.forEach(b=>b.classList.add('ok'));sfx('yay');await say([`You spelled ${word.w}!`]);await wait(150);closeCard();res({ok:tries===0});return}
  tries++;sfx('oops');bad.forEach((x,i)=>{if(x)sl[i].classList.add('bad');else locked[i]=true});
  if(tries===1){await say('Almost! Listen to the sounds.');await wait(100);bad.forEach((x,i)=>{if(x){slot[i].used=false;slot[i]=null;sl[i].classList.remove('bad')}});draw();await soundOut(word.seg,sl,null)}
  else{await say('Here is how it goes.');for(let i=0;i<n;i++){if(!locked[i]){if(slot[i])slot[i].used=false;const tt=tiles.find(o=>!o.used&&o.t===texts[i]);if(tt){tt.used=true;slot[i]=tt}sl[i].classList.remove('bad')}draw()}await soundOut(word.seg,sl,word.w);done=true;await wait(300);closeCard();res({ok:false})}};
 tl.forEach(b=>b.onclick=()=>{if(done)return;const o=tiles[+b.dataset.t];if(o.used)return;const i=slot.findIndex(x=>!x);if(i<0)return;o.used=true;slot[i]=o;sfx('place');say(SND[o.seg]||SND[o.t]||o.t,{remember:false,rate:.85});draw();check()});
 sl.forEach((b,i)=>b.onclick=()=>{if(done||locked[i]||!slot[i])return;slot[i].used=false;slot[i]=null;sfx('tap');draw()});draw()})}
const MOBSAY={pig:'Oink oink! Watch out. Pigs toot!',hog:'Oink! A hairy hog!',cat:'Meow! A cat!',dog:'Woof woof! A doggy!',fox:'What does the fox say?',rat:'Squeak! A rat! Eek!',mouse:'Squeak squeak! A tiny mouse!',cow:'Mooooo! A cow!',ox:'A big strong ox!',ram:'Baaa! A ram!',sheep:'Baaa! A fluffy sheep!',goat:'Meeeh! A goat! It eats everything!',horse:'Neigh! A horse!',skunk:'A skunk! Pee-yew!',hen:'Cluck cluck! Hi cousin!',chick:'Peep peep! A baby chick!',duck:'Quack quack!',owl:'Hoo hoo! An owl!',bat:'A bat! Squeak!',bee:'Bzzzzz! A bee!',bug:'A little bug!',crab:'Snip snip! A crab!',snail:'A snail. It is very slow.',frog:'Ribbit! A frog!',snake:'Hissss! A snake!',fish:'Blub blub! A fish!',shark:'Chomp chomp! A shark!',seal:'Ar ar ar! A seal!'};
function craftPicks(){const E=D.sp;const out=[];let guard=0;while(out.length<3&&guard++<40){const s=chooseSkill(E);const w=chooseWord(E,s,out.map(o=>o.w));if(!out.includes(w)&&!out.some(o=>o.em===w.em))out.push(w)}return out}
async function openCraft(){if(D.gems<3){cluckSay(`Bawk! You need 3 gems to make something. Pop sparkly blocks to get gems!`);pointAtOre();return}
 const picks=craftPicks();openCard(`<button class="x blk" id="cx" aria-label="Close">✕</button><div class="chead" style="justify-content:center"><div class="who">🔨</div></div>
  <div class="recipes">${picks.map((w,i)=>`<button class="rc blk" data-i="${i}"><span class="em">${w.em}</span><b>💎 3</b></button>`).join('')}</div>`);
 say(`What do you want to make? Tap one!`);$('#cx').onclick=()=>{shutUp();closeCard()};
 document.querySelectorAll('.rc').forEach(b=>b.onclick=async()=>{const w=picks[+b.dataset.i];sfx('tap');closeCard();await wait(60);const r=await spellWord(w);grade(D.sp,w,r.ok,false);
  D.gems-=3;D.book[w.w]=1;D.stats.crafts++;updateHUD();const t=HOME.table;
  if(w.mob){const e=spawnMob(w.mob,t.x+.5,t.z+1.5);sfx('magic');confetti(e.x,e.y+1,e.z);setTimeout(()=>say(MOBSAY[w.mob]||`A ${w.w}!`),200)}
  else{invAdd('w:'+w.w,2);D.sel='w:'+w.w;sfx('magic');confetti(t.x+.5,4,t.z+.5);floatText(w.em+' +2',t.x+.5,4.5,t.z+.5);setTimeout(()=>say(`${cap(w.w)} blocks! Tap the brick button to build with them.`),200);flashBuild()}
  questCheck();save()})}
const cap=s=>s[0].toUpperCase()+s.slice(1);
function flashBuild(){const b=$('#buildB');b.style.animation='bump .5s 3';setTimeout(()=>b.style.animation='',1600)}

/* ---------- mining a sparkly ore ---------- */
const REWARDS=[[B.GOLD,'gold'],[B.DIAMOND,'diamond'],[B.RAINBOW,'rainbow'],[B.GLASS,'glass'],[B.BRICK,'brick'],[B.PLANK,'planks'],[B.SNOW,'snow'],[B.PUMPKIN,'pumpkin']];
async function oreChallenge(x,y,z){if(get(x,y,z)!==B.ORE)return;const r=await readTurn('⛏️');
 setB(x,y,z,r.ok||r.help?B.AIR:B.AIR);rebuildWorld();debris(x,y,z,B.ORE);confetti(x+.5,y+1,z+.5);sfx('pop');
 const g=r.ok&&!r.help?2:1;D.gems+=g;sfx('gem');const [bid]=pick(REWARDS);invAdd(String(bid),3);floatText(`+${g} 💎`,x+.5,y+1.4,z+.5);setTimeout(()=>floatText('+3 🧱',x+.5,y+1,z+.5),300);
 D.stats.ores++;updateHUD(true);setTimeout(()=>{spawnOre();rebuildWorld()},4000+rnd()*4000);questCheck();save()}
function pointAtOre(){const L=oreList();if(!L.length)return;const p=player;L.sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z));camPan.x=L[0].x+.5-p.x;camPan.z=L[0].z+.5-p.z;lastInput=performance.now();const g=oreGlow[L[0].x+','+L[0].y+','+L[0].z];if(g){g.userData.pulse=3}}

/* ---------- Sir Clucks' quests ---------- */
const QUESTS=[
 {stat:'ores',n:1,ic:'✨',say:n=>[`Bawk! Hi ${n}! I'm Sir Clucks, king of Block Island.`,`Yes. A chicken can be a king.`,`See the sparkly blocks? Tap one, and read the word!`]},
 {stat:'ores',n:2,ic:'✨',say:()=>[`You read it! Reading makes sparkly blocks go POP!`,`Pop two more!`]},
 {stat:'crafts',n:1,ic:'🔨',say:()=>[`Look at all those gems!`,`Take them to the crafting table. The table with the hammer on top. Make something!`]},
 {stat:'placed',n:5,ic:'🧱',say:()=>[`Now let's build!`,`Tap the brick button. Then tap the ground to put down blocks. Put down five!`]},
 {stat:'digs',n:4,ic:'⛏️',say:()=>[`Need more blocks? Tap the pickaxe button.`,`Then tap blocks to dig them up. Dig four!`]},
 {stat:'burps',n:1,ic:'🟩',burp:1,say:()=>[`Bawk! Oh no! A Burpling!`,`Burplings burp on everything. It is so gross!`,`Tap it, and read to make it go away!`]}];
const LOOPQ=[{stat:'ores',n:3,ic:'✨',say:()=>[`Pop three sparkly blocks!`]},{stat:'crafts',n:2,ic:'🔨',say:()=>[`Make two new things at the crafting table!`]},{stat:'placed',n:10,ic:'🧱',say:()=>[`Build something big! Put down ten blocks. Maybe a house for me? I am a king, after all.`]},{stat:'ores',n:4,ic:'✨',say:()=>[`I love sparkly things. Pop four sparkly blocks!`]},{stat:'burps',n:1,ic:'🟩',burp:1,say:()=>[`Uh oh. I smell a Burpling. Find it and make it go away!`]},{stat:'digs',n:6,ic:'⛏️',say:()=>[`Dig up six blocks! Digging is fun.`]}];
function curQuest(){return D.quest<QUESTS.length?QUESTS[D.quest]:LOOPQ[(D.quest-QUESTS.length)%LOOPQ.length]}
function questProg(){const q=curQuest();return Math.min(q.n,(D.stats[q.stat]||0)-(D.qprog[q.stat]||0))}
function startQuest(talk){const q=curQuest();D.qprog=Object.assign({},D.stats);if(q.burp&&!ENTS.some(e=>e.kind==='burpling'))setTimeout(spawnBurpling,talk?5500:500);clucks2(q);updateHUD()}
function clucks2(q){if(clucks)clucks.hasNews=false;clucks&&(clucks.flap=1.2);sfx('cluck');return cluckSay(q.say(D.name||'friend'))}
let questBusy=false;
async function questCheck(){if(questBusy)return;const q=curQuest();updateHUD();if(questProg()<q.n)return;questBusy=true;await wait(overlay?0:600);while(overlay)await wait(300);
 D.stats.quests++;D.gems+=3;const qn=D.stats.quests;let prize='';
 if(qn%2===0){const h=HAT_ORDER.find(k=>!D.hats.includes(k));if(h){D.hats.push(h);D.hat=h;wearHat(player.P,h);prize=`Here is a ${HATS[h].n} for you! Looking good!`}}
 if(!prize){invAdd(String(B.RAINBOW),6);prize=`Here are six rainbow blocks!`}
 $('#quest').classList.remove('done');void $('#quest').offsetWidth;$('#quest').classList.add('done');confetti(player.x,player.y+2,player.z);sfx('yay');updateHUD(true);
 D.quest++;save();clucks.flap=1.5;await cluckSay([pick([`Bawk! You did it!`,`Hooray! Bawk bawk!`,`Wow! You are amazing!`]),`Three gems for you!`,prize]);questBusy=false;startQuest(true)}

/* ---------- Burplings ---------- */
let burpTimer=150;
function spawnBurpling(){if(ENTS.some(e=>e.kind==='burpling'))return;let s=null;for(let t=0;t<60&&!s;t++){const a=rnd()*Math.PI*2,x=Math.round(CX+Math.cos(a)*6.5),z=Math.round(CZ+Math.sin(a)*6.5);if(standY(x,z)>0&&findPath(x,z,(px,pz)=>Math.abs(px-HOME.clucks.x)+Math.abs(pz-HOME.clucks.z)<=2))s={x,z}}if(!s)return;
 const P=makeBurpling();const e=addEnt('burpling',P,s.x+.5,s.z+.5,{life:75,burpCd:5});poof(e.x,e.y+.5,e.z,0x9AE060);sfx('burp');if(D.quest>=QUESTS.length&&curQuest().stat!=='burps')cluckSay(pick([`Ewww! A Burpling is coming!`,`Bawk! Burpling alert! Tap it!`]));return e}
function burpTick(e,dt,t){const P=e.P;P.body.scale.y=1+Math.sin(t*6)*.06;if(overlay&&e.reading)return;e.life-=dt;
 if(e.leaving){e.lt+=dt;const f=e.lt/1.3;e.x=e.lx+(e.ox-e.lx)*f;e.z=e.lz+(e.oz-e.lz)*f;e.y=e.ly+Math.sin(Math.min(1,f)*Math.PI)*5-(f>1?(f-1)*6:0);P.g.rotation.x+=dt*10;if(f>1.05&&!e.splashed){e.splashed=1;sfx('splash');puff(e.x,SEA,e.z,0xE8F4FF,.6,12)}if(f>1.5)removeEnt(e);return}
 if(e.life<0){e.leaving=1;e.lt=0;e.lx=e.x;e.lz=e.z;e.ly=e.y;const a=Math.atan2(e.z-CZ,e.x-CX);e.ox=CX+Math.cos(a)*12;e.oz=CZ+Math.sin(a)*12;return}
 if(!e.path?.length&&e.cd<0){e.cd=1.2;const p=findPath(Math.floor(e.x),Math.floor(e.z),(x,z)=>Math.abs(x-HOME.clucks.x)+Math.abs(z-HOME.clucks.z)<=2);if(p&&p.length>1){p.shift();e.path=p.slice(0,1)}}
 const mv=walkTick(e,dt,1.1);if(mv&&e.hopY<=0)hop(e,5);settleY(e,dt);
 e.burpCd-=dt;if(e.burpCd<0){e.burpCd=6+rnd()*3;sfx('burp');puff(e.x+Math.sin(e.ry)*.6,e.y+.6,e.z+Math.cos(e.ry)*.6,0x9AE060,.7,12);P.body.scale.set(1.3,.8,1.3);setTimeout(()=>P.body.scale.set(1,1,1),250);
  const d=Math.hypot(e.x-clucks.x,e.z-clucks.z);if(d<3&&!overlay&&rnd()<.6){clucks.flap=1;cluckSay(pick([`Ewww! It burped on my crown!`,`Gross! Excuse you!`,`Bawk! That smells like old socks!`,`Pee-yew! Somebody stop that Burpling!`]))}}}
async function burplingChallenge(e){if(e.leaving||e.reading)return;e.reading=true;e.path=null;const r=await readTurn('🟩');e.reading=false;
 {sfx('burp');puff(e.x,e.y+.8,e.z,0xFF9AE0,.7,10);confetti(e.x,e.y+1,e.z);setTimeout(()=>sfx('boing'),300);e.leaving=1;e.lt=0;e.lx=e.x;e.lz=e.z;e.ly=e.y;const a=Math.atan2(e.z-CZ,e.x-CX);e.ox=CX+Math.cos(a)*12;e.oz=CZ+Math.sin(a)*12;
  D.gems+=3;D.stats.burps++;updateHUD(true);floatText('+3 💎',e.x,e.y+1.5,e.z);setTimeout(()=>say(pick([`Boing! Bye bye, Burpling!`,`Splash! See you later, burp face!`,`Ha ha! It bounced into the sea!`])),500);questCheck();save()}}

/* ---------- tapping animals ---------- */
const MOBSND={pig:'Oink!',hog:'Oink oink!',cow:'Moooo!',cat:'Meow!',dog:'Woof!',fox:'Ring-ding-ding!',sheep:'Baaa!',ram:'Baaa!',goat:'Meeeh!',horse:'Neigh!',duck:'Quack!',hen:'Cluck cluck!',chick:'Peep peep!',owl:'Hoo hoo!',frog:'Ribbit!',bee:'Bzzzz!',mouse:'Squeak!',rat:'Squeak!',snake:'Hissss!',seal:'Ar ar ar!',shark:'Chomp!',fish:'Blub blub!',bat:'Squeak!',bug:'Bzz!',crab:'Snip snip!',snail:'Hello. I am slow.',skunk:'Pee-yew!',ox:'Mooo!'};
function tapMob(e){const A=ANIMALS[e.type];if(A.t==='swim'){e.jump=1;sfx('splash')}else hop(e,6);e.flap=.8;say(MOBSND[e.type]||'Hi!',{remember:false,pitch:1.3});if(A.toot&&rnd()<.4)setTimeout(()=>tootPuff(e),450);floatText(pick(['❤️','😄','⭐','🎵']),e.x,e.y+1.4,e.z)}

/* ---------- HUD ---------- */
function updateHUD(bump){$('#gemN').textContent=D.gems;if(bump){const g=$('#gems');g.classList.remove('bump');void g.offsetWidth;g.classList.add('bump')}const q=curQuest();$('#qIcon').innerHTML=`<span>${q.ic}</span><small>${Math.max(0,questProg())}/${q.n}</small>`}
function barItems(){const L=[];PLACEABLE.forEach(id=>{if(D.inv[String(id)]>0)L.push(String(id))});Object.keys(D.inv).filter(k=>k.startsWith('w:')&&D.inv[k]>0).forEach(k=>L.push(k));return L}
const iconCache={};
function drawBar(){const bar=$('#bar');const L=barItems();if(!L.includes(D.sel))D.sel=L[0]||null;bar.innerHTML='';
 if(!L.length){bar.innerHTML=`<div class="slot blk empty"><span class="em">⛏️</span></div>`;return}
 L.forEach(k=>{const b=document.createElement('button');b.className='slot blk'+(k===D.sel?' on':'');if(k.startsWith('w:')){b.innerHTML=`<span class="em">${WORDS[k.slice(2)].em}</span>`}else{const c=iconCache[k]||(iconCache[k]=iconFor(+k));const cc=document.createElement('canvas');cc.width=cc.height=32;cc.getContext('2d').drawImage(c,0,0);b.appendChild(cc)}
  b.insertAdjacentHTML('beforeend',`<b>${D.inv[k]}</b>`);b.onclick=e=>{e.stopPropagation();D.sel=k;sfx('tap');drawBar()};bar.appendChild(b)})}
function setMode(build){buildMode=build;$('#digB').classList.toggle('on',!build);$('#buildB').classList.toggle('on',build);$('#bar').hidden=!build;if(build)drawBar();sfx('tap');
 say(build?(barItems().length?`Build! Tap where you want a block.`:`You have no blocks. Dig some first!`):`Dig! Tap a block to dig it.`,{remember:false})}
let toastT=0;function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('on'),2200)}

/* ---------- sticker book ---------- */
function openBook(){const found=Object.keys(D.book).length;const fr=focusOf(D.rd),fs=focusOf(D.sp),td=D.days[today()]||{q:0,ok:0};
 openCard(`<button class="x blk" id="bx" aria-label="Close">✕</button><div class="chead" style="justify-content:center"><div class="who">📖</div></div>
  <div class="bookg">${WLIST.map(w=>`<button class="bk${D.book[w.w]?'':' lock'}" data-w="${w.w}">${w.em}</button>`).join('')}</div>
  <div class="note"><b>For grown-ups.</b> Reading: ${esc(D.rd.placed?'working on '+SKILLS[fr].n:'finding the right level')} · ${D.rd.ok}/${D.rd.q} right.<br>Spelling: ${esc(D.sp.placed?'working on '+SKILLS[fs].n:'finding the right level')} · ${D.sp.ok}/${D.sp.q} right.<br>Today: ${td.ok}/${td.q} answered without help. Things made: ${found} of ${WLIST.length}.</div>`);
 say(found?`Your sticker book! You made ${found} things. Tap one to hear it.`:`Your sticker book! Make things at the crafting table to fill it up.`);
 $('#bx').onclick=()=>{shutUp();closeCard()};document.querySelectorAll('.bk').forEach(b=>b.onclick=()=>{if(!D.book[b.dataset.w]){sfx('boing');return}sfx('tap');say(b.dataset.w,{remember:false})})}

/* ---------- input ---------- */
const ptrs=new Map();let tap0=null,pinch0=0,dist0=15;
function onTap(px,py){if(overlay||mode!=='play')return;audioInit();tipT=0;
 const ents=ENTS.filter(e=>e!==player).map(e=>e.P.g);const h=pickAt(px,py,ents);if(!h)return;
 if(h.ent){const e=h.ent;if(e.kind==='mob')return tapMob(e);if(e.kind==='clucks'){clucks.flap=1.2;sfx('cluck');return clucks2(curQuest())}if(e.kind==='burpling'){player.ry=Math.atan2(e.x-player.x,e.z-player.z);return burplingChallenge(e)}return}
 const {x,y,z}=h;const v=get(x,y,z);
 if(v===B.ORE){sfx('tap');return goDo(x,y,z,()=>oreChallenge(x,y,z),.6)}
 if(v===B.TABLE){sfx('tap');return goDo(x,y,z,()=>openCraft(),.3)}
 if(buildMode){const nx=x+h.n[0],ny=y+h.n[1],nz=z+h.n[2];if(!D.sel||!(D.inv[D.sel]>0)){sfx('boing');say(`Pick a block at the bottom first! No blocks? Dig some with the pickaxe.`);return}const why=canPlaceAt(nx,ny,nz);if(why==='edge'||why==='full'){sfx('boing');return}
  return goDo(nx,ny,nz,()=>placeBlock(nx,ny,nz),.25,true)}
 if(v)return goDo(x,y,z,()=>digBlock(x,y,z),.55)}
function inputInit(){const c=$('#gl');
 c.addEventListener('pointerdown',e=>{ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});try{c.setPointerCapture(e.pointerId)}catch(_){}if(ptrs.size===1)tap0={x:e.clientX,y:e.clientY,t:performance.now(),moved:0,px:camPan.x,pz:camPan.z};else{tap0=null;const [a,b]=[...ptrs.values()];pinch0=Math.hypot(a.x-b.x,a.y-b.y);dist0=camDist}});
 c.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId))return;const p=ptrs.get(e.pointerId);p.x=e.clientX;p.y=e.clientY;
  if(ptrs.size===2){const [a,b]=[...ptrs.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch0>0)camDist=clamp(dist0*pinch0/d,8,26);lastInput=performance.now()}
  else if(tap0){const dx=e.clientX-tap0.x,dy=e.clientY-tap0.y;tap0.moved=Math.max(tap0.moved,Math.hypot(dx,dy));if(tap0.moved>14&&mode==='play'){const k=camDist/innerHeight*1.4;camPan.x=clamp(tap0.px-(dx*.75+dy*.66)*k*.8,-12,12);camPan.z=clamp(tap0.pz-(dy*.75-dx*.66)*k*.8,-12,12);lastInput=performance.now()}}});
 const up=e=>{if(tap0&&ptrs.size===1&&tap0.moved<14&&performance.now()-tap0.t<700)onTap(e.clientX,e.clientY);ptrs.delete(e.pointerId);if(ptrs.size<2)pinch0=0;if(!ptrs.size)tap0=null};
 c.addEventListener('pointerup',up);c.addEventListener('pointercancel',e=>{ptrs.delete(e.pointerId);tap0=null});
 c.addEventListener('wheel',e=>{e.preventDefault();camDist=clamp(camDist*(1+e.deltaY*.001),8,26)},{passive:false});
 $('#digB').onclick=()=>{audioInit();if(buildMode)setMode(false);else say(`Dig! Tap a block to dig it.`,{remember:false})};$('#buildB').onclick=()=>{audioInit();if(!buildMode)setMode(true);else say(`Build! Tap where you want a block.`,{remember:false})};
 $('#sayB').onclick=()=>{audioInit();sfx('tap');if(lastSay)say(lastSay.t,lastSay.o);else clucks2(curQuest())};$('#bookB').onclick=()=>{audioInit();sfx('tap');openBook()};$('#quest').onclick=()=>{audioInit();clucks2(curQuest())};
 document.addEventListener('visibilitychange',()=>{if(document.hidden){shutUp();save()}});addEventListener('pagehide',save)}

/* ---------- camera ---------- */
const camT=new THREE.Vector3(),camL=new THREE.Vector3();
function camTick(dt,t){if(mode==='title'){const a=t*.12;cam.position.set(CX+.5+Math.cos(a)*19,13,CZ+.5+Math.sin(a)*19);cam.lookAt(CX+.5,2.5,CZ+.5);return}
 if(performance.now()-lastInput>7000&&(player.path?.length||player.job)){camPan.x*=.96;camPan.z*=.96}
 camT.set(player.x+camPan.x,player.y+.8,player.z+camPan.z);camL.lerp(camT,Math.min(1,dt*5));const d=camDist;cam.position.set(camL.x+d*.42,camL.y+d*.78,camL.z+d*.62);cam.lookAt(camL)}

/* ---------- loop ---------- */
let last=performance.now(),saveT=20,qT=0,tipT=0;
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;const t=now/1000;
 entsTick(dt,t);partsTick(dt);oresTick(t);skyTick(dt,t);camTick(dt,t);musicTick();
 if(mode==='play'){Object.values(oreGlow).forEach(g=>{if(g.userData.pulse>0){g.userData.pulse-=dt;g.children[0].scale.setScalar(1.25+.2*Math.sin(t*12))}});
  if(!overlay){saveT-=dt;if(saveT<0){saveT=20;save()}if(D.quest>=QUESTS.length-1){burpTimer-=dt;if(burpTimer<0){burpTimer=150+rnd()*90;spawnBurpling()}}
   qT-=dt;if(qT<0){qT=1;if(oreCount()<4){spawnOre();rebuildWorld()}}}
  if(!overlay&&!player.job&&!player.path?.length)tipT+=dt;if(D.stats.ores===0&&tipT>16){tipT=-14;pointAtOre();cluckSay(`Tap the sparkly block!`)}}
 if(!window.__noRender)R.render(scene,cam)}

/* ---------- start ---------- */
function placeHome(){const s=HOME.spawn;player=addEnt('player',makePlayer(),s.x+.5,s.z+.5);player.ry=Math.PI*.25;if(D.hat)wearHat(player.P,D.hat);
 const c=HOME.clucks;clucks=addEnt('clucks',makeClucks(),c.x+.5,c.z+.5);clucks.ry=.6;clucks.hasNews=true;
}
function boot(){try{const c=document.createElement('canvas');if(!(c.getContext('webgl')||c.getContext('experimental-webgl')))throw 0}catch(e){$('#noGL').style.display='block';return}
 load();setupScene();
 if(D.started&&D.world&&unpackWorld(D.world)){}else{D.pics={};genWorld((Math.random()*1e9)|0)}
 rebuildWorld();placeHome();(D.mobs||[]).forEach(m=>{if(ANIMALS[m[0]])spawnMob(m[0],m[1],m[2],true)});
 if(!D.started){/* a couple of friends live here from the start */spawnMob('fish',0,0,true);spawnMob('fish',0,0,true)}
 inputInit();updateHUD();requestAnimationFrame(frame);
 $('#play').disabled=false;$('#loadMsg').textContent='';$('#play').onclick=startPlay;
 window.__bpSpawn=(k,x,z)=>spawnMob(k,x,z,true);window.__bp={pointAtOre,set camDist(v){camDist=v},get D(){return D},get player(){return player},get cluckSay(){return clucks},ENTS,WORDS,WLIST,SKILLS,oreList,pickAt,onTap,get overlay(){return overlay},spawnBurpling,questCheck,openCraft,oreChallenge,readTurn,spellWord,get cam(){return cam},get,B,setMode,standY,findPath,goDo,canPlaceAt,placeBlock,digBlock,save,rebuildWorld,curQuest,questProg}}
function startPlay(){audioInit();sfx('tap');$('#title').hidden=true;$('#hud').hidden=false;mode='play';camL.set(player.x,player.y+.8,player.z);
 if(!D.started){D.started=true;D.name=kidName();D.inv={'7':12,'8':4};D.sel='7';save();startQuest(true)}
 else{const nm=D.name?`, ${D.name}`:'';clucks.flap=1.2;sfx('cluck');cluckSay([`Bawk! Welcome back${nm}!`,...curQuest().say(D.name||'friend').slice(-1)]);updateHUD();if(curQuest().burp&&!ENTS.some(e=>e.kind==='burpling'))setTimeout(spawnBurpling,3000)}}
