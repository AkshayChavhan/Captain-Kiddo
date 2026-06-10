"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { logOut } from "@/app/(auth)/actions";

/**
 * Log-out control — a power/turn-off icon (⏻) that asks for confirmation before
 * it actually signs out.
 *
 * Logging out is easy to hit by accident (and a kid might poke it), so a single
 * click does NOT log out. It opens a friendly "Do you really want to get out?"
 * dialog; only tapping "Yes" runs the log-out. "No" (or tapping the backdrop /
 * pressing Esc) just closes the dialog and changes nothing.
 *
 * `className` styles the trigger (a subtle icon on the home page, a full button
 * in the dashboard corner). `label` overrides the trigger's contents — pass text
 * if a place wants a worded button instead of the bare power icon.
 */
export function LogoutButton({
  className = "text-2xl text-gray-500 disabled:opacity-50",
  label = "⏻",
}: Readonly<{
  className?: string;
  label?: React.ReactNode;
}> = {}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // Whether the "are you sure?" dialog is showing.
  const [confirming, setConfirming] = useState(false);

  // Run the actual sign-out, then return home. Called only after "Yes".
  const doLogout = () => {
    startTransition(async () => {
      await logOut();
      router.replace("/");
      router.refresh();
    });
  };

  return (
    <>
      {/* The trigger: a power/turn-off icon. Clicking only OPENS the dialog. */}
      <button
        type="button"
        disabled={pending}
        onClick={() => setConfirming(true)}
        aria-label="Log out"
        title="Log out"
        className={className}
      >
        {label}
      </button>

      {/* Confirmation dialog. Rendered only while confirming so it adds nothing
          to the page when closed. */}
      {confirming && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-confirm-title"
          // Full-screen dim backdrop; clicking it cancels (same as "No").
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
          onClick={() => {
            if (!pending) setConfirming(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape" && !pending) setConfirming(false);
          }}
        >
          {/* The card itself. stopPropagation so a click inside doesn't hit the
              backdrop's cancel handler. */}
          <div
            className="kiddo-card flex w-full max-w-xs flex-col items-center gap-5 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-6xl">⏻</div>
            <h2
              id="logout-confirm-title"
              className="font-kiddo text-2xl font-bold text-kiddo-purple"
            >
              Do you really want to get out?
            </h2>

            <div className="flex w-full gap-3">
              {/* No — cancel and keep the parent signed in. Autofocused so the
                  safe choice is the default for keyboard/Enter. */}
              <button
                type="button"
                autoFocus
                disabled={pending}
                onClick={() => setConfirming(false)}
                className="kiddo-btn flex-1 bg-gray-400 disabled:opacity-50"
              >
                No
              </button>

              {/* Yes — this is the one that actually logs out. */}
              <button
                type="button"
                disabled={pending}
                onClick={doLogout}
                className="kiddo-btn flex-1 bg-kiddo-red disabled:opacity-50"
              >
                {pending ? "…" : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
