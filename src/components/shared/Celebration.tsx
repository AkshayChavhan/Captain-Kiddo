"use client";

import { motion, AnimatePresence } from "framer-motion";

/**
 * Celebration — a star-burst overlay shown on a correct answer.
 *
 * Built with Framer Motion only (no extra confetti dependency): a ring of stars
 * flies outward from the center and fades, plus a big bouncing ⭐ in the middle.
 * It's a full-screen, non-interactive overlay (pointer-events: none) so it never
 * blocks taps underneath.
 *
 * Controlled by the `show` prop. Render it once near the top of a screen and flip
 * `show` to true briefly when the child gets something right.
 */

// How many stars fly out, and the burst radius (in px).
const STAR_COUNT = 12;
const RADIUS = 140;

// Pre-compute each star's outward direction so the burst is evenly spread.
const STARS = Array.from({ length: STAR_COUNT }, (_, i) => {
  const angle = (i / STAR_COUNT) * Math.PI * 2;
  return {
    id: i,
    x: Math.cos(angle) * RADIUS,
    y: Math.sin(angle) * RADIUS,
  };
});

export function Celebration({ show }: Readonly<{ show: boolean }>) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* The flying stars */}
          {STARS.map((star) => (
            <motion.span
              key={star.id}
              className="absolute text-4xl"
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{ x: star.x, y: star.y, scale: 1, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              ⭐
            </motion.span>
          ))}

          {/* The big center star that bounces in */}
          <motion.span
            className="text-8xl"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: [0, 1.3, 1], rotate: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            🌟
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
