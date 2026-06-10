"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * LoginGate — a friendly "log in to keep playing" screen for guests.
 *
 * Shown when a logged-out visitor tries to go past the free taste (first item of a
 * module's Easy tier). The login link carries a `?next=` back to the current page
 * so the parent returns here after signing in.
 */
export function LoginGate({
  message = "Log in to keep playing!",
}: Readonly<{
  message?: string;
}>) {
  const pathname = usePathname();
  const next = encodeURIComponent(pathname || "/");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="text-7xl">🔒</div>
      <h1 className="font-kiddo text-3xl font-bold">{message}</h1>
      <p className="text-lg text-gray-600">
        Ask a grown-up to log in to unlock all the games.
      </p>
      <Link href={`/login?next=${next}`} className="kiddo-btn bg-kiddo-green">
        Log in
      </Link>
      <Link href="/" className="text-sm font-bold text-gray-500">
        Back home
      </Link>
    </main>
  );
}
