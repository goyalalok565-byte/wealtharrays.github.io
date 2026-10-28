const VERSION='wealtharrays-pwa-10';
const STATIC_CACHE=VERSION+'-static';
const RUNTIME_CACHE=VERSION+'-runtime';
const STATIC_ASSETS=['/','/index.html','/tools.html','/styles.css','/cls-fixes.css','/wa-core.js','/site-runtime.js','/wa-calculator-runtime.js','/manifest.webmanifest','/favicon-v2.svg','/icon-192.png','/icon-512.png','/offline.html'];
const isSameOrigin=request=>new URL(request.url).origin===self.location.origin;
const matchCached=request=>caches.match(request);
const cachePut=(cacheName,request,response)=>{
  if(!response||!response.ok)return Promise.resolve();
  const directives=(response.headers.get('Cache-Control')||'').toLowerCase();
  if(/(?:^|,)\s*(?:no-store|private|no-cache)(?:\s*(?:,|$))/.test(directives))return Promise.resolve();
  return caches.open(cacheName).then(cache=>cache.put(request,response.clone()));
};
self.addEventListener('install',event=>event.waitUntil(caches.open(STATIC_CACHE).then(cache=>cache.addAll(STATIC_ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>![STATIC_CACHE,RUNTIME_CACHE].includes(key)).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||!isSameOrigin(request))return;
  const url=new URL(request.url);
  // API responses may contain account-specific data. Let the browser fetch them directly;
  // never put bearer-token responses or no-store endpoints in a shared Cache Storage cache.
  if(url.pathname==='/v1'||url.pathname.startsWith('/v1/')||request.headers.has('Authorization'))return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request,{cache:'no-store'}).then(response=>{cachePut(RUNTIME_CACHE,request,response);return response;}).catch(()=>matchCached(request).then(hit=>hit||matchCached(new Request('/offline.html')))));
    return;
  }
  const asset=request.destination==='script'||request.destination==='style'||request.destination==='image'||request.destination==='font'||request.destination==='manifest'||/\.(?:js|css|svg|png|jpg|jpeg|webp|woff2?|webmanifest)$/i.test(url.pathname);
  if(asset){
    event.respondWith(matchCached(request).then(hit=>hit||fetch(request).then(response=>{cachePut(RUNTIME_CACHE,request,response);return response;}).catch(()=>matchCached(new Request('/offline.html')))));
    return;
  }
  // Do not cache arbitrary same-origin fetches; only navigations and static assets are cacheable.
  return;
});
