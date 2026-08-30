const CACHE_NAME = 'mapansetu-field-cache-v1';

// Add minimal static assets here
const PRECACHE_ASSETS = [
  '/field',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Exclude API calls and specific Next.js dynamic chunks that shouldn't be cached blindly
  if (url.pathname.startsWith('/api') || url.pathname.includes('_next/data')) {
    return; // Pass through to network, Dexie handles offline data
  }

  // Basic network-first strategy for the app shell and static assets
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for GET requests
        if (event.request.method === 'GET' && response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request);
      })
  );
});
