"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TapQuiz } from "@/components/learning/TapQuiz";
import { DragDropQuiz } from "@/components/learning/DragDropQuiz";
import { useQuizStore } from "@/store/quizStore";
import type { TierConfig } from "@/config/tiers";

/** The quiz session runs through these stages in order. */
type Stage = "tap" | "drag" | "done";

/**
 * QuizRunner — drives one quiz session for a tier.
 *
 * Runs two rounds: a tap-the-answer quiz, then a drag-and-drop matching quiz.
 * When both are finished it celebrates with the star total. Saving the result to
 * the DB and unlocking the next tier is wired up in numbers08.
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
  const [stage, setStage] = useState<Stage>("tap");

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

      {stage === "tap" && (
        <TapQuiz from={from} to={to} onFinish={() => setStage("drag")} />
      )}

      {stage === "drag" && (
        <DragDropQuiz from={from} to={to} onFinish={() => setStage("done")} />
      )}

      {stage === "done" && (
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
      )}
    </main>
  );
}
