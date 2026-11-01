const CACHE_PREFIX = 'geostamp-';
const CACHE_NAME = 'geostamp-shell-v2';
const APP_ROOT = new URL('./', self.registration.scope).pathname;
const APP_SHELL = [APP_ROOT, APP_ROOT + 'manifest.webmanifest', APP_ROOT + 'geostamp.svg'];

function cacheResponse(request, response, event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.put(request, response.clone()))
      .catch(() => {})
  );
}

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      cacheResponse(request, response, event);
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match(APP_ROOT))));
    return;
  }
  if (['script', 'style', 'image', 'font'].includes(request.destination)) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) cacheResponse(request, response, event);
      return response;
    })));
  }
});
