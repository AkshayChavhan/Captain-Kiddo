"use client";

import { motion } from "framer-motion";

/**
 * Mascot — the Captain Kiddo character.
 *
 * Reusable across the app (sing-along, celebrations, empty states). When
 * `dancing` is true it bobs + wiggles in a loop so kids can copy along; when
 * false it sits still (just a gentle idle breath).
 *
 * Uses an emoji stand-in (🦸) by default. Swap `emoji` — or replace the inner
 * content with a real mascot image/Lottie later — without touching callers.
 */
export function Mascot({
  dancing = false,
  emoji = "🦸",
  size = "6rem",
}: Readonly<{
  dancing?: boolean;
  emoji?: string;
  size?: string;
}>) {
  return (
    <motion.div
      aria-hidden="true"
      style={{ fontSize: size, lineHeight: 1 }}
      animate={
        dancing
          ? {
              // Bob up/down, sway side to side, and wiggle — a simple "dance".
              y: [0, -12, 0],
              rotate: [-6, 6, -6],
              scale: [1, 1.06, 1],
            }
          : {
              // Idle: a slow, gentle breathing scale.
              scale: [1, 1.03, 1],
            }
      }
      transition={{
        duration: dancing ? 0.7 : 2.4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {emoji}
    </motion.div>
  );
}
