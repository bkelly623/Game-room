/* Hero: every kid has one character that levels up from real learning (right answers + focused play time).
   Shared by the shelf (index.html), the game bar (play.html) and every game (loaded by _kid.js).
   Saved as kid.<id>::hero.v1 so it rides along with the normal Command Center sync. */
(function(){
'use strict';
if(window.HERO)return;
var ls=null;try{ls=window.localStorage}catch(e){}
var SP=Storage.prototype,G0=window.__rawGet||SP.getItem,S0=window.__rawSet||SP.setItem;
function rget(k){try{return G0.call(ls,k)}catch(e){return null}}
function rset(k,v){try{S0.call(ls,k,v)}catch(e){}}
function rjson(k,d){try{var s=rget(k);return s?JSON.parse(s):d}catch(e){return d}}
function pad(n){return String(n).padStart(2,'0')}
function dstr(d){d=d||new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function weekId(d){d=d?new Date(d):new Date();var w=(d.getDay()+6)%7;d.setDate(d.getDate()-w);return 'w'+dstr(d)}
function yesterday(){var d=new Date();d.setDate(d.getDate()-1);return dstr(d)}

/* ---------- the catalog: gear costs coins and needs a level; moves come free with levels ---------- */
var SKINS=[['#E8742E','Sunset',1],['#3E7CD6','Ocean',1],['#2FA35A','Jungle',1],['#8E5BD6','Grape',1],['#D2463C','Lava',3],['#1FA38A','Mint',5],['#E0A21E','Gold',10],['#5A6378','Stealth',15],['#FF5FA2','Bubblegum',8],['#111827','Shadow',25]];
var ITEMS=[
 {s:'face',id:'shades',n:'Cool Shades',lv:2,c:20},{s:'face',id:'mask',n:'Ninja Mask',lv:7,c:70},{s:'face',id:'stache',n:'Fancy Mustache',lv:12,c:60},
 {s:'hat',id:'cap',n:'Ball Cap',lv:2,c:25},{s:'hat',id:'wizard',n:'Wizard Hat',lv:5,c:60},{s:'hat',id:'viking',n:'Viking Helmet',lv:8,c:90},{s:'hat',id:'crown',n:'Royal Crown',lv:13,c:160},{s:'hat',id:'astro',n:'Space Helmet',lv:20,c:260},{s:'hat',id:'dragon',n:'Dragon Hood',lv:30,c:420},
 {s:'back',id:'cape',n:'Hero Cape',lv:3,c:35},{s:'back',id:'jet',n:'Jetpack',lv:10,c:130},{s:'back',id:'wings',n:'Eagle Wings',lv:17,c:230},{s:'back',id:'dwings',n:'Dragon Wings',lv:26,c:360},
 {s:'hand',id:'sword',n:'Foam Sword',lv:4,c:45},{s:'hand',id:'wand',n:'Magic Wand',lv:6,c:70},{s:'hand',id:'hammer',n:'Thunder Hammer',lv:15,c:190},{s:'hand',id:'bolt',n:'Lightning Staff',lv:22,c:300},
 {s:'pet',id:'slime',n:'Slime Buddy',lv:5,c:55},{s:'pet',id:'owl',n:'Wise Owl',lv:9,c:110},{s:'pet',id:'robot',n:'Robo Pup',lv:14,c:180},{s:'pet',id:'drake',n:'Baby Dragon',lv:24,c:340},
 {s:'aura',id:'spark',n:'Sparkles',lv:11,c:140},{s:'aura',id:'fire',n:'Fire Aura',lv:19,c:250},{s:'aura',id:'rainbow',n:'Rainbow Aura',lv:28,c:400}];
var SLOTS=[['hat','Hats'],['face','Face'],['back','Back'],['hand','Hand'],['pet','Pets'],['aura','Aura'],['skin','Colors']];
var MOVES=[{id:'wave',n:'Wave',lv:1},{id:'jump',n:'Super Jump',lv:2},{id:'spin',n:'Tornado Spin',lv:4},{id:'dance',n:'Victory Dance',lv:6},{id:'flip',n:'Backflip',lv:9},{id:'toot',n:'Rocket Toot',lv:12},{id:'fireball',n:'Fireball',lv:16},{id:'tele',n:'Teleport',lv:21},{id:'giant',n:'Go Giant',lv:27},{id:'roar',n:'Mega Roar',lv:33},{id:'clone',n:'Clone Army',lv:40}];
var TITLES=[[1,'Rookie'],[5,'Apprentice'],[10,'Adventurer'],[15,'Knight'],[20,'Champion'],[26,'Hero'],[32,'Legend'],[40,'Mythic']];

/* ---------- levels: level L needs 200*L more XP ---------- */
function lvOf(xp){var L=1;while(xp>=100*L*(L+1))L++;return L}
function lvBase(L){return 100*L*(L-1)}
function titleOf(L){var t='Rookie';TITLES.forEach(function(x){if(L>=x[0])t=x[1]});return t}

/* ---------- per-kid settings from the hub ---------- */
function hub(){return rjson('hub.v1',null)||{}}
function kidRec(kid){return (hub().kids||[]).find(function(k){return k.id===kid})||null}
function goalOf(kid){var k=kidRec(kid);if(k&&+k.goal)return +k.goal;return kid==='vinny'?180:45}
function schedOf(kid){var k=kidRec(kid);if(k&&k.sched)return k.sched;return kid==='vinny'?'home':'school'}
function missionsOf(kid){var g=goalOf(kid),n=g>=120?3:g>=60?2:1;var a=[],chunk=Math.round(g/n);for(var i=0;i<n;i++)a.push((i+1)*chunk);return a}

/* ---------- state ---------- */
var KEY=function(kid){return 'kid.'+kid+'::hero.v1'};
function fresh(){return{v:1,xp:0,coins:0,day:dstr(),today:{sec:0,right:0,wrong:0,games:{},m:[],chest:0,back:0},streak:{n:0,last:''},best:0,wk:{id:weekId(),xp:0},prev:null,lastAct:0,
 look:{skin:'#E8742E',hat:'',face:'',back:'',hand:'',pet:'',aura:''},owned:[],moves:['wave'],hist:[],news:[]}}
function load(kid){var h=rjson(KEY(kid),null);if(!h||h.v!==1){h=fresh();var k=kidRec(kid);if(k&&k.color)h.look.skin=k.color}roll(h);return h}
function roll(h){var d=dstr();if(h.day!==d){if(h.today&&(h.today.sec||h.today.right))h.hist=(h.hist||[]).concat([{d:h.day,sec:h.today.sec,right:h.today.right,m:(h.today.m||[]).length}]).slice(-28);
  h.day=d;h.today={sec:0,right:0,wrong:0,games:{},m:[],chest:0,back:0}}
 var w=weekId();if(!h.wk||h.wk.id!==w){if(h.wk&&h.wk.xp)h.prev={id:h.wk.id,xp:h.wk.xp};h.wk={id:w,xp:0}}
 if(h.streak&&h.streak.last&&h.streak.last!==d&&h.streak.last!==yesterday())h.streak.n=0}
function save(kid,h){h.at=Date.now();rset(KEY(kid),JSON.stringify(h));try{window.dispatchEvent(new CustomEvent('hero',{detail:{kid:kid}}))}catch(e){}}
function news(h,o){h.news=(h.news||[]).concat([Object.assign({t:Date.now()},o)]).slice(-12)}
function give(kid,h,xp,coins,why){var L0=lvOf(h.xp);h.xp+=xp;h.wk.xp+=xp;h.coins+=coins||0;var L1=lvOf(h.xp);
 if(L1>L0){for(var L=L0+1;L<=L1;L++){var mv=MOVES.filter(function(m){return m.lv===L}).map(function(m){return m.n}),it=ITEMS.filter(function(i){return i.lv===L}).map(function(i){return i.n});
   MOVES.forEach(function(m){if(m.lv<=L&&h.moves.indexOf(m.id)<0)h.moves.push(m.id)});
   news(h,{k:'lv',lv:L,txt:'LEVEL '+L+'!'+(mv.length?' New move: '+mv.join(', ')+'.':'')+(it.length?' New gear in the Hero Room: '+it.join(', ')+'.':'')})}}
 if(why)news(h,{k:'xp',txt:why})}

/* right answer: +10 XP, +1 coin (half with a hint). Wrong answers give nothing, so guessing never pays. */
function onAns(kid,ok,game,help){if(!kid)return;var h=load(kid);h.lastAct=Date.now();if(game)h.today.games[game]=1;
 if(ok){h.today.right++;give(kid,h,help?5:10,help?0:1)}else h.today.wrong++;
 check(kid,h);save(kid,h)}
/* focused play time: +2 XP a minute, only counted while they're actually touching the game */
function addSec(kid,sec){var h=load(kid);var now=Date.now();
 if(h.lastAct&&now-h.lastAct>40*60000&&h.today.m.length&&!h.pendingBack)h.pendingBack=now;
 h.today.sec+=sec;h.lastAct=now;h.secAcc=(h.secAcc||0)+sec;var mins=Math.floor(h.secAcc/60);if(mins){h.secAcc-=mins*60;give(kid,h,2*mins,0)}
 if(h.pendingBack&&now-h.pendingBack>3*60000){h.pendingBack=0;h.today.back++;give(kid,h,50,10,'Welcome back, hero! +50 XP for coming back.')}
 check(kid,h);save(kid,h)}
function check(kid,h){var ms=missionsOf(kid),min=h.today.sec/60;
 ms.forEach(function(goal,i){if(min>=goal&&h.today.m.length===i){h.today.m.push(Date.now());give(kid,h,100,25);
   news(h,{k:'mission',txt:(ms.length>1?'Mission '+(i+1)+' of '+ms.length:'Daily mission')+' complete! +100 XP, +25 coins.'+(i+1===ms.length?' Your treasure chest is ready!':'')});
   if(i===0){var d=dstr();if(h.streak.last!==d){h.streak.n=(h.streak.last===yesterday()?h.streak.n:0)+1;h.streak.last=d;h.best=Math.max(h.best||0,h.streak.n);
     if(h.streak.n>1)news(h,{k:'streak',txt:'🔥 '+h.streak.n+'-day streak!'})}}}})}
var LOOT=['coins','coins','gear','xp'];
function openChest(kid){var h=load(kid),ms=missionsOf(kid);if(h.today.chest||h.today.m.length<ms.length)return null;h.today.chest=1;
 var L=lvOf(h.xp),r=LOOT[Math.floor(Math.random()*LOOT.length)],out;
 var free=ITEMS.filter(function(i){return i.lv<=L+2&&h.owned.indexOf(i.id)<0});
 if(r==='gear'&&free.length){var it=free[Math.floor(Math.random()*free.length)];h.owned.push(it.id);out={k:'gear',txt:'You found the '+it.n+'!',id:it.id}}
 else if(r==='xp'){give(kid,h,200,20);out={k:'xp',txt:'+200 XP and 20 coins!'}}
 else{var c=60+Math.floor(Math.random()*61);h.coins+=c;give(kid,h,100,0);out={k:'coins',txt:'+'+c+' coins and 100 XP!'}}
 if(h.streak.n>=3){h.coins+=h.streak.n*5;out.txt+=' Streak bonus: +'+h.streak.n*5+' coins.'}
 save(kid,h);return out}
function buy(kid,id){var h=load(kid),it=ITEMS.find(function(i){return i.id===id});if(!it||h.owned.indexOf(id)>=0)return false;if(lvOf(h.xp)<it.lv||h.coins<it.c)return false;h.coins-=it.c;h.owned.push(id);h.look[it.s]=id;save(kid,h);return true}
function equip(kid,slot,id){var h=load(kid);if(slot==='skin'){var s=SKINS.find(function(x){return x[0]===id});if(!s||lvOf(h.xp)<s[2])return false;h.look.skin=id}else{if(id&&h.owned.indexOf(id)<0)return false;h.look[slot]=h.look[slot]===id?'':id}save(kid,h);return true}

/* ---------- the avatar (SVG) ---------- */
function shade(hex,f){var n=parseInt(hex.slice(1),16),r=n>>16,g=n>>8&255,b=n&255;function c(v){return Math.max(0,Math.min(255,Math.round(f<0?v*(1+f):v+(255-v)*f)))}return '#'+((1<<24)+(c(r)<<16)+(c(g)<<8)+c(b)).toString(16).slice(1)}
function svg(look,opt){look=look||{};opt=opt||{};var s=look.skin||'#E8742E',d=shade(s,-.3),l=shade(s,.35),u='h'+Math.random().toString(36).slice(2,7),o=[];
 o.push('<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" class="hsvg" aria-hidden="true"><defs><radialGradient id="'+u+'a"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>');
 var a=look.aura;
 if(a==='spark')o.push('<g class="au"><circle cx="60" cy="74" r="58" fill="url(#'+u+'a)" opacity=".25"/>'+[[14,30],[104,26],[10,96],[108,92],[60,8],[96,124],[22,126]].map(function(p,i){return '<path class="tw" style="animation-delay:'+(i*.3)+'s" d="M'+p[0]+' '+(p[1]-6)+'l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#FFE66D"/>'}).join('')+'</g>');
 if(a==='fire')o.push('<g class="au fl"><path d="M60 6c10 14 30 18 34 44 10-8 10-20 8-26 14 16 16 44 6 62 8-4 12-10 12-16 4 30-20 64-60 64S-4 106 0 76c0 6 4 12 12 16C2 74 4 46 18 30c-2 6-2 18 8 26 4-26 24-30 34-50z" fill="#FF7A1A" opacity=".55"/><path d="M60 26c6 10 20 14 22 30 8-4 8-12 8-16 8 12 8 30 2 42 4-2 6-6 8-10 0 20-16 40-40 40S20 92 20 72c2 4 4 8 8 10-6-12-6-30 2-42 0 4 0 12 8 16 2-16 16-20 22-30z" fill="#FFD23F" opacity=".55"/></g>');
 if(a==='rainbow')o.push('<g class="au" fill="none" stroke-width="5" opacity=".7">'+['#FF5F5F','#FFA23F','#FFE14D','#4DD66B','#4DA6FF','#9B6BFF'].map(function(c,i){return '<path d="M'+(6+i*5)+' 112a'+(54-i*5)+' '+(60-i*5)+' 0 0 1 '+(108-i*10)+' 0" stroke="'+c+'"/>'}).join('')+'</g>');
 var b=look.back;
 if(b==='cape')o.push('<path d="M38 54 C20 80 18 110 22 128 L60 118 L98 128 C102 110 100 80 82 54Z" fill="#D2263C" stroke="#8E1424" stroke-width="2"/>');
 if(b==='jet')o.push('<g><rect x="14" y="60" width="18" height="40" rx="7" fill="#9AA3B5" stroke="#5A6378" stroke-width="2"/><rect x="88" y="60" width="18" height="40" rx="7" fill="#9AA3B5" stroke="#5A6378" stroke-width="2"/><path class="jf" d="M16 100h14l-7 20z M90 100h14l-7 20z" fill="#FF8A1A"/><path class="jf" d="M19 100h8l-4 11z M93 100h8l-4 11z" fill="#FFE14D"/></g>');
 if(b==='wings'||b==='dwings'){var wc=b==='wings'?'#fff':'#7B3FD6',ws=b==='wings'?'#C9D3E6':'#4A1F8E';o.push('<g class="wg" fill="'+wc+'" stroke="'+ws+'" stroke-width="2">'+(b==='wings'?'<path d="M36 66C14 50 2 58 4 70c8-2 10 2 6 8 8-2 10 2 6 8 8 0 14 0 20-6z"/><path d="M84 66c22-16 34-8 32 4-8-2-10 2-6 8-8-2-10 2-6 8-8 0-14 0-20-6z"/>':'<path d="M36 64 6 40l4 20-8 4 10 10-6 8 30-4z"/><path d="M84 64l30-24-4 20 8 4-10 10 6 8-30-4z"/>')+'</g>')}
 /* body */
 o.push('<ellipse cx="45" cy="128" rx="11" ry="6" fill="'+d+'"/><ellipse cx="75" cy="128" rx="11" ry="6" fill="'+d+'"/>');
 o.push('<ellipse cx="28" cy="92" rx="9" ry="12" fill="'+s+'" stroke="'+d+'" stroke-width="2.5"/>');
 o.push('<rect x="30" y="34" width="60" height="92" rx="30" fill="'+s+'" stroke="'+d+'" stroke-width="3"/><ellipse cx="60" cy="98" rx="20" ry="20" fill="'+l+'" opacity=".55"/>');
 o.push('<ellipse cx="48" cy="64" rx="9" ry="11" fill="#fff"/><ellipse cx="72" cy="64" rx="9" ry="11" fill="#fff"/><circle class="ey" cx="50" cy="66" r="5" fill="#1B1530"/><circle class="ey" cx="74" cy="66" r="5" fill="#1B1530"/><circle cx="52" cy="63" r="1.8" fill="#fff"/><circle cx="76" cy="63" r="1.8" fill="#fff"/>');
 o.push('<path d="M49 82q11 10 22 0" fill="none" stroke="#1B1530" stroke-width="3" stroke-linecap="round"/><ellipse cx="40" cy="78" rx="5" ry="3" fill="#FF8FA8" opacity=".6"/><ellipse cx="80" cy="78" rx="5" ry="3" fill="#FF8FA8" opacity=".6"/>');
 var f=look.face;
 if(f==='shades')o.push('<g><rect x="36" y="58" width="22" height="13" rx="5" fill="#141020"/><rect x="62" y="58" width="22" height="13" rx="5" fill="#141020"/><path d="M58 63h4" stroke="#141020" stroke-width="3"/><path d="M40 61l6 0" stroke="#fff" stroke-width="2" opacity=".6"/></g>');
 if(f==='mask')o.push('<path d="M31 56h58v16H31z" fill="#1B1530"/><path d="M89 60l14-6-4 10 6 4-16-2z" fill="#1B1530"/><ellipse cx="48" cy="64" rx="8" ry="5" fill="#fff"/><ellipse cx="72" cy="64" rx="8" ry="5" fill="#fff"/><circle cx="50" cy="64" r="3.5" fill="#1B1530"/><circle cx="74" cy="64" r="3.5" fill="#1B1530"/>');
 if(f==='stache')o.push('<path d="M60 77c-6-6-16-6-20 2 6-2 10 2 20 0 10 2 14-2 20 0-4-8-14-8-20-2z" fill="#3A2412"/>');
 var hh=look.hat;
 if(hh==='cap')o.push('<path d="M32 46a28 24 0 0 1 56 0z" fill="#2B6CD6" stroke="#18408A" stroke-width="2"/><path d="M80 44h26q2 6-6 7H82z" fill="#18408A"/><circle cx="60" cy="24" r="3" fill="#18408A"/>');
 if(hh==='wizard')o.push('<path d="M28 46 64 -2 92 46z" fill="#5B3CC4" stroke="#33207A" stroke-width="2"/><path d="M24 44h72v8H24z" fill="#33207A" rx="4"/><path d="M62 18l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z" fill="#FFE14D"/><circle cx="50" cy="34" r="2" fill="#FFE14D"/><circle cx="76" cy="38" r="2" fill="#FFE14D"/>');
 if(hh==='viking')o.push('<path d="M32 48a28 26 0 0 1 56 0z" fill="#9AA3B5" stroke="#5A6378" stroke-width="2"/><path d="M30 46h60v7H30z" fill="#C79A12"/><path d="M34 40C18 36 14 20 18 10c4 12 10 18 20 20z" fill="#F4F1E6" stroke="#B9B2A0" stroke-width="2"/><path d="M86 40c16-4 20-20 16-30-4 12-10 18-20 20z" fill="#F4F1E6" stroke="#B9B2A0" stroke-width="2"/>');
 if(hh==='crown')o.push('<path d="M36 44 34 18l13 12 13-18 13 18 13-12-2 26z" fill="#FFD23F" stroke="#C79A12" stroke-width="2"/><circle cx="60" cy="34" r="4" fill="#E23A5A"/><circle cx="45" cy="38" r="3" fill="#3E7CD6"/><circle cx="75" cy="38" r="3" fill="#2FA35A"/>');
 if(hh==='astro')o.push('<circle cx="60" cy="62" r="40" fill="#BFE6FF" opacity=".28" stroke="#E6F4FF" stroke-width="4"/><path d="M34 40a36 34 0 0 1 22-16" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/><rect x="40" y="98" width="40" height="8" rx="4" fill="#E6F4FF"/>');
 if(hh==='dragon')o.push('<path d="M28 60C26 30 42 20 60 20s34 10 32 40c-8-12-20-16-32-16S36 48 28 60z" fill="#2FA35A" stroke="#1B6B3A" stroke-width="2"/><path d="M44 22l4-14 6 12 6-14 6 14 6-12 4 14z" fill="#FFD23F"/><circle cx="40" cy="40" r="3" fill="#FFD23F"/><circle cx="80" cy="40" r="3" fill="#FFD23F"/>');
 o.push('<ellipse cx="92" cy="92" rx="9" ry="12" fill="'+s+'" stroke="'+d+'" stroke-width="2.5"/>');
 var hd=look.hand;
 if(hd==='sword')o.push('<g class="hi"><rect x="96" y="44" width="8" height="44" rx="3" fill="#4DD6FF" stroke="#2A8FB3" stroke-width="2"/><rect x="88" y="86" width="24" height="6" rx="3" fill="#FFD23F"/><rect x="97" y="92" width="6" height="12" rx="2" fill="#8A5A2B"/></g>');
 if(hd==='wand')o.push('<g class="hi"><rect x="97" y="60" width="5" height="40" rx="2" fill="#3A2412"/><path d="M99 44l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z" fill="#FFE14D" stroke="#C79A12" stroke-width="1.5"/></g>');
 if(hd==='hammer')o.push('<g class="hi"><rect x="97" y="58" width="6" height="46" rx="2" fill="#8A5A2B"/><rect x="84" y="42" width="32" height="20" rx="4" fill="#9AA3B5" stroke="#5A6378" stroke-width="2"/><path d="M98 46l-4 8h5l-3 6 8-9h-5l3-5z" fill="#FFE14D"/></g>');
 if(hd==='bolt')o.push('<g class="hi"><rect x="97" y="50" width="5" height="56" rx="2" fill="#5B3CC4"/><path d="M104 22l-14 22h9l-6 18 16-24h-9l6-16z" fill="#FFE14D" stroke="#C79A12" stroke-width="1.5"/></g>');
 var p=look.pet;
 if(p==='slime')o.push('<g class="pt"><path d="M2 136c0-16 8-24 15-24s15 8 15 24z" fill="#5BE37D" stroke="#2FA35A" stroke-width="2"/><circle cx="12" cy="124" r="3" fill="#1B1530"/><circle cx="22" cy="124" r="3" fill="#1B1530"/><path d="M13 130q4 3 8 0" stroke="#1B1530" stroke-width="2" fill="none"/></g>');
 if(p==='owl')o.push('<g class="pt"><ellipse cx="16" cy="124" rx="13" ry="15" fill="#A0703A" stroke="#6B4520" stroke-width="2"/><circle cx="11" cy="120" r="5" fill="#fff"/><circle cx="21" cy="120" r="5" fill="#fff"/><circle cx="11" cy="120" r="2.5" fill="#1B1530"/><circle cx="21" cy="120" r="2.5" fill="#1B1530"/><path d="M14 126l2 4 2-4z" fill="#FFB020"/><path d="M5 110l4 5M27 110l-4 5" stroke="#6B4520" stroke-width="3"/></g>');
 if(p==='robot')o.push('<g class="pt"><rect x="3" y="112" width="26" height="22" rx="5" fill="#B8C2D6" stroke="#5A6378" stroke-width="2"/><rect x="8" y="118" width="16" height="8" rx="3" fill="#1B1530"/><circle cx="12" cy="122" r="2" fill="#4DFFB0"/><circle cx="20" cy="122" r="2" fill="#4DFFB0"/><path d="M16 112v-6" stroke="#5A6378" stroke-width="2"/><circle cx="16" cy="105" r="3" fill="#FF5F5F"/></g>');
 if(p==='drake')o.push('<g class="pt"><path d="M0 116l8 6-6 6zM32 116l-8 6 6 6z" fill="#9B6BFF"/><ellipse cx="16" cy="126" rx="12" ry="11" fill="#2FA35A" stroke="#1B6B3A" stroke-width="2"/><circle cx="11" cy="123" r="3" fill="#fff"/><circle cx="21" cy="123" r="3" fill="#fff"/><circle cx="11" cy="123" r="1.5" fill="#1B1530"/><circle cx="21" cy="123" r="1.5" fill="#1B1530"/><path d="M10 114l3-6 3 5 3-5 3 6" fill="#FFD23F"/></g>');
 o.push('</svg>');return o.join('')}

/* ---------- styles shared by the shelf and the game bar ---------- */
var CSS='.hav{position:relative;display:inline-block;line-height:0}.hav .hsvg{width:100%;height:100%;overflow:visible}.hav .au{transform-origin:60px 74px}.hav .tw{animation:hTw 1.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center}.hav .fl{animation:hFl .5s ease-in-out infinite alternate;transform-origin:60px 130px}.hav .jf{animation:hFl .18s linear infinite alternate;transform-origin:center top;transform-box:fill-box}.hav .pt{animation:hBob 1.4s ease-in-out infinite}.hav .wg{animation:hFlap 1.2s ease-in-out infinite;transform-origin:60px 70px}'+
'@keyframes hTw{50%{transform:scale(.3);opacity:.3}}@keyframes hFl{to{transform:scaleY(1.08)}}@keyframes hBob{50%{transform:translateY(-4px)}}@keyframes hFlap{50%{transform:scaleX(1.08)}}'+
'.hav.m-wave .hsvg{animation:hWave .9s ease}.hav.m-jump .hsvg{animation:hJump .9s cubic-bezier(.3,.7,.4,1)}.hav.m-spin .hsvg{animation:hSpin .9s ease}.hav.m-dance .hsvg{animation:hDance 1.2s ease}.hav.m-flip .hsvg{animation:hFlip 1s ease}.hav.m-giant .hsvg{animation:hGiant 1.8s ease}.hav.m-tele .hsvg{animation:hTele 1.4s ease}.hav.m-roar .hsvg{animation:hRoar 1.2s linear}.hav.m-toot .hsvg{animation:hToot 1s ease}'+
'@keyframes hWave{25%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}75%{transform:rotate(-6deg)}}@keyframes hJump{40%{transform:translateY(-60%) scale(1.05,.95)}80%{transform:translateY(0) scale(1.1,.9)}}@keyframes hSpin{to{transform:rotateY(1080deg)}}@keyframes hDance{20%{transform:translateX(-10%) rotate(-10deg)}40%{transform:translateX(10%) rotate(10deg)}60%{transform:translateX(-10%) rotate(-10deg)}80%{transform:translateX(10%) rotate(10deg)}}@keyframes hFlip{50%{transform:translateY(-55%) rotate(-180deg)}100%{transform:rotate(-360deg)}}@keyframes hGiant{30%,70%{transform:scale(1.7) translateY(-10%)}}@keyframes hTele{30%{opacity:0;transform:scale(.2,1.4)}60%{opacity:0;transform:translateX(40%) scale(.2,1.4)}100%{opacity:1}}@keyframes hRoar{0%,100%{transform:none}10%,30%,50%,70%,90%{transform:translateX(-4%) scale(1.08)}20%,40%,60%,80%{transform:translateX(4%) scale(1.08)}}@keyframes hToot{30%{transform:translateY(-40%) rotate(12deg)}}'+
'.hfx{position:absolute;pointer-events:none;font-size:28px;line-height:1;animation:hFx 1.2s ease-out forwards;z-index:3}@keyframes hFx{from{opacity:1;transform:translate(0,0) scale(.6)}to{opacity:0;transform:translate(var(--dx),var(--dy)) scale(1.4)}}.hroar{position:absolute;left:50%;top:-6%;transform:translateX(-50%);font:900 26px/1 Bungee,Impact,sans-serif;color:#FFD23F;text-shadow:0 3px 0 #C0392B;animation:hFx 1.2s ease-out forwards;--dx:-50%;--dy:-30px;pointer-events:none;z-index:3}';
function css(){if(document.getElementById('heroCss'))return;var st=document.createElement('style');st.id='heroCss';st.textContent=CSS;(document.head||document.documentElement).appendChild(st)}

var AC=null;function tone(kind){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();var t=AC.currentTime,g=AC.createGain();g.connect(AC.destination);
 if(kind==='toot'){var n=AC.createBufferSource(),b=AC.createBuffer(1,AC.sampleRate*.6,AC.sampleRate),dd=b.getChannelData(0);for(var i=0;i<dd.length;i++)dd[i]=(Math.random()*2-1)*Math.sin(i/dd.length*Math.PI);n.buffer=b;var f=AC.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(400,t);f.frequency.linearRampToValueAtTime(120,t+.6);n.connect(f);f.connect(g);g.gain.value=.6;n.start(t);return}
 var o=AC.createOscillator();o.connect(g);var seq={wave:[660,880],jump:[300,900],spin:[500,700,900,1100],dance:[523,659,784,659,523],flip:[400,800],fireball:[200,120],tele:[1200,300,1200],giant:[150,100],roar:[110,90,110],clone:[600,600,600],level:[523,659,784,1047],coin:[988,1319]}[kind]||[600];
 o.type=kind==='roar'||kind==='giant'||kind==='fireball'?'sawtooth':'square';g.gain.setValueAtTime(.06,t);seq.forEach(function(fq,i){o.frequency.setValueAtTime(fq,t+i*.09)});g.gain.linearRampToValueAtTime(0,t+seq.length*.09+.12);o.start(t);o.stop(t+seq.length*.09+.15)}catch(e){}}
function fx(el,em,n,dx,dy){for(var i=0;i<n;i++){var s=document.createElement('span');s.className='hfx';s.textContent=em;s.style.left=(40+Math.random()*20)+'%';s.style.top=(30+Math.random()*30)+'%';
 s.style.setProperty('--dx',(dx!=null?dx:(Math.random()*160-80))+'px');s.style.setProperty('--dy',(dy!=null?dy:(-60-Math.random()*80))+'px');s.style.animationDelay=(i*.06)+'s';el.appendChild(s);setTimeout(function(x){return function(){x.remove()}}(s),1600)}}
function doMove(el,id){if(!el)return;el.className=el.className.replace(/\s?m-\w+/g,'');void el.offsetWidth;tone(id);
 if(id==='fireball'){fx(el,'🔥',6,220,-10)}else if(id==='toot'){el.classList.add('m-toot');fx(el,'💨',5,null,60)}else if(id==='clone'){var c=el.querySelector('.hsvg');[-1,1].forEach(function(sx){var k=c.cloneNode(true);k.style.cssText='position:absolute;left:0;top:0;opacity:.75;transition:transform .5s;';el.appendChild(k);requestAnimationFrame(function(){k.style.transform='translateX('+sx*70+'%) scale(.8)'});setTimeout(function(){k.remove()},1500)})}
 else if(id==='roar'){el.classList.add('m-roar');var r=document.createElement('span');r.className='hroar';r.textContent='ROAR!';el.appendChild(r);setTimeout(function(){r.remove()},1300)}
 else{el.classList.add('m-'+id);if(id==='jump'||id==='flip')fx(el,'✨',4);if(id==='dance')fx(el,'🎵',4)}
 setTimeout(function(){el.classList.remove('m-'+id)},1900)}

/* ---------- inside a game: count focused time ---------- */
var KID=window.__KID||null,GAME=(location.pathname.match(/\/games\/([a-z0-9-]+)\//)||[])[1]||null;
if(KID&&GAME&&ls){var lastIn=0;['pointerdown','keydown','touchstart','wheel'].forEach(function(t){window.addEventListener(t,function(){lastIn=Date.now()},{capture:true,passive:true})});
 setInterval(function(){if(!document.hidden&&Date.now()-lastIn<75000)addSec(KID,15)},15000)}

function bonus(kid,xp,coins,txt){var h=load(kid);give(kid,h,xp,coins,txt);save(kid,h)}
window.HERO={bonus:bonus,load:load,save:save,onAns:onAns,addSec:addSec,openChest:openChest,buy:buy,equip:equip,svg:svg,css:css,doMove:doMove,tone:tone,
 lvOf:lvOf,lvBase:lvBase,titleOf:titleOf,goalOf:goalOf,schedOf:schedOf,missionsOf:missionsOf,weekId:weekId,ITEMS:ITEMS,SKINS:SKINS,SLOTS:SLOTS,MOVES:MOVES};
})();
