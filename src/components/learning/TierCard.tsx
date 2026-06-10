"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { TierConfig } from "@/config/tiers";

/**
 * TierCard — one difficulty tier on a module's home screen.
 *
 * Shows the tier as a big, bright, tappable card. If `locked` is true it renders
 * a 🔒 and is NOT tappable (the child must finish the previous tier first).
 *
 * This is a reusable building block: the same card works for every module.
 */
export function TierCard({
  moduleSlug,
  tier,
  locked,
}: Readonly<{
  moduleSlug: string;
  tier: TierConfig;
  locked: boolean;
}>) {
  // The range hint, e.g. "1–5" (only shown if the tier defines a range).
  const rangeLabel = tier.range ? `${tier.range.from}–${tier.range.to}` : null;

  // Card visuals. Locked cards are greyed out; unlocked use the tier color.
  const cardClasses = locked
    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
    : `bg-kiddo-${tier.color} text-white`;

  const content = (
    <motion.div
      // Unlocked cards gently invite a tap; locked cards stay still.
      whileTap={locked ? undefined : { scale: 0.95 }}
      whileHover={locked ? undefined : { scale: 1.03 }}
      className={`kiddo-card flex min-h-tap flex-col items-center justify-center gap-2 text-center ${cardClasses}`}
    >
      <div className="text-5xl">{locked ? "🔒" : tier.emoji}</div>
      <div className="text-2xl font-bold">{tier.label}</div>
      {rangeLabel && (
        <div className="text-lg opacity-90">Numbers {rangeLabel}</div>
      )}
    </motion.div>
  );

  // Locked tiers are plain (non-clickable) divs; unlocked ones link into the
  // learning view for that tier.
  if (locked) {
    return <div aria-disabled className="select-none">{content}</div>;
  }

  return (
    <Link
      href={`/learn/${moduleSlug}/${tier.difficulty.toLowerCase()}`}
      className="block"
    >
      {content}
    </Link>
  );
}
