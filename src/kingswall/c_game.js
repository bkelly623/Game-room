/* ================= save + settings ================= */
let KEY='kingswall.v1';
/* players: in the Game Room each kid already has their own save; on its own the game keeps a list of players */
const PKEY='kingswall.profiles';let PROF=null;
function setupProfiles(){HK=hubKid();if(HK){KEY='kingswall.v1';PROF=null;return}
 try{PROF=JSON.parse(localStorage.getItem(PKEY)||'null')}catch(e){PROF=null}
 if(!PROF||!Array.isArray(PROF.list)){PROF={list:[],cur:null};let old=null;try{old=localStorage.getItem('kingswall.v1')}catch(e){}
  if(old){const id='p'+Date.now().toString(36);PROF.list.push({id,name:'Player 1',em:'🛡️'});PROF.cur=id;try{localStorage.setItem('kingswall.v1.'+id,old)}catch(e){}}saveProfiles()}
 const p=PROF.list.find(x=>x.id===PROF.cur)||PROF.list[0];if(p){PROF.cur=p.id;KEY='kingswall.v1.'+p.id}else KEY=null}
function saveProfiles(){try{localStorage.setItem(PKEY,JSON.stringify(PROF))}catch(e){}}
function curProfile(){return PROF&&PROF.list.find(x=>x.id===PROF.cur)||null}
function readSave(key){try{const s=key.indexOf('kid.')===0&&window.__hubRaw?window.__hubRaw(key):localStorage.getItem(key);return s?JSON.parse(s):null}catch(e){return null}}
/* new game: castle, gold and upgrades start over; learning levels and answer history stay */
function newGame(){const keep={eng:D.eng,ma:D.ma,rd:D.rd,sp:D.sp,days:D.days,sound:D.sound,music:D.music,cfg:D.cfg,seenHelp:true,rot:D.rot};D=Object.assign(freshSave(),keep);save()}
let D=null;
function freshSave(){return{v:1,stage:1,best:0,gold:0,up:{dmg:0,wall:0,vol:0,arch:0,king:0,luck:0},eng:{},ma:{q:0,ok:0},rd:{q:0,ok:0},sp:{q:0,ok:0},days:{},sound:true,music:true,rot:0,cfg:null,stats:{wins:0,losses:0,kills:0,megas:0,bosses:0},seenHelp:false}}
function load(){D=freshSave();try{const s=KEY&&localStorage.getItem(KEY);if(s){const d=JSON.parse(s);if(d&&d.v===1){D=Object.assign(freshSave(),d);D.up=Object.assign(freshSave().up,d.up||{});D.stats=Object.assign(freshSave().stats,d.stats||{})}}}catch(e){}
 if(!D.cfg)D.cfg=Object.assign(window.KW.defaults(''),{speak:false})}
function save(){if(!KEY)return;try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){}}
function hubKid(){try{if(window.__hubRaw){const h=JSON.parse(window.__hubRaw('hub.v1')||'null');return h&&h.kids&&h.kids.find(k=>k.id===window.__KID)||null}}catch(e){}return null}
let HK=null;
function cfg(){HK=hubKid();const kw=(HK&&HK.kw)||(HK?window.KW.defaults(HK.id):D.cfg);
 const subj=(kw.subj||[]).filter(s=>window.KW.subjects[s]);
 return{subj:subj.length?subj:['ma'],lv:Object.assign({ma:1,rd:1,sw:1,sp:1},kw.lv||{}),speed:kw.speed||'normal',strict:kw.strict!=null?!!kw.strict:(HK?HK.id==='luca':!!D.cfg.strict),speak:HK?!!HK.speak:!!D.cfg.speak,name:HK?HK.name:((curProfile()||{}).name||'')}}
function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}

/* ================= learning engine (per subject) ================= */
const MAXLV={ma:13,rd:13,sw:5,sp:6};
function eng(s){const C=cfg();const want=clamp(C.lv[s]||1,1,MAXLV[s]);
 const E=D.eng[s]||(D.eng[s]={lv:want,set:want,hist:[],streak:0,review:[],n:0,q:0,ok:0});
 if(E.set!==want){E.set=want;E.lv=want;E.hist=[];E.streak=0;E.review=[]}return E}
let lastKey='';
function nextQ(){const C=cfg();const s=C.subj[D.rot++%C.subj.length];const E=eng(s);E.n++;let q=null;
 const due=E.review.find(r=>r.due<=E.n&&r.q.key!==lastKey);
 if(due){q=JSON.parse(JSON.stringify(due.q));q.opts=shuf(q.opts);q.review=true}
 else{const recent=E.recent||(E.recent=[]);for(let i=0;i<14;i++){q=genQ(s,E.lv);if(!q.key)q.key=s+':'+q.ans+':'+(q.prompt.big||q.prompt.word||'')+':'+(q.prompt.pics||'');if(q.key!==lastKey&&!recent.includes(q.key))break}
  recent.push(q.key);if(recent.length>10)recent.shift()}
 q.s=s;q.lv=E.lv;lastKey=q.key;return q}
