'use strict';
/* ================= helpers ================= */
const $=s=>document.querySelector(s);
const rnd=Math.random,ri=(a,b)=>a+Math.floor(rnd()*(b-a+1)),pick=a=>a[Math.floor(rnd()*a.length)];
const shuf=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const uniq=a=>[...new Set(a)];

/* ================= word banks ================= */
const PHON=[
 'cat:🐱 hat:🎩 bat:🦇 map:🗺️ van:🚐 can:🥫 rat:🐀 bag:👜 pan:🍳 ram:🐏 cab:🚕 ax:🪓',
 'pig:🐷 pin:📌 dog:🐶 pot:🍲 fox:🦊 box:📦 log:🪵 ox:🐂 kid:🧒 bin:🗑️ hog:🐗 lip:👄',
 'bed:🛏️ hen:🐔 net:🥅 web:🕸️ sun:☀️ bug:🐛 cup:☕ bus:🚌 pen:🖊️ ten:🔟 egg:🥚 nut:🥜 tub:🛁 leg:🦵 jet:✈️',
 'stop:🛑 frog:🐸 crab:🦀 drum:🥁 flag:🚩 sled:🛷 hand:✋ tent:⛺ plug:🔌 swim:🏊 milk:🥛 gift:🎁 plant:🪴 skunk:🦨 lamp:💡',
 'ship:🚢 fish:🐟 shell:🐚 chick:🐤 duck:🦆 sock:🧦 lock:🔒 rock:🪨 truck:🚚 brick:🧱 clock:⏰ dish:🍽️ shop:🏪 bath:🛀',
 'cake:🎂 bike:🚲 bone:🦴 cube:🧊 kite:🪁 nose:👃 rose:🌹 snake:🐍 skate:⛸️ smile:😃 cone:🍦 globe:🌍',
 'bee:🐝 tree:🌳 feet:🦶 seal:🦭 leaf:🍃 sheep:🐑 teeth:🦷 peach:🍑 jeep:🚙 seed:🌱 beach:🏖️ queen:👸 meat:🍖',
 'rain:🌧️ snail:🐌 train:🚂 mail:📬 paint:🎨 boat:⛵ goat:🐐 soap:🧼 coat:🧥 road:🛣️ toast:🍞 sail:⛵',
 'house:🏠 mouse:🐭 cow:🐮 owl:🦉 cloud:☁️ crown:👑 mouth:👄 clown:🤡 couch:🛋️ flower:🌸 shower:🚿',
 'car:🚗 star:⭐ shark:🦈 yarn:🧶 fork:🍴 horn:📯 corn:🌽 moon:🌙 spoon:🥄 boot:👢 book:📖 storm:⛈️ horse:🐴'
].map((row,s)=>row.split(' ').map(p=>{const [w,em]=p.split(':');return{w,em,s}}));
/* sail and boat share a picture, so sail is only used for spelling. */
const PH_ALL=PHON.flat();
const OPP=[['hot','cold'],['big','small'],['up','down'],['fast','slow'],['happy','sad'],['wet','dry'],['full','empty'],['loud','quiet'],['open','closed'],['early','late'],['top','bottom'],['hard','soft'],['push','pull'],['tall','short'],['win','lose'],['day','night'],['inside','outside'],['first','last'],['old','new'],['awake','asleep'],['give','take'],['clean','dirty'],['heavy','light'],['brave','scared'],['sweet','sour'],['always','never'],['above','below'],['laugh','cry']];
const SYN=[['big','huge'],['small','tiny'],['happy','glad'],['fast','quick'],['angry','mad'],['smart','clever'],['scared','afraid'],['shout','yell'],['begin','start'],['finish','end'],['jump','leap'],['look','stare'],['rock','stone'],['gift','present'],['simple','easy'],['silly','goofy'],['tired','sleepy'],['grab','snatch'],['rush','hurry'],['shut','close'],['sick','ill'],['quiet','silent'],['center','middle'],['choose','pick'],['wealthy','rich'],['giggle','laugh']];
const VOC=[['enormous','very, very big'],['ancient','very old'],['furious','very angry'],['timid','shy and easily scared'],['swift','very fast'],['exhausted','very tired'],['delicious','tastes really good'],['fragile','breaks easily'],['generous','happy to share'],['curious','wants to find out'],['gloomy','dark and sad'],['victory','a win'],['frigid','freezing cold'],['peculiar','strange or odd'],['sturdy','strong, hard to break'],['vanish','disappear'],['soggy','wet and squishy'],['brilliant','very bright or very smart'],['cautious','careful'],['famished','very hungry'],['gigantic','huge'],['hilarious','very funny'],['nimble','quick and light on your feet'],['ruckus','a noisy mess'],['stubborn','will not change their mind'],['mischief','playful trouble']];
const SIGHT=[
 'a and away big blue can come down find for funny go help here I in is it jump little look make me my not one play red run said see the three to two up we where yellow you',
 'all am are at ate be black brown but came did do eat four get good have he into like must new no now on our out please pretty ran ride saw say she so soon that there they this too under want was well went what white who will with yes',
 'after again an any as ask by could every fly from give going had has her him his how just know let live may of old once open over put round some stop take thank them then think walk were when',
 'always around because been before best both buy call cold does fast first five found gave goes green its made many off or pull read right sing sit sleep tell their these those upon us use very wash which why wish work would write your',
 'about better bring carry clean cut done draw drink eight fall far full got grow hold hot hurt if keep kind laugh light long much myself never only own pick seven shall show six small start ten today together try warm'
].map(r=>r.split(' '));
const SPELL_HARD=[
 [['because','I laughed because the goat burped.'],['friend','My friend has a pet frog.'],['people','Lots of people came to the castle.'],['could','I could hear the ogre snore.'],['would','Would you like some pudding?'],['should','You should run from the goblins!'],['again','The goblins came back again.'],['every','I brush my teeth every day.'],['many','How many arrows do you have?'],['after','We ate cake after the battle.'],['before','Wash your hands before dinner.'],['laugh','The king made me laugh.'],['night','Bats fly at night.'],['right','You got the right answer!'],['which','Which way did the goblin go?'],['where','Where is my crown?'],['there','There is a wolf over there.'],['their','The goblins lost their snacks.'],['said','The king said, "Fire!"'],['were','We were very brave.'],['little','A little bat flew by.'],['write','I can write my name.'],['know','I know the answer.'],['once','Once upon a time, a king had a wall.'],['always','The ogre is always hungry.']],
 [['beautiful','What a beautiful castle!'],['different','The two goblins look different.'],['enough','Do we have enough arrows?'],['favorite','Pudding is the king\'s favorite food.'],['important','The wall is very important.'],['through','The arrow flew through the air.'],['thought','I thought it was a bat.'],['tomorrow','We will battle again tomorrow.'],['answer','Tap the right answer.'],['believe','I believe in you!'],['caught','The knight caught the goblin.'],['early','The goblins came early.'],['question','Answer the question fast.'],['special','Today is a special day.'],['surprise','The chest had a surprise inside.'],['minute','Wait one minute.'],['often','Ogres often smell bad.'],['probably','It will probably rain.'],['remember','Remember to aim for the ogre.'],['together','We win when we work together.'],['finally','We finally beat Big Gary!'],['really','That wolf is really fast.'],['decided','The king decided to build a tower.'],['weird','The bat made a weird noise.'],['busy','The archers are very busy.']],
 [['necessary','Is it necessary to shout?'],['separate','Keep the wolves separate.'],['definitely','We will definitely win.'],['restaurant','The ogre ate at a restaurant.'],['environment','Keep the environment clean.'],['government','The government made a new law.'],['knowledge','Knowledge is power.'],['temperature','The temperature dropped at night.'],['rhythm','The drums kept a steady rhythm.'],['especially','I love pudding, especially chocolate.'],['opportunity','This is our opportunity to win!'],['immediately','Come here immediately!'],['occasion','A royal feast is a big occasion.'],['appearance','The ogre made a sudden appearance.'],['villain','The ogre is the villain.'],['guarantee','I guarantee the wall will hold.'],['exaggerate','Don\'t exaggerate about the ogre.'],['mischievous','The mischievous goblin stole a sock.'],['vacuum','The king needs a vacuum for the crumbs.'],['committee','The goblin committee had a meeting.'],['receive','You will receive a golden chest.'],['physical','Battle is hard physical work.'],['embarrass','Don\'t embarrass the king!'],['conscience','Listen to your conscience.'],['accidentally','I accidentally sat on my crown.']]
];

