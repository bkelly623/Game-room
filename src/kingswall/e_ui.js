/* ================= question panel ================= */
let qShown=0,Q=null,qBusy=false,revealT=0,revealDur=0,goldShown=0;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function setCombo(){[...$('#combo').children].forEach((d,i)=>d.classList.toggle('on',G&&G.combo%3>i))}
function showQ(){if(!G||G.over)return;Q=nextQ();qBusy=false;const C=cfg();const S=window.KW.subjects[Q.s];
 $('#qSub').textContent=S.em+' '+S.n+' · Lv '+Q.lv+(Q.review?' · again':'');
 const p=Q.prompt;let h='';if(p.ask)h+=`<div class="ask">${esc(p.ask)}</div>`;
 if(p.pics)h+=`<div class="pics${[...p.pics].length<=2&&!/[0-9+]/.test(p.pics)?' solo':''}">${p.pics}</div>`;if(p.big2)h+=`<div class="big" style="font-size:calc(var(--k,1)*clamp(26px,5vh,44px))">${esc(p.big2)}</div>`;
 if(p.word)h+=`<div class="word">${esc(p.word)}</div>`;if(p.big)h+=`<div class="big"${Q.small?' style="font-size:calc(var(--k,1)*clamp(30px,6vh,52px))"':''}>${esc(p.big)}</div>`;if(p.sent)h+=`<div class="sent">${p.sent}</div>`;
 $('#qPrompt').innerHTML=h;
 const box=$('#choices');box.innerHTML='';Q.opts.forEach((o,i)=>{const b=document.createElement('button');b.className='ch'+(Q.kind==='pic'?' pic':Q.kind==='txt'?' txt':'');
  if(Q.word)b.style.fontFamily='Andika,Fredoka,sans-serif';if(Q.small&&Q.kind==='txt')b.style.fontSize='calc(var(--k,1)*clamp(15px,2.4vh,20px))';
  b.textContent=o;b.onpointerdown=ev=>{ev.preventDefault();answer(i,b)};box.appendChild(b)});
 $('#qSay').hidden=!(Q.say||Q.listen||C.speak);
 /* readers must read before the pictures show up */
 revealDur=Q.reveal?(Q.kind==='pic'?1.1:Q.listen?(C.strict?1.6:1):.7):(C.strict&&Q.s==='ma'?.8:0);revealT=revealDur;qShown=performance.now()+revealDur*1000;
 if(revealDur)[...box.children].forEach(b=>b.classList.add('hide'));$('#readBar').style.visibility=revealDur?'visible':'hidden';
 fitQ();
 if(Q.listen)setTimeout(()=>say(Q.say,Q.s==='sp'?.85:.8),150);else if(C.speak&&Q.s==='ma')setTimeout(()=>say(Q.say||''),150)}
/* make every answer button and the prompt fit, whatever the screen, zoom or fonts */
function qFits(){const qp=$('#qp'),r=qp.getBoundingClientRect(),pb=parseFloat(getComputedStyle(qp).paddingBottom)||0,c=$('#choices').getBoundingClientRect(),p=$('#qPrompt');
 if(c.bottom>r.bottom-pb+1||c.right>r.right+1)return false;if(p.scrollHeight>p.clientHeight+2||p.scrollWidth>p.clientWidth+2)return false;
 for(const b of $('#choices').children)if(b.scrollWidth>b.clientWidth+2||b.scrollHeight>b.clientHeight+2)return false;return true}
function fitQ(){const qp=$('#qp');if(!qp||!$('#choices').children.length)return;qp.classList.remove('tight');let k=1;qp.style.setProperty('--k',k);
 if(qFits())return;qp.classList.add('tight');for(let i=0;i<14&&!qFits();i++){k=Math.max(.4,k-.05);qp.style.setProperty('--k',k)}}
