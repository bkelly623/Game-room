const SKILLS=[
 {n:'Short a words (cat, map)',w:['cat:c.a.t:🐱:cat','hat:h.a.t:🎩','bat:b.a.t:🦇:bat','map:m.a.p:🗺️','van:v.a.n:🚐','can:c.a.n:🥫','rat:r.a.t:🐀:rat','bag:b.a.g:👜','pan:p.a.n:🍳','ram:r.a.m:🐏:ram','cab:c.a.b:🚕','ax:a.x:🪓']},
 {n:'Short i and o words (pig, dog)',w:['pig:p.i.g:🐷:pig','pin:p.i.n:📌','dog:d.o.g:🐶:dog','pot:p.o.t:🍲','fox:f.o.x:🦊:fox','box:b.o.x:📦','log:l.o.g:🪵','ox:o.x:🐂:ox','kid:k.i.d:🧒','bin:b.i.n:🗑️','hog:h.o.g:🐗:hog']},
 {n:'Short e and u words (bed, sun)',w:['bed:b.e.d:🛏️','hen:h.e.n:🐔:hen','net:n.e.t:🥅','web:w.e.b:🕸️','sun:s.u.n:☀️','bug:b.u.g:🐛:bug','cup:c.u.p:☕','bus:b.u.s:🚌','pen:p.e.n:🖊️','ten:t.e.n:🔟','egg:e.gg:🥚','nut:n.u.t:🥜','tub:t.u.b:🛁','leg:l.e.g:🦵','jet:j.e.t:✈️']},
 {n:'Blends (stop, frog, hand)',w:['stop:s.t.o.p:🛑','frog:f.r.o.g:🐸:frog','crab:c.r.a.b:🦀:crab','drum:d.r.u.m:🥁','flag:f.l.a.g:🚩','sled:s.l.e.d:🛷','hand:h.a.n.d:✋','tent:t.e.n.t:⛺','plug:p.l.u.g:🔌','swim:s.w.i.m:🏊','milk:m.i.l.k:🥛','gift:g.i.f.t:🎁','plant:p.l.a.n.t:🪴','skunk:s.k.u.n.k:🦨:skunk','drop:d.r.o.p:💧','lamp:l.a.m.p:💡']},
 {n:'sh, ch, th, ck (ship, duck)',w:['ship:sh.i.p:🚢','fish:f.i.sh:🐟:fish','shell:sh.e.ll:🐚','chick:ch.i.ck:🐤:chick','duck:d.u.ck:🦆:duck','sock:s.o.ck:🧦','lock:l.o.ck:🔒','rock:r.o.ck:🪨','truck:t.r.u.ck:🚚','brick:b.r.i.ck:🧱','clock:c.l.o.ck:⏰','dish:d.i.sh:🍽️','shop:sh.o.p:🏪','bath:b.a.th:🛀']},
 {n:'Magic e (cake, bike)',w:['cake:c.a*.k.e~:🎂','bike:b.i*.k.e~:🚲','bone:b.o*.n.e~:🦴','cube:c.u*.b.e~:🧊','kite:k.i*.t.e~:🪁','nose:n.o*.s.e~:👃','rose:r.o*.s.e~:🌹','snake:s.n.a*.k.e~:🐍:snake','skate:s.k.a*.t.e~:⛸️','smile:s.m.i*.l.e~:😃','cone:c.o*.n.e~:🍦','globe:g.l.o*.b.e~:🌍']},
 {n:'ee and ea (bee, leaf)',w:['bee:b.ee:🐝:bee','tree:t.r.ee:🌳','feet:f.ee.t:🦶','seal:s.ea.l:🦭:seal','leaf:l.ea.f:🍃','sheep:sh.ee.p:🐑:sheep','teeth:t.ee.th:🦷','peach:p.ea.ch:🍑','jeep:j.ee.p:🚙','seed:s.ee.d:🌱','beach:b.ea.ch:🏖️','queen:qu.ee.n:👸','meat:m.ea.t:🍖']},
 {n:'ai, ay, oa (rain, boat)',w:['rain:r.ai.n:🌧️','snail:s.n.ai.l:🐌:snail','train:t.r.ai.n:🚂','mail:m.ai.l:📬','pail:p.ai.l:🪣','paint:p.ai.n.t:🎨','boat:b.oa.t:⛵','goat:g.oa.t:🐐:goat','soap:s.oa.p:🧼','coat:c.oa.t:🧥','road:r.oa.d:🛣️','toast:t.oa.s.t:🍞']},
 {n:'ow and ou (cow, house)',w:['house:h.ou.s.e~:🏠','mouse:m.ou.s.e~:🐭:mouse','cow:c.ow:🐮:cow','owl:ow.l:🦉:owl','cloud:c.l.ou.d:☁️','crown:c.r.ow.n:👑','mouth:m.ou.th:👄','clown:c.l.ow.n:🤡','couch:c.ou.ch:🛋️','flower:f.l.ow.er:🌸','shower:sh.ow.er:🚿']},
 {n:'ar, or, oo (car, fork, moon)',w:['car:c.ar:🚗','star:s.t.ar:⭐','shark:sh.ar.k:🦈:shark','yarn:y.ar.n:🧶','fork:f.or.k:🍴','horn:h.or.n:📯','corn:c.or.n:🌽','moon:m.oo.n:🌙','spoon:s.p.oo.n:🥄','boot:b.oo.t:👢','book:b.oo.k:📖','storm:s.t.or.m:⛈️','horse:h.or.s.e~:🐴:horse']}
];
const SND={b:'buh',c:'kuh',k:'kuh',ck:'kuh',d:'duh',f:'fff',g:'guh',gg:'guh',h:'huh',j:'juh',l:'lll',ll:'lll',m:'mmm',n:'nnn',p:'puh',r:'rrr',s:'sss',ss:'sss',t:'tuh',v:'vvv',w:'wuh',x:'ks',y:'yuh',z:'zzz',qu:'kwuh',sh:'shhh',ch:'chuh',th:'thhh',
 a:'apple',e:'egg',i:'it',o:'octopus',u:'up','a*':'ay','i*':'eye','o*':'oh','u*':'you','e~':'Magic e. I am quiet!',ee:'ee',ea:'ee',ai:'ay',ay:'ay',oa:'oh',ow:'ow',ou:'ow',ar:'ar',or:'or',oo:'oo',er:'er',ur:'er',ir:'er',le:'lll',ks:'ks'};
