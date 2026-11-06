/* ================= drawing ================= */
let cv,cx,CW=0,CH=0,DPR=1,K=1,OX=0,OY=0,BG=null;const goldPos={x:0,y:0};
function resize(){const f=$('#field').getBoundingClientRect();DPR=Math.min(2,window.devicePixelRatio||1);CW=f.width;CH=f.height;
 cv.width=Math.max(1,CW*DPR|0);cv.height=Math.max(1,CH*DPR|0);cv.style.width=CW+'px';cv.style.height=CH+'px';
 K=Math.min(CW/W,CH/(H-20));OX=(CW-W*K)/2;OY=CH-H*K;
 const g=$('#goldN').getBoundingClientRect();goldPos.x=g.left-f.left+g.width/2;goldPos.y=g.top-f.top+g.height/2;
 buildBG()}
/* decorations are fixed per session so the field looks the same each time */
let DECOR=null;
function makeDecor(){let seed=7;const r=()=>(seed=(seed*16807)%2147483647)/2147483647;DECOR=[];
 for(let i=0;i<70;i++){const side=i%2?1:-1;const x=side<0?-400+r()*430:W-30+r()*430,y=-700+r()*(WALLY+640);DECOR.push({k:'tree',x,y,s:.8+r()*.6})}
 for(let i=0;i<26;i++)DECOR.push({k:'rock',x:20+r()*(W-40),y:-700+r()*(WALLY+620),s:.5+r()*.7});
 for(let i=0;i<90;i++)DECOR.push({k:'flower',x:-300+r()*(W+600),y:-700+r()*(WALLY+660),c:['#FFE45C','#FF7BAC','#fff','#9BD0FF'][i%4]});
 for(let i=0;i<20;i++)DECOR.push({k:'bush',x:(i%2?r()*60:W-60+r()*60),y:-600+r()*(WALLY+520),s:.7+r()*.5});
 DECOR.sort((a,b)=>a.y-b.y)}
function buildBG(){if(!DECOR)makeDecor();BG=document.createElement('canvas');BG.width=cv.width;BG.height=cv.height;const c=BG.getContext('2d');
 c.setTransform(DPR,0,0,DPR,0,0);
 const g=c.createLinearGradient(0,0,0,CH);g.addColorStop(0,'#4E9A36');g.addColorStop(1,'#6CBF48');c.fillStyle=g;c.fillRect(0,0,CW,CH);
 c.save();c.translate(OX,OY);c.scale(K,K);
 /* grass tufts */
 let seed=3;const r=()=>(seed=(seed*16807)%2147483647)/2147483647;
 c.strokeStyle='rgba(30,90,20,.25)';c.lineWidth=2;for(let i=0;i<500;i++){const x=-500+r()*(W+1000),y=-800+r()*(WALLY+780);c.beginPath();c.moveTo(x,y);c.lineTo(x-3,y-7);c.moveTo(x+3,y);c.lineTo(x+5,y-8);c.stroke()}
 c.fillStyle='rgba(255,255,255,.05)';for(let i=0;i<60;i++){c.beginPath();c.ellipse(-400+r()*(W+800),-800+r()*1400,30+r()*60,14+r()*20,0,0,7);c.fill()}
 /* dirt road */
 c.fillStyle='#C9A26B';c.beginPath();c.moveTo(KX-70,-900);c.bezierCurveTo(KX-40,0,KX-130,300,KX-150,WALLY+10);c.lineTo(KX+150,WALLY+10);c.bezierCurveTo(KX+130,300,KX+40,0,KX+70,-900);c.fill();
 c.fillStyle='rgba(120,80,40,.18)';for(let i=0;i<80;i++){const y=-800+r()*(WALLY+780),w=60+(y+800)/(WALLY+800)*80;c.beginPath();c.ellipse(KX+(r()-.5)*w*1.6,y,3+r()*5,2+r()*3,0,0,7);c.fill()}
 c.strokeStyle='rgba(90,60,20,.25)';c.lineWidth=3;c.setLineDash([14,16]);c.beginPath();c.moveTo(KX,-900);c.bezierCurveTo(KX,0,KX,300,KX,WALLY);c.stroke();c.setLineDash([]);
 for(const d of DECOR){if(d.k==='flower'){c.fillStyle=d.c;c.beginPath();c.arc(d.x,d.y,2.6,0,7);c.fill()}
  else if(d.k==='rock'){c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.ellipse(d.x+3,d.y+5*d.s,14*d.s,6*d.s,0,0,7);c.fill();c.fillStyle='#9A9AAE';c.beginPath();c.ellipse(d.x,d.y,13*d.s,10*d.s,0,0,7);c.fill();c.fillStyle='#BDBDCF';c.beginPath();c.ellipse(d.x-3*d.s,d.y-3*d.s,7*d.s,4*d.s,0,0,7);c.fill()}
  else if(d.k==='bush'){c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.ellipse(d.x,d.y+8*d.s,22*d.s,7*d.s,0,0,7);c.fill();c.fillStyle='#3E8A2A';[[-10,0,12],[8,-2,13],[0,-8,12]].forEach(([a,b,rr])=>{c.beginPath();c.arc(d.x+a*d.s,d.y+b*d.s,rr*d.s,0,7);c.fill()});c.fillStyle='#E84A5F';c.beginPath();c.arc(d.x+4*d.s,d.y-6*d.s,2.5,0,7);c.arc(d.x-6*d.s,d.y-1*d.s,2.5,0,7);c.fill()}
  else if(d.k==='tree')drawTree(c,d.x,d.y,d.s)}
 drawWall(c);
 c.restore()}
