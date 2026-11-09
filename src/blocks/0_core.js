/* ================= core: helpers, sound, voice, phonics, learning engine, save ================= */
const $=s=>document.querySelector(s);
const rnd=Math.random,ri=(a,b)=>a+Math.floor(rnd()*(b-a+1)),pick=a=>a[Math.floor(rnd()*a.length)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const wait=ms=>new Promise(r=>setTimeout(r,ms));

/* ---------- phonics ladder ----------
   word spec: "word:segments:emoji[:mob]". Segments are the tiles. "a*" = long vowel (magic e word), "e~" = silent e. */
const SKILLS=[
 {n:'Short a words (cat, map)',w:['cat:c.a.t:🐱:cat','hat:h.a.t:🎩','bat:b.a.t:🦇:bat','map:m.a.p:🗺️','van:v.a.n:🚐','can:c.a.n:🥫','rat:r.a.t:🐀:rat','bag:b.a.g:👜','pan:p.a.n:🍳','ram:r.a.m:🐏:ram','cab:c.a.b:🚕','ax:a.x:🪓']},
 {n:'Short i and o words (pig, dog)',w:['pig:p.i.g:🐷:pig','pin:p.i.n:📌','dog:d.o.g:🐶:dog','pot:p.o.t:🍲','fox:f.o.x:🦊:fox','box:b.o.x:📦','log:l.o.g:🪵','ox:o.x:🐂:ox','kid:k.i.d:🧒','bin:b.i.n:🗑️','hog:h.o.g:🐗:hog']},
 {n:'Short e and u words (bed, sun)',w:['bed:b.e.d:🛏️','hen:h.e.n:🐔:hen','net:n.e.t:🥅','web:w.e.b:🕸️','sun:s.u.n:☀️','bug:b.u.g:🐛:bug','cup:c.u.p:☕','bus:b.u.s:🚌','pen:p.e.n:🖊️','ten:t.e.n:🔟','egg:e.gg:🥚','nut:n.u.t:🥜','tub:t.u.b:🛁','leg:l.e.g:🦵','jet:j.e.t:✈️']},
 {n:'Blends (stop, frog, hand)',w:['stop:s.t.o.p:🛑','frog:f.r.o.g:🐸:frog','crab:c.r.a.b:🦀:crab','drum:d.r.u.m:🥁','flag:f.l.a.g:🚩','sled:s.l.e.d:🛷','hand:h.a.n.d:✋','tent:t.e.n.t:⛺','plug:p.l.u.g:🔌','swim:s.w.i.m:🏊','milk:m.i.l.k:🥛','gift:g.i.f.t:🎁','plant:p.l.a.n.t:🪴','skunk:s.k.u.n.k:🦨:skunk','drop:d.r.o.p:💧','lamp:l.a.m.p:💡']},
 {n:'sh, ch, th, ck (ship, duck)',w:['ship:sh.i.p:🚢','fish:f.i.sh:🐟:fish','shell:sh.e.ll:🐚','chick:ch.i.ck:🐤:chick','duck:d.u.ck:🦆:duck','sock:s.o.ck:🧦','lock:l.o.ck:🔒','rock:r.o.ck:🪨','truck:t.r.u.ck:🚚','brick:b.r.i.ck:🧱','clock:c.l.o.ck:⏰','dish:d.i.sh:🍽️','shop:sh.o.p:🏪','bath:b.a.th:🛀']},
 {n:'Magic e (cake, bike)',w:['cake:c.a*.k.e~:🎂','bike:b.i*.k.e~:🚲','bone:b.o*.n.e~:🦴','cube:c.u*.b.e~:🧊','kite:k.i*.t.e~:🪁','nose:n.o*.s.e~:👃','rose:r.o*.s.e~:🌹','snake:s.n.a*.k.e~:🐍:snake','skate:s.k.a*.t.e~:⛸️','smile:s.m.i*.l.e~:😃','cone:c.o*.n.e~:🍦','globe:g.l.o*.b.e~:🌍']},
 {n:'ee and ea (bee, leaf)',w:['bee:b.ee:🐝:bee','tree:t.r.ee:🌳','feet:f.ee.t:🦶','seal:s.ea.l:🦭:seal','leaf:l.ea.f:🍃','sheep:sh.ee.p:🐑:sheep','teeth:t.ee.th:🦷','peach:p.ea.ch:🍑','jeep:j.ee.p:🚙','seed:s.ee.d:🌱','beach:b.ea.ch:🏖️','queen:qu.ee.n:👸','meat:m.ea.t:🍖']},
 {n:'ai, ay, oa (rain, boat)',w:['rain:r.ai.n:🌧️','snail:s.n.ai.l:🐌:snail','train:t.r.ai.n:🚂','mail:m.ai.l:📬','pail:p.ai.l:🪣','paint:p.ai.n.t:🎨','boat:b.oa.t:⛵','goat:g.oa.t:🐐:goat','soap:s.oa.p:🧼','coat:c.oa.t:🧥','road:r.oa.d:🛣️','toast:t.oa.s.t:🍞']},
 {n:'ow and ou (cow, house)',w:['house:h.ou.s.e~:🏠','mouse:m.ou.s.e~:🐭:mouse','cow:c.ow:🐮:cow','owl:ow.l:🦉:owl','cloud:c.l.ou.d:☁️','crown:c.r.ow.n:👑','mouth:m.ou.th:👄','clown:c.l.ow.n:🤡','couch:c.ou.ch:🛋️','flower:f.l.ow.er:🌸','shower:sh.ow.er:🚿']},
 {n:'ar, or, oo (car, fork, moon)',w:['car:c.ar:🚗','star:s.t.ar:⭐','shark:sh.ar.k:🦈:shark','yarn:y.ar.n:🧶','fork:f.or.k:🍴','horn:h.or.n:📯','corn:c.or.n:🌽','moon:m.oo.n:🌙','spoon:s.p.oo.n:🥄','boot:b.oo.t:👢','book:b.oo.k:📖','storm:s.t.or.m:⛈️','horse:h.or.s.e~:🐴:horse']}
];
const WORDS={},WLIST=[];
SKILLS.forEach((S,si)=>{S.words=S.w.map(spec=>{const [w,seg,em,mob]=spec.split(':');const o={w,seg:seg.split('.'),em,mob:mob||null,s:si};WORDS[w]=o;WLIST.push(o);return o})});
/* Sight words used in silly sentences: tapping them is free help. */
const SIGHT=['a','the','is','can','on','in','has','i','to','with'];
const SILLY=[
 ['A cat can nap.',0,3],['A dog can run.',0,3],['A bus can hop.',1,3],['A cup can run.',1,3],['The sun is in a box.',1,3],['A bug is on the rug.',0,3],['The hen has a hat.',1,3],['A frog can jump.',0,3],['A fox can dig.',0,3],['The pot can jump.',1,3],['A van can swim.',1,3],['The egg can run.',1,3],['A cat is in the bed.',0,3],['A pig is on the sun.',1,3],['A dog can sit.',0,3],['The jet can hop.',1,3],['A crab can swim.',0,3],['The drum can run.',1,3],
 ['A fish can swim.',0,5],['A duck can quack.',0,5],['A ship can jump.',1,5],['A sock can bake a cake.',1,5],['The snake can ride a bike.',1,5],['A chick can hop.',0,5],['A clock can smile.',1,5],['I can ride a bike.',0,5],['The duck has a kite.',1,5],['A dog can lick a bone.',0,5],
 ['A sheep can sleep.',0,7],['A goat can eat a boat.',1,7],['The tree can read.',1,7],['A seal can swim in the sea.',0,7],['The train can sleep in a bed.',1,7],['A snail is in the rain.',0,7],
 ['A cow can see the moon.',0,9],['A mouse can drive a car.',1,9],['The owl has a crown.',1,9],['A shark can play with a spoon.',1,9],['A cow is in the house.',1,9]];

/* ---------- sounds for tiles (what the voice says when a letter tile is tapped) ---------- */
const SND={b:'buh',c:'kuh',k:'kuh',ck:'kuh',d:'duh',f:'fff',g:'guh',gg:'guh',h:'huh',j:'juh',l:'lll',ll:'lll',m:'mmm',n:'nnn',p:'puh',r:'rrr',s:'sss',ss:'sss',t:'tuh',v:'vvv',w:'wuh',x:'ks',y:'yuh',z:'zzz',qu:'kwuh',sh:'shhh',ch:'chuh',th:'thhh',
 a:'apple',e:'egg',i:'it',o:'octopus',u:'up','a*':'ay','i*':'eye','o*':'oh','u*':'you','e~':'Magic e. I am quiet!',ee:'ee',ea:'ee',ai:'ay',ay:'ay',oa:'oh',ow:'ow',ou:'ow',ar:'ar',or:'or',oo:'oo',er:'er',ur:'er',ir:'er',le:'lll',ks:'ks'};
const tileText=s=>s.replace(/[*~]/g,'');
const isVowelTile=s=>/^[aeiou]/.test(s)&&s!=='qu'||s==='ow'||s==='er'||s==='ar'||s==='or';
/* Distractor tiles that look or sound close. */
const CONF={b:['d','p'],d:['b','p'],p:['b','q'],m:['n','w'],n:['m','h'],g:['j','q'],c:['k','s'],k:['c','ck'],s:['z','c'],t:['f','l'],f:['v','t'],l:['t','i'],r:['n','w'],h:['n','b'],v:['f','w'],w:['v','m'],j:['g','y'],x:['ks','z'],y:['i','v'],qu:['k','w'],
 a:['e','u','o'],e:['i','a'],i:['e','a'],o:['u','a'],u:['o','a'],'a*':['e','i'],'i*':['e','a'],'o*':['u','a'],'u*':['o','a'],'e~':['a','y'],
 sh:['ch','s'],ch:['sh','c'],th:['f','t'],ck:['k','c'],ll:['l','le'],gg:['g','j'],ee:['ea','e'],ea:['ee','e'],ai:['ay','a'],oa:['o','ow'],ow:['ou','o'],ou:['ow','oo'],ar:['or','a'],or:['ar','o'],oo:['u','ou'],er:['ur','ir']};

/* ---------- audio ---------- */
let AC=null,sfxG,musG;
function audioInit(){if(AC){if(AC.state==='suspended')AC.resume();return}try{AC=new(window.AudioContext||window.webkitAudioContext)();const m=AC.createGain();m.gain.value=.6;m.connect(AC.destination);sfxG=AC.createGain();sfxG.connect(m);musG=AC.createGain();musG.gain.value=.22;musG.connect(m);Music.next=AC.currentTime+.2}catch(e){AC=null}}
function tone(f,dur,o={}){if(!AC)return;const t0=(o.t0!=null?o.t0:AC.currentTime)+(o.at||0);const os=AC.createOscillator(),g=AC.createGain();os.type=o.type||'square';os.frequency.setValueAtTime(f,t0);if(o.slide)os.frequency.exponentialRampToValueAtTime(Math.max(25,f+o.slide),t0+dur);
 if(o.wob){const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=o.wob;lg.gain.value=f*.25;l.connect(lg);lg.connect(os.frequency);l.start(t0);l.stop(t0+dur+.05)}
 g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(o.vol||.1,t0+.015);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);os.connect(g);g.connect(o.dest||sfxG);os.start(t0);os.stop(t0+dur+.05)}