/* returns a message when the level changed */
function grade(q,ok){const E=eng(q.s);E.q++;if(ok)E.ok++;
 const b=q.s==='ma'?'ma':q.s==='sp'?'sp':'rd';D[b].q++;if(ok)D[b].ok++;
 const t=today();const dd=D.days[t]||(D.days[t]={q:0,ok:0});dd.q++;if(ok)dd.ok++;
 const ks=Object.keys(D.days).sort();while(ks.length>60)delete D.days[ks.shift()];
 const rv=E.review.find(r=>r.q.key===q.key);
 if(!ok){const qq=Object.assign({},q);delete qq.review;if(rv){rv.need=2;rv.due=E.n+ri(2,4)}else E.review.push({q:qq,due:E.n+ri(2,4),need:2});if(E.review.length>20)E.review.shift()}
 else if(rv){rv.need--;if(rv.need<=0)E.review=E.review.filter(r=>r!==rv);else rv.due=E.n+ri(4,7)}
 if(q.review)return null;
 E.hist.push(ok?1:0);if(E.hist.length>8)E.hist.shift();
 if(ok){E.streak++;const acc=E.hist.reduce((a,b)=>a+b,0)/E.hist.length;
  if(E.streak>=6&&E.hist.length>=6&&acc>=.84&&E.lv<MAXLV[q.s]){E.lv++;E.streak=0;E.hist=[];return'up'}}
 else{E.streak=0;/* only step down when it's clearly too hard: 2 or fewer right out of the last 8 */if(E.hist.length>=8&&E.hist.filter(x=>x).length<=2&&E.lv>Math.max(1,E.set-1)){E.lv--;E.hist=[];return'down'}}
 return null}

/* ================= sound ================= */
let AC=null,sfxG,musG;
function audioInit(){if(AC){if(AC.state==='suspended')AC.resume();return}try{AC=new(window.AudioContext||window.webkitAudioContext)();const m=AC.createGain();m.gain.value=.55;m.connect(AC.destination);sfxG=AC.createGain();sfxG.connect(m);musG=AC.createGain();musG.gain.value=.16;musG.connect(m);applyVol();Music.next=AC.currentTime+.3}catch(e){AC=null}}
function applyVol(){if(!AC)return;sfxG.gain.value=D.sound?1:0;musG.gain.value=D.music?.16:0}
function tone(f,dur,o={}){if(!AC)return;const t0=(o.t0!=null?o.t0:AC.currentTime)+(o.at||0);const os=AC.createOscillator(),g=AC.createGain();os.type=o.type||'square';os.frequency.setValueAtTime(f,t0);if(o.slide)os.frequency.exponentialRampToValueAtTime(Math.max(25,f+o.slide),t0+dur);
 g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(o.vol||.1,t0+.012);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);os.connect(g);g.connect(o.dest||sfxG);os.start(t0);os.stop(t0+dur+.05)}
let NB=null;
function noise(dur,vol,f,at,lp){if(!AC)return;if(!NB){const n=AC.sampleRate;NB=AC.createBuffer(1,n,n);const d=NB.getChannelData(0);for(let i=0;i<n;i++)d[i]=rnd()*2-1}
 const s=AC.createBufferSource();s.buffer=NB;const fl=AC.createBiquadFilter();fl.type=lp?'lowpass':'highpass';fl.frequency.value=f;const g=AC.createGain();const t0=AC.currentTime+(at||0);g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);s.connect(fl);fl.connect(g);g.connect(sfxG);s.start(t0,rnd()*.5,dur+.05)}
