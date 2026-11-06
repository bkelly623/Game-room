/* ================= question panel ================= */
let Q=null,qBusy=false,revealT=0,revealDur=0,goldShown=0;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function setCombo(){[...$('#combo').children].forEach((d,i)=>d.classList.toggle('on',G&&G.combo%3>i))}
function showQ(){if(!G||G.over)return;Q=nextQ();qBusy=false;const C=cfg();const S=window.KW.subjects[Q.s];
 $('#qSub').textContent=S.em+' '+S.n+' · Lv '+Q.lv+(Q.review?' · again':'');
 const p=Q.prompt;let h='';if(p.ask)h+=`<div class="ask">${esc(p.ask)}</div>`;
 if(p.pics)h+=`<div class="pics${[...p.pics].length<=2&&!/[0-9+]/.test(p.pics)?' solo':''}">${p.pics}</div>`;if(p.big2)h+=`<div class="big" style="font-size:clamp(26px,5vh,44px)">${esc(p.big2)}</div>`;
 if(p.word)h+=`<div class="word">${esc(p.word)}</div>`;if(p.big)h+=`<div class="big"${Q.small?' style="font-size:clamp(30px,6vh,52px)"':''}>${esc(p.big)}</div>`;if(p.sent)h+=`<div class="sent">${p.sent}</div>`;
 $('#qPrompt').innerHTML=h;
 const box=$('#choices');box.innerHTML='';Q.opts.forEach((o,i)=>{const b=document.createElement('button');b.className='ch'+(Q.kind==='pic'?' pic':Q.kind==='txt'?' txt':'');
  if(Q.word)b.style.fontFamily='Andika,Fredoka,sans-serif';if(Q.small&&Q.kind==='txt')b.style.fontSize='clamp(15px,2.4vh,20px)';
  b.textContent=o;b.onpointerdown=ev=>{ev.preventDefault();answer(i,b)};box.appendChild(b)});
 $('#qSay').hidden=!(Q.say||Q.listen||C.speak);
 /* readers must read before the pictures show up */
 revealDur=Q.reveal?(Q.kind==='pic'?1.1:.7):0;revealT=revealDur;
 if(revealDur)[...box.children].forEach(b=>b.classList.add('hide'));$('#readBar').style.visibility=revealDur?'visible':'hidden';
 if(Q.listen)setTimeout(()=>say(Q.say,Q.s==='sp'?.85:.8),150);else if(C.speak&&Q.s==='ma')setTimeout(()=>say(Q.say||''),150)}
function sayAgain(){if(!Q)return;if(Q.listen||Q.s==='ma')say(Q.say||Q.fixSay);else if(cfg().speak&&Q.prompt.ask)say(Q.prompt.ask)}
function answer(i,b){if(!G||G.paused||G.over||qBusy||G.jam>0||revealT>0)return;audioInit();qBusy=true;const ok=Q.opts[i]===Q.ans;const btns=[...$('#choices').children];
 const ch=grade(Q,ok);
 if(ok){b.classList.add('ok');SFX.right();G.right++;G.combo++;G.best=Math.max(G.best,G.combo);addXp(1);setCombo();
  if(G.combo%3===0){mega();volley(1)}else volley(1);
  if(ch==='up')toast('⬆️ '+window.KW.subjects[Q.s].n+' level '+eng(Q.s).lv+'!');
  setTimeout(showQ,320)}
 else{b.classList.add('no');SFX.wrong();G.wrong++;G.combo=0;setCombo();btns.forEach(x=>{if(Q.opts[btns.indexOf(x)]===Q.ans)x.classList.add('ok');else if(x!==b)x.classList.add('dim')});
  G.jam=G.jamT;say(Q.fixSay||'');
  setTimeout(()=>{if(!G||G.over)return;const j=$('#jam');j.hidden=false;j.innerHTML=`<div class="t1">🪢 Bow tangled!</div><div class="t2">${esc(Q.fix).replace(esc(Q.ans),'<b>'+esc(Q.ans)+'</b>')}</div><svg class="ring" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="5"/><circle id="jamArc" cx="20" cy="20" r="16" fill="none" stroke="#FFC93C" stroke-width="5" stroke-linecap="round" transform="rotate(-90 20 20)" stroke-dasharray="100.5" stroke-dashoffset="0"/></svg>`},450);
  if(ch==='down')setTimeout(()=>toast('Practice time: level '+eng(Q.s).lv),900)}
 save()}