function drawTree(c,x,y,s){c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(x+6*s,y+14*s,30*s,10*s,0,0,7);c.fill();
 c.fillStyle='#7A4E2A';c.fillRect(x-5*s,y-4*s,10*s,20*s);
 c.fillStyle='#2F7A26';c.beginPath();c.arc(x,y-14*s,26*s,0,7);c.fill();c.fillStyle='#3E9A30';c.beginPath();c.arc(x-6*s,y-20*s,19*s,0,7);c.fill();
 c.fillStyle='#5BBE45';c.beginPath();c.arc(x-11*s,y-26*s,9*s,0,7);c.fill()}
function drawWall(c){const y=WALLY;
 /* courtyard */
 c.fillStyle='#B98E5A';c.fillRect(-800,y+40,W+1600,200);
 c.fillStyle='rgba(0,0,0,.08)';for(let x=-800;x<W+800;x+=26)for(let yy=y+46;yy<y+200;yy+=18)c.fillRect(x+((yy/18|0)%2)*13,yy,22,14);
 const roofs=[[-40,'#D9534F'],[60,'#3A7BFF'],[340,'#D9534F'],[450,'#E09B12'],[-150,'#E09B12'],[560,'#3A7BFF']];
 roofs.forEach(([x,col])=>{c.fillStyle='#F2E2C2';c.fillRect(x-30,y+66,60,40);c.fillStyle=col;c.beginPath();c.moveTo(x-38,y+70);c.lineTo(x,y+44);c.lineTo(x+38,y+70);c.fill();c.fillStyle='#5A3A1A';c.fillRect(x-6,y+86,12,20)});
 /* wall body */
 c.fillStyle='rgba(0,0,0,.25)';c.fillRect(-800,y-2,W+1600,8);
 c.fillStyle='#8F93AE';c.fillRect(-800,y,W+1600,46);
 c.fillStyle='#7A7E99';for(let row=0;row<3;row++)for(let x=-800+(row%2)*18;x<W+800;x+=36)c.fillRect(x+1,y+4+row*14,34,12);
 c.fillStyle='#A8ACC6';for(let row=0;row<3;row++)for(let x=-800+(row%2)*18;x<W+800;x+=36)c.fillRect(x+1,y+4+row*14,34,3);
 c.fillStyle='#B5B9D2';c.fillRect(-800,y-8,W+1600,10);
 c.fillStyle='#C9CDE3';for(let x=-800;x<W+800;x+=30){c.fillRect(x,y-22,18,16);c.fillStyle='#9EA2BC';c.fillRect(x,y-8,18,3);c.fillStyle='#C9CDE3'}
 /* gate tower */
 c.fillStyle='#7F83A0';c.fillRect(KX-40,y-30,80,76);c.fillStyle='#C9CDE3';for(let i=0;i<4;i++)c.fillRect(KX-40+i*22,y-44,14,16);
 c.fillStyle='#4A2E18';c.beginPath();c.moveTo(KX-20,y+46);c.lineTo(KX-20,y+16);c.arc(KX,y+16,20,Math.PI,0);c.lineTo(KX+20,y+46);c.fill();
 c.strokeStyle='#2E1A0A';c.lineWidth=2;for(let i=-12;i<=12;i+=8){c.beginPath();c.moveTo(KX+i,y+4);c.lineTo(KX+i,y+46);c.stroke()}
 /* banners */
 [[KX-58,'#D9534F'],[KX+58,'#3A7BFF']].forEach(([x,col])=>{c.fillStyle=col;c.beginPath();c.moveTo(x-9,y+4);c.lineTo(x+9,y+4);c.lineTo(x+9,y+34);c.lineTo(x,y+28);c.lineTo(x-9,y+34);c.fill();c.fillStyle='#FFC93C';c.beginPath();c.arc(x,y+16,4,0,7);c.fill()})}

