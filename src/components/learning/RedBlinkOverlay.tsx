"use client";

/**
 * RedBlinkOverlay — a full-screen red flash for "try again" feedback.
 *
 * Purely visual and non-interactive (pointer-events: none) so it never blocks the
 * child's next attempt. Driven by the `show` flag from useRedBlink; the on/off
 * toggling (3 times) happens in the hook, this just renders the current state with
 * a quick fade so each blink looks soft, not harsh.
 */
export function RedBlinkOverlay({ show }: Readonly<{ show: boolean }>) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 bg-kiddo-red transition-opacity duration-100"
      style={{ opacity: show ? 0.55 : 0 }}
    />
  );
}
