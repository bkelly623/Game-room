/* Shared family-hub state: kids, assignments, PIN and play log. Lives in this browser's localStorage. */
(function(){
'use strict';
var KEY='hub.v1';
function defaults(){return{v:1,pin:null,kids:[
  {id:'vinny',name:'Vinny',emoji:'🦊',color:'#E8742E',speak:false,games:['kingdoms','ashvale','snortwood','glorp','rocket','echo','lumen','summit']},
  {id:'luca',name:'Luca',emoji:'🐸',color:'#2FA35A',speak:true,games:['glorp','rocket','letters']},
  {id:'brother',name:'Big Brother',emoji:'🐺',color:'#3E7CD6',speak:false,games:['summit','echo','rocket','lumen','glorp']}
 ],log:{}}}
var mem=null;
function load(){if(mem)return mem;try{var s=localStorage.getItem(KEY);if(s){var d=JSON.parse(s);if(d&&Array.isArray(d.kids)){d.log=d.log||{};mem=d;return d}}}catch(e){}mem=defaults();return mem}
function save(){try{localStorage.setItem(KEY,JSON.stringify(mem))}catch(e){}}
function kid(id){return load().kids.find(function(k){return k.id===id})||null}
function game(id){return (window.CATALOG||[]).find(function(g){return g.id===id})||null}
function today(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function logOf(k,g){var L=load().log;L[k]=L[k]||{};L[k][g]=L[k][g]||{first:Date.now(),last:0,sec:0,days:{}};return L[k][g]}
function addTime(k,g,sec){var e=logOf(k,g);e.last=Date.now();e.sec+=sec;var t=today();e.days[t]=(e.days[t]||0)+sec;
  var ks=Object.keys(e.days).sort();while(ks.length>90)delete e.days[ks.shift()];save()}
function touch(k,g){var e=logOf(k,g);e.last=Date.now();save()}
function weekSec(e){if(!e)return 0;var n=0,now=new Date();for(var i=0;i<7;i++){var d=new Date(now);d.setDate(now.getDate()-i);n+=e.days[today(d)]||0}return n}
/* Read a game's own save for one kid and pull out answered / correct counts by subject. */
var SUBJ={ma:'Math',rd:'Reading',gr:'Grammar',sp:'Spelling'};
function gameSave(k,g){var key=(window.SAVEKEYS||{})[g];if(!key)return null;try{var s=localStorage.getItem('kid.'+k+'::'+key);return s?JSON.parse(s):null}catch(e){return null}}
function progress(k,g){var D=gameSave(k,g);if(!D)return null;var out=[];
  Object.keys(SUBJ).forEach(function(p){var E=D[p];if(E&&typeof E.q==='number'&&E.q>0)out.push({s:SUBJ[p],q:E.q,ok:E.ok||0})});
  if(g==='rocket'&&D.stats&&D.stats.q)out.push({s:'Math',q:D.stats.q,ok:D.stats.correct||0});
  if(g==='echo'&&D.stats&&D.stats.words)out.push({s:'Spelling',q:D.stats.words,ok:D.stats.correct||0});
  if(g==='lumen'&&D.stats){var q=0,ok=0;['sum','mult','pattern','word'].forEach(function(x){var a=D.stats[x];if(Array.isArray(a)){ok+=a[0]||0;q+=(a[0]||0)+(a[1]||0)}});if(q)out.push({s:'Math',q:q,ok:ok})}
  if(g==='summit'&&D.totalAnswered)out.push({s:'Mixed',q:D.totalAnswered,ok:D.totalCorrect||0});
  return{name:D.name||'',subjects:out}}
function wipe(k,g){var key=(window.SAVEKEYS||{})[g];if(key)try{localStorage.removeItem('kid.'+k+'::'+key)}catch(e){}var L=load().log;if(L[k])delete L[k][g];save()}
function wipeKid(k){try{var rm=[];for(var i=0;i<localStorage.length;i++){var x=localStorage.key(i);if(x&&x.indexOf('kid.'+k+'::')===0)rm.push(x)}rm.forEach(function(x){localStorage.removeItem(x)})}catch(e){}delete load().log[k];save()}
/* Speech for kids who can't read yet. */
var voice=null;
function pickVoice(){try{var vs=speechSynthesis.getVoices().filter(function(v){return/^en[-_]/i.test(v.lang)});voice=vs.find(function(v){return/samantha|google us english|aria|jenny|allison|ava/i.test(v.name)})||vs.find(function(v){return/en[-_]us/i.test(v.lang)})||vs[0]||null}catch(e){}}
if('speechSynthesis' in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
function say(t){try{if(!('speechSynthesis' in window))return;speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(t);u.rate=.9;u.pitch=1.1;if(voice){u.voice=voice;u.lang=voice.lang}else u.lang='en-US';speechSynthesis.speak(u)}catch(e){}}
function fmtDur(sec){sec=Math.round(sec||0);if(sec<60)return sec?'<1 min':'0 min';var m=Math.round(sec/60);if(m<60)return m+' min';var h=Math.floor(m/60);return h+' h '+(m%60)+' min'}
function ago(ts){if(!ts)return'Never';var s=(Date.now()-ts)/1000;if(s<90)return'Just now';if(s<3600)return Math.round(s/60)+' min ago';if(s<86400)return Math.round(s/3600)+' h ago';var d=Math.round(s/86400);return d===1?'Yesterday':d+' days ago'}
window.HUB={load:load,save:save,kid:kid,game:game,logOf:logOf,addTime:addTime,touch:touch,weekSec:weekSec,progress:progress,wipe:wipe,wipeKid:wipeKid,say:say,fmtDur:fmtDur,ago:ago,reset:function(){mem=defaults();save()}};
})();
