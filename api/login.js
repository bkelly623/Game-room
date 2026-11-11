/* Grown-up sign-in for the Command Center. Sets a private cookie for 90 days. */
const {readBody,json,makeSession,eq}=require('./_util');
const tries=new Map();
module.exports=async(req,res)=>{
  if(req.method==='DELETE'){res.setHeader('set-cookie','cc_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict');return json(res,200,{ok:true})}
  if(req.method!=='POST')return json(res,405,{error:'POST only'});
  const ip=String(req.headers['x-forwarded-for']||'').split(',')[0]||'x',t=tries.get(ip)||{n:0,at:0};
  if(t.n>=8&&Date.now()-t.at<15*60e3)return json(res,429,{error:'Too many tries. Wait 15 minutes.'});
  const b=await readBody(req)||{};
  const ok=process.env.ADMIN_USER&&process.env.ADMIN_PASS&&eq(String(b.user||'').trim().toLowerCase(),process.env.ADMIN_USER.toLowerCase())&&eq(String(b.pass||''),process.env.ADMIN_PASS);
  if(!ok){tries.set(ip,{n:t.n+1,at:Date.now()});await new Promise(r=>setTimeout(r,600));return json(res,401,{error:'Wrong username or password.'})}
  tries.delete(ip);
  res.setHeader('set-cookie',`cc_session=${makeSession(90)}; Path=/; Max-Age=${90*86400}; HttpOnly; Secure; SameSite=Strict`);
  return json(res,200,{ok:true})};