let sfxCount=0;
const SFX={
 thunder(){noise(1.1,.5,420,0,1);noise(.25,.35,3000,0);tone(60,.9,{type:'sawtooth',vol:.18,slide:-25})},
 heart(){[660,880,1175].forEach((f,i)=>tone(f,.14,{type:'sine',vol:.1,at:i*.07}))},
 bow(){if(sfxCount++>6)return;tone(520,.07,{type:'triangle',vol:.04,slide:-260})},
 hit(){if(sfxCount++>6)return;noise(.06,.12,1600,0)},
 pop(){tone(260,.12,{type:'sine',vol:.14,slide:420});noise(.1,.1,900,0,1)},
 coin(){tone(1320,.06,{type:'square',vol:.035});tone(1760,.1,{type:'square',vol:.035,at:.05})},
 volley(){noise(.35,.18,2400,0);[660,880,1100].forEach((f,i)=>tone(f,.12,{type:'triangle',vol:.06,at:i*.05}))},
 mega(){noise(.9,.5,500,0,1);tone(90,.8,{type:'sawtooth',vol:.2,slide:-50});[523,659,784,1047].forEach((f,i)=>tone(f,.2,{type:'square',vol:.05,at:.1+i*.07}))},
 boom(){noise(.45,.35,700,0,1);tone(110,.35,{type:'sine',vol:.25,slide:-60})},
 zap(){noise(.25,.2,3000,0);tone(1400,.2,{type:'sawtooth',vol:.05,slide:-1000})},
 thud(){tone(80,.18,{type:'sine',vol:.22,slide:-30});noise(.12,.15,400,0,1)},
 right(){[784,988,1319].forEach((f,i)=>tone(f,.13,{type:'triangle',vol:.1,at:i*.06}))},
 wrong(){tone(220,.18,{type:'square',vol:.07,slide:-60});tone(165,.28,{type:'square',vol:.07,at:.14,slide:-40})},
 lvl(){[523,659,784,1047,1319].forEach((f,i)=>tone(f,.18,{type:'square',vol:.06,at:i*.08}))},
 card(){tone(880,.08,{type:'triangle',vol:.1});tone(1320,.12,{type:'triangle',vol:.08,at:.06})},
 win(){[523,523,784,784,880,1047].forEach((f,i)=>tone(f,.22,{type:'square',vol:.07,at:i*.13}))},
 lose(){[392,349,330,262].forEach((f,i)=>tone(f,.35,{type:'triangle',vol:.1,at:i*.22}))},
 roar(){tone(70,1.1,{type:'sawtooth',vol:.25,slide:40});noise(1,.2,300,0,1)},
 tap(){tone(900,.04,{type:'triangle',vol:.05})}
};
/* a bouncy little march */
const Music={next:0,step:0,on:false,
 lead:[67,0,72,0,71,69,67,0,64,0,67,0,69,67,64,62, 60,0,64,0,67,0,72,0,71,0,69,71,72,0,0,0],
 bass:[48,55,52,55,48,55,52,55,45,52,48,52,43,50,47,50],
 tick(){if(!AC||!this.on||!D.music)return;const spb=.16;while(this.next<AC.currentTime+.4){const i=this.step%32,n=this.lead[i];
  if(n)tone(440*Math.pow(2,(n-69)/12),spb*.9,{type:'square',vol:.05,t0:this.next,dest:musG});
  if(i%2===0){const b=this.bass[(i/2)%16];tone(440*Math.pow(2,(b-69)/12),spb*1.6,{type:'triangle',vol:.13,t0:this.next,dest:musG})}
  if(i%4===0)tone(120,.06,{type:'sine',vol:.1,t0:this.next,dest:musG,slide:-60});
  this.next+=spb;this.step++}}};

