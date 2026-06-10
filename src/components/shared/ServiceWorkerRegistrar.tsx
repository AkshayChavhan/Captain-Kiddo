"use client";

import { useEffect } from "react";

/**
 * Registers the service worker once, on the client, after the page loads.
 *
 * WHY A CLIENT COMPONENT:
 * Service workers only exist in the browser, so registration must run on the
 * client ("use client") and inside useEffect (which only runs in the browser).
 *
 * WHY ONLY IN PRODUCTION:
 * In development, an active service worker aggressively caches files and fights
 * with Next.js hot reload — confusing while learning. So we register it only in
 * production builds.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" &&
      typeof navigator !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        // Non-fatal: the app still works, just without offline support.
        console.error("Service worker registration failed:", err);
      });
    }
  }, []);

  // This component renders nothing — it's only here for its side effect.
  return null;
}
