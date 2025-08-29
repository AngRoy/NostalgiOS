
const CACHE='os-static-v6';
const CORE=['/','/index.html','/manifest.webmanifest','/sdk/app-sdk.js','/apps/catalog.json','/apps/hello/index.html','/sim.js'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE); try{await c.addAll(CORE)}catch{}; self.skipWaiting()})())});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{const url=new URL(e.request.url); if(url.origin===location.origin){e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))}});