/* ================= misspellings ================= */
function misspell(w){
 const out=new Set(),add=v=>{if(v&&v!==w&&v.length>1&&/[aeiouy]/.test(v))out.add(v)};
 const swaps=[['ee','ea'],['ea','ee'],['ai','ay'],['ay','ai'],['oa','ow'],['ow','ou'],['ou','ow'],['ie','ei'],['ei','ie'],['ph','f'],['ck','k'],['ck','c'],['ll','l'],['ss','s'],['tion','shun'],['ture','cher'],['ough','uff'],['ough','ow'],['augh','af'],['igh','i'],['ight','ite'],['le','el'],['el','le'],['er','ur'],['or','er'],['ar','or'],['wh','w'],['kn','n'],['wr','r'],['oo','u'],['ue','oo'],['ea','e'],['ai','a'],['ou','u'],['au','o'],['c','k'],['k','c'],['s','c'],['ce','se'],['y','ie'],['ey','y'],['ful','full'],['ly','ley'],['ious','ous'],['sc','s'],['mb','m'],['gh','g'],['our','or'],['ence','ance'],['ance','ence'],['ent','ant'],['ant','ent']];
 for(const [a,b] of swaps){let i=w.indexOf(a);while(i>=0){add(w.slice(0,i)+b+w.slice(i+a.length));i=w.indexOf(a,i+1)}}
 /* doubled letters */
 for(let i=1;i<w.length;i++){if(w[i]===w[i-1])add(w.slice(0,i)+w.slice(i+1));else if(/[bcdfglmnprst]/.test(w[i])&&i<w.length-1&&/[aeiou]/.test(w[i-1]))add(w.slice(0,i)+w[i]+w.slice(i))}
 /* vowels */
 const V={a:'e',e:'i',i:'e',o:'u',u:'o'};
 for(let i=0;i<w.length;i++)if(V[w[i]]&&!(V[w[i+1]]||V[w[i-1]]))add(w.slice(0,i)+V[w[i]]+w.slice(i+1));
 if(/[^aeiou]e$/.test(w))add(w.slice(0,-1));else if(/[^aeiouy]$/.test(w)&&w.length<6)add(w+'e');
 /* silent letters and swaps */
 for(let i=1;i<w.length-1;i++)if(/[aeiou]/.test(w[i])&&/[aeiou]/.test(w[i+1]))add(w.slice(0,i)+w[i+1]+w[i]+w.slice(i+2));
 let L=[...out];
 /* keep the ones that look the most like the real word */
 const sim=v=>(v[0]===w[0]?3:0)+(v.length===w.length?1.5:0)-Math.abs(v.length-w.length)*(w.length<5?2:1);
 L.sort((a,b)=>sim(b)-sim(a)+(rnd()-.5)*1.5);
 if(L.length<3){for(let i=1;i<w.length-1&&L.length<6;i++){const v=w.slice(0,i)+w.slice(i+1);if(!L.includes(v)&&v!==w)L.push(v)}}
 for(let i=0;L.length<3&&i<w.length-1;i++){const v=w.slice(0,i)+w[i+1]+w[i]+w.slice(i+2);if(v!==w&&!L.includes(v))L.push(v)}
 const extra=['e','a','y','h'];for(let i=0;L.length<3&&i<extra.length;i++){const v=w+extra[i];if(!L.includes(v))L.push(v)}
 return L}

