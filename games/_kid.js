/* Gives every kid their own saves. Each game is opened as games/<id>/?kid=<kidId>;
   every localStorage key the game uses is quietly stored as "kid.<kidId>::<key>". */
(function(){
  'use strict';
  if(window.__KID)return;
  var kid=null;
  try{kid=new URLSearchParams(location.search).get('kid')}catch(e){}
  if(!kid||!/^[a-z0-9-]{1,40}$/.test(kid))return;
  var P='kid.'+kid+'::',S=Storage.prototype,g=S.getItem,s=S.setItem,r=S.removeItem,ls=null;
  try{ls=window.localStorage}catch(e){return}
  var GAME=(location.pathname.match(/\/games\/([a-z0-9-]+)\//)||[])[1]||'';
  /* grown-up level settings: applied once to the game's save, the first time it's read after a change */
  function gsFix(k,raw){try{var GS=window.__GSET;if(!GS||!GAME||!GS.games[GAME]||GS.games[GAME].key!==k)return raw;
    var h=JSON.parse(g.call(ls,'hub.v1')||'null'),me=h&&h.kids&&h.kids.find(function(x){return x.id===kid});var set=me&&me.gs&&me.gs[GAME];if(!set)return raw;
    var AK=P+'__gs.'+GAME,done={};try{done=JSON.parse(g.call(ls,AK)||'{}')||{}}catch(e){done={}}
    var todo={},n=0;Object.keys(set).forEach(function(t){var v=set[t];if(v&&v.lv&&v.t&&done[t]!==v.t){todo[t]=v.lv;done[t]=v.t;n++}});if(!n)return raw;
    var save=raw?JSON.parse(raw):null;var out=GS.apply(GAME,save,todo,!!me.speak);s.call(ls,AK,JSON.stringify(done));if(!out)return raw;
    var str=JSON.stringify(out);s.call(ls,P+k,str);return str}catch(e){return raw}}
  S.getItem=function(k){if(this!==ls)return g.call(this,k);return gsFix(k,g.call(this,P+k))};
  S.setItem=function(k,v){return s.call(this,this===ls?P+k:k,v)};
  S.removeItem=function(k){return r.call(this,this===ls?P+k:k)};
  window.__KID=kid;
  window.__rawGet=g;window.__rawSet=s;window.__rawRemove=r;
  window.__hubRaw=function(k){try{return g.call(ls,k)}catch(e){return null}};
  /* this kid's Game Room settings, for every game */
  window.__kidInfo=function(){try{var h=JSON.parse(g.call(ls,'hub.v1')||'null');return h&&h.kids&&h.kids.find(function(k){return k.id===kid})||null}catch(e){return null}};
  /* Stop guessing: wrong answers cost a heart (on for Luca unless a grown-up turns it off) */
  window.__strict=function(){var k=window.__kidInfo();var kw=k&&k.kw;return kw&&kw.strict!=null?!!kw.strict:kid==='luca'};
  /* early reader: reads things aloud and starts with the youngest material */
  window.__young=function(){var k=window.__kidInfo();return !!(k&&k.speak)};
  /* progress tracking for the grown-ups' Command Center */
  try{var me=document.currentScript&&document.currentScript.src;if(me)document.write('<script src="'+me.replace(/_kid\.js(\?.*)?$/,'_gset.js')+'"><\/script><script src="'+me.replace(/_kid\.js(\?.*)?$/,'_sync.js')+'"><\/script>')}catch(e){}
})();