function tickQ(dt){if(!G||G.paused||G.over)return;
 if(revealT>0){revealT-=dt;$('#readBar i').style.width=(100*(1-revealT/revealDur))+'%';if(revealT<=0){[...$('#choices').children].forEach(b=>b.classList.remove('hide'));$('#readBar').style.visibility='hidden'}}
 if(G.jam>0){G.jam-=dt;const a=$('#jamArc');if(a)a.setAttribute('stroke-dashoffset',String(100.5*(1-Math.max(0,G.jam)/G.jamT)));if(G.jam<=0){$('#jam').hidden=true;showQ()}}}
let toastT=0;function toast(t){const el=$('#toast');el.textContent=t;el.style.opacity=1;clearTimeout(toastT);toastT=setTimeout(()=>el.style.opacity=0,2200)}
function bumpGold(){goldShown=Math.min(D.gold+G.gold,goldShown+1);$('#goldN').textContent=goldShown}

/* ================= HUD ================= */
function hud(){if(!G)return;$('#stgN').textContent=(G.boss?'👹 ':'')+'Stage '+G.stage;$('#stgBar').style.width=(100*G.killed/Math.max(1,G.total))+'%';
 $('#xpLv').textContent='Lv '+G.lvl;$('#xpBar').style.width=(100*G.xp/G.need)+'%';
 const q=$('#quiver');q.hidden=!G.stored;if(G.stored)q.textContent='🏹 '+G.stored+' ready'}

/* ================= power-up cards ================= */
function openCards(){G.cardsOpen=true;G.paused=true;G.pending--;SFX.lvl();
 const avail=Object.keys(POWERS).filter(k=>(G.pw[k]||0)<POWERS[k].max&&!(k==='gold'&&G.pw.gold));
 const wt=k=>({repair:G.wall.hp<G.wall.max*.5?4:.6,gold:.5,knight:G.pw.knight?1:1.6,cannon:G.pw.cannon?1:1.6,light:1.3}[k]||1);
 const pickW=pool=>{let s=pool.reduce((a,k)=>a+wt(k),0),r=rnd()*s;for(const k of pool){r-=wt(k);if(r<=0)return k}return pool[0]};
 const ch=[];let pool=avail.slice();while(ch.length<3&&pool.length){const k=pickW(pool);ch.push(k);pool=pool.filter(x=>x!==k)}
 const box=$('#pcs');box.innerHTML='';ch.forEach(k=>{const P=POWERS[k],l=G.pw[k]||0;const b=document.createElement('button');b.className='pc'+(l?'':' new');
  b.innerHTML=`<div class="ic">${P.ic}</div><div class="nm">${P.n}</div>${P.max<9?`<div class="lv">${l?'Level '+(l+1):'New!'}</div>`:''}<div class="ds">${esc(P.d(l))}</div>`;
  b.onclick=()=>takePower(k);box.appendChild(b)});
 show('cards');if(cfg().speak)say('Level up! Pick a power. '+ch.map(k=>POWERS[k].n).join('. '))}
function takePower(k){SFX.card();G.pw[k]=(G.pw[k]||0)+1;
 if(k==='arch'){G.archers.push({cd:.3,aim:0});layoutArchers()}
 if(k==='repair'){G.wall.max+=20;G.wall.hp=Math.min(G.wall.max,G.wall.hp+45);floatText(KX,WALLY-50,'+45','#7CF07C',24)}
 if(k==='cannon'&&G.pw.cannon===1)G.cannonT=1;
 hide('cards');G.cardsOpen=false;if(G.pending>0)setTimeout(()=>{if(G&&!G.over)openCards()},250);else G.paused=false}

