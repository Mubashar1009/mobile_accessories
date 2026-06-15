const CACHE_NAME = "product-catalog-v2";
const OFFLINE_URL = "/";

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
];

// Install: pre-cache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
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

// Fetch: network-first strategy for pages, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith("http")) return;

  // For navigation requests (HTML pages): network-first
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache the response
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, cloned);
          });
          return response;
        })
        .catch(() => {
          // If offline, serve from cache
          return caches.match(request).then((cached) => {
            return cached || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // For static assets (JS, CSS, images): stale-while-revalidate
  if (
    request.url.includes("/_next/static/") ||
    request.url.includes("/icons/") ||
    request.destination === "image" ||
    request.destination === "style" ||
    request.destination === "script"
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cached) => {
          const fetched = fetch(request).then((response) => {
            cache.put(request, response.clone());
            return response;
          });
          return cached || fetched;
        });
      })
    );
    return;
  }

  // For everything else: network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        const cloned = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, cloned);
        });
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});
