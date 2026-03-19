const CACHE_NAME = "krootal-static-v1";
const OFFLINE_URL = "/_offline.html";
const ASSETS_TO_CACHE = [
  "/",
  "/_offline.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// activate
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// fetch strategy
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // API requests -> network-first
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((resp) => {
          // optionally cache responses
          return resp;
        })
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // navigation -> try network, fallback to cache/offline
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // update cache
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then((r) => r || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // static assets -> cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // optionally cache first-time assets
        return response;
      }).catch(() => caches.match(OFFLINE_URL));
    })
  );
});
