/* Brothers League: one small file, updated whenever a kid's hero save arrives. */
const B=require('./_blob'),T=require('./_time');
const PATH='gr/v1/league.json';
async function read(){const url=B.publicUrl(PATH);return (url&&await B.getJSON(url+'?t='+Date.now()))||{kids:{}}}
async function record(doc){const h=doc.snap&&doc.snap.saves&&doc.snap.saves['hero.v1'];if(!h||typeof h!=='object'||doc.dev.test||doc.kid==='uncle-b')return;
  const cur=await read();const k=cur.kids[doc.kid]=cur.kids[doc.kid]||{devs:{}};const info=doc.snap.kid||{};
  k.name=info.name||doc.name||k.name||doc.kid;k.emoji=info.emoji||k.emoji;k.color=info.color||k.color;
  const t=h.today||{};
  k.devs[doc.dev.id]={xp:+h.xp||0,look:h.look||null,wk:h.wk&&h.wk.id,wxp:h.wk&&+h.wk.xp||0,prev:h.prev||null,streak:h.streak&&+h.streak.n||0,sl:h.streak&&h.streak.last||'',
    day:h.day,sec:+t.sec||0,m:Array.isArray(t.m)?t.m.length:(t.m&&t.m.__n)||0,chest:+t.chest||0,lastAct:+h.lastAct||0,at:doc.at,dev:doc.dev.name};
  cur.at=Date.now();await B.put(PATH,JSON.stringify(cur),{random:false,overwrite:true,maxAge:30})}
function lvOf(xp){let L=1;while(xp>=100*L*(L+1))L++;return L}
/* what everyone sees: per kid, best device for level/look, all devices added up for this week */
function summary(raw,now){const wk=T.weekId(now),prevWk='w'+T.addDays(wk.slice(1),-7),today=T.parts(now).d,out={};
  for(const [id,k] of Object.entries(raw.kids||{})){const ds=Object.values(k.devs||{});if(!ds.length)continue;const best=ds.reduce((a,b)=>b.xp>a.xp?b:a);
    const wxp=ds.reduce((a,d)=>a+(d.wk===wk?d.wxp:0),0),pxp=ds.reduce((a,d)=>a+(d.wk===prevWk?d.wxp:d.prev&&d.prev.id===prevWk?d.prev.xp:0),0);
    const live=ds.filter(d=>d.sl===today||d.sl===T.addDays(today,-1));
    out[id]={name:k.name,emoji:k.emoji,color:k.color,xp:best.xp,lv:lvOf(best.xp),look:best.look,wk,wxp,pxp,streak:live.reduce((a,d)=>Math.max(a,d.streak),0),
      todaySec:ds.reduce((a,d)=>a+(d.day===today?d.sec:0),0),todayM:ds.reduce((a,d)=>Math.max(a,d.day===today?d.m:0),0),lastAct:ds.reduce((a,d)=>Math.max(a,d.lastAct||0),0)}}
  let champ=null;for(const [id,s] of Object.entries(out))if(s.pxp>0&&(!champ||s.pxp>champ.xp))champ={id,name:s.name,xp:s.pxp};
  return{week:wk,kids:out,champ}}
module.exports={read,record,summary,PATH};
