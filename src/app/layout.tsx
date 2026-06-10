import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegistrar } from "@/components/shared/ServiceWorkerRegistrar";

/**
 * Root layout — wraps every page in the app.
 *
 * In the Next.js App Router, this file MUST export a single component that
 * renders <html> and <body>. Everything else (pages, nested layouts) renders
 * inside {children}.
 */

export const metadata: Metadata = {
  title: "Captain Kiddo",
  description: "A fun, audio-first learning app for kids aged 3–6.",
  // Link the PWA manifest so the app is installable to the home screen.
  manifest: "/manifest.json",
  // iOS treats this as a web app (fullscreen, no Safari chrome) when installed.
  appleWebApp: {
    capable: true,
    title: "Captain Kiddo",
    statusBarStyle: "default",
  },
};

// Kid-friendly app: lock to portrait, fill the screen, disable user zoom so
// little fingers don't accidentally pinch-zoom the UI. themeColor tints the
// browser/OS UI to match the app.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FF6B6B",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Registers the service worker (production only) for offline support. */}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