function circle(x,y,r,col){cx.fillStyle=col;cx.beginPath();cx.arc(x,y,r,0,6.283);cx.fill()}
function ell(x,y,rx,ry,col){cx.fillStyle=col;cx.beginPath();cx.ellipse(x,y,rx,ry,0,0,6.283);cx.fill()}
function eyes(x,y,s,ang,mad){[-1,1].forEach(d=>{circle(x+d*5*s,y,4.2*s,'#fff');circle(x+d*5*s,y+1*s,2.2*s,'#1A1030')});
 if(mad){cx.strokeStyle='#1A1030';cx.lineWidth=2*s;cx.beginPath();cx.moveTo(x-9*s,y-6*s);cx.lineTo(x-2*s,y-3.5*s);cx.moveTo(x+9*s,y-6*s);cx.lineTo(x+2*s,y-3.5*s);cx.stroke()}}
function drawEnemy(e){const T=TYPES[e.ty],s=e.r/14*.9*(.82+.18*clamp(e.y/WALLY,0,1)),bob=Math.abs(Math.sin(e.an))*3*s,x=e.x,y=e.y;
 const fly=T.fly;ell(x,y+e.r*.55+(fly?16:0),e.r*.95,e.r*.38,'rgba(0,0,0,.22)');
 const yy=y-bob-(fly?14+Math.sin(e.an*1.5)*4:0);
 cx.save();if(e.atWall&&!fly){const lean=Math.sin(e.an*1.3)*.08;cx.translate(x,yy);cx.rotate(lean);cx.translate(-x,-yy)}
 if(e.ty==='gob'||e.ty==='bomb'){const col=e.ty==='bomb'?'#E8664F':'#6CC24A',dk=e.ty==='bomb'?'#9A2E22':'#2F6A1E';
  /* ears */cx.fillStyle=dk;cx.beginPath();cx.moveTo(x-10*s,yy-4*s);cx.lineTo(x-22*s,yy-12*s);cx.lineTo(x-9*s,yy+2*s);cx.moveTo(x+10*s,yy-4*s);cx.lineTo(x+22*s,yy-12*s);cx.lineTo(x+9*s,yy+2*s);cx.fill();
  circle(x,yy,14*s,dk);circle(x,yy,12.5*s,col);ell(x,yy+5*s,7*s,5*s,'rgba(255,255,255,.25)');eyes(x,yy-3*s,s,0,true);
  cx.fillStyle='#1A1030';cx.beginPath();cx.arc(x,yy+4*s,4.5*s,0,Math.PI);cx.fill();cx.fillStyle='#fff';cx.fillRect(x-3*s,yy+4*s,2*s,2*s);cx.fillRect(x+1*s,yy+4*s,2*s,2*s);
  if(e.ty==='bomb'){circle(x+14*s,yy+6*s,7*s,'#222');circle(x+12*s,yy+4*s,2*s,'#666');cx.strokeStyle='#8A6A3A';cx.lineWidth=2;cx.beginPath();cx.moveTo(x+17*s,yy);cx.lineTo(x+20*s,yy-5*s);cx.stroke();circle(x+20*s,yy-6*s,2.5+Math.random()*2,'#FFC93C')}
  else{cx.fillStyle='#C9CDE3';cx.fillRect(x+11*s,yy-2*s,3*s,12*s);cx.fillStyle='#5A3A1A';cx.fillRect(x+10*s,yy+8*s,5*s,4*s)}}
 else if(e.ty==='wolf'){/* wolf body + tiny rider */ell(x,yy+4*s,17*s,10*s,'#5D6178');ell(x,yy+3*s,15.5*s,8.5*s,'#8B8FA8');
  circle(x,yy+12*s,7*s,'#8B8FA8');cx.fillStyle='#5D6178';cx.beginPath();cx.moveTo(x-6*s,yy+8*s);cx.lineTo(x-8*s,yy+1*s);cx.lineTo(x-2*s,yy+6*s);cx.moveTo(x+6*s,yy+8*s);cx.lineTo(x+8*s,yy+1*s);cx.lineTo(x+2*s,yy+6*s);cx.fill();
  circle(x-3*s,yy+12*s,1.6*s,'#1A1030');circle(x+3*s,yy+12*s,1.6*s,'#1A1030');circle(x,yy+16*s,2*s,'#1A1030');
  circle(x,yy-6*s,8.5*s,'#2F6A1E');circle(x,yy-6*s,7.5*s,'#6CC24A');eyes(x,yy-8*s,s*.62,0,false);
  cx.strokeStyle='#5D6178';cx.lineWidth=4*s;cx.beginPath();cx.moveTo(x,yy-4*s);cx.quadraticCurveTo(x+Math.sin(e.an*2)*8*s,yy-16*s,x+Math.sin(e.an*2)*4*s,yy-18*s);cx.stroke()}
 else if(e.ty==='bat'){const fl=Math.sin(e.an*3)*.6;cx.fillStyle='#5B3A8A';[-1,1].forEach(d=>{cx.beginPath();cx.moveTo(x+d*6*s,yy);cx.lineTo(x+d*24*s,yy-10*s-fl*10*s);cx.lineTo(x+d*18*s,yy+2*s);cx.lineTo(x+d*13*s,yy-2*s);cx.lineTo(x+d*8*s,yy+6*s);cx.fill()});
  circle(x,yy,10*s,'#5B3A8A');circle(x,yy,8.5*s,'#9B6BD6');eyes(x,yy-2*s,s*.7,0,true);cx.fillStyle='#fff';cx.beginPath();cx.moveTo(x-3*s,yy+3*s);cx.lineTo(x-1.5*s,yy+7*s);cx.lineTo(x,yy+3*s);cx.lineTo(x+1.5*s,yy+7*s);cx.lineTo(x+3*s,yy+3*s);cx.fill()}
 else if(e.ty==='orc'){circle(x,yy,20*s,'#3D5A1A');circle(x,yy,18.5*s,'#7FA03A');ell(x,yy+7*s,11*s,8*s,'rgba(255,255,255,.18)');
  cx.fillStyle='#8F93AE';cx.beginPath();cx.arc(x,yy-5*s,18*s,Math.PI,0);cx.fill();cx.fillStyle='#B5B9D2';cx.fillRect(x-18*s,yy-7*s,36*s,5*s);
  cx.fillStyle='#F2E2C2';cx.beginPath();cx.moveTo(x-17*s,yy-14*s);cx.lineTo(x-26*s,yy-26*s);cx.lineTo(x-13*s,yy-19*s);cx.moveTo(x+17*s,yy-14*s);cx.lineTo(x+26*s,yy-26*s);cx.lineTo(x+13*s,yy-19*s);cx.fill();
  eyes(x,yy+1*s,s*1.05,0,true);cx.fillStyle='#F2E2C2';cx.beginPath();cx.moveTo(x-7*s,yy+12*s);cx.lineTo(x-5*s,yy+5*s);cx.lineTo(x-3*s,yy+12*s);cx.moveTo(x+7*s,yy+12*s);cx.lineTo(x+5*s,yy+5*s);cx.lineTo(x+3*s,yy+12*s);cx.fill();
  cx.fillStyle='#6A4A2A';cx.fillRect(x+18*s,yy-14*s,6*s,26*s);cx.fillStyle='#8F93AE';cx.beginPath();cx.moveTo(x+21*s,yy-16*s);cx.lineTo(x+33*s,yy-10*s);cx.lineTo(x+21*s,yy-2*s);cx.fill()}
 else if(e.ty==='ogre'){const u=s*.35;circle(x,yy,40*u,'#7A3E86');circle(x,yy,37*u,'#C07BC9');ell(x,yy+16*u,22*u,16*u,'#E0A9E6');
  eyes(x,yy-10*u,u*1.6,0,true);cx.fillStyle='#4A1A50';cx.beginPath();cx.ellipse(x,yy+6*u,11*u,6*u,0,0,Math.PI);cx.fill();cx.fillStyle='#fff';cx.fillRect(x-3*u,yy+6*u,6*u,6*u);
  cx.fillStyle='#FFC93C';cx.beginPath();const cy=yy-36*u;cx.moveTo(x-14*u,cy+8*u);cx.lineTo(x-14*u,cy-4*u);cx.lineTo(x-7*u,cy+2*u);cx.lineTo(x,cy-6*u);cx.lineTo(x+7*u,cy+2*u);cx.lineTo(x+14*u,cy-4*u);cx.lineTo(x+14*u,cy+8*u);cx.fill();
  cx.save();cx.translate(x+38*u,yy);cx.rotate(e.atWall?Math.sin(e.an*1.5)*.6-.3:-.3);cx.fillStyle='#7A4E2A';cx.fillRect(-5*u,-34*u,10*u,40*u);circle(0,-34*u,10*u,'#8A5E3A');cx.restore();
  cx.font='700 '+Math.round(13)+'px Fredoka,sans-serif';cx.textAlign='center';cx.lineWidth=4;cx.strokeStyle='#1A1030';cx.strokeText('BIG GARY',x,cy-14*u);cx.fillStyle='#FFC93C';cx.fillText('BIG GARY',x,cy-14*u)}
 if(e.hitT>0){cx.globalAlpha=.55;circle(x,yy,e.r*1.05,'#fff');cx.globalAlpha=1}
 if(e.slow>0){cx.globalAlpha=.3;circle(x,yy,e.r*1.1,'#7FD3FF');cx.globalAlpha=1}
 cx.restore();
 if(e.hp<e.max){const bw=e.ty==='ogre'?90:Math.max(26,e.r*2),by=e.ty==='ogre'?yy-64*s*.35:yy-e.r*s*1.15-8;cx.fillStyle='rgba(0,0,0,.5)';cx.fillRect(x-bw/2-1,by-1,bw+2,6);cx.fillStyle=e.ty==='ogre'?'#FF5A5F':'#7CF07C';cx.fillRect(x-bw/2,by,bw*Math.max(0,e.hp/e.max),4)}
 if(e.talkT>0&&e.talk)bubble(x,yy-e.r-22,e.talk,13)}