/* ================= speech ================= */
let voice=null;
function pickVoice(){try{const vs=speechSynthesis.getVoices().filter(v=>/^en[-_]/i.test(v.lang));voice=vs.find(v=>/samantha|google us english|aria|jenny|allison|ava/i.test(v.name))||vs.find(v=>/en[-_]us/i.test(v.lang))||vs[0]||null}catch(e){}}
if('speechSynthesis' in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
function say(t,rate){try{if(!('speechSynthesis' in window)||!t)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=rate||.9;u.pitch=1.05;if(voice){u.voice=voice;u.lang=voice.lang}else u.lang='en-US';speechSynthesis.speak(u)}catch(e){}}

/* ================= battle world ================= */
const W=420,H=700,WALLY=600,KX=W/2;
const SPEEDS={easy:.55,normal:.8,hard:1};
const JAMS={easy:2,normal:2.5,hard:3};
const TYPES={
 gob:{hp:4,spd:26,dmg:1.3,r:18,gold:1,xp:1,col:'#6CC24A',talk:['Snacks!','Hehehe!','Pudding!','Wheee!','Mine!']},
 wolf:{hp:3,spd:48,dmg:1.3,r:20,gold:1,xp:1,col:'#8B8FA8',talk:['Awoo!','Zoom!','Woof!']},
 bat:{hp:2,spd:40,dmg:1,r:16,gold:1,xp:1,col:'#9B6BD6',fly:true,talk:['Squeak!','Eek!']},
 orc:{hp:14,spd:17,dmg:3,r:25,gold:3,xp:2,col:'#7FA03A',talk:['SMASH!','Grr!','Knock knock!']},
 bomb:{hp:5,spd:30,dmg:0,r:19,gold:2,xp:1,col:'#E8664F',boom:12,talk:['Bombs away!','Hehe, boom!']},
 ogre:{hp:140,spd:9,dmg:8,r:48,gold:40,xp:12,col:'#C07BC9',boss:true,talk:['WHERE PUDDING?','GARY HUNGRY!','ME SMASH WALL!']}
};
/* run power-ups */
const POWERS={
 arch:{ic:'🏹',n:'More Archers',d:l=>'+1 archer on the wall',max:4},
 multi:{ic:'🎯',n:'Multishot',d:l=>'Archers shoot '+(l+1)+' arrows',max:3},
 quick:{ic:'⚡',n:'Quick Bows',d:l=>'Archers shoot faster',max:4},
 fire:{ic:'🔥',n:'Fire Arrows',d:l=>'Volley arrows set monsters on fire',max:3},
 ice:{ic:'❄️',n:'Ice Arrows',d:l=>'Arrows slow monsters down',max:3},
 bigvol:{ic:'🌧️',n:'Arrow Storm',d:l=>'+4 arrows in every volley',max:4},
 light:{ic:'🌩️',n:'Lightning',d:l=>'Right answers zap '+(3+l)+' monsters',max:4},
 cannon:{ic:'💣',n:'Cannon',d:l=>l?'Cannon hits harder and faster':'A cannon that blasts groups',max:4},
 knight:{ic:'🛡️',n:'Sir Bonk',d:l=>l?'Sir Bonk hits harder':'A knight who bonks monsters at the wall',max:4},
 repair:{ic:'🧱',n:'Fix the Wall',d:l=>'Heal the wall and make it stronger',max:9},
 gold:{ic:'🪙',n:'Gold Rush',d:l=>'+50% gold this stage',max:2}
};
/* permanent castle upgrades */
const UPS={
 dmg:{ic:'🗡️',n:'Sharp Arrows',d:'Archers hit 25% harder',base:25,max:10},
 vol:{ic:'🌧️',n:'Bigger Volleys',d:'+2 arrows in every volley',base:30,max:10},
 wall:{ic:'🧱',n:'Stone Wall',d:'Wall gets +20 health',base:20,max:10},
 arch:{ic:'🏹',n:'Hire Archer',d:'Start with one more archer',base:60,max:3},
 king:{ic:'👑',n:'King\'s Bow',d:'The King shoots harder and faster',base:40,max:8},
 luck:{ic:'🍀',n:'Lucky Coins',d:'+15% gold from everything',base:50,max:6}
};
const upCost=k=>Math.round(UPS[k].base*Math.pow(1.55,D.up[k]));
const KING_LINES={start:['Protect my snacks!','Archers! Ready your pointy sticks!','Nobody touches my pudding!','To battle! After my nap... no, NOW!'],hit:['Ow, my wall!','I just painted that!','Shoo! Go home!','My pudding is in there!','Stop licking the wall!','Who invited the goblins?'],mega:['KABOOM!','Did you see that?!','Majestic!','Hot hot HOT!','That\'s my favorite kid!'],boss:['Is that... Big Gary?!','He smells like old socks!'],low:['Help! The wall is wobbly!','Answer fast! FAST!'],win:['Victory! Snacks for everyone!','Hooray! The pudding is safe!']};

let G=null;
function newRun(stage){const C=cfg();const n=stage;
 const wallMax=100+D.up.wall*20;
 G={stage:n,t:0,en:[],pr:[],fx:[],tx:[],zaps:[],spawn:[],total:0,killed:0,wall:{hp:wallMax,max:wallMax,hitT:0},
  xp:0,lvl:1,need:6,pw:{},pending:0,combo:0,jam:0,gold:0,stored:0,over:false,paused:true,
  spd:SPEEDS[C.speed]||.8,jamT:JAMS[C.speed]||2.5,shake:0,flash:0,cannonT:2,knight:null,king:{cd:1,line:null,lineT:0},
  archers:[],hearts:3,strict:C.strict,bolt:0,heal:0,right:0,wrong:0,best:0,talkT:3,lastHitLine:0,bannerQ:[],hpMul:1+.32*(n-1),boss:n%5===0};
 const nArch=2+D.up.arch;for(let i=0;i<nArch;i++)G.archers.push({cd:rnd()*.8,aim:0});layoutArchers();
 /* waves */
 const count=Math.min(90,12+n*6),dur=Math.min(95,36+n*3.5),waves=3;
 const types=['gob'];if(n>=2)types.push('wolf');if(n>=3)types.push('bat');if(n>=4)types.push('orc');if(n>=6)types.push('bomb');
 for(let i=0;i<count;i++){const w=Math.floor(i*waves/count),inW=i-Math.floor(w*count/waves),per=Math.ceil(count/waves);
  const t=3+w*(dur/waves)+inW*((dur/waves)*.62/per)+rnd()*.8;
  let ty='gob';const r=rnd();if(i>2){if(types.includes('orc')&&r<.13+w*.03)ty='orc';else if(types.includes('bomb')&&r<.24)ty='bomb';else if(types.includes('bat')&&r<.4)ty='bat';else if(types.includes('wolf')&&r<.6)ty='wolf'}
  G.spawn.push({t,ty,wave:w})}
 if(G.boss)G.spawn.push({t:3+dur+4,ty:'ogre',wave:waves});
 G.spawn.sort((a,b)=>a.t-b.t);G.total=G.spawn.length;G.waves=waves;G.waveShown=0;
 G.decor=null;}
function layoutArchers(){const sl=[-78,78,-140,140,-196,196,-46,46];G.archers.forEach((a,i)=>{a.x=KX+sl[i%sl.length]+(i>=sl.length?10:0);a.y=WALLY-6})}
function spawnEnemy(ty){const T=TYPES[ty];const top=Math.min(-30,-(OY/K)-30);
 const e={ty,x:ri(50,W-50),y:top-rnd()*30,hp:T.hp*G.hpMul,max:T.hp*G.hpMul,r:T.r,spd:T.spd*(.9+rnd()*.2),an:rnd()*6,hitT:0,slow:0,burn:0,atWall:false,atkT:0,ph:rnd()*6,talk:null,talkT:0};
 if(T.boss){e.x=KX;e.hp=e.max=T.hp*(1+.5*(G.stage/5-1))*G.hpMul;banner('BIG GARY!','The ogre boss is here');kingSay(pick(KING_LINES.boss),3);SFX.roar();shake(10)}
 G.en.push(e);return e}
function shake(n){G.shake=Math.max(G.shake,n)}
function kingSay(t,s){G.king.line=t;G.king.lineT=s||2.4}
function floatText(x,y,t,col,size){G.tx.push({x,y,t,col:col||'#fff',size:size||18,life:1,max:1})}
function burst(x,y,col,n,sp){for(let i=0;i<(n||8);i++){const a=rnd()*6.283,v=(sp||90)*(.4+rnd());G.fx.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-30,life:.5+rnd()*.4,max:.9,col,r:2+rnd()*3,g:220})}}
function archerDmg(){return 1*(1+.25*D.up.dmg)}
function damage(e,d,o={}){if(e.hp<=0)return;e.hp-=d;e.hitT=.12;if(o.ice||G.pw.ice&&o.arrow)e.slow=Math.max(e.slow,1.2+.5*(G.pw.ice||0));
 if(o.fire&&G.pw.fire)e.burn=Math.max(e.burn,2.5+G.pw.fire);
 if(d>=2.5)floatText(e.x+ri(-8,8),e.y-e.r-6,Math.round(d)+'',o.col||'#FFE08A',o.big?24:16);
 if(e.hp<=0)kill(e)}