function noise(dur,vol,f,at,lp){if(!AC)return;const n=AC.sampleRate*dur|0,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(rnd()*2-1)*(1-i/n);const s=AC.createBufferSource();s.buffer=b;const fl=AC.createBiquadFilter();fl.type=lp?'lowpass':'highpass';fl.frequency.value=f;const g=AC.createGain();g.gain.value=vol;s.connect(fl);fl.connect(g);g.connect(sfxG);s.start(AC.currentTime+(at||0))}
const SFX={
 dig(){noise(.12,.35,900,0,1);tone(140,.1,{type:'triangle',vol:.2,slide:-60})},
 pop(){noise(.18,.3,700,0,1);tone(300,.15,{type:'sine',vol:.18,slide:500})},
 place(){tone(180,.08,{type:'triangle',vol:.25});noise(.06,.2,1200,0,1)},
 gem(){[1047,1319,1568,2093].forEach((f,i)=>tone(f,.14,{type:'sine',vol:.09,at:i*.06}))},
 yay(){[523,659,784,1047,784,1047].forEach((f,i)=>tone(f,.16,{type:'square',vol:.06,at:i*.09}))},
 boing(){tone(220,.4,{type:'sine',vol:.2,slide:380,wob:9})},
 oops(){tone(330,.18,{type:'triangle',vol:.15,slide:-120});tone(250,.25,{type:'triangle',vol:.14,at:.16,slide:-90})},
 burp(){tone(95,.55,{type:'sawtooth',vol:.22,slide:-30,wob:18});noise(.4,.12,300,0,1)},
 toot(){tone(110,.35,{type:'square',vol:.12,slide:-40,wob:22});noise(.3,.08,250,.05,1)},
 cluck(){[0,.12,.22].forEach((a,i)=>tone(700+i*80,.07,{type:'square',vol:.05,at:a,slide:-200}))},
 tap(){tone(880,.05,{type:'triangle',vol:.06})},
 step(){noise(.05,.05,1500,0,1)},
 magic(){[784,988,1175,1568,1976].forEach((f,i)=>tone(f,.25,{type:'triangle',vol:.06,at:i*.07}))},
 splash(){noise(.6,.25,600,0,1)},
 zap(){tone(1200,.25,{type:'sawtooth',vol:.08,slide:-900});noise(.25,.2,2500);[1568,2093].forEach((f,i)=>tone(f,.12,{type:'square',vol:.05,at:.08+i*.06}))},
 hurt(){tone(300,.25,{type:'square',vol:.12,slide:-180});noise(.15,.15,600,0,1)},
 grumble(){tone(80,.5,{type:'sawtooth',vol:.12,wob:6,slide:-20})},
 night(){[392,330,262].forEach((f,i)=>tone(f,.6,{type:'triangle',vol:.08,at:i*.35}))},
 morning(){[523,659,784,1047].forEach((f,i)=>tone(f,.3,{type:'triangle',vol:.08,at:i*.15}));setTimeout(()=>SFX.cluck(),700)},
 combo(){[784,988,1319].forEach((f,i)=>tone(f,.1,{type:'square',vol:.06,at:i*.05}))}};