/* ================= question generators ================= */
const FRUIT=[['🍎','apples'],['🍌','bananas'],['🐸','frogs'],['⭐','stars'],['🍪','cookies'],['🐟','fish'],['🦆','ducks'],['🍩','donuts'],['🐌','snails']];
const OPS={'+':'plus','−':'minus','×':'times','÷':'divided by'};
function numChoices(ans,o={}){const lo=o.min||0,hi=o.max==null?1e9:o.max,out=[];
 const add=n=>{if(n>=lo&&n<=hi&&n!==ans&&!out.includes(n))out.push(n)};
 if(o.alt!=null)add(o.alt);
 const near=[ans+1,ans-1,ans+2,ans-2];if(ans>=10)near.push(ans+10,ans-10);if(o.f>1)near.push(ans+o.f,ans-o.f,ans+o.f,ans-o.f);
 if(ans>=12&&ans<100){const s=String(ans);if(s[0]!==s[1]&&s[1]!=='0')near.push(+(s[1]+s[0]))}
 shuf(near).forEach(add);let k=3;while(out.length<3&&k<60){add(ans+k);add(ans-k);k++}
 return out.slice(0,3)}
function mathQ(ans,text,o={}){const wrong=numChoices(ans,o);
 return{kind:'num',prompt:o.prompt||{ask:o.ask||'',big:text},say:o.say||'',ans:String(ans),opts:shuf([String(ans),...wrong.map(String)]),fix:o.fix||(text+' = '+ans),fixSay:o.fixSay||((o.say||text)+' is '+ans)}}
