/* Everything the Command Center needs. Needs the grown-up key. */
const B=require('./_blob'),{json,authed}=require('./_util');
module.exports=async(req,res)=>{
  if(!authed(req))return json(res,401,{error:'key'});
  const u=new URL(req.url,'http://x'),days=Math.min(120,Math.max(1,+u.searchParams.get('days')||45));
  const since=new Date(Date.now()-days*864e5).toISOString().slice(0,10);
  try{const all=(await B.list('gr/v1/b/')).filter(x=>{const d=x.pathname.split('/')[3];return d>=since});
    const out=[];let i=0;
    async function worker(){while(i<all.length){const x=all[i++];const j=await B.getJSON(x.url);if(j)out.push(j)}}
    await Promise.all(Array.from({length:16},worker));
    out.sort((a,b)=>a.at-b.at);
    if(u.searchParams.get('lite')){const keep=['hero.v1','dawnkingdoms.camp.v1'];const lite=out.filter(b=>!(b.dev&&b.dev.test)&&b.kid!=='uncle-b').map(b=>({at:b.at,kid:b.kid,dev:b.dev&&b.dev.name,ev:(b.ev||[]).map(e=>({t:e.t,e:e.e,g:e.g,s:e.s,ok:e.ok,ms:e.ms,f:e.f,sec:e.sec,it:e.it&&String(e.it).slice(0,40)})),hero:b.snap&&b.snap.saves&&b.snap.saves['hero.v1']?{xp:b.snap.saves['hero.v1'].xp,today:b.snap.saves['hero.v1'].today,day:b.snap.saves['hero.v1'].day,look:b.snap.saves['hero.v1'].look,owned:b.snap.saves['hero.v1'].owned}:null,camp:b.snap&&b.snap.saves&&b.snap.saves['dawnkingdoms.camp.v1']||null}));return json(res,200,{now:Date.now(),batches:lite})}
    return json(res,200,{now:Date.now(),days,batches:out,count:all.length})}
  catch(e){return json(res,500,{error:String(e.message||e)})}};