function bubble(x,y,t,size){cx.font='700 '+size+'px Fredoka,sans-serif';const w=cx.measureText(t).width+14,h=size+10;x=clamp(x,w/2+4,W-w/2-4);
 cx.fillStyle='rgba(0,0,0,.18)';rr(x-w/2+2,y-h/2+3,w,h,8);cx.fill();cx.fillStyle='#fff';rr(x-w/2,y-h/2,w,h,8);cx.fill();cx.beginPath();cx.moveTo(x-5,y+h/2-1);cx.lineTo(x,y+h/2+6);cx.lineTo(x+5,y+h/2-1);cx.fill();
 cx.fillStyle='#22163F';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(t,x,y+1);cx.textBaseline='alphabetic'}
function rr(x,y,w,h,r){cx.beginPath();cx.moveTo(x+r,y);cx.arcTo(x+w,y,x+w,y+h,r);cx.arcTo(x+w,y+h,x,y+h,r);cx.arcTo(x,y+h,x,y,r);cx.arcTo(x,y,x+w,y,r);cx.closePath()}
function drawArcher(a){cx.save();cx.translate(a.x,a.y);cx.scale(1.45,1.45);cx.translate(-a.x,-a.y);const x=a.x,y=a.y,s=1;ell(x,y+6,10,4,'rgba(0,0,0,.25)');
 circle(x,y,9,'#2A5BB8');circle(x,y,7.5,'#3A7BFF');circle(x,y-9,7,'#F2C29A');
 cx.fillStyle='#2F8A3A';cx.beginPath();cx.moveTo(x-8,y-10);cx.lineTo(x,y-21);cx.lineTo(x+8,y-10);cx.fill();cx.fillStyle='#E84A5F';cx.fillRect(x+3,y-20,2,8);
 circle(x-2.5,y-9,1.3,'#1A1030');circle(x+2.5,y-9,1.3,'#1A1030');
 cx.strokeStyle='#7A4E2A';cx.lineWidth=2.4;cx.beginPath();cx.arc(x+9,y-6,10,-2.2,-.9);cx.stroke();
 if(a.aim>0){cx.strokeStyle='#ddd';cx.lineWidth=1;cx.beginPath();cx.moveTo(x+3,y-12);cx.lineTo(x+14,y-15);cx.stroke()}cx.restore()}