function sayOp(a,op,b){return a+' '+OPS[op]+' '+b}
function genMath(lv){
 const F=pick(FRUIT);let a,b,op;
 const bin=(a,op,b,ans,o={})=>mathQ(ans,`${a} ${op} ${b}`,Object.assign({say:sayOp(a,op,b),f:op==='×'?Math.min(a,b):0},o));
 switch(lv){
 case 1:case 2:{const n=lv===1?ri(1,5):ri(3,10);const rows=n>5?F[0].repeat(5)+'<br>'+F[0].repeat(n-5):F[0].repeat(n);
  return mathQ(n,'',{prompt:{ask:'How many?',pics:rows},say:'How many '+F[1]+'?',min:1,max:lv===1?6:12,fix:'There are '+n,fixSay:'There are '+n+' '+F[1]})}
 case 3:a=ri(1,4);b=ri(1,5-a);return mathQ(a+b,'',{prompt:{ask:'How many in all?',pics:F[0].repeat(a)+' ➕ '+F[0].repeat(b),big2:a+' + '+b},say:sayOp(a,'+',b),min:1,max:8,fix:a+' + '+b+' = '+(a+b)});
 case 4:a=ri(1,9);b=ri(1,10-a);return bin(a,'+',b,a+b,{min:1});
 case 5:a=ri(3,10);b=ri(1,a);return bin(a,'−',b,a-b);
 case 6:if(rnd()<.5){a=ri(4,15);b=ri(2,20-a);return bin(a,'+',b,a+b)}a=ri(11,20);b=ri(2,a-1);return bin(a,'−',b,a-b);
 case 7:{const r=rnd();if(r<.4){a=ri(2,8)*10+ri(1,7);b=ri(1,9-a%10);return bin(a,'+',b,a+b)}if(r<.7){a=ri(2,9)*10+ri(4,9);b=ri(1,a%10);return bin(a,'−',b,a-b)}a=ri(1,6)*10;b=ri(1,9-a/10)*10;return bin(a,'+',b,a+b)}
 case 8:if(rnd()<.5){a=ri(15,69);b=ri(12,95-a);if((a%10)+(b%10)<10)b+=10-((a%10)+(b%10))%10;if(a+b>99)b=ri(12,20);return bin(a,'+',b,a+b,{alt:a+b-10})}a=ri(31,95);b=ri(12,a-8);if(a%10>=b%10)b=Math.min(a-5,b+(a%10-b%10)+1);return bin(a,'−',b,a-b,{alt:a-b+10});
 case 9:{const f=pick([2,5,10]),n=ri(1,10);return rnd()<.5?bin(f,'×',n,f*n,{f}):bin(n,'×',f,f*n,{f})}
 case 10:{const f=pick([3,4,6,7,8,9,6,7,8]),n=ri(2,10);return rnd()<.5?bin(f,'×',n,f*n,{f}):bin(n,'×',f,f*n,{f})}
 case 11:{const f=ri(2,9),n=ri(2,10),p=f*n;if(rnd()<.6)return bin(p,'÷',f,n,{f:1});return mathQ(n,`${f} × ? = ${p}`,{say:f+' times what is '+p+'?',fix:f+' × '+n+' = '+p,fixSay:f+' times '+n+' is '+p})}
 case 12:{const r=rnd();if(r<.45){a=ri(12,39);b=ri(2,6);return bin(a,'×',b,a*b,{f:b,alt:a*b+10})}if(r<.75){a=ri(120,780);b=ri(25,199);return bin(a,'+',b,a+b,{alt:a+b+10})}a=ri(300,900);b=ri(25,199);return bin(a,'−',b,a-b,{alt:a-b+10})}
 default:{const r=rnd();if(r<.4){const d=pick([2,3,4,5,10]),n=d*ri(2,10);return mathQ(n/d,`¹⁄${['','','₂','₃','₄','₅','','','','','₁₀'][d]} of ${n}`,{say:'one '+['','','half','third','fourth','fifth','','','','','tenth'][d]+' of '+n,fix:'1/'+d+' of '+n+' = '+n/d})}
  if(r<.7){a=ri(3,9);b=ri(2,6);const c=ri(2,9);return mathQ(c+a*b,`${c} + ${a} × ${b}`,{say:c+' plus '+a+' times '+b,alt:(c+a)*b,fix:'Times first! '+c+' + '+(a*b)+' = '+(c+a*b),fixSay:'Do the times first. '+c+' plus '+(a*b)+' is '+(c+a*b)})}
  a=ri(11,25);b=ri(3,9);return bin(a,'×',b,a*b,{f:b,alt:a*b+10})}
 }}
