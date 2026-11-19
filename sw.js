const VERSION='wealtharrays-pwa-11';
const STATIC_CACHE=VERSION+'-static';
const RUNTIME_CACHE=VERSION+'-runtime';
const STATIC_ASSETS=[
  '/offline.html',
  '/styles.css',
  '/theme-init.js',
  '/wa-site-runtime.js',
  '/wa-home-runtime.js',
  '/wa-calculator-runtime.js'
];
const NAVIGATION_TIMEOUT_MS=3000;
const isSameOrigin=request=>new URL(request.url).origin===self.location.origin;
const matchCached=request=>caches.match(request);
const cachePut=(cacheName,request,response)=>{
  if(!response||!response.ok)return Promise.resolve();
  const directives=(response.headers.get('Cache-Control')||'').toLowerCase();
  if(/(?:^|,)\s*(?:no-store|private|no-cache)(?:\s*(?:,|$))/.test(directives))return Promise.resolve();
  return caches.open(cacheName).then(cache=>cache.put(request,response.clone()));
};
const offlineFallback=request=>matchCached(request).then(hit=>hit||matchCached(new Request('/offline.html')));
self.addEventListener('install',event=>event.waitUntil(
  caches.open(STATIC_CACHE).then(cache=>cache.addAll(STATIC_ASSETS)).then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil(
  caches.keys()
    .then(keys=>Promise.all(keys.filter(key=>![STATIC_CACHE,RUNTIME_CACHE].includes(key)).map(key=>caches.delete(key))))
    .then(()=>self.clients.claim())
));
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||!isSameOrigin(request))return;
  const url=new URL(request.url);
  // API responses can contain account-specific data. Never cache API or authenticated requests.
  if(url.pathname==='/v1'||url.pathname.startsWith('/v1/')||request.headers.has('Authorization'))return;

  if(request.mode==='navigate'){
    let networkRequest;
    const networkPromise=fetch(request).then(response=>{
      event.waitUntil(cachePut(RUNTIME_CACHE,request,response));
      return response;
    });
    const timeoutPromise=new Promise(resolve=>{
      setTimeout(()=>offlineFallback(request).then(resolve),NAVIGATION_TIMEOUT_MS);
    });
    networkRequest=Promise.race([networkPromise,timeoutPromise]).catch(()=>offlineFallback(request));
    event.respondWith(networkRequest);
    return;
  }

  const asset=request.destination==='script'||request.destination==='style'||request.destination==='image'||request.destination==='font'||request.destination==='manifest'||/\.(?:js|css|svg|png|jpg|jpeg|webp|woff2?|webmanifest)$/i.test(url.pathname);
  if(asset){
    event.respondWith(caches.open(RUNTIME_CACHE).then(cache=>cache.match(request).then(hit=>{
      const refresh=fetch(request).then(response=>cachePut(RUNTIME_CACHE,request,response).then(()=>response)).catch(()=>null);
      if(hit){event.waitUntil(refresh);return hit;}
      return refresh.then(response=>response||matchCached(new Request('/offline.html')));
    })));
    return;
  }
  // Do not cache arbitrary same-origin fetches; only navigations and static assets are cacheable.
});
