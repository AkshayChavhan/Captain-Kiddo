# 📲 pwa01-manifest-and-service-worker

> **Phase A · Ticket A12** (the last one!) — Turn Captain Kiddo into a real **PWA**:
> installable, fullscreen, portrait-locked, and offline-capable.

---

## 🎯 Goal

Make the web app feel like a **native app**: kids can install it to the home screen,
it opens fullscreen in portrait, and it still does *something* sensible offline.

---

## ❓ What is a PWA?

A **Progressive Web App** is a website that behaves like an installed app. Two
ingredients make the magic:

1. A **Web App Manifest** (`manifest.json`) — tells the device the app's name, icon,
   colors, and how to display it.
2. A **Service Worker** (`sw.js`) — a background script that can intercept network
   requests, enabling **offline** support.

---

## 1️⃣ The manifest — [`public/manifest.json`](../../public/manifest.json)

```json
{
  "name": "Captain Kiddo",
  "display": "fullscreen",
  "orientation": "portrait",
  "background_color": "#FFD93D",
  "theme_color": "#FF6B6B",
  "icons": [ ... ]
}
```

| Field | Effect |
|-------|--------|
| `display: "fullscreen"` | No browser bars — the app fills the screen. ✅ brief requirement |
| `orientation: "portrait"` | Locks to portrait so the layout never rotates. ✅ brief requirement |
| `background_color` | The splash screen color while the app boots. |
| `theme_color` | Tints the OS/browser UI to match the app. |
| `icons` | Home-screen icons in several sizes (incl. a **maskable** one for Android). |

We link it from the layout via `metadata.manifest = "/manifest.json"` so Next.js adds
the right `<link>` tag.

> 🖼️ The icon PNGs aren't created yet — see
> [`public/icons/README.md`](../../public/icons/README.md) for the exact files to add.
> The app runs fine without them; only the installed icon is missing.

---

## 2️⃣ The service worker — [`public/sw.js`](../../public/sw.js)

A service worker runs **in the background, separate from the page**, and can answer
network requests from a **cache**. That's what makes offline possible.

### Its lifecycle

```
install  ->  activate  ->  fetch (runs for every request)
```

- **`install`** — precache the "app shell" (`/`, `/offline`, `/manifest.json`) so the
  app can boot with no network. Then `skipWaiting()` to activate immediately.
- **`activate`** — delete old caches from previous versions (we bump `CACHE_VERSION`
  to invalidate). Then `clients.claim()` to control open pages right away.
- **`fetch`** — decide how to answer each request (the caching strategy ↓).

### The caching strategy (important to understand)

| Request type | Strategy | Why |
|--------------|----------|-----|
| **Page navigations** | **Network-first**, fall back to cache, then `/offline` | Kids get fresh content online, but still see *something* offline. |
| **Static assets** (images, audio, icons) | **Cache-first** | Speed — these rarely change, so serve instantly from cache. |

```js
// navigation: try network, save a copy, fall back to cache/offline page
fetch(request).then(saveCopy).catch(() => caches.match(request) || caches.match("/offline"))

// static asset: serve from cache if present, else fetch and cache it
caches.match(request).then(cached => cached || fetchAndCache(request))
```

> 🧠 **Network-first vs cache-first** is the core PWA caching decision. Content that
> should stay fresh → network-first. Content that's stable and should be fast →
> cache-first.

---

## 3️⃣ Registering the worker — [`ServiceWorkerRegistrar.tsx`](../../src/components/shared/ServiceWorkerRegistrar.tsx)

```tsx
"use client";
useEffect(() => {
  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }
}, []);
```

- **`"use client"` + `useEffect`** — service workers exist only in the browser, so
  registration must run client-side.
- **Production only** — in dev, a service worker's aggressive caching fights Next.js
  hot reload and confuses debugging. So we register it only in production builds.
- It renders **nothing**; it exists purely for the side effect. We drop it into the
  layout `<body>` so it runs on every page.

---

## 4️⃣ Serving the worker correctly — [`next.config.mjs`](../../next.config.mjs)

```js
async headers() {
  return [{
    source: "/sw.js",
    headers: [
      { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
      { key: "Service-Worker-Allowed", value: "/" },
    ],
  }];
}
```

- **`Cache-Control: no-cache…`** — never let the browser serve a *stale* service
  worker; always re-check for an updated one so fixes roll out.
- **`Service-Worker-Allowed: "/"`** — permits the worker to control the **whole
  site** (root scope), not just the `/` it's served from.

---

## 5️⃣ The offline page — [`src/app/offline/page.tsx`](../../src/app/offline/page.tsx)

A friendly fallback (📡 "You're offline") the worker serves when the device is
offline and the page isn't cached. Simple and reassuring.

---

## 🧪 How to test it (after `npm install`)

PWAs only fully work in a **production build** (the worker is prod-only):

```bash
npm run build
npm run start
```

Then in Chrome DevTools → **Application** tab:
- **Manifest** — see the parsed manifest + icons.
- **Service Workers** — confirm `sw.js` is activated.
- Toggle **Offline** and reload — you should still get the app shell / offline page.

You'll also see an **"Install"** option in the browser to add it to the home screen.

---

## ✅ Result — Phase A complete! 🎉

Captain Kiddo is now a proper PWA: installable, fullscreen, portrait-locked, with an
offline-capable app shell. Combined with the earlier tickets, the **entire
foundation is done**:

> scaffold ✅ · full schema ✅ · Prisma client ✅ · module registry ✅ · access
> helpers ✅ · PWA ✅

---

## ➡️ Next phase

**Phase B — the Numbers learning module** (our reusable template). It starts with
**B1 · `theme01-tailwind-kid-theme`**: the kid-friendly Tailwind theme (bright
colors, rounded shapes, big tap targets) that every screen will use.
