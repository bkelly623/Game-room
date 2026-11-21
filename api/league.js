/* Brothers League scoreboard (public: names, levels, XP only). */
const B=require('./_blob'),{json}=require('./_util'),L=require('./_league');
module.exports=async(req,res)=>{try{const raw=await L.read(),s=L.summary(raw,Date.now());
  let prize='';try{const u=B.publicUrl('gr/v1/settings.json');const st=u&&await B.getJSON(u+'?t='+Date.now());prize=st&&st.prize&&st.prize.v||''}catch(e){}
  for(const k of Object.values(s.kids)){delete k.lastAct}
  return json(res,200,Object.assign(s,{prize}))}catch(e){return json(res,500,{error:String(e.message||e).slice(0,200)})}};