function kill(e){const T=TYPES[e.ty];e.hp=0;G.killed++;D.stats.kills++;
 const g=Math.max(1,Math.round(T.gold*(1+.15*D.up.luck)*(G.pw.gold?1+.5*G.pw.gold:1)));G.gold+=g;
 burst(e.x,e.y,T.col,T.boss?40:10,T.boss?200:110);burst(e.x,e.y,'#fff',4,60);SFX.pop();
 for(let i=0;i<Math.min(g,6);i++)G.fx.push({coin:1,x:e.x+ri(-10,10),y:e.y,vx:ri(-60,60),vy:-ri(80,160),life:1.6,max:1.6,delay:.35+i*.05});
 if(rnd()<.18&&!T.boss)G.fx.push({boot:1,x:e.x,y:e.y,vx:ri(-80,80),vy:-220,life:1.2,max:1.2,rot:0});
 addXp(T.xp);
 if(T.boss){D.stats.bosses++;banner('GARY GOT BONKED!','');kingSay('Bye bye, Gary!',3);shake(14)}}
function addXp(n){G.xp+=n;while(G.xp>=G.need){G.xp-=G.need;G.lvl++;G.need=Math.round(6+G.lvl*3.2);G.pending++}}
function bannerShow(t,sub){const b=$('#banner');b.innerHTML=t+(sub?'<small>'+sub+'</small>':'');b.classList.add('on');clearTimeout(bannerShow.T);bannerShow.T=setTimeout(()=>b.classList.remove('on'),1700)}
function banner(t,sub){bannerShow(t,sub)}