/* ================= screens ================= */
function show(id){$('#'+id).hidden=false}function hide(id){$('#'+id).hidden=true}
function titleScreen(){G=null;const C=cfg();Music.on=false;hide('result');hide('shop');hide('pause');hide('cards');
 const nm=C.name;$('#tWho').textContent=(nm?nm+"'s castle · ":'')+'Stage '+D.stage+(D.best?' · Best '+D.best:'');
 $('#tPlay').innerHTML='⚔️ Battle! <small style="font-size:.6em;opacity:.8">Stage '+D.stage+'</small>';
 $('#tSubs').innerHTML=C.subj.map(s=>{const S=window.KW.subjects[s];return`<span>${S.em} ${S.n} · Lv ${eng(s).lv}</span>`}).join('');
 $('#tSet').hidden=!!HK;$('#tNote').textContent=HK?'Grown-ups pick subjects and levels in the Game Room.':'';
 $('#goldN').textContent=D.gold;$('#qWait').hidden=false;$('#qWait').textContent='Tap Battle to start!';
 show('title');save()}
function startRun(){audioInit();hide('title');hide('result');hide('shop');newRun(D.stage);goldShown=D.gold;$('#goldN').textContent=D.gold;
 resize();G.paused=false;Music.on=true;if(AC)Music.next=AC.currentTime+.1;
 $('#qWait').hidden=true;$('#jam').hidden=true;setCombo();showQ();
 banner('STAGE '+G.stage,G.boss?'Boss stage!':'Defend the wall!');kingSay(pick(KING_LINES.start),2.6);
 if(!D.seenHelp){D.seenHelp=true;setTimeout(()=>toast('Answer right to fire a volley! 🏹'),1600);if(cfg().speak)setTimeout(()=>say('Answer right to shoot arrows at the monsters!'),900)}}
function endRun(win){if(G.over)return;G.over=true;Music.on=false;$('#qWait').hidden=false;$('#qWait').textContent=win?'You did it!':'Oh no!';$('#jam').hidden=true;
 const st=G.stage;let earned=G.gold;
 if(win){D.stats.wins++;D.best=Math.max(D.best,st);D.stage=st+1;SFX.win();kingSay(pick(KING_LINES.win),4)}else{D.stats.losses++;SFX.lose();earned=Math.round(earned*.7)}
 const bonus=win?Math.round((12+st*4)*(1+.15*D.up.luck)*(st%5===0?2.5:1)):0;
 D.gold+=earned;save();
 setTimeout(()=>{const pc=G.wall.hp/G.wall.max,stars=win?(pc>.7?3:pc>.35?2:1):0;
  $('#rTitle').textContent=win?'STAGE '+st+' CLEARED!':'THE WALL FELL!';$('#rTitle').className=win?'':'lose';
  $('#stars').innerHTML=win?[0,1,2].map(i=>`<span class="${i<stars?'':'off'}">⭐</span>`).join(''):'<span>🧱💥</span>';
  $('#rLine').textContent=win?(st%5===0?'You beat Big Gary!':'The pudding is safe!'):'The goblins ate the pudding... Try again!';
  $('#rStats').innerHTML=`<div><b>${G.right}</b>right answers</div><div><b>${G.best}</b>best streak</div><div><b>${G.killed}</b>monsters</div><div><b>+${earned}</b>gold</div>`;
  const cb=$('#chestBox');cb.hidden=!win;$('#rGold').textContent='';const chest=$('#chest');chest.className='';chest.textContent=st%5===0?'🎁':'📦';chest.dataset.bonus=bonus;chest.dataset.open='';
  $('#rNext').textContent=win?'Next stage ▶':'Try again ↻';$('#rNext').disabled=win;$('#rNext').classList.toggle('pulse',!win);
  if(win){$('#rLine').textContent+=' Tap the chest!'}
  show('result');if(cfg().speak)say(win?'You won! Tap the chest!':'Oh no! Try again!')},win?1300:900)}