function scoreLike(a,b){let s=0;if(a[0]===b[0])s+=2;if(a.slice(-1)===b.slice(-1))s+=2;if(a.length===b.length)s+=1;for(const ch of new Set(a))if(b.includes(ch))s+=.5;return s}
function likeOnes(target,pool,n,key=x=>x){const tk=key(target);const c=pool.filter(p=>key(p)!==tk).map(p=>({p,s:scoreLike(tk,key(p))+rnd()*2.6}));c.sort((x,y)=>y.s-x.s);const out=[];for(const {p} of c){if(out.length>=n)break;if(!out.some(o=>key(o)===key(p)))out.push(p)}return out}
function genRead(lv){
 if(lv<=10){const s=lv-1;const src=rnd()<.25&&s>0?PHON[ri(Math.max(0,s-2),s-1)]:PHON[s];
  const t=pick(src.filter(x=>x.w!=='sail'));
  const pool=PH_ALL.filter(x=>Math.abs(x.s-t.s)<=1&&x.em!==t.em&&x.w!=='sail');
  const others=likeOnes(t,pool,3,x=>x.w).filter((x,i,a)=>a.findIndex(y=>y.em===x.em)===i);
  while(others.length<3){const x=pick(PH_ALL);if(x.em!==t.em&&!others.some(o=>o.em===x.em))others.push(x)}
  return{kind:'pic',reveal:true,prompt:{ask:'Read it, then tap the picture',word:t.w},ans:t.em,opts:shuf([t.em,...others.map(o=>o.em)]),fix:t.w+' = '+t.em,fixSay:'That says '+t.w+'.',key:'rd:'+t.w}}
 if(lv===11){const p=pick(OPP),flip=rnd()<.5,q=flip?p[1]:p[0],a=flip?p[0]:p[1];
  const wrong=shuf(OPP.filter(x=>x!==p).flat()).filter(w=>w!==q).slice(0,3);
  return{kind:'txt',reveal:true,prompt:{ask:'What is the opposite of',big:q.toUpperCase()},ans:a,opts:shuf([a,...wrong]),fix:q+' ↔ '+a,fixSay:'The opposite of '+q+' is '+a+'.',key:'opp:'+q}}
 if(lv===12){const p=pick(SYN),q=p[0],a=p[1];const wrong=shuf(SYN.filter(x=>x!==p).map(x=>x[1])).slice(0,3);
  return{kind:'txt',reveal:true,prompt:{ask:'Which word means the same as',big:q.toUpperCase()},ans:a,opts:shuf([a,...wrong]),fix:q+' = '+a,fixSay:q+' means '+a+'.',key:'syn:'+q}}
 const p=pick(VOC);const wrong=shuf(VOC.filter(x=>x!==p).map(x=>x[1])).slice(0,3);
 return{kind:'txt',small:true,reveal:true,prompt:{ask:'What does this word mean?',big:p[0]},ans:p[1],opts:shuf([p[1],...wrong]),fix:p[0]+' = '+p[1],fixSay:p[0]+' means '+p[1]+'.',key:'voc:'+p[0]}}
