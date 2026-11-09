/* Game Room sync: sends play time, answers and saves to the grown-ups' Command Center.
   Works only on the Game Room website; anywhere else it quietly does nothing. */
(function(){
'use strict';
if(window.__trk)return;
var ls=null;try{ls=window.localStorage}catch(e){}
if(!ls){window.__trk={ans:function(){},ev:function(){}};return}
var SP=Storage.prototype,G0=window.__rawGet||SP.getItem,S0=window.__rawSet||SP.setItem,R0=window.__rawRemove||SP.removeItem;
function rget(k){try{return G0.call(ls,k)}catch(e){return null}}
function rset(k,v){try{S0.call(ls,k,v)}catch(e){}}
function rjson(k,d){try{var s=rget(k);return s?JSON.parse(s):d}catch(e){return d}}
function rkeys(){var a=[];try{for(var i=0;i<ls.length;i++)a.push(ls.key(i))}catch(e){}return a}
var ON=/^https?:/.test(location.protocol)&&!/^(localhost|127\.)/.test(location.hostname)||window.__trkForce;
/* this device */
function device(){var d=rjson('hub.device',null);if(!d||!d.id){var ua=navigator.userAgent,n=/iPad|Macintosh.*Mobile|Macintosh(?=.*Safari)(?=.*Version)/.test(ua)&&navigator.maxTouchPoints>1?'iPad':/iPhone/.test(ua)?'iPhone':/Android/.test(ua)?'Android':/CrOS/.test(ua)?'Chromebook':/Mac/.test(ua)?'Mac':/Win/.test(ua)?'Windows PC':'Device';
  d={id:Math.random().toString(36).slice(2,12),name:n,test:false};rset('hub.device',JSON.stringify(d))}return d}
function kidInfo(kid){var h=rjson('hub.v1',null)||{};var k=(h.kids||[]).find(function(x){return x.id===kid})||null;return{k:k,log:(h.log||{})[kid]||null}}
function slim(v,d){if(d>7)return null;if(typeof v==='string')return v.length>300?v.slice(0,300)+'…':v;
 if(Array.isArray(v)){if(v.length>150)return{__n:v.length};return v.map(function(x){return slim(x,d+1)})}
 if(v&&typeof v==='object'){var o={};for(var k in v)if(Object.prototype.hasOwnProperty.call(v,k))o[k]=slim(v[k],d+1);return o}return v}
function hash(s){var h=5381;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return String(h)}
function snapshot(kid){var P='kid.'+kid+'::',saves={};rkeys().forEach(function(k){if(k&&k.indexOf(P)===0){var n=k.slice(P.length);if(/^__/.test(n))return;var s=rget(k);try{saves[n]=slim(JSON.parse(s),0)}catch(e){saves[n]=s&&s.length<300?s:null}}});
 var I=kidInfo(kid);var snap={saves:saves,kid:I.k?{name:I.k.name,emoji:I.k.emoji,color:I.k.color,speak:!!I.k.speak,games:I.k.games,kw:I.k.kw||null}:null,log:I.log};
 var js=JSON.stringify(snap);if(js.length>320000){Object.keys(saves).map(function(k){return[k,JSON.stringify(saves[k]).length]}).sort(function(a,b){return b[1]-a[1]}).forEach(function(p){if(JSON.stringify(snap).length>320000)saves[p[0]]={__dropped:p[1]}})}
 return snap}
function queue(kid){return rjson('trk.q.'+kid,[])}
function send(kid,opts){opts=opts||{};if(!ON||!kid)return;var q=queue(kid),dev=device();
 var snap=null;if(opts.snap!==false){var s=snapshot(kid),h=hash(JSON.stringify(s)),meta=rjson('trk.h.'+kid,{}),fresh=Date.now()-(meta.at||0)>6*36e5;if(h!==meta.h||fresh){snap=s;snap.h=h}}
 if(snap&&!Object.keys(snap.saves).length&&!snap.log&&!q.length)snap=null;
 if(!q.length&&!snap)return;var I=kidInfo(kid);
 var body=JSON.stringify({kid:kid,name:I.k?I.k.name:'',dev:dev,ev:q,snap:snap});
 var done=function(){var now=queue(kid);rset('trk.q.'+kid,JSON.stringify(now.slice(q.length)));if(snap)rset('trk.h.'+kid,JSON.stringify({h:snap.h,at:Date.now()}))};
 if(opts.beacon&&navigator.sendBeacon&&body.length<60000){if(navigator.sendBeacon('/api/ingest',new Blob([body],{type:'text/plain'})))done();return}
 try{fetch('/api/ingest',{method:'POST',headers:{'content-type':'text/plain'},body:body,keepalive:body.length<60000}).then(function(r){if(r.ok)done()}).catch(function(){})}catch(e){}}
/* inside a game */
var KID=window.__KID||null,GAME=(location.pathname.match(/\/games\/([a-z0-9-]+)\//)||[])[1]||null;
var active=0,lastAns=0;
function push(kid,o){if(!kid)return;var q=queue(kid);q.push(o);if(q.length>2500)q=q.slice(-2500);rset('trk.q.'+kid,JSON.stringify(q))}
function flushSess(){if(active>=5&&KID&&GAME){push(KID,{t:Date.now(),e:'sess',g:GAME,sec:active});active=0}}
window.__trk={
 /* one answer: s=subject, lv=level, it=item, ok=right, ms=time to answer */
 ans:function(o){if(!KID)return;var t=Date.now();var e={t:t,e:'ans',g:GAME,s:String(o.s||''),ok:o.ok?1:0};if(o.lv!=null)e.lv=o.lv;if(o.it!=null)e.it=String(o.it).slice(0,60);
  var ms=o.ms!=null?o.ms:(lastAns?t-lastAns:null);if(ms!=null&&ms<180000)e.ms=Math.round(ms);if(o.help)e.h=1;if(o.f!=null)e.f=o.f;lastAns=t;push(KID,e)},
 ev:function(type,o){if(!KID)return;var e={t:Date.now(),e:type,g:GAME};for(var k in o)e[k]=o[k];push(KID,e)},
 flush:function(b){flushSess();send(KID,{beacon:b})},
 syncKid:function(kid){send(kid,{})},device:device,setDevice:function(p){var d=device();for(var k in p)d[k]=p[k];rset('hub.device',JSON.stringify(d))}
};
if(KID&&GAME){
 setInterval(function(){if(!document.hidden)active+=5},5000);
 setTimeout(function(){window.__trk.flush(false)},4000);
 setInterval(function(){if(queue(KID).length||active>=60)window.__trk.flush(false)},900000);
 document.addEventListener('visibilitychange',function(){if(document.hidden)window.__trk.flush(true)});
 window.addEventListener('pagehide',function(){window.__trk.flush(true)});
}
})();