const sfx=n=>{if(AC&&D.sound!==false&&SFX[n])SFX[n]()};
const Music={next:0,step:0,on:true};
const MEL=[72,0,76,79,76,0,72,0,74,0,77,81,77,0,74,0,72,0,76,79,84,0,83,79,77,0,76,0,74,0,72,0];
const BAS=[48,0,0,0,55,0,0,0,50,0,0,0,53,0,0,0,48,0,0,0,52,0,0,0,43,0,0,0,47,0,0,0];
const mtof=m=>440*Math.pow(2,(m-69)/12);
function musicTick(){if(!AC||!Music.on||D.music===false||speaking)return;const spb=60/112/2;if(Music.next<AC.currentTime-.5)Music.next=AC.currentTime+.05;
 while(Music.next<AC.currentTime+.2){const i=Music.step%MEL.length;if(MEL[i])tone(mtof(MEL[i]),spb*.9,{type:'triangle',vol:.5,dest:musG,t0:Music.next});if(BAS[i])tone(mtof(BAS[i]),spb*3,{type:'sine',vol:.7,dest:musG,t0:Music.next});Music.next+=spb;Music.step++}}

/* ---------- voice ---------- */
const TTS=('speechSynthesis' in window)&&typeof SpeechSynthesisUtterance!=='undefined';let voice=null,speaking=false,lastSay=null;
function pickVoice(){if(!TTS)return;const vs=speechSynthesis.getVoices().filter(v=>/^en[-_]/i.test(v.lang));voice=vs.find(v=>/samantha|google us english|aria|jenny|allison|ava|zira/i.test(v.name))||vs.find(v=>/en[-_]us/i.test(v.lang))||vs[0]||null}
if(TTS){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
let sayQ=Promise.resolve(),sayGen=0;
function speakOne(t,o={}){return new Promise(res=>{if(!TTS){setTimeout(res,Math.min(2500,300+t.length*45));return}try{const u=new SpeechSynthesisUtterance(t);u.rate=o.rate||.92;u.pitch=o.pitch||1.12;if(voice){u.voice=voice;u.lang=voice.lang}else u.lang='en-US';let done=false;const fin=()=>{if(done)return;done=true;speaking=false;res()};u.onend=fin;u.onerror=fin;speaking=true;speechSynthesis.speak(u);setTimeout(fin,Math.max(2500,t.length*140/(o.rate||.92)))}catch(e){speaking=false;res()}})}
/* say(): stop whatever is being said and say this. Returns a promise that ends when done. */
function say(t,o={}){if(o.remember!==false)lastSay={t,o};const g=++sayGen;try{if(TTS)speechSynthesis.cancel()}catch(e){}const parts=Array.isArray(t)?t:[t];
 sayQ=(async()=>{for(const p of parts){if(g!==sayGen)return;if(typeof p==='number'){await wait(p);continue}await speakOne(p,o)}})();return sayQ}
const cluckSay=t=>say(t,{pitch:1.45,rate:1.0});
function shutUp(){sayGen++;try{if(TTS)speechSynthesis.cancel()}catch(e){}speaking=false}

/* ---------- learning engine (same idea as the other games: mastery per skill, focus on the first one not yet mastered) ---------- */
const MASTER=.8;
function freshEng(){return{m:SKILLS.map(()=>0),n:SKILLS.map(()=>0),c:SKILLS.map(()=>0),q:0,ok:0,recent:[],review:[],missed:{},seen:{},counter:0,probe:0,placed:false}}
function focusOf(E){for(let i=0;i<SKILLS.length;i++)if(E.m[i]<MASTER)return i;return SKILLS.length-1}
function recentAcc(E){return E.recent.length?E.recent.reduce((a,b)=>a+b,0)/E.recent.length:.8}
function chooseSkill(E){if(!E.placed)return E.probe;const f=focusOf(E),acc=recentAcc(E),r=rnd();if(r<(acc<.6?.35:.2)&&f>0)return ri(Math.max(0,f-2),f-1);if(r>(acc>.9?.82:.93)&&f<SKILLS.length-1)return f+1;return f}
function chooseWord(E,s,avoid){E.counter++;const due=E.review.find(r=>r.due<=E.counter&&(!avoid||!avoid.includes(r.w)));if(due&&WORDS[due.w])return WORDS[due.w];
 const pool=SKILLS[s].words.filter(w=>!(avoid||[]).includes(w.w));const fresh=pool.filter(w=>!(E.seen[w.w]>E.counter-8));const o=pick(fresh.length?fresh:pool);E.seen[o.w]=E.counter;return o}
/* ok: got it; help: needed a hint (counts as a small step only). */
function grade(E,word,ok,help){try{window.__trk&&__trk.ans({s:E===D.sp?'sp':'rd',lv:word.s+1,it:word.w,ok:ok&&!help,help:!!help})}catch(e){}const s=word.s;E.q++;if(ok)E.ok++;E.n[s]++;if(ok&&!help)E.c[s]++;
 if(!E.placed){if(ok&&!help){for(let i=0;i<=s;i++)E.m[i]=Math.max(E.m[i],.85);E.probe=s+1;if(E.probe>=SKILLS.length)E.placed=true}else{E.m[s]=Math.min(E.m[s],.3);E.placed=true}}
 else if(ok&&!help)E.m[s]+=(1-E.m[s])*.22;else if(ok)E.m[s]+=(1-E.m[s])*.06;else E.m[s]-=E.m[s]*.3;
 E.recent.push(ok&&!help?1:0);if(E.recent.length>10)E.recent.shift();
 const rv=E.review.find(r=>r.w===word.w);if(!ok||help){E.missed[word.w]=(E.missed[word.w]||0)+1;if(rv){rv.need=2;rv.due=E.counter+ri(3,5)}else E.review.push({w:word.w,due:E.counter+ri(3,5),need:2})}else if(rv){rv.need--;if(rv.need<=0)E.review=E.review.filter(x=>x!==rv);else rv.due=E.counter+ri(5,9)}
 if(E.review.length>30)E.review.shift();const dd=D.days[today()]||(D.days[today()]={q:0,ok:0});dd.q++;if(ok&&!help)dd.ok++;save()}

/* ---------- save ---------- */
const KEY='blockparty.v1';
let D=null;
function freshSave(){return{v:2,hearts:5,combo:0,bestCombo:0,clock:30,day:1,nightsOn:false,name:'',started:false,sound:true,music:true,rd:freshEng(),sp:freshEng(),gems:4,inv:{},world:null,pics:{},mobs:[],book:{},quest:0,qprog:{},hats:[],hat:null,stats:{ores:0,crafts:0,placed:0,digs:0,burps:0,quests:0,zaps:0,nights:0,lamps:0},days:{},burpT:0,savedAt:0}}
function load(){D=freshSave();try{const s=localStorage.getItem(KEY);if(s){const d=JSON.parse(s);if(d&&d.v===2)D=Object.assign(freshSave(),d);else if(d&&d.v===1){/* bigger world in v2: keep everything learned and collected, make a new island */const keep=['name','started','sound','music','rd','sp','gems','inv','book','quest','qprog','hats','hat','stats','days'];keep.forEach(k=>{if(d[k]!==undefined)D[k]=d[k]});D.world=null;D.pics={};D.mobs=[];D.stats=Object.assign(freshSave().stats,d.stats||{})}}}catch(e){}}
function save(){if(!D||!D.started)return;D.savedAt=Date.now();try{if(typeof packWorld==='function')D.world=packWorld();if(typeof packMobs==='function')D.mobs=packMobs();localStorage.setItem(KEY,JSON.stringify(D))}catch(e){}}
function kidName(){try{if(window.__hubRaw){const h=JSON.parse(window.__hubRaw('hub.v1')||'null');const k=h&&h.kids&&h.kids.find(k=>k.id===window.__KID);if(k&&k.name)return k.name}}catch(e){}return ''}
