"use client";

import { useEffect, useMemo, useRef } from "react";
import { TraceCanvas, type TracePoint } from "@/components/learning/TraceCanvas";
import { LetterGuide } from "@/components/learning/LetterGuide";
import { RedBlinkOverlay } from "@/components/learning/RedBlinkOverlay";
import { Celebration } from "@/components/shared/Celebration";
import { useRedBlink } from "@/hooks/useRedBlink";
import { useSound } from "@/hooks/useSound";
import { useCelebration } from "@/hooks/useCelebration";
import { getLetterStrokes, scaleStrokes } from "@/config/letterPaths";
import { letterAudio, FEEDBACK_AUDIO } from "@/config/audio";
import { isPointOnPath, traceCoverage } from "@/lib/trace";

const SIZE = 320;
/** Need to cover at least this fraction of the letter to count as traced. */
const COVERAGE_TO_PASS = 0.7;

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
  const { celebrating, celebrate } = useCelebration();

  // Audio-first: the letter's name, plus encouraging feedback clips.
  const playLetter = useSound(letterAudio(letter));
  const playGreat = useSound(FEEDBACK_AUDIO.correct);
  const playTryAgain = useSound(FEEDBACK_AUDIO.wrong);

  // Speak the letter when it appears (audio-first — kids can't read).
  useEffect(() => {
    playLetter();
  }, [playLetter]);

  // Scale this letter's normalized guide to canvas pixels once.
  const scaled = useMemo(() => {
    const strokes = getLetterStrokes(letter);
    return strokes ? scaleStrokes(strokes, SIZE) : [];
  }, [letter]);

  // Did the current stroke go off-path at any point? (ref: no re-render needed.)
  const wentOffRef = useRef(false);
  // Whether this letter is already done (so we don't fire success twice).
  const doneRef = useRef(false);

  const handleStart = () => {
    wentOffRef.current = false;
  };

  const handleMove = (point: TracePoint) => {
    if (wentOffRef.current || doneRef.current) return;
    if (!isPointOnPath(point, scaled)) {
      wentOffRef.current = true;
      playTryAgain(); // "Try again!"
      blink(); // 🔴 off the letter -> blink red 3 times
    }
  };

  const handleEnd = (path: TracePoint[]) => {
    if (doneRef.current || wentOffRef.current) return;

    // Success only if they stayed on path AND covered most of the letter
    // (so a single short on-path dab doesn't count as "traced").
    const coverage = traceCoverage(path, scaled);
    if (coverage >= COVERAGE_TO_PASS) {
      doneRef.current = true;
      playGreat(); // "Great job!"
      celebrate(); // ⭐ star-burst
      onComplete?.();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <RedBlinkOverlay show={blinking} />
      <Celebration show={celebrating} />

      <button
        type="button"
        onClick={() => playLetter()}
        className="font-kiddo text-2xl font-bold"
        aria-label={`Hear the letter ${letter}`}
      >
        Trace the {letter}! 🔊
      </button>

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
