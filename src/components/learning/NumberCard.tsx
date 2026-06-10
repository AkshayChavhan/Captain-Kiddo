"use client";

import { motion } from "framer-motion";
import { useSound } from "@/hooks/useSound";
import { numberAudio } from "@/config/audio";

/**
 * NumberCard — the core visual of a Numbers lesson.
 *
 * Shows ONE number two ways at once so pre-readers connect the symbol to a
 * quantity:
 *   1. the big numeral (e.g. "3") — bounces in (Framer Motion)
 *   2. that many objects counted out (e.g. 🍎🍎🍎) — pop in one-by-one (stagger)
 *
 * AUDIO-FIRST: tapping the card speaks the number (via Howler / useSound). The
 * optional onTap prop still runs on tap, so callers can compose extra behavior.
 */

/** The object emoji used to count out a number (swappable per module/theme). */
const COUNT_EMOJI = "🍎";

export function NumberCard({
  value,
  emoji = COUNT_EMOJI,
  onTap,
}: Readonly<{
  /** The number to show, e.g. 3. */
  value: number;
  /** Which object to count with (defaults to apples). */
  emoji?: string;
  /** Optional extra tap handler, run after the number's sound plays. */
  onTap?: () => void;
}>) {
  // Build a stable list of keys, one per object to render (e.g. 3 -> 3 apples).
  const itemKeys = Array.from({ length: Math.max(0, value) }, (_, i) => `obj-${i}`);

  // Audio-first: load this number's spoken clip and play it on tap.
  const playNumber = useSound(numberAudio(value));

  const handleTap = () => {
    playNumber(); // speak the number, e.g. "Three!"
    onTap?.(); // let callers add extra behavior
  };

  return (
    <motion.button
      type="button"
      onClick={handleTap}
      aria-label={`Number ${value}`}
      className="kiddo-card flex min-h-tap w-full max-w-sm flex-col items-center gap-4 bg-white"
      // Press feedback for the whole card.
      whileTap={{ scale: 0.96 }}
      // `key` is set by the parent (keyed on value) so React remounts this card
      // each time the number changes, replaying the enter animations below.
      // With the parent's <AnimatePresence>, `exit` animates the old card out.
      initial="hidden"
      animate="visible"
      exit="exit"
      // Container orchestrates children: each counted object pops in slightly
      // after the previous one (the "staggerChildren" delay) for a count-up feel.
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
      }}
    >
      {/* The big numeral — bounces/scales in. */}
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
        {value}
      </motion.div>

      {/* The counted objects — wraps to multiple rows for larger numbers. */}
      <div className="flex flex-wrap items-center justify-center gap-1 text-4xl">
        {itemKeys.map((key) => (
          <motion.span
            key={key}
            role="img"
            aria-hidden="true"
            // Each object pops in; the parent's stagger spaces them out.
            variants={{
              hidden: { scale: 0, opacity: 0 },
              visible: { scale: 1, opacity: 1 },
            }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>
    </motion.button>
  );
}
