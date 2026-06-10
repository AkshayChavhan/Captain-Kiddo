"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Difficulty } from "@prisma/client";
import { TraceGlyph } from "@/components/learning/TraceGlyph";
import { HomeButton } from "@/components/shared/HomeButton";
import { TRACEABLE_NUMBERS, getNumberStrokes } from "@/config/numberPaths";

/** Digit -> spoken word, so the glyph "3" is read as "three". */
const DIGIT_WORDS: Record<string, string> = {
  "0": "zero", "1": "one", "2": "two", "3": "three", "4": "four",
  "5": "five", "6": "six", "7": "seven", "8": "eight", "9": "nine",
};

/**
 * NumberTraceActivity — trace the digits 0–9 one at a time to learn to WRITE them.
 *
 * The number version of the alphabet-tracing activity: it reuses the exact same
 * TraceGlyph engine (canvas, guide, on-path detection, red-blink-3x, success
 * celebration) — only the stroke DATA and audio differ. Saves progress to the
 * numbers module on completion.
 */
export function NumberTraceActivity({
  childId,
}: Readonly<{
  childId: string | null;
}>) {
  const digits = TRACEABLE_NUMBERS;
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = digits[index];
  const strokes = getNumberStrokes(current);

  const saveProgress = useCallback(async () => {
    if (!childId) return;
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          module: "numbers",
          difficulty: Difficulty.EASY,
          starsEarned: digits.length,
          isCompleted: true,
        }),
      });
    } catch {
      // Non-fatal — the child still sees their celebration.
    }
  }, [childId, digits.length]);

  const handleComplete = useCallback(() => {
    setIndex((i) => {
      const next = i + 1;
      if (next >= digits.length) {
        setFinished(true);
        void saveProgress();
        return i;
      }
      return next;
    });
  }, [digits.length, saveProgress]);

  if (finished) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-7xl">🎉</div>
        <h1 className="font-kiddo text-3xl font-bold">You wrote all the numbers!</h1>
        <p className="text-xl">Super counting & writing! 🔢⭐</p>
        <Link href="/learn/numbers" className="kiddo-btn bg-kiddo-green">
          Done
        </Link>
      </main>
    );
  }

  if (!strokes) return null;

  return (
    <main className="relative flex min-h-screen flex-col items-center gap-4 p-6">
      {/* Icon-only home button, pinned top-left. */}
      <HomeButton />

      <header className="flex w-full max-w-sm items-center justify-between pl-14">
        <Link href="/learn/numbers" className="text-3xl" aria-label="Back">
          ⬅️
        </Link>
        <span className="text-lg font-bold text-gray-600">
          ✍️ {index + 1} / {digits.length}
        </span>
      </header>

      {/* key remounts per digit -> resets state + replays audio. */}
      <TraceGlyph
        key={current}
        strokes={strokes}
        speakText={DIGIT_WORDS[current] ?? current}
        promptLabel={`Trace the ${current}!`}
        onComplete={handleComplete}
      />
    </main>
  );
}
