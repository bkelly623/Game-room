/* Grown-up game settings, shared by every device. Anyone can read; only a signed-in grown-up can change. */
const B=require('./_blob'),{json,readBody,authed}=require('./_util');
const PATH='gr/v1/settings.json';
async function current(){const url=B.publicUrl(PATH);const j=url&&await B.getJSON(url+'?t='+Date.now());return j&&j.kids?j:{at:0,kids:{}}}
module.exports=async(req,res)=>{try{
  if(req.method==='GET')return json(res,200,await current());
  if(req.method!=='POST')return json(res,405,{error:'method'});
  if(!authed(req))return json(res,401,{error:'sign in'});
  const body=await readBody(req);if(!body||typeof body.kids!=='object')return json(res,400,{error:'bad body'});
  const cur=await current();
  for(const [id,v] of Object.entries(body.kids)){if(!/^[a-z0-9-]{1,40}$/.test(id)||!v||typeof v!=='object')continue;const s=JSON.stringify(v);if(s.length>20000)continue;
    const at=+v.at||Date.now();if(!cur.kids[id]||(+cur.kids[id].at||0)<=at)cur.kids[id]={at,gs:v.gs||{},kw:v.kw||null}}
  cur.at=Date.now();await B.put(PATH,JSON.stringify(cur),{random:false,overwrite:true,maxAge:60});
  return json(res,200,{ok:true,at:cur.at})}catch(e){return json(res,500,{error:String(e.message||e).slice(0,200)})}};
