/* Grown-up game settings: for each game, the subjects it teaches and the levels in each one.
   The grown-up page lets you pick where a kid starts in every subject of every game.
   When the game next opens its save, the chosen level is put in place once (skills below it count as
   learned, the chosen one becomes the current focus), then the game keeps adapting from there. */
(function(){
'use strict';
var GSK=["Capital letter to start a sentence","End marks . ? !","Capitals for names, days & places","Tricky plurals (mice, geese)","Tricky past tense (ran, ate)","Verbs that match (he runs / they run)","Contractions (don't, can't)","Sound-alikes (to/too/two, hear/here)","\"I\" or \"me\"?","-ly words, good & well","Commas (lists, dates, Yes/No)","their/there/they're, its/it's, your/you're"];
var RSK=["Finding details","Order of events","Word meaning from clues","Reading between the lines","Main idea"];
var DMSK=["Adding within 20","Subtracting within 20","Adding 2-digit numbers","Subtracting 2-digit numbers","Multiplying by 2, 5 and 10","Multiplying by 3, 4 and 6","Multiplying by 7, 8 and 9","Division facts","Adding & subtracting 3-digit numbers","Two-step problems","2-digit × 1-digit","Division with remainders","Fractions of a number","Perimeter and area","Multiplying by 10s and 100s"];
var FEATS=["Short a and i","Short e, o and u","Digraphs: sh, ch, th, wh, ck","Blends: st, fr, tr, -nd, -mp","Long a and i with silent e","Long o and u with silent e","Vowel teams: ai, ay, ee, ea","Vowel teams: oa, ow, igh, y","R-controlled: ar, or, er, ir, ur","oi, oy, ou, ow, oo, aw","Tricky consonants: tch, dge, kn, wr","Adding -ing and -ed","Two-syllable words","Prefixes and suffixes","Endings: -tion, -sion, -ture, -sure"];
var GMSK=["Adding within 20","Subtracting within 20","Adding 2-digit numbers","Subtracting 2-digit numbers","Place value to 1,000","Adding and subtracting 3-digit numbers","Times tables: 2, 5, 10","Times tables: 3, 4, 6","Times tables: 7, 8, 9","Division facts","Missing numbers","2-digit times 1-digit","Fractions","Area and perimeter","Two-step word problems","Dividing bigger numbers"];
var RKSK=GMSK.concat(["Reading words (cat, dog)","Sight words","Adding within 10","Taking away within 10","Bigger, smaller, what comes next"]);
var PHON=["Short a words (cat, map)","Short i and o words (pig, dog)","Short e and u words (bed, sun)","Blends (stop, frog, hand)","sh, ch, th, ck (ship, duck)","Magic e (cake, bike)","ee and ea (bee, leaf)","ai, ay, oa (rain, boat)","ow and ou (cow, house)","ar, or, oo (car, fork, moon)"];
var FIVE=["Level 1 (easiest)","Level 2","Level 3","Level 4","Level 5 (hardest)"];
function range(n){var a=[];for(var i=0;i<n;i++)a.push(i);return a}
var ROCKET_OLD=range(16),ROCKET_YOUNG=[16,17,18,19,20].concat(range(16));

var G={
 kingdoms:{key:'dawnkingdoms.v1',type:'eng',v:2,tracks:[{k:'ma',n:'Math',lv:DMSK},{k:'rd',n:'Reading',lv:RSK},{k:'gr',n:'Grammar',lv:GSK}]},
 ashvale:{key:'ashvale.v1',type:'eng',v:1,tracks:[{k:'gr',n:'Grammar',lv:GSK},{k:'rd',n:'Reading',lv:RSK}]},
 snortwood:{key:'snortwood.v1',type:'eng',v:1,tracks:[{k:'gr',n:'Grammar',lv:GSK},{k:'rd',n:'Reading',lv:RSK}]},
 glorp:{key:'glorpisland.v1',type:'eng',v:2,extra:{seen:{}},tracks:[{k:'sp',n:'Spelling',lv:FEATS},{k:'ma',n:'Math',lv:GMSK}]},
 blocks:{key:'blockparty.v1',type:'eng',v:2,extra:{seen:{},probe:0},tracks:[{k:'rd',n:'Reading',lv:PHON},{k:'sp',n:'Spelling',lv:PHON}]},
 rocket:{key:'rocketpants.v1',type:'flat',tracks:[{k:'',n:'Math',all:RKSK,order:ROCKET_OLD,orderYoung:ROCKET_YOUNG}]},
 echo:{key:'echomines.v1',type:'flat',tracks:[{k:'',n:'Spelling',lv:FEATS}]},
 racer:{key:'spellracer.v1',type:'racer',tracks:[{k:'lv',n:'Spelling',lv:PHON},{k:'ma',n:'Math',lv:['Add to 5','Add to 10','Take away within 10','Add and take away to 20','Tens (30 + 40)','Times 2, 5 and 10']},{k:'sw',n:'Sight words',lv:['Pre-K (the, see, go)','Kindergarten (all, are, came)','First grade','Second grade']},{k:'rd',n:'Reading',lv:PHON.slice(0,8)}]},
 summit:{key:'summitquest.v1',type:'summit',tracks:[{k:'math',n:'Math (Puzzle Math)',lv:FIVE},{k:'spell',n:'Spelling (Crystal Mine)',lv:FIVE},{k:'grammar',n:'Grammar (Fix-It Trail)',lv:FIVE},{k:'read',n:'Reading (Trail Detective)',lv:FIVE}]},
 lumen:{key:'lumenvale.save.v1',type:'lumen',tracks:[{k:'level',n:'Math',lv:FIVE}]}
};
/* the level list a kid sees in one track (Rocket Pants starts early readers on reading and small sums) */
function levels(g,t,young){var T=G[g].tracks.find(function(x){return x.k===t});if(!T)return[];if(T.all){var o=young?T.orderYoung:T.order;return o.map(function(i){return T.all[i]})}return T.lv}
function today(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function freshEng(n,extra){var e={m:[],n:[],c:[],counter:0,review:[],missed:{},recent:[],survey:null,placed:false,placement:null,q:0,ok:0};for(var i=0;i<n;i++){e.m.push(0);e.n.push(0);e.c.push(0)}if(extra)for(var x in extra)e[x]=JSON.parse(JSON.stringify(extra[x]));return e}
/* put the chosen level in place: idx is 0-based, order maps positions to skill indexes */
function place(E,idx,order,len){['m','n','c'].forEach(function(f){E[f]=E[f]||[];while(E[f].length<len)E[f].push(0)});
 order=order||range(len);idx=Math.max(0,Math.min(order.length-1,idx));
 order.forEach(function(s,p){if(p<idx){E.m[s]=Math.max(E.m[s]||0,.85);E.n[s]=Math.max(E.n[s]||0,3);E.c[s]=Math.max(E.c[s]||0,3)}else E.m[s]=Math.min(E.m[s]||0,.3)});
 E.placed=true;E.survey=null;E.review=[];E.recent=[];E.placement={date:today(),focus:order[idx],q:0,correct:0,from:order[idx],reached:order[idx],mastered:idx,words:0,grownup:true};if('probe' in E)E.probe=order[idx]}
/* returns the patched save (object) or null if nothing to do */
function apply(g,save,set,young){var S=G[g];if(!S||!set)return null;var any=false;save=save||{};
 S.tracks.forEach(function(T){var lv=set[T.k];if(!lv)return;any=true;var idx=lv-1;
  if(S.type==='eng'){if(!save[T.k])save[T.k]=freshEng(T.lv.length,S.extra);place(save[T.k],idx,null,T.lv.length)}
  else if(S.type==='flat'){var len=T.all?T.all.length:T.lv.length;place(save,idx,T.all?(young?T.orderYoung:T.order):null,len);if(T.all&&young)save.yv=2}
  else if(S.type==='racer'){if(T.k==='lv'){save.lv=lv;save.m=save.m||[];for(var i=lv-1;i<save.m.length;i++)save.m[i]=Math.min(save.m[i]||0,.3)}else{save.q=save.q||{};save.q[T.k]={lv:lv,hist:[],recent:[]}}}
  else if(S.type==='summit'){save.v=1;save.subj=save.subj||{};var st=save.subj[T.k]||{lvl:1,c:0,a:0};st.lvl=lv;save.subj[T.k]=st}
  else if(S.type==='lumen'){save.level=lv;if(save.stats)save.stats.streak=0}});
 if(!any)return null;
 if(S.v&&save.v==null)save.v=S.v;
 return save}
/* where a kid is right now in one track, from their save (1-based level, or 0 if unknown) */
function current(g,t,save,young){var S=G[g];if(!S||!save)return 0;var T=S.tracks.find(function(x){return x.k===t});if(!T)return 0;
 if(S.type==='eng'||S.type==='flat'){var E=S.type==='eng'?save[t]:save;if(!E||!E.m||!E.placed)return 0;var order=T.all?(young?T.orderYoung:T.order):range(T.lv.length);for(var p=0;p<order.length;p++)if((E.m[order[p]]||0)<.8)return p+1;return order.length}
 if(S.type==='racer'){if(t==='lv')return save.lv||0;return save.q&&save.q[t]?save.q[t].lv:0}
 if(S.type==='summit')return save.subj&&save.subj[t]?save.subj[t].lvl:0;
 if(S.type==='lumen')return save.level||0;return 0}
window.__GSET={games:G,levels:levels,apply:apply,current:current};
})();
