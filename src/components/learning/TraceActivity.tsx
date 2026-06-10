"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Difficulty } from "@prisma/client";
import { TraceGlyph } from "@/components/learning/TraceGlyph";
import {
  TRACEABLE_LETTERS,
  getLetterStrokes,
} from "@/config/letterPaths";

/**
 * TraceActivity — sequences letters one at a time into a full tracing session.
 *
 * Starts at the first letter; each successful trace (TraceLetter's onComplete)
 * advances to the next. When the last letter is done it shows a celebration and
 * saves progress for the alphabets module (reusing /api/progress from numbers08).
 *
 * `childId` comes from the server page; if there's no active child yet the save
 * no-ops (same honest pattern as the rest of the app) but the child still plays.
 */
export function TraceActivity({
  childId,
}: Readonly<{
  childId: string | null;
}>) {
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  const letters = TRACEABLE_LETTERS;
  const current = letters[index];

  const saveProgress = useCallback(async () => {
    if (!childId) return; // no active child -> nothing to save
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          module: "alphabets",
          difficulty: Difficulty.EASY,
          starsEarned: letters.length, // one star per letter traced
          isCompleted: true,
        }),
      });
    } catch {
      // Non-fatal — the child still sees their celebration.
    }
  }, [childId, letters.length]);

  const handleComplete = useCallback(() => {
    setIndex((i) => {
      const next = i + 1;
      if (next >= letters.length) {
        setFinished(true);
        void saveProgress();
        return i; // stay on the last index
      }
      return next;
    });
  }, [letters.length, saveProgress]);

  if (finished) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-7xl">🎉</div>
        <h1 className="font-kiddo text-3xl font-bold">You traced them all!</h1>
        <p className="text-xl">Amazing writing! ✍️⭐</p>
        <Link href="/" className="kiddo-btn bg-kiddo-green">
          Done
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-4 p-6">
      <header className="flex w-full max-w-sm items-center justify-between">
        <Link href="/" className="text-3xl" aria-label="Back home">
          ⬅️
        </Link>
        <span className="text-lg font-bold text-gray-600">
          ✍️ {index + 1} / {letters.length}
        </span>
      </header>

      {/* `key` remounts on each new letter so its speech + state reset. */}
      <TraceGlyph
        key={current}
        strokes={getLetterStrokes(current) ?? []}
        speakText={current}
        promptLabel={`Trace the ${current}!`}
        onComplete={handleComplete}
      />
    </main>
  );
}