/* targets: monsters closest to the wall first */
function targets(range){const top=Math.max(-(OY/K)+10,range?WALLY-range:-1e9);return G.en.filter(e=>e.hp>0&&e.y>top).sort((a,b)=>b.y-a.y)}
function shoot(from,e,o){const sp=o.spd||520;G.pr.push({k:'arrow',x:from.x,y:from.y,tg:e,dmg:o.dmg,spd:sp,ang:-1.57,life:2,big:o.big,col:o.col})}
function lob(fromX,e,dmg,o={}){G.pr.push({k:o.k||'volley',sx:fromX,sy:WALLY-10,x:fromX,y:WALLY-10,tg:e,tx:e.x,ty:e.y,t:0,T:o.T||(.45+rnd()*.25),dmg,h:o.h||(120+rnd()*80),splash:o.splash||0,fire:o.fire,wait:o.wait||0,z:0})}
function volley(mult){const T=targets();const n=Math.round((6+2*D.up.vol+4*(G.pw.bigvol||0))*mult);
 SFX.volley();G.flash=Math.max(G.flash,.15);
 if(!T.length){G.stored=Math.min(3,G.stored+1);floatText(KX,WALLY-60,'Saved for later!','#BFE3FF',18);return}
 const dmg=2.6*(1+.15*D.up.dmg)*(1+.13*(G.stage-1));
 for(let i=0;i<n;i++){const e=T[i%Math.min(T.length,Math.max(3,Math.ceil(n/2)))];lob(ri(40,W-40),e,dmg,{fire:true,wait:i*.045})}
 if(G.pw.light){let cur={x:KX,y:WALLY-40};const hit=[];const pts=[[cur.x,cur.y]];for(let i=0;i<3+G.pw.light;i++){const nx=G.en.filter(e=>e.hp>0&&!hit.includes(e)&&e.y>-(OY/K)).sort((a,b)=>Math.hypot(a.x-cur.x,a.y-cur.y)-Math.hypot(b.x-cur.x,b.y-cur.y))[0];if(!nx)break;hit.push(nx);pts.push([nx.x,nx.y]);cur=nx}
  if(hit.length){G.zaps.push({pts,life:.35});SFX.zap();hit.forEach(e=>damage(e,4*(1+.1*G.stage),{col:'#BFE3FF'}))}}}
function mega(){const T=targets();SFX.mega();D.stats.megas++;banner('MEGA!','Fireball!');kingSay(pick(KING_LINES.mega),2);
 if(!T.length){G.stored=Math.min(3,G.stored+1);return}
 let best=T[0],bn=-1;T.forEach(e=>{const c=T.filter(o=>Math.hypot(o.x-e.x,o.y-e.y)<90).length;if(c>bn){bn=c;best=e}});
 G.pr.push({k:'meteor',x:best.x+120,y:-(OY/K)-60,tx:best.x,ty:best.y,tg:best,t:0,T:.6,dmg:10*(1+.12*G.stage)*(1+.1*D.up.dmg)})}
function useStored(){if(G.stored>0&&targets().length){G.stored--;volley(1)}}

