"use client";

import { useMemo, useRef } from "react";
import { TraceCanvas, type TracePoint } from "@/components/learning/TraceCanvas";
import { LetterGuide } from "@/components/learning/LetterGuide";
import { RedBlinkOverlay } from "@/components/learning/RedBlinkOverlay";
import { useRedBlink } from "@/hooks/useRedBlink";
import { getLetterStrokes, scaleStrokes } from "@/config/letterPaths";
import { isPointOnPath } from "@/lib/trace";

const SIZE = 320;

/**
 * TraceLetter — trace one letter, with red-blink feedback on a mistake.
 *
 * Wires together the canvas (E1), the guide (E2), on-path detection (E3), and the
 * red blink (E4): as the child drags, every point is checked against the scaled
 * guide. The first point that strays OFF the path triggers the screen to blink red
 * 3 times and the attempt resets.
 *
 * Success handling (all points on-path -> celebrate) + letter flow come in E5/E6;
 * this ticket delivers the off-path -> red-blink-3x behavior.
 */
export function TraceLetter({
  letter,
  onComplete,
}: Readonly<{
  letter: string;
  onComplete?: () => void;
}>) {
  const { blinking, blink } = useRedBlink({ times: 3 });

  // Scale this letter's normalized guide to canvas pixels once.
  const scaled = useMemo(() => {
    const strokes = getLetterStrokes(letter);
    return strokes ? scaleStrokes(strokes, SIZE) : [];
  }, [letter]);

  // Did the current stroke go off-path at any point? (ref: no re-render needed.)
  const wentOffRef = useRef(false);

  const handleStart = () => {
    wentOffRef.current = false;
  };

  const handleMove = (point: TracePoint) => {
    if (wentOffRef.current) return; // already failed this attempt
    if (!isPointOnPath(point, scaled)) {
      wentOffRef.current = true;
      blink(); // 🔴 off the letter -> blink red 3 times
    }
  };

  const handleEnd = (path: TracePoint[]) => {
    // If they never strayed and actually drew something, count it as done.
    // (Fuller success scoring — coverage of the whole letter — comes in E5/E6.)
    if (!wentOffRef.current && path.length > 3) {
      onComplete?.();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <RedBlinkOverlay show={blinking} />

      <p className="font-kiddo text-2xl font-bold">Trace the {letter}!</p>

      <TraceCanvas
        width={SIZE}
        height={SIZE}
        onStrokeStart={handleStart}
        onStrokeMove={handleMove}
        onStrokeEnd={handleEnd}
      >
        <LetterGuide letter={letter} size={SIZE} />
      </TraceCanvas>
    </div>
  );
}