function drawKing(){const x=KX,y=WALLY-34;cx.save();cx.translate(x,y);cx.scale(1.5,1.5);cx.translate(-x,-y);const b=Math.sin(performance.now()/300)*1.5;
 ell(x,y+12,16,5,'rgba(0,0,0,.3)');
 cx.fillStyle='#B5262B';cx.beginPath();cx.moveTo(x-14,y-4+b);cx.lineTo(x-18,y+14);cx.lineTo(x+18,y+14);cx.lineTo(x+14,y-4+b);cx.fill();
 circle(x,y+2+b,13,'#7A3E86');circle(x,y+2+b,11,'#9B5BD6');circle(x,y-12+b,10,'#F2C29A');
 cx.fillStyle='#fff';cx.beginPath();cx.ellipse(x,y-5+b,8,6,0,0,Math.PI);cx.fill();
 circle(x-3.5,y-13+b,1.6,'#1A1030');circle(x+3.5,y-13+b,1.6,'#1A1030');circle(x,y-10+b,2.2,'#E89A7A');
 cx.fillStyle='#FFC93C';cx.beginPath();const cy=y-22+b;cx.moveTo(x-9,cy+4);cx.lineTo(x-10,cy-6);cx.lineTo(x-5,cy-1);cx.lineTo(x,cy-8);cx.lineTo(x+5,cy-1);cx.lineTo(x+10,cy-6);cx.lineTo(x+9,cy+4);cx.fill();circle(x,cy-1,1.8,'#E84A5F');
 cx.strokeStyle='#5A3A1A';cx.lineWidth=3;cx.beginPath();cx.arc(x+14,y-2+b,13,-2.3,-.8);cx.stroke();
 cx.restore();if(G.king.lineT>0&&G.king.line)bubble(x,y-62,G.king.line,16)}
