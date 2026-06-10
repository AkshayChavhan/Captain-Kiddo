"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { ItemCard } from "@/components/learning/ItemCard";
import { getModuleItems } from "@/config/moduleContent";
import type { TierConfig } from "@/config/tiers";

/**
 * LearningView — steps a child through a module's ITEMS, one at a time.
 *
 * Content-driven: it asks getModuleItems(moduleSlug, range) for what to show, so
 * Numbers shows numbers, Colors shows colors, Alphabets shows letters — same view,
 * different content. Tap Back/Next to move; each item is an ItemCard (big label +
 * visual + tap-to-hear).
 *
 * Client component because it holds the "current item index" state.
 */
export function LearningView({
  moduleSlug,
  tier,
}: Readonly<{
  moduleSlug: string;
  tier: TierConfig;
}>) {
  // Build this module+tier's items once.
  const items = useMemo(
    () => getModuleItems(moduleSlug, tier.range),
    [moduleSlug, tier.range]
  );

  const [index, setIndex] = useState(0);

  // A module with no content yet -> friendly notice instead of a broken view.
  if (items.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-7xl">{tier.emoji}</div>
        <h1 className="font-kiddo text-3xl font-bold">New games coming soon!</h1>
        <p className="text-lg text-gray-600">
          We&apos;re still building this one. 🚧
        </p>
        <Link href={`/learn/${moduleSlug}`} className="kiddo-btn bg-kiddo-green">
          Back
        </Link>
      </main>
    );
  }

  const isFirst = index <= 0;
  const isLast = index >= items.length - 1;
  const item = items[index];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between gap-6 p-6">
      {/* Top bar: back to the tier list + progress label */}
      <header className="flex w-full max-w-sm items-center justify-between">
        <Link
          href={`/learn/${moduleSlug}`}
          className="text-3xl"
          aria-label="Back to levels"
        >
          ⬅️
        </Link>
        <span className="text-lg font-bold text-gray-600">
          {tier.emoji} {tier.label} · {index + 1} / {items.length}
        </span>
      </header>

      {/* The item card. Keying by index swaps + replays the enter animation. */}
      <div className="flex flex-1 items-center justify-center">
        <AnimatePresence mode="wait">
          <ItemCard key={index} item={item} />
        </AnimatePresence>
      </div>

      {/* Bottom bar: Back / Next big buttons */}
      <footer className="flex w-full max-w-sm items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setIndex((n) => Math.max(0, n - 1))}
          disabled={isFirst}
          className="kiddo-btn bg-kiddo-teal disabled:opacity-40"
        >
          ⬅️ Back
        </button>
        {/* On the last item, swap Next for a Start-Quiz link. */}
        {isLast ? (
          <Link
            href={`/learn/${moduleSlug}/${tier.difficulty.toLowerCase()}/quiz`}
            className="kiddo-btn bg-kiddo-yellow text-center text-gray-800"
          >
            Quiz ✏️
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setIndex((n) => Math.min(items.length - 1, n + 1))}
            className="kiddo-btn bg-kiddo-green"
          >
            Next ➡️
          </button>
        )}
      </footer>
    </main>
  );
}