function sayAgain(){if(!Q)return;if(Q.listen||Q.s==='ma')say(Q.say||Q.fixSay);else if(cfg().speak&&Q.prompt.ask)say(Q.prompt.ask)}
function answer(i,b){if(!G||G.paused||G.over||qBusy||G.jam>0||revealT>0)return;audioInit();qBusy=true;const ok=Q.opts[i]===Q.ans;const btns=[...$('#choices').children];
 const ch=grade(Q,ok);try{window.__trk&&__trk.ans({s:Q.s,lv:Q.lv,it:Q.key,ok,ms:Math.max(0,performance.now()-qShown)});if(ch)window.__trk&&__trk.ev('lvl',{s:Q.s,to:eng(Q.s).lv,dir:ch})}catch(e){}
 if(ok&&G.strict&&G.hearts<3&&++G.heal>=5){G.heal=0;G.hearts++;SFX.heart();toast('❤️ Careful answers earned a heart back!');hearts(true)}
 if(ok){b.classList.add('ok');SFX.right();G.right++;G.combo++;G.best=Math.max(G.best,G.combo);addXp(1);setCombo();
  if(G.combo%3===0){mega();volley(1)}else volley(1);
  if(ch==='up')toast('⬆️ '+window.KW.subjects[Q.s].n+' level '+eng(Q.s).lv+'!');
  setTimeout(showQ,320)}
 else{b.classList.add('no');SFX.wrong();G.wrong++;G.combo=0;G.heal=0;setCombo();
  const zap=G.strict;if(zap){G.hearts--;G.bolt=.9;G.flash=.6;shake(16);SFX.thunder();kingSay(G.hearts>0?pick(['OUCH! Think first!','ZAP! No guessing!','My crown is smoking!']):'Too many guesses!',2.4);hearts(true);if(G.hearts<=0){G.jam=99;say('Zap! Too many guesses. Think, then tap!');setTimeout(()=>{if(G&&!G.over){G.zapped=true;endRun(false)}},1300);save();return}}btns.forEach(x=>{if(Q.opts[btns.indexOf(x)]===Q.ans)x.classList.add('ok');else if(x!==b)x.classList.add('dim')});
  G.jam=G.jamT;say(Q.fixSay||'');
  setTimeout(()=>{if(!G||G.over)return;const j=$('#jam');j.hidden=false;j.innerHTML=`<div class="t1">${zap?'⚡ ZAP! Lost a heart':'🪢 Bow tangled!'}</div>${zap?`<div style="font-size:26px">${'❤️'.repeat(G.hearts)}${'🖤'.repeat(3-G.hearts)}</div>`:''}<div class="t2">${esc(Q.fix).replace(esc(Q.ans),'<b>'+esc(Q.ans)+'</b>')}</div><svg class="ring" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="5"/><circle id="jamArc" cx="20" cy="20" r="16" fill="none" stroke="#FFC93C" stroke-width="5" stroke-linecap="round" transform="rotate(-90 20 20)" stroke-dasharray="100.5" stroke-dashoffset="0"/></svg>`},450);
  if(ch==='down')setTimeout(()=>toast('Practice time: level '+eng(Q.s).lv),900)}
 save()}
function tickQ(dt){if(!G||G.paused||G.over)return;
 if(revealT>0){revealT-=dt;$('#readBar i').style.width=(100*(1-revealT/revealDur))+'%';if(revealT<=0){[...$('#choices').children].forEach(b=>b.classList.remove('hide'));$('#readBar').style.visibility='hidden'}}
 if(G.jam>0){G.jam-=dt;const a=$('#jamArc');if(a)a.setAttribute('stroke-dashoffset',String(100.5*(1-Math.max(0,G.jam)/G.jamT)));if(G.jam<=0){$('#jam').hidden=true;showQ()}}}
let toastT=0;function toast(t){const el=$('#toast');el.textContent=t;el.style.opacity=1;clearTimeout(toastT);toastT=setTimeout(()=>el.style.opacity=0,2200)}
function bumpGold(){goldShown=Math.min(D.gold+G.gold,goldShown+1);$('#goldN').textContent=goldShown}

/* ================= HUD ================= */
function hearts(bump){const h=$('#hearts');if(!G||!G.strict){h.hidden=true;return}h.hidden=false;h.innerHTML='❤️'.repeat(Math.max(0,G.hearts))+'<span class="off">'+'🖤'.repeat(3-Math.max(0,G.hearts))+'</span>';if(bump){h.classList.remove('bump');void h.offsetWidth;h.classList.add('bump')}}
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
function ssGet(k){try{return sessionStorage.getItem(k)}catch(e){return '1'}}
function titleScreen(){G=null;if(!HK&&!curProfile()){openPlayers(true);return}if(!HK&&curProfile().name==='Player 1'&&!ssGet('kw.named')){try{sessionStorage.setItem('kw.named','1')}catch(e){}openPlayers(false);const p=curProfile();renaming=p.id;firstName=true;pickEm=p.em;[...$('#plEm').children].forEach(c=>c.classList.toggle('on',c.dataset.em===pickEm));$('#plName').value='';$('#plName').placeholder='What\'s your name?';$('#plAdd').textContent='Save name';toast('Give your castle a name!');return}const C=cfg();Music.on=false;['result','shop','pause','cards','board','players','confirm'].forEach(hide);
 const nm=C.name,started=D.stage>1||D.gold>0||D.best>0;
 $('#tWho').innerHTML=HK?esc((nm?nm+"'s castle":'Your castle')+(D.best?' · Best stage '+D.best:'')):'Playing as <b>'+esc(nm)+'</b> · <button id="tChange">change player</button>';
 if(!HK)$('#tChange').onclick=()=>openPlayers(false);
 $('#tPlay').innerHTML=started?'▶ Continue <small style="font-size:.6em;opacity:.85">Stage '+D.stage+'</small>':'⚔️ Start!';
 $('#tNew').hidden=!started;
 $('#tSubs').innerHTML=C.subj.map(s=>{const S=window.KW.subjects[s];return`<span>${S.em} ${S.n} · Lv ${eng(s).lv}</span>`}).join('');
 $('#tSet').hidden=!!HK;$('#tNote').textContent=HK?'Grown-ups pick subjects and levels in the Game Room.':'';
 $('#goldN').textContent=D.gold;$('#qWait').hidden=false;$('#qWait').textContent='Tap Start to play!';
 show('title');save()}
