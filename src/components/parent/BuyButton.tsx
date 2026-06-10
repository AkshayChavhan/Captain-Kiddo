"use client";

import { useRouter } from "next/navigation";
import { useRazorpayCheckout } from "@/hooks/useRazorpayCheckout";

/** Format integer paise as "₹5". */
function formatPaise(paise: number): string {
  return `₹${Math.round(paise / 100)}`;
}

/**
 * BuyButton — starts a Razorpay purchase for a target (module slug or "ALL").
 *
 * On a verified payment it refreshes so the now-unlocked content updates. Shows a
 * pending state during checkout and any error underneath.
 */
export function BuyButton({
  target,
  label,
  priceInPaise,
  accentClass = "bg-kiddo-green",
}: Readonly<{
  target: string;
  label: string;
  priceInPaise: number;
  accentClass?: string;
}>) {
  const router = useRouter();
  const { buy, pending, error } = useRazorpayCheckout(() => router.refresh());

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => buy(target)}
        disabled={pending}
        className={`kiddo-btn ${accentClass} disabled:opacity-50`}
      >
        {pending ? "…" : `${label} — ${formatPaise(priceInPaise)}`}
      </button>
      {error && <p className="text-sm font-bold text-kiddo-red">{error}</p>}
    </div>
  );
}
