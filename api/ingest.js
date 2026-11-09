/* Receives a batch from one device for one kid: events + (sometimes) a snapshot of saves. */
const B=require('./_blob'),{readBody,json,day}=require('./_util');
const ID=/^[a-z0-9-]{1,40}$/;
module.exports=async(req,res)=>{
  if(req.method!=='POST')return json(res,405,{error:'POST only'});
  const b=await readBody(req);
  if(!b||!ID.test(b.kid||'')||!b.dev||!ID.test(String(b.dev.id||'')))return json(res,400,{error:'bad batch'});
  const now=Date.now(),ev=Array.isArray(b.ev)?b.ev.slice(0,3000):[];
  if(!ev.length&&!b.snap)return json(res,200,{ok:true,skipped:true});
  const doc={v:1,at:now,kid:b.kid,name:String(b.name||'').slice(0,30),dev:{id:b.dev.id,name:String(b.dev.name||'').slice(0,40),test:!!b.dev.test},ev,snap:b.snap||null};
  const body=JSON.stringify(doc);if(body.length>500000)return json(res,413,{error:'too big'});
  try{await B.put(`gr/v1/b/${day(now)}/${b.kid}.json`,body)}catch(e){return json(res,500,{error:String(e.message||e)})}
  /* King's Wall leaderboard: only touched when someone beats their best */
  const best=ev.filter(e=>e&&e.e==='kwbest'&&!doc.dev.test).reduce((m,e)=>Math.max(m,+e.st||0),0);
  if(best){try{const url=B.publicUrl('gr/v1/board.json');const cur=(url&&await B.getJSON(url+'?t='+now))||{kids:{}};
    const k=cur.kids[b.kid]||{};if(best>(k.best||0)){cur.kids[b.kid]={name:doc.name||k.name||b.kid,best,at:now};await B.put('gr/v1/board.json',JSON.stringify(cur),{random:false,overwrite:true,maxAge:60})}}catch(e){}}
  return json(res,200,{ok:true})};
