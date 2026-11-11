/* King's Wall: subjects, levels and starting settings. Shared by the game and the grown-up page. */
window.KW={
 subjects:{
  ma:{n:'Math',em:'➕',lv:['Count to 5','Count to 10','Add to 5 with pictures','Add within 10','Take away within 10','Add and take away to 20','Two-digit, easy (34 + 5)','Two-digit with carrying','Times 2, 5 and 10','All times tables','Division facts','Bigger numbers (23 × 4)','Fractions and mixed']},
  rd:{n:'Reading',em:'📖',lv:['Short a words (cat, map)','Short i and o (pig, dog)','Short e and u (bed, sun)','Blends (stop, frog)','sh, ch, th, ck (ship, duck)','Magic e (cake, bike)','ee and ea (bee, leaf)','ai and oa (rain, boat)','ow and ou (cow, house)','ar, or, oo (car, moon)','Opposites','Same meaning','Big words']},
  sw:{n:'Sight words',em:'👀',lv:['Pre-K (the, see, go)','Kindergarten (was, they)','First grade (could, every)','Second grade (because, which)','Third grade (together, laugh)']},
  sp:{n:'Spelling',em:'✏️',lv:['Short vowel words (cat)','Blends and sh, ch (frog, ship)','Magic e and vowel teams (cake, rain)','Tricky words (because, friend)','Harder words (beautiful)','Challenge words (necessary)']}
 },
 speeds:{easy:'Easy',normal:'Normal',hard:'Hard'},
 defaults:function(id){
  if(id==='luca')return{subj:['rd','sw','ma'],lv:{ma:1,rd:1,sw:1,sp:1},speed:'easy',strict:true};
  if(id==='jack')return{subj:['ma','sp'],lv:{ma:9,rd:11,sw:4,sp:3},speed:'normal'};
  if(id==='vinny')return{subj:['ma','sp'],lv:{ma:10,rd:12,sw:5,sp:4},speed:'normal'};
  return{subj:['ma','rd'],lv:{ma:4,rd:3,sw:1,sp:2},speed:'normal'}}
};
