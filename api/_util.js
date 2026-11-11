function readBody(req){return new Promise(res=>{if(req.body!==undefined&&req.body!==null){if(typeof req.body==='string'){try{return res(JSON.parse(req.body))}catch(e){return res(null)}}if(Buffer.isBuffer(req.body)){try{return res(JSON.parse(req.body.toString('utf8')))}catch(e){return res(null)}}return res(req.body)}
  let d='';req.on('data',c=>{d+=c;if(d.length>600000)req.destroy()});req.on('end',()=>{try{res(JSON.parse(d))}catch(e){res(null)}});req.on('error',()=>res(null))})}
function json(res,code,obj){res.statusCode=code;res.setHeader('content-type','application/json');res.setHeader('cache-control','no-store');res.end(JSON.stringify(obj))}
function day(ts){return new Date(ts).toISOString().slice(0,10)}
const crypto=require('crypto');
const SECRET=()=>(process.env.DASH_KEY||'')+'|'+(process.env.ADMIN_PASS||'');
function sign(exp){return crypto.createHmac('sha256',SECRET()).update('cc|'+exp).digest('base64url')}
function makeSession(days){const exp=Date.now()+days*864e5;return exp+'.'+sign(exp)}
function cookie(req,name){const m=(req.headers.cookie||'').split(/;\s*/).find(c=>c.startsWith(name+'='));return m?decodeURIComponent(m.slice(name.length+1)):''}
function eq(a,b){a=Buffer.from(String(a));b=Buffer.from(String(b));return a.length===b.length&&crypto.timingSafeEqual(a,b)}
function sessionOk(req){const v=cookie(req,'cc_session');const [exp,sig]=v.split('.');return !!(exp&&sig&&+exp>Date.now()&&process.env.ADMIN_PASS&&eq(sig,sign(exp)))}
/* signed-in grown-up (cookie) or the private key (used for analysis tools) */
function authed(req){if(sessionOk(req))return true;const k=process.env.DASH_KEY;if(!k)return false;const u=new URL(req.url,'http://x');const got=u.searchParams.get('key')||req.headers['x-dash-key']||'';return !!got&&eq(got,k)}
module.exports={readBody,json,day,authed,makeSession,eq};
