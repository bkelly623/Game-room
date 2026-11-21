/* Eastern-time dates (the family's clock), shared by the league and the hero alerts. */
const TZ='America/New_York';
function parts(ts){const f=new Intl.DateTimeFormat('en-US',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',weekday:'short',hourCycle:'h23'});
  const o={};f.formatToParts(new Date(ts||Date.now())).forEach(p=>o[p.type]=p.value);
  return{d:`${o.year}-${o.month}-${o.day}`,h:+o.hour,mi:+o.minute,wd:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(o.weekday)}}
function addDays(d,n){const t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)}
function weekId(ts){const p=parts(ts);return 'w'+addDays(p.d,-((p.wd+6)%7))}
module.exports={parts,addDays,weekId,TZ};
