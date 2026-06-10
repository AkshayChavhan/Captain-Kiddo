"use client";

import { useCallback, useState } from "react";

/**
 * useRazorpayCheckout — drives the client side of a purchase.
 *
 * Flow:
 *   1. POST /api/payments/create-order { target } -> { orderId, amount, keyId, ... }
 *   2. Open Razorpay's checkout popup with that order.
 *   3. On success, POST the checkout response to /api/payments/verify (pay03),
 *      which verifies the signature SERVER-SIDE and grants access.
 *
 * The Razorpay checkout script is loaded on demand (no extra <script> in layout).
 * We never handle card details ourselves — Razorpay's popup does, which keeps us
 * out of PCI scope.
 */

// Minimal shape of the global Razorpay constructor the script injects.
interface RazorpayInstance {
  open: () => void;
}
interface RazorpayConstructor {
  new (options: Record<string, unknown>): RazorpayInstance;
}
declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/** Load the Razorpay checkout script once; resolve when ready. */
function loadCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${CHECKOUT_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface CheckoutState {
  pending: boolean;
  error: string | null;
}

export function useRazorpayCheckout(onPaid?: () => void) {
  const [state, setState] = useState<CheckoutState>({
    pending: false,
    error: null,
  });

  const buy = useCallback(
    async (target: string) => {
      setState({ pending: true, error: null });
      try {
        // 1. Create the order on the server (price decided server-side).
        const res = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target }),
        });
        if (!res.ok) throw new Error("Could not start checkout.");
        const order = await res.json();

        // 2. Make sure the Razorpay script is loaded.
        const ready = await loadCheckoutScript();
        if (!ready || !window.Razorpay) {
          throw new Error("Payment is unavailable right now.");
        }

        // 3. Open the checkout popup.
        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amountInPaise,
          currency: order.currency,
          name: "Captain Kiddo",
          description: order.label,
          order_id: order.orderId,
          theme: { color: "#6C5CE7" },
          handler: async (response: Record<string, string>) => {
            // 4. Verify SERVER-SIDE (pay03). Never trust this client response.
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            if (verifyRes.ok) {
              setState({ pending: false, error: null });
              onPaid?.();
            } else {
              setState({
                pending: false,
                error: "Payment could not be verified.",
              });
            }
          },
          modal: {
            ondismiss: () => setState({ pending: false, error: null }),
          },
        });
        rzp.open();
      } catch (e) {
        setState({
          pending: false,
          error: e instanceof Error ? e.message : "Something went wrong.",
        });
      }
    },
    [onPaid]
  );

  return { buy, ...state };
}
