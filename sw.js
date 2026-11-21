/* Game Room service worker: only for hero alerts (no offline caching, so updates are never stuck). */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('push',e=>{e.waitUntil((async()=>{
  let m={title:'Game Room',body:'Your hero is waiting! A new mission is ready.',url:'/'};
  try{if(e.data){const j=e.data.json();if(j&&j.body)m=j}}catch(x){}
  try{const s=await self.registration.pushManager.getSubscription();if(s){const r=await fetch('/api/push?msg=1&ep='+encodeURIComponent(s.endpoint),{cache:'no-store'});if(r.ok){const j=await r.json();if(j&&j.body)m=j}}}catch(x){}
  await self.registration.showNotification(m.title||'Game Room',{body:m.body,icon:'/assets/icon-192.png',badge:'/assets/icon-192.png',tag:'hero',renotify:true,data:{url:m.url||'/'}})})())});
self.addEventListener('notificationclick',e=>{e.notification.close();const url=(e.notification.data&&e.notification.data.url)||'/';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if('focus' in c){try{c.navigate(url)}catch(x){}return c.focus()}}return self.clients.openWindow(url)}))});
