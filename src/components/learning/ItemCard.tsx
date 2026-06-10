"use client";

import { motion } from "framer-motion";
import { useSpeak } from "@/hooks/useSpeak";
import type { ContentItem } from "@/config/moduleContent";

/**
 * ItemCard — the generic learning card for ANY module.
 *
 * Generalized from NumberCard: shows an item's big label plus `count` copies of
 * its emoji (numbers count out N apples; colors/letters show one visual).
 *
 * AUDIO-FIRST: the item's name is SPOKEN (browser text-to-speech) automatically
 * when the card appears (kids can't read), and tapping the card says it again.
 * No audio files — the device reads item.speak out loud. LearningView keys the
 * card by index, so each new item remounts -> speaks on arrival.
 */
export function ItemCard({ item }: Readonly<{ item: ContentItem }>) {
  const say = useSpeak(item.speak, { onAppear: true });
  const emojiKeys = Array.from(
    { length: Math.max(1, item.count) },
    (_, i) => `e-${i}`
  );

  return (
    <motion.button
      type="button"
      onClick={() => say()}
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
