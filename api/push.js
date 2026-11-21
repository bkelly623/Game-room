/* Hero alerts (Web Push, no packages).
   GET  ?pub=1            -> public key for subscribing
   POST {kid,sub,dev}     -> save a device's subscription for a kid
   GET  ?msg=1&ep=...     -> the message waiting for this device (the service worker asks; pushes carry no payload)
   GET  ?run=1&key=...    -> the scheduler: sends whatever alerts are due right now (Eastern time)
   GET  ?test=<kid>&key=  -> send a test alert to that kid's devices now */
const crypto=require('crypto'),B=require('./_blob'),{json,readBody,authed,eq}=require('./_util'),T=require('./_time'),L=require('./_league');
const SUBS='gr/v1/push/subs.json',MSGS='gr/v1/push/msgs.json',SENT='gr/v1/push/sent.json';
const OKHOST=/(^|\.)(fcm\.googleapis\.com|push\.services\.mozilla\.com|push\.apple\.com|notify\.windows\.com|push\.api\.chrome\.google\.com)$/;
async function get(p,d){const u=B.publicUrl(p);return (u&&await B.getJSON(u+'?t='+Date.now()))||d}
const put=(p,o)=>B.put(p,JSON.stringify(o),{random:false,overwrite:true,maxAge:60});
const h=s=>crypto.createHash('sha256').update(s).digest('base64url').slice(0,22);

/* ---------- VAPID-signed, payload-free push ---------- */
function vapid(aud){const pub=process.env.VAPID_PUB,d=process.env.VAPID_PRIV;const raw=Buffer.from(pub,'base64url');
  const key=crypto.createPrivateKey({key:{kty:'EC',crv:'P-256',d,x:raw.subarray(1,33).toString('base64url'),y:raw.subarray(33,65).toString('base64url')},format:'jwk'});
  const enc=o=>Buffer.from(JSON.stringify(o)).toString('base64url');const head=enc({typ:'JWT',alg:'ES256'}),body=enc({aud,exp:Math.floor(Date.now()/1000)+12*3600,sub:'mailto:bkel733@gmail.com'});
  const sig=crypto.sign('sha256',Buffer.from(head+'.'+body),{key,dsaEncoding:'ieee-p1363'}).toString('base64url');
  return `vapid t=${head}.${body}.${sig}, k=${pub}`}
async function send(ep){const u=new URL(ep);const r=await fetch(ep,{method:'POST',headers:{Authorization:vapid(u.origin),TTL:'10800',Urgency:'normal','Content-Length':'0'}});return r.status}

/* ---------- when to call each kid (Eastern time) ---------- */
const SLOTS={home:{wk:[[9,30],[11,15],[13,0],[14,45],[16,30]],we:[[10,30],[15,0]]},school:{wk:[[15,45],[17,15],[18,45]],we:[[10,30],[14,0],[17,0]]}};
const goalOf=(id,st)=>+(st.kids&&st.kids[id]&&st.kids[id].goal)||(id==='vinny'?180:45);
const schedOf=(id,st)=>(st.kids&&st.kids[id]&&st.kids[id].sched)||(id==='vinny'?'home':'school');
function missions(goal){const n=goal>=120?3:goal>=60?2:1,c=Math.round(goal/n);return{n,c}}
const pick=a=>a[Math.floor(Math.random()*a.length)];
function message(id,s,all,st,slotIdx,slots,p){const goal=goalOf(id,st),M=missions(goal),done=s?s.todayM:0,min=s?Math.floor(s.todaySec/60):0;
  const next=Math.min(done+1,M.n),left=Math.max(5,M.c*next-min),name=s&&s.name||id[0].toUpperCase()+id.slice(1);
  const mis=M.n>1?`Mission ${next}`:'Your daily mission';
  const rows=Object.entries(all).filter(([k])=>k!==id).map(([,v])=>v).sort((a,b)=>b.wxp-a.wxp),lead=rows[0];
  if(lead&&s&&lead.wxp>s.wxp&&lead.wxp-s.wxp<600&&Math.random()<.6)return `🏆 ${name}, ${lead.name} is ${lead.wxp-s.wxp} XP ahead of you in the Brothers League. Go take the crown back!`;
  if(s&&s.streak>=2&&!done&&(slotIdx>=slots.length-2))return `🔥 ${name}, your ${s.streak}-day streak ends at midnight! ${M.c} minutes saves it.`;
  if(slotIdx===0&&schedOf(id,st)==='home'&&p.wd>=1&&p.wd<=5&&!done)return pick([`☀️ Good morning, ${name}! Your morning mission is ready: ${M.c} minutes to the first reward.`,`☀️ Rise and shine, hero! ${mis} is waiting. First treasure in ${left} minutes.`]);
  if(done>=M.n)return null;
  return pick([`🐉 ${name}! A dragon is sitting on your treasure chest. ${left} minutes of right answers scares it off.`,`🧦 ${name}, your hero lost a sock. Only ${left} minutes of learning can find it.`,
    `🚀 Your hero is doing jumping jacks waiting for you, ${name}. ${mis}: ${left} minutes to go.`,`👑 King Varric says you're too scared to come back, ${name}. Prove him wrong!`,
    `🍕 Your hero ordered a pizza and can't pay. Go earn some coins, ${name}!`,`⚡ ${name}, ${mis} is ready. ${left} minutes to the next reward, plus a welcome-back bonus.`,
    `🦖 A T. rex just learned the 9 times table. Are you going to let it beat you, ${name}?`])}

