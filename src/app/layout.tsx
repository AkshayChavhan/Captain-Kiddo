import type { Metadata, Viewport } from "next";
import "./globals.css";

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
};

// Kid-friendly app: lock to portrait, fill the screen, disable user zoom so
// little fingers don't accidentally pinch-zoom the UI.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
