/* =========================================================================
 * Captain Kiddo — Service Worker
 * -------------------------------------------------------------------------
 * A service worker is a script the browser runs IN THE BACKGROUND, separate
 * from the web page. It can intercept network requests, which lets us serve
 * cached files when the device is OFFLINE.
 *
 * Caching strategy used here:
 *   - PRECACHE the app shell (the bare files needed to boot) on install.
 *   - At runtime, use "network-first, fall back to cache" for navigations so
 *     kids always get fresh content when online but still see something offline.
 *   - Cache static assets (images/audio/icons) "cache-first" for speed.
 *
 * NOTE: This is a hand-written, dependency-free worker for learning clarity.
 * Production apps often generate one with a tool (e.g. Workbox).
 * ========================================================================= */

const CACHE_VERSION = "v1";
const CACHE_NAME = `captain-kiddo-${CACHE_VERSION}`;

// The minimal "app shell" we precache so the app can boot offline.
const PRECACHE_URLS = ["/", "/offline", "/manifest.json"];

// --- INSTALL: precache the app shell -------------------------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  // Activate this new worker immediately instead of waiting for old tabs.
  self.skipWaiting();
});

// --- ACTIVATE: clean up old caches when the version changes ---------------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME) // delete anything not current
          .map((key) => caches.delete(key))
      )
    )
  );
  // Take control of open pages right away.
  self.clients.claim();
});

// --- FETCH: decide how to answer each request -----------------------------
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests; let the browser do POST/PUT/etc. normally.
  if (request.method !== "GET") return;

  // PAGE NAVIGATIONS -> network-first, fall back to cache, then offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Save a fresh copy for offline use.
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          // Offline: try the cached page, else the offline fallback.
          const cached = await caches.match(request);
          return cached || caches.match("/offline");
        })
    );
    return;
  }

  // STATIC ASSETS (images, audio, icons, css, js) -> cache-first for speed.
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
      );
    })
  );
});