/* confirm box */
function ask(t,p,yes){$('#cfYes').textContent='Start over';$('#cfT').textContent=t;$('#cfP').textContent=p;$('#cfYes').onclick=()=>{hide('confirm');yes()};$('#cfNo').onclick=()=>hide('confirm');show('confirm')}
function askNewGame(){const nm=cfg().name;ask('Start a new game?',(nm?nm+"'s":'Your')+' castle goes back to Stage 1 with no gold or upgrades. Learning levels stay the same.',()=>{newGame();SFX.card();toast('New castle! Stage 1');titleScreen()})}
/* leaderboard */
function boardRows(cb){const rows=[];
 if(HK){let h={};try{h=JSON.parse(window.__hubRaw('hub.v1')||'{}')}catch(e){}
  (h.kids||[]).filter(k=>(k.games||[]).includes('kingswall')).forEach(k=>{const s=k.id===HK.id?D:readSave('kid.'+k.id+'::kingswall.v1');rows.push({id:k.id,name:k.name,em:k.emoji,best:s?s.best||0:0,stage:s?s.stage||1:1,kills:s&&s.stats?s.stats.kills||0:0,me:k.id===HK.id})});
  let done=false;const fin=()=>{if(!done){done=true;cb(rows)}};setTimeout(fin,2500);
  try{fetch('/api/board').then(r=>r.json()).then(j=>{for(const id in (j.kids||{})){const r=rows.find(x=>x.id===id);if(r)r.best=Math.max(r.best,j.kids[id].best||0)}fin()}).catch(fin)}catch(e){fin()}}
 else{PROF.list.forEach(p=>{const s=p.id===PROF.cur?D:readSave('kingswall.v1.'+p.id);rows.push({id:p.id,name:p.name,em:p.em,best:s?s.best||0:0,stage:s?s.stage||1:1,kills:s&&s.stats?s.stats.kills||0:0,me:p.id===PROF.cur})});cb(rows)}}
function openBoard(){$('#bdList').innerHTML='<p class="sub">Loading…</p>';show('board');
 boardRows(rows=>{rows.sort((a,b)=>b.best-a.best||b.kills-a.kills);const med=['🥇','🥈','🥉'];
  $('#bdSub').textContent=HK?'Highest stage beaten. Updates when you play.':'Highest stage beaten on this device';
  $('#bdList').innerHTML=rows.length?rows.map((r,i)=>`<div class="lb${r.me?' me':''}"><span class="rk">${r.best?med[i]||i+1:'–'}</span><span class="em">${esc(r.em||'🛡️')}</span><span class="nm">${esc(r.name)}<small>${r.kills} monsters bonked</small></span><span class="st">${r.best||0}<small>best stage</small></span></div>`).join(''):'<p class="sub">No players yet.</p>'})}
/* players (only when King's Wall is played outside the Game Room) */
const PEMO=['🛡️','🦊','🐺','🐸','🦁','🐯','🐻','🐲','🦄','🤖','👑','🚀'];let pickEm='🦊',renaming=null,firstName=false;
function openPlayers(first){['title','board','confirm'].forEach(hide);
 $('#plX').hidden=!!first||!PROF.list.length;
 $('#plList').innerHTML=PROF.list.map(p=>{const s=readSave('kingswall.v1.'+p.id);return`<div class="pl"><button class="go${p.id===PROF.cur?' on':''}" data-pick="${p.id}"><span>${esc(p.em)}</span><b>${esc(p.name)}</b><small>Stage ${s?s.stage||1:1}</small></button><button class="del" data-ren="${p.id}" aria-label="Rename ${esc(p.name)}">✏️</button><button class="del" data-del="${p.id}" aria-label="Remove ${esc(p.name)}">🗑</button></div>`}).join('');
 $('#plEm').innerHTML=PEMO.map(e=>`<button class="chip${e===pickEm?' on':''}" data-em="${e}">${e}</button>`).join('');
 $('#plName').value='';$('#plName').placeholder='Name';renaming=null;$('#plAdd').textContent='Start a new castle';show('players');if(!PROF.list.length)setTimeout(()=>$('#plName').focus(),100)}
