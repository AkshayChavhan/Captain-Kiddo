"use client";

import { motion } from "framer-motion";
import { useSound } from "@/hooks/useSound";
import type { ContentItem } from "@/config/moduleContent";

/**
 * ItemCard — the generic learning card for ANY module.
 *
 * Generalized from NumberCard: shows an item's big label plus `count` copies of
 * its emoji (numbers count out N apples; colors/letters show one visual).
 *
 * AUDIO-FIRST: the item's name plays automatically when the card appears (kids
 * can't read), and tapping the card replays it. `autoplay` waits for the clip to
 * load before playing. LearningView keys the card by index, so each new item
 * remounts -> speaks on arrival.
 */
export function ItemCard({ item }: Readonly<{ item: ContentItem }>) {
  const play = useSound(item.audio, { autoplay: true });
  const emojiKeys = Array.from(
    { length: Math.max(1, item.count) },
    (_, i) => `e-${i}`
  );

  return (
    <motion.button
      type="button"
      onClick={() => play()}
      aria-label={item.label}
      className="kiddo-card flex min-h-tap w-full max-w-sm flex-col items-center gap-4 bg-white"
      whileTap={{ scale: 0.96 }}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
      }}
    >
      {/* Big label */}
      <motion.div
        className="font-kiddo text-8xl font-extrabold text-kiddo-purple"
        variants={{
          hidden: { scale: 0.3, opacity: 0 },
          visible: {
            scale: 1,
            opacity: 1,
            transition: { type: "spring", stiffness: 400, damping: 12 },
          },
        }}
      >
        {item.label}
      </motion.div>

      {/* The visual(s) */}
      <div className="flex flex-wrap items-center justify-center gap-1 text-4xl">
        {emojiKeys.map((key) => (
          <motion.span
            key={key}
            role="img"
            aria-hidden="true"
            variants={{
              hidden: { scale: 0, opacity: 0 },
              visible: { scale: 1, opacity: 1 },
            }}
          >
            {item.emoji}
          </motion.span>
        ))}
      </div>
    </motion.button>
  );
}
