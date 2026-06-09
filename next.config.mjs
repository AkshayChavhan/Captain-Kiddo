/**
 * Next.js configuration for Captain Kiddo.
 *
 * PWA notes:
 *  - The manifest (public/manifest.json) and service worker (public/sw.js) are
 *    static files served from /public, so Next needs no special build plugin.
 *  - We add headers so the browser ALWAYS revalidates sw.js (never serves a
 *    stale worker) and so the worker is allowed to control the whole site.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        // Never cache the service worker file itself — always fetch fresh so
        // updates roll out. Service-Worker-Allowed lets it control "/" (root scope).
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
