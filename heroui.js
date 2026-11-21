/* Shelf pieces for the Hero layer: hero card, Hero Room (moves + gear), Brothers League, hero alerts. */
(function(){
'use strict';
var H=window.HERO;if(!H)return;H.css();
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var CSS='.hcard{--c:#E8742E;display:grid;grid-template-columns:auto 1fr;gap:14px 18px;align-items:center;background:linear-gradient(150deg,color-mix(in srgb,var(--c) 38%,#221C4E),#221C4E 70%);border:2px solid color-mix(in srgb,var(--c) 55%,#3E3584);border-radius:24px;padding:14px 18px;margin:0 0 18px;box-shadow:0 8px 0 rgba(0,0,0,.25)}'+
'.hcard .hav{width:112px;height:130px;cursor:pointer}.hcard h2{margin:0;font:400 clamp(20px,3.6vw,28px)/1.1 var(--display);color:#fff}.hcard .ttl{color:var(--gold);font-weight:700;font-size:14px;letter-spacing:.04em;text-transform:uppercase}'+
'.hbar{height:14px;border-radius:99px;background:#15103A;border:2px solid #3E3584;overflow:hidden;margin:6px 0 4px}.hbar i{display:block;height:100%;background:linear-gradient(90deg,#FFD23F,#FF9F1C);border-radius:99px;transition:width .6s}.hstats{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:14px;color:var(--ink2)}.hstats b{color:#fff}'+
'.hmis{grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}.hm{background:rgba(0,0,0,.22);border-radius:14px;padding:8px 10px;font-size:13px;color:var(--ink2)}.hm b{color:#fff;display:block;font-size:14px}.hm.done{background:rgba(62,219,138,.18);color:#BFF5D8}.hm.done b::after{content:" ✓";color:var(--good)}.hm .hbar{height:9px;margin:5px 0 0;border-width:1px}.hm .hbar i{background:linear-gradient(90deg,#3EDB8A,#7FDBFF)}'+
'.hbtns{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:10px}.hbtns .btn{font-size:15px;padding:9px 14px}.chestbtn{animation:hPulse 1.1s ease-in-out infinite}@keyframes hPulse{50%{transform:scale(1.06)}}'+
'.hroom{position:fixed;inset:0;z-index:50;background:#0E0B24;overflow:auto;overscroll-behavior:contain;padding:max(14px,env(safe-area-inset-top)) 14px 30px}.hroom .in{max-width:860px;margin:0 auto}.hroom .top{display:flex;align-items:center;gap:12px;margin-bottom:10px}.hroom .top h1{flex:1;margin:0;font:400 clamp(22px,4vw,34px) var(--display);color:#fff}'+
'.hstage{display:flex;justify-content:center;padding:26px 0 10px;background:radial-gradient(circle at 50% 60%,rgba(255,210,63,.18),transparent 60%);border-radius:24px}.hstage .hav{width:190px;height:222px;cursor:pointer}'+
'.hsec{font:400 16px var(--display);color:var(--gold);margin:18px 0 8px;letter-spacing:.05em}.hgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:10px}'+
'.hit{position:relative;background:#221C4E;border:2px solid #3E3584;border-radius:16px;padding:8px;text-align:center;font-size:13px;color:var(--ink2);cursor:pointer}.hit .hav{width:70px;height:82px}.hit b{display:block;color:#fff;font-size:13px;margin-top:2px}.hit.on{border-color:var(--gold);box-shadow:0 0 0 3px rgba(255,210,63,.3)}.hit.locked{opacity:.45;filter:grayscale(.8);cursor:default}.hit .tag{display:inline-block;margin-top:4px;border-radius:99px;padding:2px 8px;background:#15103A;font-weight:700}.hit .tag.buy{background:var(--gold);color:#2A1E00}'+
'.htabs{display:flex;flex-wrap:wrap;gap:6px}.htabs button{border:2px solid #3E3584;background:#221C4E;border-radius:99px;padding:6px 12px;font:600 14px var(--body)}.htabs button.on{background:var(--gold);color:#2A1E00;border-color:var(--gold)}'+
'.mv{border:2px solid #3E3584;background:#2D2663;border-radius:14px;padding:10px 8px;font:700 14px var(--body);color:#fff}.mv.locked{opacity:1;color:#8C84B8;background:#1A1540;border-style:dashed}.mv.locked small{color:#6E66A0}.mv small{display:block;font-weight:600;color:var(--ink2)}'+
'.league{background:#1C1745;border:2px solid #3E3584;border-radius:24px;padding:14px 16px;margin:26px auto 0;max-width:720px;text-align:left}.league h2{margin:0 0 2px;font:400 clamp(18px,3vw,24px) var(--display);color:var(--gold)}.league .sub{font-size:13px;color:var(--ink2);margin-bottom:10px}'+
'.lrow{display:grid;grid-template-columns:34px 54px 1fr auto;align-items:center;gap:10px;padding:6px 8px;border-radius:16px}.lrow+.lrow{margin-top:4px}.lrow.me{background:rgba(255,210,63,.1)}.lrow .rk{font:400 22px var(--display);text-align:center;color:#fff}.lrow .hav{width:50px;height:58px}.lrow .em{font-size:38px;text-align:center}.lrow .nm b{color:#fff;font-size:17px}.lrow .nm small{display:block;color:var(--ink2);font-size:12.5px}.lrow .xp{font:400 20px var(--display);color:#fff;text-align:right}.lrow .xp small{display:block;font:600 11px var(--body);color:var(--ink2)}'+
'.hpop{position:fixed;left:50%;top:18%;transform:translate(-50%,0);z-index:60;background:#221C4E;border:3px solid var(--gold);border-radius:24px;padding:20px 26px;text-align:center;max-width:min(92vw,420px);box-shadow:0 20px 60px rgba(0,0,0,.6);animation:hIn .4s cubic-bezier(.2,1.4,.4,1)}.hpop h2{margin:6px 0;font:400 26px var(--display);color:var(--gold)}.hpop p{margin:0 0 14px;color:#fff}@keyframes hIn{from{transform:translate(-50%,30px) scale(.7);opacity:0}}'+
'@media (max-width:520px){.hcard{grid-template-columns:auto 1fr;padding:12px}.hcard .hav{width:84px;height:98px}}';
var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);

function av(look,cls){return '<div class="hav'+(cls?' '+cls:'')+'">'+H.svg(look)+'</div>'}
function itemLook(base,slot,id){var l=JSON.parse(JSON.stringify(base));if(slot==='skin')l.skin=id;else{['hat','face','back','hand','pet','aura'].forEach(function(s){l[s]=''});l[slot]=id}return l}
function randMove(h,el){var m=h.moves[Math.floor(Math.random()*h.moves.length)]||'wave';H.doMove(el,m)}
function pop(title,txt,look){var d=document.createElement('div');d.className='hpop';d.innerHTML=(look?av(look):'')+'<h2>'+esc(title)+'</h2><p>'+esc(txt)+'</p><button class="btn">Awesome!</button>';if(look){d.querySelector('.hav').style.cssText='width:120px;height:140px'}
 document.body.appendChild(d);d.querySelector('button').onclick=function(){d.remove()};H.tone('level');if(look)setTimeout(function(){H.doMove(d.querySelector('.hav'),'jump')},300)}

/* ---------- hero card on the shelf ---------- */
function card(k,onChange){var h=H.load(k.id),L=H.lvOf(h.xp),base=H.lvBase(L),next=H.lvBase(L+1),pct=Math.round((h.xp-base)/(next-base)*100);
 var ms=H.missionsOf(k.id),min=Math.floor(h.today.sec/60),prev=0;
 var mis=ms.map(function(g,i){var done=h.today.m.length>i,have=Math.max(0,Math.min(g-prev,min-prev)),need=g-prev;prev=g;
   var name=ms.length===1?'Daily mission':(H.schedOf(k.id)==='home'&&ms.length===3?['Morning mission','Midday mission','Afternoon mission'][i]:'Mission '+(i+1));
   return '<div class="hm'+(done?' done':'')+'"><b>'+esc(name)+'</b>'+(done?'Done! +100 XP':have+' of '+need+' min')+'<div class="hbar"><i style="width:'+Math.round(have/need*100)+'%"></i></div></div>'}).join('');
 var chestReady=h.today.m.length>=ms.length&&!h.today.chest;
 var el=document.createElement('div');el.className='hcard';el.style.setProperty('--c',h.look.skin);
 el.innerHTML=av(h.look)+'<div><div class="ttl">'+esc(H.titleOf(L))+' · Level '+L+'</div><h2>'+esc(k.name)+'</h2><div class="hbar"><i style="width:'+pct+'%"></i></div>'+
  '<div class="hstats"><span><b>'+(h.xp-base)+'</b> / '+(next-base)+' XP to Level '+(L+1)+'</span><span>🪙 <b>'+h.coins+'</b></span><span>🔥 <b>'+(h.streak.n||0)+'</b> day streak</span><span>⚡ <b>'+h.today.right+'</b> right today</span></div></div>'+
  '<div class="hmis">'+mis+'</div><div class="hbtns">'+(chestReady?'<button class="btn chestbtn" data-h="chest">🎁 Open treasure chest</button>':'')+'<button class="btn ghost" data-h="room">🧑‍🚀 Hero Room</button><button class="btn ghost" data-h="alerts" hidden>🔔 Turn on hero alerts</button></div>';
 var a=el.querySelector('.hav');a.title='Tap me!';a.onclick=function(){randMove(h,a)};
 el.querySelector('[data-h="room"]').onclick=function(){room(k,onChange)};
 var cb=el.querySelector('[data-h="chest"]');if(cb)cb.onclick=function(){var r=H.openChest(k.id);if(r){var h2=H.load(k.id);pop('Treasure!',r.txt,h2.look);onChange&&onChange()}};
 alertsBtn(k,el.querySelector('[data-h="alerts"]'));
 showNews(k,h);return el}
function showNews(k,h){var L=H.lvOf(h.xp);if(h.seenLv==null)h.seenLv=1;if(L>h.seenLv){var mv=H.MOVES.filter(function(m){return m.lv>h.seenLv&&m.lv<=L}).map(function(m){return m.n}),it=H.ITEMS.filter(function(i){return i.lv>h.seenLv&&i.lv<=L}).map(function(i){return i.n});
  h.seenLv=L;H.save(k.id,h);setTimeout(function(){pop('Level '+L+'!',(mv.length?'New move'+(mv.length>1?'s':'')+': '+mv.join(', ')+'. ':'')+(it.length?'New gear in the Hero Room: '+it.join(', ')+'.':'')||'Your hero got stronger!',h.look)},500)}return;var seen=+(sessionStorage.getItem('hero.seen.'+k.id)||0)||(h.news.length?h.news[h.news.length-1].t-1:0);var fresh=(h.news||[]).filter(function(n){return n.t>seen&&n.k==='lv'});
 try{sessionStorage.setItem('hero.seen.'+k.id,String(Date.now()))}catch(e){}if(fresh.length){var n=fresh[fresh.length-1];setTimeout(function(){pop('Level '+n.lv+'!',n.txt.replace(/^LEVEL \d+!\s*/,'')||'Your hero got stronger.',h.look)},500)}}

/* ---------- Hero Room ---------- */
var tab='hat';
function room(k,onChange){var old=document.querySelector('.hroom');if(old)old.remove();var h=H.load(k.id),L=H.lvOf(h.xp);
 var d=document.createElement('div');d.className='hroom';
 var mv=H.MOVES.map(function(m){var ok=h.moves.indexOf(m.id)>=0;return '<button class="mv'+(ok?'':' locked')+'" data-mv="'+m.id+'"'+(ok?'':' disabled')+'>'+esc(m.n)+'<small>'+(ok?'Tap to do it':'Level '+m.lv)+'</small></button>'}).join('');
 var tabs=H.SLOTS.map(function(s){return '<button data-tab="'+s[0]+'" class="'+(tab===s[0]?'on':'')+'">'+s[1]+'</button>'}).join('');
 var items;if(tab==='skin')items=H.SKINS.map(function(s){var ok=L>=s[2],on=h.look.skin===s[0];return '<div class="hit'+(on?' on':'')+(ok?'':' locked')+'" data-skin="'+s[0]+'">'+av(itemLook(h.look,'skin',s[0]))+'<b>'+esc(s[1])+'</b><span class="tag">'+(on?'Wearing':ok?'Wear':'Level '+s[2])+'</span></div>'}).join('');
 else items=H.ITEMS.filter(function(i){return i.s===tab}).map(function(i){var own=h.owned.indexOf(i.id)>=0,on=h.look[i.s]===i.id,unl=L>=i.lv,afford=h.coins>=i.c;
   return '<div class="hit'+(on?' on':'')+(own||unl?'':' locked')+'" data-it="'+i.id+'">'+av(itemLook(h.look,i.s,i.id))+'<b>'+esc(i.n)+'</b><span class="tag'+(!own&&unl&&afford?' buy':'')+'">'+(on?'Wearing ✓':own?'Wear':unl?'🪙 '+i.c+(afford?' Buy':' (need more)'):'Level '+i.lv)+'</span></div>'}).join('');
 d.innerHTML='<div class="in"><div class="top"><h1>'+esc(k.name)+'’s Hero Room</h1><button class="btn ghost" data-x>Done</button></div>'+
  '<div class="hstage">'+av(h.look)+'</div><div class="hstats" style="justify-content:center;margin-top:8px"><span>Level <b>'+L+'</b> '+esc(H.titleOf(L))+'</span><span>🪙 <b>'+h.coins+'</b> coins</span><span>Right answers earn XP and coins. Wrong guesses earn nothing.</span></div>'+
  '<div class="hsec">MOVES</div><div class="hgrid">'+mv+'</div><div class="hsec">GEAR</div><div class="htabs">'+tabs+'</div><div class="hgrid" style="margin-top:10px">'+items+'</div></div>';
 document.body.appendChild(d);var stage=d.querySelector('.hstage .hav');stage.onclick=function(){randMove(h,stage)};
 d.onclick=function(e){var t=e.target.closest('[data-x],[data-mv],[data-tab],[data-it],[data-skin]');if(!t)return;
  if(t.hasAttribute('data-x')){d.remove();onChange&&onChange();return}
  if(t.dataset.mv){H.doMove(stage,t.dataset.mv);return}
  if(t.dataset.tab){tab=t.dataset.tab;room(k,onChange);return}
  if(t.dataset.skin){if(H.equip(k.id,'skin',t.dataset.skin)){H.tone('coin');room(k,onChange)}return}
  if(t.dataset.it){var id=t.dataset.it;if(h.owned.indexOf(id)>=0){H.equip(k.id,tab,id);room(k,onChange);return}
   if(H.buy(k.id,id)){H.tone('coin');room(k,onChange);setTimeout(function(){var s=document.querySelector('.hroom .hstage .hav');H.doMove(s,'jump')},200)}}}}

/* ---------- Brothers League ---------- */
var leagueCache=null;
function league(box,kids,meId){if(!box)return;var list=kids.filter(function(k){return!k.tester});if(list.length<2){box.hidden=true;return}
 function draw(j){var wk=H.weekId(),rows=list.map(function(k){var h=H.load(k.id),s=j&&j.kids&&j.kids[k.id]||null;var local=h.wk.id===wk?h.wk.xp:0;var srv=s&&s.wk===wk?s.wxp:0;
   var lv=Math.max(H.lvOf(h.xp),s&&s.lv||0);var look=h.xp>=(s&&s.xp||0)?h.look:(s.look||h.look);var used=h.xp>0||(s&&s.xp>0);
   return{k:k,xp:Math.max(local,srv),lv:lv,look:look,used:used,streak:Math.max(h.streak.n||0,s&&s.streak||0)}}).sort(function(a,b){return b.xp-a.xp});
  var champ=j&&j.champ,now=new Date(),end=new Date(now);end.setDate(now.getDate()+((7-now.getDay())%7));end.setHours(23,59,0,0);var days=Math.round((end-now)/864e5);
  box.hidden=false;box.innerHTML='<h2>🏆 BROTHERS LEAGUE</h2><div class="sub">Right answers and focused play earn XP. Most XP by Sunday night wins the week'+(days>0?' · '+days+' day'+(days===1?'':'s')+' left':' · ends tonight!')+(j&&j.prize?' · Prize: <b style="color:#fff">'+esc(j.prize)+'</b>':'')+(champ&&champ.name?' · Last week: 👑 '+esc(champ.name):'')+'</div>'+
   rows.map(function(r,i){return '<div class="lrow'+(r.k.id===meId?' me':'')+'"><div class="rk">'+(r.xp?['🥇','🥈','🥉'][i]||(i+1):'·')+'</div>'+(r.used?av(r.look):'<div class="em">'+esc(r.k.emoji)+'</div>')+'<div class="nm"><b>'+esc(r.k.name)+'</b><small>Level '+r.lv+(r.streak>1?' · 🔥 '+r.streak+' days':'')+'</small></div><div class="xp">'+r.xp.toLocaleString()+'<small>XP this week</small></div></div>'}).join('')}
 draw(leagueCache);fetch('api/league',{cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(j){if(j){leagueCache=j;draw(j)}}).catch(function(){})}

/* ---------- hero alerts (web push) ---------- */
function b64u(s){var p='='.repeat((4-s.length%4)%4),b=atob((s+p).replace(/-/g,'+').replace(/_/g,'/')),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a}
function pushOk(){return 'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window}
function isIOS(){return /iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
function standalone(){return matchMedia('(display-mode: standalone)').matches||navigator.standalone}
function alertsBtn(k,b){if(!b||k.tester)return;var key='hero.push.'+k.id;var on=localStorage.getItem(key)==='1'&&pushOk()&&Notification.permission==='granted';
 if(on){b.hidden=true;return}
 if(!pushOk()){if(isIOS()&&!standalone()){b.hidden=false;b.textContent='🔔 Get hero alerts';b.onclick=function(){pop('Hero alerts on iPhone/iPad','Tap the Share button, then “Add to Home Screen”. Open the Game Room from the new icon and tap this button again.')}}return}
 if(Notification.permission==='denied')return;
 b.hidden=false;b.onclick=function(){subscribe(k).then(function(ok){if(ok){localStorage.setItem(key,'1');b.hidden=true;pop('Alerts on!','Your hero will call you when a mission is ready.',H.load(k.id).look)}}).catch(function(e){pop('Couldn’t turn on alerts',String(e&&e.message||e))})}}
function subscribe(k){return Notification.requestPermission().then(function(p){if(p!=='granted')return false;
 return navigator.serviceWorker.register('/sw.js').then(function(){return navigator.serviceWorker.ready}).then(function(reg){
  return fetch('api/push?pub=1').then(function(r){return r.json()}).then(function(j){return reg.pushManager.getSubscription().then(function(s){return s||reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(j.pub)})})})
 }).then(function(sub){var dev=window.__trk&&__trk.device?__trk.device():{};return fetch('api/push',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({kid:k.id,sub:sub.toJSON(),dev:{id:dev.id,name:dev.name,test:!!dev.test}})}).then(function(r){return r.ok})})})}

window.HEROUI={card:card,room:room,league:league,av:av,pop:pop};
})();