function openChest(){const c=$('#chest');if(c.dataset.open)return;c.dataset.open='1';const b=+c.dataset.bonus;c.classList.add('open');c.textContent='✨';SFX.lvl();
 let n=0;const iv=setInterval(()=>{n=Math.min(b,n+Math.ceil(b/12));$('#rGold').textContent='+'+n+' 🪙';SFX.coin();if(n>=b){clearInterval(iv);D.gold+=b;save();$('#rNext').disabled=false;$('#rNext').classList.add('pulse')}},70)}
function openShop(){const L=$('#shopList');L.innerHTML='';$('#shGold').textContent=D.gold;
 Object.keys(UPS).forEach(k=>{const U=UPS[k],l=D.up[k],max=l>=U.max,c=upCost(k);const d=document.createElement('div');d.className='up';
  d.innerHTML=`<div class="h"><span class="ic">${U.ic}</span><div><div class="nm">${U.n}</div><div class="lv">Level ${l}${max?' (max)':''}</div></div></div><div class="ds">${esc(U.d)}</div>`;
  const b=document.createElement('button');b.className='btn small'+(max?' ghost':'');b.textContent=max?'Maxed':'🪙 '+c;b.disabled=max||D.gold<c;b.onclick=()=>{if(D.gold<c||max)return;D.gold-=c;D.up[k]++;save();SFX.lvl();toast(U.ic+' '+U.n+' level '+D.up[k]+'!');openShop();$('#goldN').textContent=D.gold};
  d.appendChild(b);L.appendChild(d)});show('shop')}
function pause(on){if(!G||G.over)return;if(on){G.paused=true;Music.on=false;$('#pSnd').textContent=D.sound?'🔊 Sound on':'🔇 Sound off';$('#pMus').textContent=D.music?'🎵 Music on':'🎵 Music off';show('pause')}else{hide('pause');if(!G.cardsOpen)G.paused=false;Music.on=true;if(AC)Music.next=AC.currentTime+.1}}
/* grown-up settings when played outside the Game Room */
function openSetup(){const c=D.cfg,K=window.KW;
 $('#suSubj').innerHTML=Object.keys(K.subjects).map(s=>`<button class="chip${c.subj.includes(s)?' on':''}" data-s="${s}">${K.subjects[s].em} ${K.subjects[s].n}</button>`).join('');
 $('#suLv').innerHTML=c.subj.map(s=>{const S=K.subjects[s],l=c.lv[s]||1;return`<div class="lvrow"><span class="nm">${S.n}</span><button data-l="${s}" data-d="-1">−</button><b>${l}</b><button data-l="${s}" data-d="1">+</button><span class="d">${esc(S.lv[l-1])}</span></div>`}).join('');
 $('#suSpd').innerHTML=Object.keys(K.speeds).map(k=>`<button class="chip${c.speed===k?' on':''}" data-sp="${k}">${K.speeds[k]}</button>`).join('');
 $('#suSpk').innerHTML=`<button class="chip${c.speak?' on':''}" data-spk="1">On</button><button class="chip${!c.speak?' on':''}" data-spk="0">Off</button>`;
 show('setup')}
$('#setup').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const c=D.cfg,d=b.dataset;
 if(d.s){const i=c.subj.indexOf(d.s);if(i>=0){if(c.subj.length>1)c.subj.splice(i,1)}else c.subj.push(d.s)}
 else if(d.l){c.lv[d.l]=clamp((c.lv[d.l]||1)+(+d.d),1,MAXLV[d.l])}
 else if(d.sp)c.speed=d.sp;else if(d.spk)c.speak=d.spk==='1';else return;save();openSetup()});

