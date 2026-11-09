/* Tiny Vercel Blob client (REST), so the site needs no build step or packages. */
const API='https://blob.vercel-storage.com';
const TOKEN=()=>process.env.BLOB_READ_WRITE_TOKEN||'';
const H=extra=>Object.assign({authorization:'Bearer '+TOKEN(),'x-api-version':'7'},extra||{});
/* Public URL of a fixed path (used for the small leaderboard file). */
function publicUrl(path){const m=TOKEN().match(/^vercel_blob_rw_([A-Za-z0-9]+)_/);return m?`https://${m[1].toLowerCase()}.public.blob.vercel-storage.com/${path}`:null}
async function put(path,body,{random=true,overwrite=false,maxAge=60}={}){
  const headers=H({'x-content-type':'application/json','x-add-random-suffix':random?'1':'0','x-cache-control-max-age':String(maxAge)});
  if(overwrite)headers['x-allow-overwrite']='1';
  let r=await fetch(`${API}/${path}`,{method:'PUT',headers,body});
  if(!r.ok&&r.status<500){const first=await r.text();r=await fetch(`${API}/?pathname=${encodeURIComponent(path)}`,{method:'PUT',headers,body});if(!r.ok)throw new Error('blob put '+r.status+' '+first.slice(0,150)+' | '+(await r.text()).slice(0,150))}
  if(!r.ok)throw new Error('blob put '+r.status+' '+(await r.text()).slice(0,200));
  return r.json()}
async function list(prefix){const out=[];let cursor='';
  for(let i=0;i<50;i++){const q=new URLSearchParams({prefix,limit:'1000'});if(cursor)q.set('cursor',cursor);
    const r=await fetch(`${API}?${q}`,{headers:H()});if(!r.ok)throw new Error('blob list '+r.status+' '+(await r.text()).slice(0,200));
    const j=await r.json();out.push(...(j.blobs||[]));if(!j.hasMore||!j.cursor)break;cursor=j.cursor}
  return out}
async function del(urls){if(!urls.length)return;const r=await fetch(`${API}/delete`,{method:'POST',headers:H({'content-type':'application/json'}),body:JSON.stringify({urls})});if(!r.ok)throw new Error('blob delete '+r.status)}
async function getJSON(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)return null;try{return await r.json()}catch(e){return null}}
module.exports={put,list,del,getJSON,publicUrl};