async function run(force){const now=Date.now(),p=T.parts(now),nowMin=p.h*60+p.mi,wkday=p.wd>=1&&p.wd<=5;
  const [subs,st,raw,sent,msgs]=await Promise.all([get(SUBS,{subs:[]}),get('gr/v1/settings.json',{kids:{}}),L.read(),get(SENT,{}),get(MSGS,{})]);
  const all=L.summary(raw,now).kids,byEp={},log=[];if(sent.d!==p.d){sent.d=p.d;sent.k={}}
  const kids=[...new Set(subs.subs.map(x=>x.kid))];
  for(const id of kids){const sch=SLOTS[schedOf(id,st)]||SLOTS.school,slots=wkday?sch.wk:sch.we;
    let si=-1;slots.forEach(([hh,mm],i)=>{const m=hh*60+mm;if(nowMin>=m&&nowMin<m+45)si=i});
    if(force&&force!==id)continue;if(!force&&si<0)continue;const tag=force?'test'+now:'s'+si;
    if(!force&&(sent.k[id]||[]).includes(tag))continue;
    const s=all[id];const goal=goalOf(id,st);
    if(!force){if(s&&s.todaySec/60>=goal){log.push(id+': goal met');continue}if(s&&s.lastAct&&now-s.lastAct<45*60000){log.push(id+': playing');continue}}
    const msg=force?`🔔 Test alert for ${s&&s.name||id}: hero alerts are working!`:message(id,s,all,st,si,slots,p);
    sent.k[id]=(sent.k[id]||[]).concat(tag);if(!msg){log.push(id+': nothing to say');continue}
    subs.subs.filter(x=>x.kid===id).forEach(x=>{(byEp[x.ep]=byEp[x.ep]||[]).push({id,msg})})}
  const dead=new Set();
  for(const [ep,list] of Object.entries(byEp)){const body=list.map(x=>x.msg).join('\n');msgs[h(ep)]={title:'Game Room',body,url:'/#'+list[0].id,at:now};}
  if(Object.keys(byEp).length){const cut=now-3*864e5;for(const k of Object.keys(msgs))if(msgs[k].at<cut)delete msgs[k];await put(MSGS,msgs)}
  for(const ep of Object.keys(byEp)){try{const code=await send(ep);log.push(byEp[ep].map(x=>x.id).join('+')+' -> '+code);if(code===404||code===410)dead.add(ep)}catch(e){log.push('send error '+String(e.message||e).slice(0,80))}}
  if(dead.size){subs.subs=subs.subs.filter(x=>!dead.has(x.ep));await put(SUBS,subs)}
  sent.last={at:now,log:log.slice(0,10)};await put(SENT,sent);const out={at:p,log,subs:subs.subs.length};console.log('hero-alerts run',JSON.stringify(out));return out}

module.exports=async(req,res)=>{try{const u=new URL(req.url,'http://x'),q=u.searchParams;
  if(req.method==='GET'&&q.get('pub'))return json(res,200,{pub:process.env.VAPID_PUB||''});
  if(req.method==='GET'&&q.get('msg')){const ep=q.get('ep')||'';const m=(await get(MSGS,{}))[h(ep)];return json(res,200,m&&Date.now()-m.at<6*36e5?m:{title:'Game Room',body:'Your hero is waiting! A new mission is ready.',url:'/'})}
  const keyOk=()=>authed(req)||(process.env.NUDGE_KEY&&eq(q.get('key')||'',process.env.NUDGE_KEY));
  if(req.method==='GET'&&q.get('run')){if(!keyOk())return json(res,401,{error:'key'});return json(res,200,await run(null))}
  if(req.method==='GET'&&q.get('test')){if(!keyOk())return json(res,401,{error:'key'});return json(res,200,await run(q.get('test')))}
  if(req.method==='GET'&&q.get('list')){if(!keyOk())return json(res,401,{error:'key'});const s=await get(SUBS,{subs:[]}),sn=await get(SENT,{});return json(res,200,{lastRun:sn.last||null,subs:s.subs.map(x=>({kid:x.kid,host:new URL(x.ep).host,dev:x.dev,at:x.at}))})}
  if(req.method!=='POST')return json(res,405,{error:'method'});
  const b=await readBody(req);const ep=b&&b.sub&&b.sub.endpoint;
  if(!b||!/^[a-z0-9-]{1,40}$/.test(b.kid||'')||typeof ep!=='string'||ep.length>1000)return json(res,400,{error:'bad'});
  let host;try{const x=new URL(ep);if(x.protocol!=='https:')throw 0;host=x.hostname}catch(e){return json(res,400,{error:'bad endpoint'})}
  if(!OKHOST.test(host))return json(res,400,{error:'unknown push service'});
  const subs=await get(SUBS,{subs:[]});subs.subs=subs.subs.filter(x=>!(x.ep===ep&&x.kid===b.kid));
  const dev=b.dev||{};subs.subs.push({kid:b.kid,ep,dev:{id:String(dev.id||'').slice(0,20),name:String(dev.name||'').slice(0,30),test:!!dev.test},at:Date.now()});
  if(subs.subs.length>60)subs.subs=subs.subs.slice(-60);await put(SUBS,subs);return json(res,200,{ok:true})}
 catch(e){return json(res,500,{error:String(e.message||e).slice(0,200)})}};
module.exports._vapid=vapid;module.exports._message=message;
