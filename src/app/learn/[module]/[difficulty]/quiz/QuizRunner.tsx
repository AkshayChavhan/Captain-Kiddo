"use client";

import { useCallback, useEffect, useState } from "react";
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
 * When both are finished it celebrates AND saves progress to the DB (which marks
 * the tier completed -> unlocks the next tier -> awards stars).
 *
 * `childId` comes from the server page. If there's no active child yet (Phase D
 * wires real selection), we skip saving but still let the child play + celebrate.
 */
export function QuizRunner({
  moduleSlug,
  tier,
  childId,
}: Readonly<{
  moduleSlug: string;
  tier: TierConfig;
  childId: string | null;
}>) {
  const from = tier.range?.from ?? 1;
  const to = tier.range?.to ?? 5;

  const reset = useQuizStore((s) => s.reset);
  const stars = useQuizStore((s) => s.stars);
  const correct = useQuizStore((s) => s.correct);
  const answered = useQuizStore((s) => s.answered);
  const [stage, setStage] = useState<Stage>("tap");

  // Start each quiz session with a clean tally.
  useEffect(() => {
    reset();
  }, [reset]);

  // Persist the session when the quiz is finished. Completing the tier here is
  // what unlocks the next tier (saveProgress sets isCompleted + awards stars).
  const saveSession = useCallback(async () => {
    if (!childId) return; // no active child yet -> nothing to save
    const difficulty = tier.difficulty;
    try {
      await Promise.all([
        fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            childId,
            module: moduleSlug,
            difficulty,
            starsEarned: stars,
            isCompleted: true,
          }),
        }),
        fetch("/api/test-results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            childId,
            module: moduleSlug,
            difficulty,
            score: correct,
            total: answered,
          }),
        }),
      ]);
    } catch {
      // Non-fatal for the child: they still see the celebration. (A retry/queue
      // could be added later for offline robustness.)
    }
  }, [childId, moduleSlug, tier.difficulty, stars, correct, answered]);

  const handleDragFinish = () => {
    setStage("done");
    void saveSession();
  };

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
        <DragDropQuiz from={from} to={to} onFinish={handleDragFinish} />
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