/* ================= wiring ================= */
$('#tPlay').onclick=startRun;$('#tShop').onclick=()=>{audioInit();openShop()};$('#tSet').onclick=openSetup;$('#suX').onclick=()=>{hide('setup');titleScreen()};
$('#shDone').onclick=$('#shX').onclick=()=>{hide('shop');if($('#result').hidden)titleScreen()};
$('#rShop').onclick=openShop;$('#rNext').onclick=()=>{if($('#rNext').disabled)return;startRun()};$('#rHome').onclick=()=>{const c=$('#chest');if(!$('#chestBox').hidden&&!c.dataset.open){openChest()}titleScreen()};
$('#chest').onclick=openChest;$('#bPause').onclick=()=>pause(true);$('#pGo').onclick=()=>pause(false);
$('#pSnd').onclick=()=>{D.sound=!D.sound;applyVol();save();pause(true)};$('#pMus').onclick=()=>{D.music=!D.music;applyVol();save();pause(true)};
$('#pQuit').onclick=()=>{hide('pause');G.paused=false;G.wall.hp=0};
$('#qSay').onclick=()=>{audioInit();sayAgain()};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&G&&!G.over&&!G.paused)pause(true)});
let last=0;
function frame(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;
 if(G&&!G.paused&&!G.over){update(dt);tickQ(dt)}else if(G&&G.over)updateFx(dt);
 render();hud();Music.tick();requestAnimationFrame(frame)}
function updateFx(dt){for(const f of G.fx){if(f.delay>0){f.delay-=dt;continue}f.life-=dt;if(f.coin){f.life=0;continue}if(f.ring||f.stuck)continue;f.vy+=(f.g||0)*dt;f.x+=f.vx*dt;f.y+=f.vy*dt}G.fx=G.fx.filter(f=>f.life>0);for(const t of G.tx){t.life-=dt;t.y-=30*dt}G.tx=G.tx.filter(t=>t.life>0);if(G.shake>0)G.shake=Math.max(0,G.shake-dt*30);if(G.flash>0)G.flash-=dt}
function init(){load();cv=$('#cv');cx=cv.getContext('2d');resize();addEventListener('resize',()=>{resize()});
 if(window.ResizeObserver)new ResizeObserver(()=>resize()).observe($('#field'));
 titleScreen();requestAnimationFrame(frame)}
/* test hooks */
window.__kw={get G(){return G},get Q(){return Q},get D(){return D},answer,cfg,nextQ,genQ,eng,update,endRun,startRun,openShop,misspell,
 right(){if(!Q)return;const i=Q.opts.indexOf(Q.ans);revealT=0;[...$('#choices').children].forEach(b=>b.classList.remove('hide'));answer(i,$('#choices').children[i])},
 sim(stage,rate,acc,up,speed){const keep=JSON.stringify(D.up);Object.keys(D.up).forEach(k=>D.up[k]=Math.min(UPS[k].max,up));newRun(stage);if(speed)G.spd=SPEEDS[speed];G.paused=false;let t=0,nx=rate,an=0;const dt=1/30;
  while(!G.over&&t<600){update(dt);t+=dt;if(G.cardsOpen){const av=Object.keys(POWERS).filter(k=>(G.pw[k]||0)<POWERS[k].max);takePower(pick(av))}
   if(t>=nx){an++;if(rnd()<acc){G.combo++;addXp(1);if(G.combo%3===0)mega();volley(1);nx=t+rate}else{G.combo=0;nx=t+rate+G.jamT}}}
  const r={stage,win:G.wall.hp>0,wall:Math.round(G.wall.hp)+'/'+G.wall.max,t:Math.round(t),answers:an,gold:G.gold,lvl:G.lvl};D.up=JSON.parse(keep);G.over=true;return r},
 wrongA(){if(!Q)return;const i=Q.opts.findIndex(o=>o!==Q.ans);revealT=0;answer(i,$('#choices').children[i])}};
init();
