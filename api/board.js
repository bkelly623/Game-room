/* Public King's Wall leaderboard (names and best stage only). */
const B=require('./_blob'),{json}=require('./_util');
module.exports=async(req,res)=>{try{const url=B.publicUrl('gr/v1/board.json');const j=url&&await B.getJSON(url+'?t='+Math.floor(Date.now()/30000));res.setHeader('cache-control','public, max-age=30');return json(res,200,j||{kids:{}})}catch(e){return json(res,200,{kids:{}})}};
