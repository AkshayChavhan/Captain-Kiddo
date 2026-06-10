"use client";

import Link from "next/link";

/** Format integer paise as a rupee string, e.g. 500 -> "₹5". */
function formatPaise(paise: number): string {
  return `₹${Math.round(paise / 100)}`;
}

/**
 * MediaGate — wraps media content and shows a 🔒 paywall when it's locked.
 *
 * If `locked` is false, it just renders its children (the player). If locked, it
 * shows a friendly lock with the price and a button that routes to the PARENT
 * area to pay — checkout is only reachable behind the parent PIN so kids can't
 * trigger purchases (Phase D).
 */
export function MediaGate({
  locked,
  priceInPaise,
  title,
  children,
}: Readonly<{
  locked: boolean;
  priceInPaise: number;
  title: string;
  children: React.ReactNode;
}>) {
  if (!locked) return <>{children}</>;

  return (
    <div className="kiddo-card flex w-full max-w-sm flex-col items-center gap-4 bg-white text-center">
      <div className="text-6xl">🔒</div>
      <h2 className="font-kiddo text-2xl font-bold">{title}</h2>
      <p className="text-lg text-gray-600">
        Ask a grown-up to unlock this for {formatPaise(priceInPaise)}.
      </p>
      {/* Checkout lives behind the parent PIN area (Phase D). */}
      <Link href="/parent" className="kiddo-btn bg-kiddo-purple">
        Grown-ups 🔑
      </Link>
    </div>
  );
}
