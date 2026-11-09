/* Checks storage end to end (grown-up key needed). */
const B=require('./_blob'),{json,authed}=require('./_util');
module.exports=async(req,res)=>{if(!authed(req))return json(res,401,{error:'key'});const steps={};
  try{const p=await B.put('gr/v1/health/check.json',JSON.stringify({at:Date.now()}));steps.put=p.pathname||p.url;
    const l=await B.list('gr/v1/health/');steps.list=l.length;const g=await B.getJSON(p.url);steps.read=!!g;await B.del(l.map(x=>x.url));steps.del=true;
    steps.board=B.publicUrl('gr/v1/board.json')?'ok':'no url';return json(res,200,{ok:true,steps})}
  catch(e){return json(res,500,{ok:false,steps,error:String(e.message||e)})}};
