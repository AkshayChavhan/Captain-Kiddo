"use client";

import { useState } from "react";
import Link from "next/link";
import { NumberCard } from "@/components/learning/NumberCard";
import type { TierConfig } from "@/config/tiers";

/**
 * LearningView — steps a child through the numbers in a tier, one at a time.
 *
 * For the Numbers module a tier covers a range (Easy 1–5, etc.). The child taps
 * Back/Next to move between numbers; each shows a NumberCard (numeral + counted
 * objects). Tapping the card will play audio once that's added (numbers03).
 *
 * This is a client component because it holds the "current number" state.
 */
export function LearningView({
  moduleSlug,
  tier,
}: {
  moduleSlug: string;
  tier: TierConfig;
}) {
  // Default range fallback keeps the component safe even if a tier has none.
  const from = tier.range?.from ?? 1;
  const to = tier.range?.to ?? 5;

  const [current, setCurrent] = useState(from);

  const isFirst = current <= from;
  const isLast = current >= to;

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
          {tier.emoji} {tier.label} · {current} / {to}
        </span>
      </header>

      {/* The number card */}
      <div className="flex flex-1 items-center justify-center">
        <NumberCard value={current} />
      </div>

      {/* Bottom bar: Back / Next big buttons */}
      <footer className="flex w-full max-w-sm items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setCurrent((n) => Math.max(from, n - 1))}
          disabled={isFirst}
          className="kiddo-btn bg-kiddo-teal disabled:opacity-40"
        >
          ⬅️ Back
        </button>
        <button
          type="button"
          onClick={() => setCurrent((n) => Math.min(to, n + 1))}
          disabled={isLast}
          className="kiddo-btn bg-kiddo-green disabled:opacity-40"
        >
          Next ➡️
        </button>
      </footer>
    </main>
  );
}