function drawKnight(k){const x=k.x,y=k.y;cx.save();cx.translate(x,y);cx.scale(1.4,1.4);cx.translate(-x,-y);ell(x,y+10,12,4,'rgba(0,0,0,.25)');circle(x,y,11,'#5D6178');circle(x,y,9.5,'#B5B9D2');circle(x,y-12,8,'#C9CDE3');cx.fillStyle='#1A1030';cx.fillRect(x-5,y-13,10,2.5);
 cx.fillStyle='#E84A5F';cx.beginPath();cx.moveTo(x,y-20);cx.quadraticCurveTo(x+10,y-30,x+4,y-16);cx.fill();
 cx.save();cx.translate(x+10,y-2);cx.rotate(k.sw>0?-1.6+k.sw*6:-.4);cx.fillStyle='#E9ECF5';cx.fillRect(-2,-22,4,22);cx.fillStyle='#7A4E2A';cx.fillRect(-5,-2,10,3);cx.restore();
 cx.fillStyle='#3A7BFF';rr(x-14,y-6,9,13,3);cx.fill();cx.fillStyle='#FFC93C';cx.fillRect(x-11,y-2,3,5);cx.restore()}
function drawCannon(){const x=W-46,y=WALLY-12;cx.save();cx.translate(x,y);cx.scale(1.4,1.4);cx.translate(-x,-y);ell(x,y+8,16,5,'rgba(0,0,0,.3)');cx.fillStyle='#5A3A1A';cx.fillRect(x-14,y-2,28,10);circle(x-9,y+8,6,'#7A4E2A');circle(x+9,y+8,6,'#7A4E2A');
 cx.save();cx.translate(x,y);cx.rotate(-1.2);cx.fillStyle='#2A2A36';rr(-6,-26,12,26,4);cx.fill();cx.fillStyle='#45455A';cx.fillRect(-7,-26,14,4);cx.restore();cx.restore()}
