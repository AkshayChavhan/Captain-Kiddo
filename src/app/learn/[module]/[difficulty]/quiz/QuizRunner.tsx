"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TapQuiz } from "@/components/learning/TapQuiz";
import { useQuizStore } from "@/store/quizStore";
import type { TierConfig } from "@/config/tiers";

/**
 * QuizRunner — drives one quiz session for a tier.
 *
 * For now it runs the TapQuiz. When finished it shows a simple celebration +
 * star total. Saving the result to the DB and unlocking the next tier is wired
 * up in numbers08; the drag-and-drop quiz is added in numbers06.
 */
export function QuizRunner({
  moduleSlug,
  tier,
}: Readonly<{
  moduleSlug: string;
  tier: TierConfig;
}>) {
  const from = tier.range?.from ?? 1;
  const to = tier.range?.to ?? 5;

  const reset = useQuizStore((s) => s.reset);
  const stars = useQuizStore((s) => s.stars);
  const [done, setDone] = useState(false);

  // Start each quiz session with a clean tally.
  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <header className="flex w-full max-w-sm items-center justify-between">
        <Link
          href={`/learn/${moduleSlug}`}
          className="text-3xl"
          aria-label="Back to levels"
        >
          ⬅️
        </Link>
        <span className="text-lg font-bold text-gray-600">
          {tier.emoji} {tier.label} Quiz
        </span>
      </header>

      {done ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-7xl">🎉</div>
          <h1 className="font-kiddo text-3xl font-bold">Great work!</h1>
          <p className="text-xl">You earned ⭐ {stars} stars!</p>
          <Link
            href={`/learn/${moduleSlug}`}
            className="kiddo-btn bg-kiddo-green"
          >
            Done
          </Link>
        </div>
      ) : (
        <TapQuiz from={from} to={to} onFinish={() => setDone(true)} />
      )}
    </main>
  );
}