function update(dt){if(!G||G.paused||G.over)return;G.t+=dt;sfxCount=0;
 const vh=-(OY/K);
 /* spawning */
 while(G.spawn.length&&G.spawn[0].t<=G.t){const s=G.spawn.shift();if(s.wave>G.waveShown&&s.ty!=='ogre'){G.waveShown=s.wave;banner('WAVE '+(s.wave+1),'Here they come!')}spawnEnemy(s.ty)}
 if(G.stored&&targets().length&&rnd()<dt*2)useStored();
 /* monsters */
 for(const e of G.en){if(e.hp<=0)continue;const T=TYPES[e.ty];e.an+=dt*(e.atWall?8:6);if(e.hitT>0)e.hitT-=dt;
  let sp=e.spd*G.spd;if(e.slow>0){e.slow-=dt;sp*=.45}
  if(e.burn>0){e.burn-=dt;e.hp-=dt*1.2*(G.pw.fire||1)*(1+.05*G.stage);if(rnd()<dt*10)G.fx.push({x:e.x+ri(-8,8),y:e.y-ri(0,e.r),vx:0,vy:-40,life:.4,max:.4,col:pick(['#FF8A3C','#FFC93C']),r:3,g:-20});if(e.hp<=0){kill(e);continue}}
  const stopY=WALLY-6-(T.fly?24:0)-e.r*.4;
  if(e.y<stopY){e.y+=sp*dt;if(T.fly)e.x+=Math.sin(G.t*3+e.ph)*30*dt;e.atWall=false}
  else{e.y=stopY;e.atWall=true;
   if(T.boom){G.wall.hp-=T.boom;e.hp=0;G.killed++;burst(e.x,e.y,'#FF8A3C',24,180);burst(e.x,e.y,'#555',12,120);SFX.boom();shake(8);G.wall.hitT=.3;floatText(e.x,e.y-20,'-'+T.boom,'#FF5A5F',22);continue}
   G.wall.hp-=T.dmg*dt*(G.spd>.7?1:.8);G.wall.hitT=.15;e.atkT-=dt;if(e.atkT<=0){e.atkT=.6;SFX.thud();if(T.boss)shake(5);burst(e.x,WALLY+4,'#A9A9BD',3,60)}
   if(G.t-G.lastHitLine>9){G.lastHitLine=G.t;kingSay(pick(G.wall.hp<G.wall.max*.35?KING_LINES.low:KING_LINES.hit))}}
  e.x=clamp(e.x,24,W-24);
  if(e.talkT>0)e.talkT-=dt}
 /* keep them from stacking */
 const A=G.en;for(let i=0;i<A.length;i++)for(let j=i+1;j<A.length;j++){const a=A[i],b=A[j];if(a.hp<=0||b.hp<=0)continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),m=(a.r+b.r)*.8;if(d<m&&d>.01){const p=(m-d)/2,ux=dx/d,uy=dy/d;a.x-=ux*p;b.x+=ux*p;if(!a.atWall)a.y-=uy*p*.5;if(!b.atWall)b.y+=uy*p*.5}}
 G.en=G.en.filter(e=>e.hp>0);
 G.talkT-=dt;if(G.talkT<=0&&G.en.length){G.talkT=2.5+rnd()*3;const e=pick(G.en);if(e.y>vh+30){e.talk=pick(TYPES[e.ty].talk);e.talkT=1.6}}
 /* archers */
 const T=targets(300);const iv=1.6*Math.pow(.8,G.pw.quick||0);
 for(const a of G.archers){a.cd-=dt;if(a.aim>0)a.aim-=dt;if(a.cd<=0&&T.length){a.cd=iv*(.9+rnd()*.2);a.aim=.2;const shots=1+(G.pw.multi||0);
   for(let s=0;s<shots;s++){const e=T[Math.min(T.length-1,s+(rnd()<.3?1:0))];shoot(a,e,{dmg:archerDmg(),spd:560})}SFX.bow()}}
 /* king */
 const kg=G.king;kg.cd-=dt;if(kg.lineT>0)kg.lineT-=dt;
 if(kg.cd<=0&&T.length){kg.cd=2.4*Math.pow(.9,D.up.king);const e=T.reduce((m,x)=>x.hp>m.hp?x:m,T[0]);shoot({x:KX,y:WALLY-34},e,{dmg:2+1*D.up.king,spd:640,big:true,col:'#FFC93C'});SFX.bow()}
 /* cannon */
 if(G.pw.cannon){G.cannonT-=dt;if(G.cannonT<=0&&T.length){G.cannonT=3.4*Math.pow(.85,G.pw.cannon-1);let best=T[0],bn=-1;T.forEach(e=>{const c=T.filter(o=>Math.hypot(o.x-e.x,o.y-e.y)<60).length;if(c>bn){bn=c;best=e}});
  lob(W-46,best,(3+G.pw.cannon*1.5)*(1+.08*G.stage),{k:'ball',T:.7,h:90,splash:55});SFX.boom()}}
 /* knight */
 if(G.pw.knight){if(!G.knight)G.knight={x:KX+64,y:WALLY-40,cd:0,sw:0};const k=G.knight;k.cd-=dt;if(k.sw>0)k.sw-=dt;
  const near=G.en.filter(e=>e.hp>0&&e.y>WALLY-140).sort((a,b)=>Math.abs(a.x-k.x)-Math.abs(b.x-k.x))[0];
  if(near){const dx=near.x-k.x;k.x+=Math.sign(dx)*Math.min(Math.abs(dx),110*dt);k.y+=(clamp(near.y+near.r*.6,WALLY-120,WALLY-22)-k.y)*Math.min(1,dt*3);
   if(Math.abs(dx)<near.r+16&&Math.abs(near.y-k.y)<near.r+22&&k.cd<=0){k.cd=.75;k.sw=.25;damage(near,(2.5+G.pw.knight*1.5)*(1+.08*G.stage),{col:'#fff'});floatText(k.x,k.y-30,pick(['BONK!','BOINK!','WHAP!']),'#FFE08A',16);SFX.thud()}}
  else{k.x+=(KX+64-k.x)*dt*2;k.y+=(WALLY-40-k.y)*dt*2}}
 /* projectiles */
 for(const p of G.pr){
  if(p.k==='arrow'){const e=p.tg;let tx=e.x,ty=e.y;const dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy);
   if(e.hp<=0){p.x+=Math.cos(p.ang)*p.spd*dt;p.y+=Math.sin(p.ang)*p.spd*dt;p.life-=dt*3}
   else if(d<e.r+4){damage(e,p.dmg,{arrow:true,col:p.col});SFX.hit();p.life=0;burst(p.x,p.y,'#fff',2,40)}
   else{p.ang=Math.atan2(dy,dx);p.x+=dx/d*p.spd*dt;p.y+=dy/d*p.spd*dt}
   p.life-=dt}
  else if(p.k==='volley'||p.k==='ball'){if(p.wait>0){p.wait-=dt;if(p.wait<=0&&p.tg.hp<=0){const n=targets()[0];if(n)p.tg=n}continue}p.t+=dt;if(p.tg.hp>0){p.tx=p.tg.x;p.ty=p.tg.y}const u=Math.min(1,p.t/p.T);p.x=p.sx+(p.tx-p.sx)*u;p.y=p.sy+(p.ty-p.sy)*u;p.z=Math.sin(u*Math.PI)*p.h;
   if(u>=1){p.life=0;if(p.splash){burst(p.x,p.y,'#FFB04A',14,150);burst(p.x,p.y,'#666',8,90);shake(3);G.en.forEach(e=>{if(e.hp>0&&Math.hypot(e.x-p.x,e.y-p.y)<p.splash+e.r)damage(e,p.dmg)})}
    else if(p.tg.hp>0&&Math.hypot(p.tg.x-p.x,p.tg.y-p.y)<p.tg.r+14){damage(p.tg,p.dmg,{fire:true,arrow:true});burst(p.x,p.y,G.pw.fire?'#FF8A3C':'#fff',3,60)}
    else{const e=G.en.find(e=>e.hp>0&&Math.hypot(e.x-p.x,e.y-p.y)<e.r+12);if(e)damage(e,p.dmg,{fire:true,arrow:true});else G.fx.push({stuck:1,x:p.x,y:p.y,life:1.2,max:1.2})}}else p.life=1}
  else if(p.k==='meteor'){p.t+=dt;if(p.tg.hp>0){p.tx=p.tg.x;p.ty=p.tg.y}const u=Math.min(1,p.t/p.T);const sx=p.tx+120,sy=-(OY/K)-60;p.x=sx+(p.tx-sx)*u;p.y=sy+(p.ty-sy)*u*u;
   if(rnd()<.9)G.fx.push({x:p.x+ri(-6,6),y:p.y+ri(-6,6),vx:ri(-20,20),vy:-ri(10,40),life:.45,max:.45,col:pick(['#FF8A3C','#FFC93C','#FF5A2A']),r:5+rnd()*5,g:0});
   if(u>=1){p.life=0;shake(14);G.flash=.5;G.fx.push({ring:1,x:p.x,y:p.y,life:.5,max:.5,R:110});burst(p.x,p.y,'#FF8A3C',40,260);burst(p.x,p.y,'#FFE08A',20,200);
    G.en.forEach(e=>{const d=Math.hypot(e.x-p.x,e.y-p.y);if(e.hp>0&&d<110+e.r)damage(e,p.dmg*(d<60?1:.7),{fire:true,big:true,col:'#FFB04A'});if(e.hp>0)e.burn=Math.max(e.burn,3)})}else p.life=1}}
 G.pr=G.pr.filter(p=>p.life>0);
 /* effects */
 for(const f of G.fx){if(f.delay>0){f.delay-=dt;f.vy+=400*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.y>WALLY-10){f.y=WALLY-10;f.vy*=-.4}continue}
  f.life-=dt;if(f.coin){const tx=(goldPos.x-OX)/K,ty=(goldPos.y-OY)/K;f.x+=(tx-f.x)*Math.min(1,dt*7);f.y+=(ty-f.y)*Math.min(1,dt*7);if(Math.hypot(tx-f.x,ty-f.y)<12){f.life=0;SFX.coin();bumpGold()}continue}
  if(f.ring||f.stuck)continue;f.vy+=(f.g||0)*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.boot)f.rot+=dt*12}
 G.fx=G.fx.filter(f=>f.life>0);if(G.fx.length>500)G.fx.splice(0,G.fx.length-500);
 for(const t of G.tx){t.life-=dt;t.y-=30*dt}G.tx=G.tx.filter(t=>t.life>0);
 for(const z of G.zaps)z.life-=dt;G.zaps=G.zaps.filter(z=>z.life>0);
 if(G.shake>0)G.shake=Math.max(0,G.shake-dt*30);if(G.flash>0)G.flash-=dt;if(G.wall.hitT>0)G.wall.hitT-=dt;
 /* level ups and the end */
 if(G.pending>0&&!G.cardsOpen)openCards();
 if(G.wall.hp<=0){G.wall.hp=0;endRun(false)}
 else if(!G.spawn.length&&!G.en.length&&G.killed>=G.total)endRun(true);}
