/* No guessing, in every game.
   Kids want to play, not learn, so tapping answers at random must never pay off:
   1. Read first: new answer buttons stay locked for a moment (longer for longer questions).
   2. A wrong answer locks the answers for a few seconds.
   3. Fast wrong taps in a row mean guessing: a longer lock and a "slow down and read" banner.
   Each game's own consequences (hearts, lightning, lost rewards) still apply on top. */
(function(){
'use strict';
var CFG={
 kingdoms:{ans:'.btn.opt,.tok',bad:/\b(no|nope)\b/},
 ashvale:{ans:'.btn.opt,.tok',bad:/\b(no|nope)\b/},
 snortwood:{ans:'.btn.opt,.tok',bad:/\b(no|nope)\b/},
 summit:{ans:'.opt,.tok',bad:/\b(bad|nope)\b/},
 lumen:{ans:'#dOpts .opt,.opts .opt',bad:/\b(no|bad|wrong)\b/},
 blocks:{ans:'.pic',bad:/\b(no|bad)\b/},
 kingswall:{ans:'.ch',bad:/\bno\b/,min:800,per:110}
};
var GAME=(location.pathname.match(/\/games\/([a-z0-9-]+)\//)||[])[1]||'';
var C=CFG[GAME];if(!C)return;
var lockedUntil=0,lastSig='',lastSigT=0,lastClick=0,shownAt=0,fastWrong=0,banner=null,timer=0;
function answers(){return Array.prototype.slice.call(document.querySelectorAll(C.ans)).filter(function(b){return b.offsetParent!==null})}
function words(){var t='';var a=answers();var card=a[0]&&(a[0].closest('.card,#card,#qp,#dlg,.dlg,#ovCard,.panel,.modal')||a[0].parentElement);if(card)t=card.textContent||'';return t.split(/\s+/).filter(Boolean).length}
function paint(){var on=Date.now()<lockedUntil;answers().forEach(function(b){if(on){b.style.pointerEvents='none';b.style.opacity='.5';b.style.filter='grayscale(.4)'}else{b.style.pointerEvents='';b.style.opacity='';b.style.filter=''}});
 if(banner)banner.style.display=on&&banner.dataset.msg?'block':'none';if(on){clearTimeout(timer);timer=setTimeout(paint,Math.max(30,lockedUntil-Date.now()+20))}}
function lock(ms,msg){lockedUntil=Math.max(lockedUntil,Date.now()+ms);if(!banner){banner=document.createElement('div');banner.style.cssText='position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:99999;background:#FFF4CC;color:#3A2600;border:3px solid #F2B632;border-radius:14px;padding:10px 16px;font:700 18px system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.35);display:none;pointer-events:none;text-align:center;max-width:90vw';document.body.appendChild(banner)}
 banner.dataset.msg=msg||'';banner.textContent=msg||'';paint()}
/* new question: read before you can answer */
function onNew(){var a=answers();if(!a.length)return;var sig=a.map(function(b){return(b.textContent||'').trim()}).sort().join('|');var now=Date.now();
 if(sig===lastSig&&now-lastSigT<45000){paint();return}lastSig=sig;lastSigT=now;shownAt=now;
 var n=words();lock(Math.min(5000,Math.max(C.min||1200,n*(C.per||170))),'')}
var mo=new MutationObserver(function(){if(mo._q)return;mo._q=1;requestAnimationFrame(function(){mo._q=0;onNew();paint()})});
function start(){if(!document.body)return setTimeout(start,50);mo.observe(document.body,{childList:true,subtree:true})}
start();
/* every tap on an answer: was it wrong, and was it too fast to have been read? */
var lastTap=0;
function tap(e){var b=e.target.closest&&e.target.closest(C.ans);if(!b)return;
 if(Date.now()<lockedUntil){e.stopPropagation();e.preventDefault();return}
 var t=Date.now();if(t-lastTap<400)return;lastTap=t;var quick=t-Math.max(shownAt,lastClick)<2500;lastClick=t;
 setTimeout(function(){var wrong=answers().some(function(x){return C.bad.test(x.className)})||C.bad.test(b.className);
  if(!wrong){fastWrong=0;return}
  if(quick)fastWrong++;else fastWrong=Math.max(0,fastWrong-1);
  if(fastWrong>=2){fastWrong=0;lock(7000,'🐢 Whoa, slow down! Read it carefully, then choose.');try{if(window.speechSynthesis){var u=new SpeechSynthesisUtterance('Slow down. Read it carefully, then choose.');speechSynthesis.speak(u)}}catch(err){}}
  else lock(2600,'🤔 Not that one. Read it again.')},260)}
document.addEventListener('pointerdown',tap,true);document.addEventListener('click',tap,true);
window.__guard={lock:lock,cfg:C};
})();