/* words that sound the same can't be told apart by ear, so they never appear together,
   and a sound-alike word is always said inside a sentence */
const HOMO=[['to','two','too'],['for','four'],['there','their'],['one','won'],['no','know'],['right','write'],['by','buy'],['ate','eight'],['red','read'],['new','knew'],['here','hear'],['be','bee'],['see','sea'],['so','sew'],['blue','blew'],['our','are']];
const homoOf=w=>(HOMO.find(g=>g.includes(w))||[w]);
const SAYIN={two:'I have two hands.',to:'I go to the park.',too:'Me too!',four:'A dog has four legs.',for:'This gift is for you.',there:'Look over there.',their:'They love their dog.',one:'I have one nose.',eight:'A spider has eight legs.',ate:'I ate a cookie.',right:'Turn right.',write:'I can write my name.',read:'I like to read books.',red:'The apple is red.',new:'I got new shoes.',know:'I know the answer.',no:'No, thank you.',by:'Sit by me.',buy:'Let\'s buy a toy.',here:'Come here.',see:'I can see you.',be:'Be nice.',blue:'The sky is blue.',so:'I am so happy.',our:'This is our house.',are:'We are friends.'};
function genSight(lv){const list=SIGHT[lv-1];const w=pick(list);const pool=(lv>1?list.concat(SIGHT[lv-2]):list).filter(x=>!homoOf(w).includes(x)&&!homoOf(x).some(h=>h!==x&&h===w));
 const others=likeOnes(w,pool,3).filter(o=>!homoOf(o).includes(w));
 const sent=SAYIN[w];const say=w==='I'?'I. Find the word I.':'Find the word: '+w+'.'+(sent?' '+sent+' '+w+'.':'');
 return{kind:'txt',word:true,listen:true,reveal:true,prompt:{ask:'Find the word you hear',big:'🔊'},say,ans:w,opts:shuf([w,...others]),fix:'It was "'+w+'"',fixSay:'This one says '+w+'.'+(sent?' '+sent:''),key:'sw:'+w}}
function genSpell(lv){let w,em=null,sent=null;
 if(lv<=3){const rows=lv===1?[0,1,2]:lv===2?[3,4]:[5,6,7,8,9];const t=pick(rows.flatMap(r=>PHON[r]).filter(x=>x.w.length>2));w=t.w;em=t.em}
 else{const t=pick(SPELL_HARD[lv-4]);w=t[0];sent=t[1]}
 const wrong=misspell(w).slice(0,3);
 const prompt=sent?{ask:'Which spelling is right?',sent:sent.replace(new RegExp('\\b'+w+'\\b','i'),'<u></u>')}:{ask:'Which spelling is right?',pics:em};
 return{kind:'txt',word:true,listen:true,prompt,say:sent?w+'. '+sent+' '+w+'.':w,ans:w,opts:shuf([w,...wrong]),fix:'It is spelled '+w,fixSay:w+' is spelled '+w.split('').join(', ')+'.',key:'sp:'+w}}
function genQ(s,lv){if(s==='ma')return genMath(lv);if(s==='rd')return genRead(lv);if(s==='sw')return genSight(lv);return genSpell(lv)}