function switchPlayer(id){save();PROF.cur=id;saveProfiles();KEY='kingswall.v1.'+id;load();titleScreen()}
$('#players').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.pick){SFX.tap();switchPlayer(d.pick)}
 else if(d.ren){const p=PROF.list.find(x=>x.id===d.ren);renaming=p.id;$('#plName').value=p.name;pickEm=p.em;[...$('#plEm').children].forEach(c=>c.classList.toggle('on',c.dataset.em===pickEm));$('#plAdd').textContent='Save name';$('#plName').focus()}
 else if(d.em){pickEm=d.em;[...$('#plEm').children].forEach(c=>c.classList.toggle('on',c.dataset.em===pickEm))}
 else if(d.del){const p=PROF.list.find(x=>x.id===d.del);hide('players');ask('Remove '+p.name+'?','Their castle and progress on this device will be erased.',()=>{try{localStorage.removeItem('kingswall.v1.'+p.id)}catch(e){}PROF.list=PROF.list.filter(x=>x!==p);if(PROF.cur===p.id){PROF.cur=PROF.list[0]?PROF.list[0].id:null}saveProfiles();setupProfiles();load();openPlayers(!PROF.list.length)});$('#cfYes').textContent='Remove';$('#cfNo').onclick=()=>{hide('confirm');openPlayers(false)}}});
$('#plAdd').onclick=()=>{const n=$('#plName').value.trim().replace(/\s+/g,' ');if(!n){$('#plName').focus();toast('Type a name first');return}
 if(PROF.list.some(p=>p.id!==renaming&&p.name.toLowerCase()===n.toLowerCase())){toast(n+' already has a castle');return}
 if(renaming){const p=PROF.list.find(x=>x.id===renaming);renaming=null;if(p){p.name=n;p.em=pickEm;saveProfiles()}if(firstName){firstName=false;titleScreen()}else openPlayers(false);return}
 save();const id='p'+Date.now().toString(36);PROF.list.push({id,name:n,em:pickEm});PROF.cur=id;saveProfiles();KEY='kingswall.v1.'+id;load();SFX.lvl();titleScreen()};
$('#plName').addEventListener('keydown',e=>{if(e.key==='Enter')$('#plAdd').click()});
$('#plX').onclick=()=>{hide('players');titleScreen()};$('#bdX').onclick=()=>{hide('board');titleScreen()};
function startRun(){audioInit();hide('title');hide('result');hide('shop');newRun(D.stage);goldShown=D.gold;$('#goldN').textContent=D.gold;
 resize();G.paused=false;Music.on=true;if(AC)Music.next=AC.currentTime+.1;
 $('#qWait').hidden=true;$('#jam').hidden=true;setCombo();hearts();showQ();
 if(G.strict)setTimeout(()=>{toast('⚡ Guess and the lightning gets the King! 3 hearts.');if(cfg().speak)say('Be careful! Wrong answers make lightning zap the King. Think, then tap.')},2600);
 banner('STAGE '+G.stage,G.boss?'Boss stage!':'Defend the wall!');kingSay(pick(KING_LINES.start),2.6);
 if(!D.seenHelp){D.seenHelp=true;setTimeout(()=>toast('Answer right to fire a volley! 🏹'),1600);if(cfg().speak)setTimeout(()=>say('Answer right to shoot arrows at the monsters!'),900)}}
