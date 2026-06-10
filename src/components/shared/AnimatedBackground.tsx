"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * AnimatedBackground — a playful, moving cartoon backdrop for the home screen.
 *
 * Friendly ORIGINAL characters (waving kids, animals, balloons) and scenery
 * (clouds, stars, the sun) drift slowly across the screen and gently bob, giving
 * the lively "cartoon world" feeling kids love — WITHOUT using any copyrighted
 * characters (Shinchan/Doraemon etc. are off-limits in a shippable app). Every
 * sprite here is a plain emoji, so there are zero image assets to license, host,
 * or ship.
 *
 * It sits BEHIND the page content:
 *  - absolutely positioned, fills the viewport, `-z-10` (under everything),
 *  - `pointer-events-none` so it never intercepts a tap meant for a card/slider,
 *  - `aria-hidden` because it's purely decorative (a screen reader skips it),
 *  - `overflow-hidden` on the wrapper so drifting sprites never add scrollbars.
 *
 * SSR-safe + deterministic: the sprite list and all timings are hand-authored
 * constants — no Math.random() at render — so the server and client markup match
 * exactly (no hydration mismatch). Animation is pure GPU-friendly transforms
 * (x / y / rotate), which stays smooth on a tablet.
 *
 * Respectful of motion sensitivity: when the OS "reduce motion" setting is on, we
 * render the sprites STILL (no drifting), so the screen is calm for kids/parents
 * who need that.
 */

/** One floating sprite. All positions are viewport-relative (vw / %). */
interface Sprite {
  emoji: string;
  /** Vertical band it floats in, as a % of viewport height. */
  top: number;
  /** Starting horizontal position, as a % of viewport width. */
  startLeft: number;
  /** Font size in rem — varies depth/scale so it doesn't look like a grid. */
  size: number;
  /** Seconds for one full left↔right drift. Bigger = slower, calmer. */
  driftDuration: number;
  /** How far it drifts horizontally, in vw. */
  driftDistance: number;
  /** Seconds for one up/down bob. */
  bobDuration: number;
  /** Stagger so they don't all move in lockstep. */
  delay: number;
}

// A hand-tuned cast of characters + scenery. Spread across vertical bands and
// horizontal positions so the screen feels full but never crowds the content in
// the middle. Durations are long (15–40s) for a slow, dreamy, non-distracting
// drift. Edit/extend this list to restyle the whole background.
const SPRITES: Sprite[] = [
  // --- Sky scenery (top third): clouds, sun, stars drifting slowly ---------
  { emoji: "☀️", top: 6, startLeft: 78, size: 4.5, driftDuration: 40, driftDistance: 6, bobDuration: 7, delay: 0 },
  { emoji: "☁️", top: 10, startLeft: 8, size: 3.5, driftDuration: 34, driftDistance: 14, bobDuration: 6, delay: 1.2 },
  { emoji: "☁️", top: 18, startLeft: 55, size: 4, driftDuration: 38, driftDistance: 12, bobDuration: 8, delay: 3 },
  { emoji: "⭐", top: 8, startLeft: 35, size: 2, driftDuration: 26, driftDistance: 8, bobDuration: 4, delay: 0.5 },
  { emoji: "🌈", top: 22, startLeft: 80, size: 3, driftDuration: 30, driftDistance: 10, bobDuration: 9, delay: 2 },

  // --- Floaty fun (middle bands): balloons + a kite, kept to the edges so
  //     they frame the cards instead of covering them -------------------------
  { emoji: "🎈", top: 36, startLeft: 4, size: 3.5, driftDuration: 28, driftDistance: 10, bobDuration: 5, delay: 0 },
  { emoji: "🎈", top: 44, startLeft: 90, size: 3, driftDuration: 32, driftDistance: 8, bobDuration: 6, delay: 1.5 },
  { emoji: "🪁", top: 30, startLeft: 70, size: 3, driftDuration: 24, driftDistance: 16, bobDuration: 5, delay: 2.5 },
  { emoji: "🦋", top: 52, startLeft: 12, size: 2.5, driftDuration: 20, driftDistance: 18, bobDuration: 3.5, delay: 0.8 },

  // --- The cast (lower bands): friendly kids + animals waving/bouncing -------
  { emoji: "🧒", top: 70, startLeft: 6, size: 4, driftDuration: 30, driftDistance: 12, bobDuration: 3, delay: 0 },
  { emoji: "👧", top: 78, startLeft: 84, size: 4, driftDuration: 33, driftDistance: 10, bobDuration: 3.2, delay: 1 },
  { emoji: "🐰", top: 84, startLeft: 30, size: 3.5, driftDuration: 22, driftDistance: 14, bobDuration: 2.6, delay: 0.4 },
  { emoji: "🐥", top: 88, startLeft: 60, size: 3, driftDuration: 26, driftDistance: 12, bobDuration: 2.4, delay: 1.8 },
  { emoji: "🐶", top: 74, startLeft: 48, size: 3.5, driftDuration: 28, driftDistance: 10, bobDuration: 2.8, delay: 2.2 },
  { emoji: "🌸", top: 92, startLeft: 16, size: 2.5, driftDuration: 36, driftDistance: 6, bobDuration: 5, delay: 0.6 },
  { emoji: "🌼", top: 94, startLeft: 72, size: 2.5, driftDuration: 36, driftDistance: 6, bobDuration: 5, delay: 1.4 },
];

export function AnimatedBackground() {
  // When the OS asks for reduced motion, hold everything still.
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Soft sky gradient wash so the emoji sit on a warm, kid-friendly sky
          instead of flat white. Uses the kiddo palette tints. */}
      <div className="absolute inset-0 bg-gradient-to-b from-kiddo-blue/15 via-white to-kiddo-green/10" />

      {SPRITES.map((s, i) => (
        <motion.span
          key={i}
          className="absolute select-none will-change-transform"
          style={{
            top: `${s.top}%`,
            left: `${s.startLeft}%`,
            fontSize: `${s.size}rem`,
            // A gentle, varied baseline opacity so sprites recede behind content.
            opacity: 0.85,
          }}
          // Drift sideways (x) and bob (y) on independent loops. Reduced-motion
          // → no animation at all (the sprite just sits where it starts).
          animate={
            reduce
              ? undefined
              : {
                  x: [0, `${s.driftDistance}vw`, 0],
                  y: [0, -10, 0],
                }
          }
          transition={
            reduce
              ? undefined
              : {
                  x: {
                    duration: s.driftDuration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: s.delay,
                  },
                  y: {
                    duration: s.bobDuration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: s.delay,
                  },
                }
          }
        >
          {s.emoji}
        </motion.span>
      ))}
    </div>
  );
}