const tileText=s=>s.replace(/[*~]/g,'');
const isVowelTile=s=>/^[aeiou]/.test(s)&&s!=='qu'||s==='ow'||s==='er'||s==='ar'||s==='or';
/* Distractor tiles that look or sound close. */
const CONF={b:['d','p'],d:['b','p'],p:['b','q'],m:['n','w'],n:['m','h'],g:['j','q'],c:['k','s'],k:['c','ck'],s:['z','c'],t:['f','l'],f:['v','t'],l:['t','i'],r:['n','w'],h:['n','b'],v:['f','w'],w:['v','m'],j:['g','y'],x:['ks','z'],y:['i','v'],qu:['k','w'],
 a:['e','u','o'],e:['i','a'],i:['e','a'],o:['u','a'],u:['o','a'],'a*':['e','i'],'i*':['e','a'],'o*':['u','a'],'u*':['o','a'],'e~':['a','y'],
 sh:['ch','s'],ch:['sh','c'],th:['f','t'],ck:['k','c'],ll:['l','le'],gg:['g','j'],ee:['ea','e'],ea:['ee','e'],ai:['ay','a'],oa:['o','ow'],ow:['ou','o'],ou:['ow','oo'],ar:['or','a'],or:['ar','o'],oo:['u','ou'],er:['ur','ir']};