function endRun(win){if(G.over)return;G.over=true;Music.on=false;$('#qWait').hidden=false;$('#qWait').textContent=win?'You did it!':'Oh no!';$('#jam').hidden=true;
 const st=G.stage;let earned=G.gold;const prevBest=D.best||0;
 if(win){D.stats.wins++;D.best=Math.max(D.best,st);D.stage=st+1;SFX.win();kingSay(pick(KING_LINES.win),4)}else{D.stats.losses++;SFX.lose();earned=Math.round(earned*.7)}
 const bonus=win?Math.round((12+st*4)*(1+.15*D.up.luck)*(st%5===0?2.5:1)):0;
 D.gold+=earned;save();
 try{if(window.__trk){__trk.ev('stage',{st,win:win?1:0,right:G.right,wrong:G.wrong,wall:Math.round(100*G.wall.hp/G.wall.max),dur:Math.round(G.t),lvl:G.lvl});if(win&&st>prevBest)__trk.ev('kwbest',{st})}}catch(e){}
 setTimeout(()=>{const pc=G.wall.hp/G.wall.max,stars=win?(pc>.7?3:pc>.35?2:1):0;
  $('#rTitle').textContent=win?'STAGE '+st+' CLEARED!':'THE WALL FELL!';$('#rTitle').className=win?'':'lose';
  $('#stars').innerHTML=win?[0,1,2].map(i=>`<span class="${i<stars?'':'off'}">⭐</span>`).join(''):G.zapped?'<span>⚡👑💨</span>':'<span>🧱💥</span>';
  $('#rLine').textContent=win?(st%5===0?'You beat Big Gary!':'The pudding is safe!'):G.zapped?'⚡ The lightning got the King! Think before you tap.':'The goblins ate the pudding... Try again!';
  $('#rStats').innerHTML=`<div><b>${G.right}</b>right answers</div><div><b>${G.best}</b>best streak</div><div><b>${G.killed}</b>monsters</div><div><b>+${earned}</b>gold</div>`;
  const cb=$('#chestBox');cb.hidden=!win;$('#rGold').textContent='';const chest=$('#chest');chest.className='';chest.textContent=st%5===0?'🎁':'📦';chest.dataset.bonus=bonus;chest.dataset.open='';
  $('#rNext').textContent=win?'Next stage ▶':'Try again ↻';$('#rNext').disabled=false;$('#rNext').classList.add('pulse');
  if(win){$('#rLine').textContent+=' Tap the chest!'}
  show('result');if(cfg().speak)say(win?'You won! Tap the chest!':G.zapped?'The lightning got the King. Think before you tap! Try again.':'Oh no! Try again!')},win?1300:900)}
function openChest(){const c=$('#chest');if(c.dataset.open)return;c.dataset.open='1';const b=+c.dataset.bonus;D.gold+=b;save();c.classList.add('open');c.textContent='✨';SFX.lvl();
 let n=0;const iv=setInterval(()=>{n=Math.min(b,n+Math.ceil(b/12));$('#rGold').textContent='+'+n+' 🪙';SFX.coin();if(n>=b)clearInterval(iv)},70)}
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
 $('#suStr').innerHTML=`<button class="chip${c.strict?' on':''}" data-str="1">On</button><button class="chip${!c.strict?' on':''}" data-str="0">Off</button>`;
 $('#suSpk').innerHTML=`<button class="chip${c.speak?' on':''}" data-spk="1">On</button><button class="chip${!c.speak?' on':''}" data-spk="0">Off</button>`;
 show('setup')}
$('#setup').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const c=D.cfg,d=b.dataset;
 if(d.s){const i=c.subj.indexOf(d.s);if(i>=0){if(c.subj.length>1)c.subj.splice(i,1)}else c.subj.push(d.s)}
 else if(d.l){c.lv[d.l]=clamp((c.lv[d.l]||1)+(+d.d),1,MAXLV[d.l])}
 else if(d.str)c.strict=d.str==='1';else if(d.sp)c.speed=d.sp;else if(d.spk)c.speak=d.spk==='1';else return;save();openSetup()});

/* ================= wiring ================= */
$('#tPlay').onclick=startRun;$('#tNew').onclick=askNewGame;$('#tBoard').onclick=openBoard;$('#tShop').onclick=()=>{audioInit();openShop()};$('#tSet').onclick=openSetup;$('#suX').onclick=()=>{hide('setup');titleScreen()};
$('#shDone').onclick=$('#shX').onclick=()=>{hide('shop');if($('#result').hidden)titleScreen()};
$('#rShop').onclick=openShop;$('#rNext').onclick=()=>{const c=$('#chest');if(!$('#chestBox').hidden&&!c.dataset.open)openChest();startRun()};$('#rHome').onclick=()=>{try{window.__trk&&__trk.flush(false)}catch(e){}const c=$('#chest');if(!$('#chestBox').hidden&&!c.dataset.open){openChest()}titleScreen()};
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
function init(){setupProfiles();load();cv=$('#cv');cx=cv.getContext('2d');resize();addEventListener('resize',()=>{resize();fitQ()});try{document.fonts&&document.fonts.ready.then(fitQ);document.fonts&&document.fonts.addEventListener&&document.fonts.addEventListener('loadingdone',fitQ)}catch(e){}
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
