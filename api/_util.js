function readBody(req){return new Promise(res=>{if(req.body!==undefined&&req.body!==null){if(typeof req.body==='string'){try{return res(JSON.parse(req.body))}catch(e){return res(null)}}if(Buffer.isBuffer(req.body)){try{return res(JSON.parse(req.body.toString('utf8')))}catch(e){return res(null)}}return res(req.body)}
  let d='';req.on('data',c=>{d+=c;if(d.length>600000)req.destroy()});req.on('end',()=>{try{res(JSON.parse(d))}catch(e){res(null)}});req.on('error',()=>res(null))})}
function json(res,code,obj){res.statusCode=code;res.setHeader('content-type','application/json');res.setHeader('cache-control','no-store');res.end(JSON.stringify(obj))}
function day(ts){return new Date(ts).toISOString().slice(0,10)}
function authed(req){const k=process.env.DASH_KEY;if(!k)return false;const u=new URL(req.url,'http://x');return (u.searchParams.get('key')||req.headers['x-dash-key'])===k}
module.exports={readBody,json,day,authed};