function drawArrow(x,y,ang,len,col){cx.save();cx.translate(x,y);cx.rotate(ang);cx.strokeStyle=col||'#6A4A2A';cx.lineWidth=2;cx.beginPath();cx.moveTo(-len,0);cx.lineTo(0,0);cx.stroke();
 cx.fillStyle='#E9ECF5';cx.beginPath();cx.moveTo(4,0);cx.lineTo(-3,-3);cx.lineTo(-3,3);cx.fill();cx.fillStyle='#E84A5F';cx.fillRect(-len,-2.5,5,5);cx.restore()}
function render(){if(!cx)return;cx.setTransform(DPR,0,0,DPR,0,0);
 if(BG)cx.drawImage(BG,0,0,CW,CH);if(!G)return;
 cx.save();if(G.shake>0)cx.translate((rnd()-.5)*G.shake,(rnd()-.5)*G.shake);cx.translate(OX,OY);cx.scale(K,K);
 /* stuck arrows */
 for(const f of G.fx)if(f.stuck){cx.globalAlpha=Math.min(1,f.life*2);drawArrow(f.x,f.y,1.3,10);cx.globalAlpha=1}
 const list=G.en.slice().sort((a,b)=>a.y-b.y);for(const e of list)drawEnemy(e);
 /* wall damage */
 if(G.wall.hp<G.wall.max*.66){cx.strokeStyle='rgba(40,30,60,.7)';cx.lineWidth=2.5;const cr=[[70,0],[300,6]];if(G.wall.hp<G.wall.max*.33)cr.push([140,4],[360,2],[20,8]);cr.forEach(([x,o])=>{cx.beginPath();cx.moveTo(x,WALLY-6);cx.lineTo(x+8,WALLY+10+o);cx.lineTo(x-2,WALLY+22);cx.lineTo(x+10,WALLY+36);cx.stroke()})}
 if(G.wall.hitT>0){cx.fillStyle='rgba(255,60,60,'+(G.wall.hitT*1.6)+')';cx.fillRect(-800,WALLY-22,W+1600,68)}
 if(G.pw.cannon)drawCannon();
 for(const a of G.archers)drawArcher(a);drawKing();if(G.knight)drawKnight(G.knight);
 /* wall health */
 const hw=170,hx=KX-hw/2,hy=WALLY+56;cx.fillStyle='rgba(20,14,50,.75)';rr(hx-34,hy-3,hw+42,16,8);cx.fill();cx.font='12px sans-serif';cx.textAlign='left';cx.textBaseline='middle';cx.fillText('🧱',hx-29,hy+5);cx.textBaseline='alphabetic';
 const pc=G.wall.hp/G.wall.max;cx.fillStyle='rgba(255,255,255,.15)';rr(hx,hy,hw,10,5);cx.fill();cx.fillStyle=pc>.5?'#7CF07C':pc>.25?'#FFC93C':'#FF5A5F';if(pc>0){rr(hx,hy,Math.max(10,hw*pc),10,5);cx.fill()}
 /* projectiles */
 for(const p of G.pr){if(p.k==='arrow')drawArrow(p.x,p.y,p.ang,p.big?16:12,p.big?'#C99A1A':null);
  else if(p.k==='volley'||p.k==='ball'){if(p.wait>0)continue;ell(p.x,p.y,5,2,'rgba(0,0,0,.25)');const u=p.t/p.T,ang=Math.atan2((p.ty-p.sy)/p.T-Math.cos(u*Math.PI)*Math.PI*p.h/p.T,(p.tx-p.sx)/p.T);
   if(p.k==='ball')circle(p.x,p.y-p.z,6,'#2A2A36');else{drawArrow(p.x,p.y-p.z,ang,13,G.pw.fire?'#E8662A':null);if(G.pw.fire)circle(p.x,p.y-p.z,3,'#FFC93C')}}
  else if(p.k==='meteor'){cx.globalAlpha=.35;circle(p.x,p.y,30,'#FF8A3C');cx.globalAlpha=1;circle(p.x,p.y,18,'#FF5A2A');circle(p.x-4,p.y-4,11,'#FFC93C');circle(p.x-6,p.y-6,5,'#FFF3B0')}}
 for(const z of G.zaps){cx.strokeStyle='rgba(191,227,255,'+(z.life/.35)+')';cx.lineWidth=4;cx.beginPath();z.pts.forEach((p,i)=>{if(!i)cx.moveTo(p[0],p[1]);else{const q=z.pts[i-1];for(let k=1;k<=4;k++){const u=k/4;cx.lineTo(q[0]+(p[0]-q[0])*u+(k<4?(rnd()-.5)*18:0),q[1]+(p[1]-q[1])*u+(k<4?(rnd()-.5)*18:0))}}});cx.stroke();cx.lineWidth=1.5;cx.strokeStyle='#fff';cx.stroke()}
 /* particles */
 for(const f of G.fx){if(f.stuck)continue;const a=Math.max(0,Math.min(1,f.life/f.max*1.5));
  if(f.coin){circle(f.x,f.y,6,'#B5841A');circle(f.x,f.y,5,'#FFC93C');circle(f.x-1.5,f.y-1.5,1.8,'#FFF3B0')}
  else if(f.boot){cx.save();cx.translate(f.x,f.y);cx.rotate(f.rot);cx.globalAlpha=a;cx.font='18px sans-serif';cx.textAlign='center';cx.fillText('👢',0,6);cx.restore();cx.globalAlpha=1}
  else if(f.ring){cx.strokeStyle='rgba(255,200,80,'+(f.life/f.max)+')';cx.lineWidth=10*(f.life/f.max)+2;cx.beginPath();cx.arc(f.x,f.y,f.R*(1-f.life/f.max)+10,0,7);cx.stroke()}
  else{cx.globalAlpha=a;circle(f.x,f.y,f.r,f.col);cx.globalAlpha=1}}
 cx.textAlign='center';for(const t of G.tx){cx.globalAlpha=Math.min(1,t.life*2);cx.font=(t.size>20?'400 ':'700 ')+t.size+'px '+(t.size>20?"'Lilita One',":'')+'Fredoka,sans-serif';cx.lineWidth=4;cx.strokeStyle='rgba(30,10,40,.85)';cx.strokeText(t.t,t.x,t.y);cx.fillStyle=t.col;cx.fillText(t.t,t.x,t.y)}cx.globalAlpha=1;
 cx.restore();
 if(G.flash>0){cx.fillStyle='rgba(255,220,150,'+Math.min(.35,G.flash)+')';cx.fillRect(0,0,CW,CH)}
 const low=G.wall.hp<G.wall.max*.3&&!G.over;if(low){const a=.18+.12*Math.sin(performance.now()/180);const g=cx.createRadialGradient(CW/2,CH/2,Math.min(CW,CH)*.3,CW/2,CH/2,Math.max(CW,CH)*.7);g.addColorStop(0,'rgba(255,0,0,0)');g.addColorStop(1,'rgba(255,40,40,'+a+')');cx.fillStyle=g;cx.fillRect(0,0,CW,CH)}}
