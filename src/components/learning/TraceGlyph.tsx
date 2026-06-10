"use client";

import { useMemo, useRef } from "react";
import { TraceCanvas, type TracePoint } from "@/components/learning/TraceCanvas";
import { GlyphGuide } from "@/components/learning/GlyphGuide";
import { RedBlinkOverlay } from "@/components/learning/RedBlinkOverlay";
import { Celebration } from "@/components/shared/Celebration";
import { useRedBlink } from "@/hooks/useRedBlink";
import { useSound } from "@/hooks/useSound";
import { useCelebration } from "@/hooks/useCelebration";
import { scaleStrokes, type LetterStrokes } from "@/config/letterPaths";
import { FEEDBACK_AUDIO } from "@/config/audio";
import { isPointOnPath, traceCoverage } from "@/lib/trace";

const SIZE = 320;
const COVERAGE_TO_PASS = 0.7;

/**
 * TraceGlyph — trace ANY glyph (letter or number) with red-blink-on-mistake and a
 * success celebration. This is the generic engine: it takes the glyph's strokes,
 * its spoken-audio src, and a label as props, so letters AND numbers reuse it.
 *
 * Behavior (identical to the letter tracer):
 *  - speaks the glyph on appear (audio-first), tap label to replay
 *  - on each move point, checks on-path (trace.ts); first off-path point ->
 *    "Try again!" + screen blinks RED 3x
 *  - on stroke end, if stayed on path AND covered >=70% -> "Great job!" +
 *    star-burst + onComplete
 */
export function TraceGlyph({
  strokes,
  audioSrc,
  promptLabel,
  onComplete,
}: Readonly<{
  strokes: LetterStrokes;
  audioSrc: string;
  /** e.g. "Trace the A!" or "Trace the 3!" */
  promptLabel: string;
  onComplete?: () => void;
}>) {
  const { blinking, blink } = useRedBlink({ times: 3 });
  const { celebrating, celebrate } = useCelebration();

  // Speak the glyph on appear (audio-first); tap the label to replay.
  const playGlyph = useSound(audioSrc, { autoplay: true });
  const playGreat = useSound(FEEDBACK_AUDIO.correct);
  const playTryAgain = useSound(FEEDBACK_AUDIO.wrong);

  const scaled = useMemo(() => scaleStrokes(strokes, SIZE), [strokes]);

  const wentOffRef = useRef(false);
  const doneRef = useRef(false);

  const handleStart = () => {
    wentOffRef.current = false;
  };

  const handleMove = (point: TracePoint) => {
    if (wentOffRef.current || doneRef.current) return;
    if (!isPointOnPath(point, scaled)) {
      wentOffRef.current = true;
      playTryAgain();
      blink();
    }
  };

  const handleEnd = (path: TracePoint[]) => {
    if (doneRef.current || wentOffRef.current) return;
    if (traceCoverage(path, scaled) >= COVERAGE_TO_PASS) {
      doneRef.current = true;
      playGreat();
      celebrate();
      onComplete?.();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <RedBlinkOverlay show={blinking} />
      <Celebration show={celebrating} />

      <button
        type="button"
        onClick={() => playGlyph()}
        className="font-kiddo text-2xl font-bold"
        aria-label={promptLabel}
      >
        {promptLabel} 🔊
      </button>

      <TraceCanvas
        width={SIZE}
        height={SIZE}
        onStrokeStart={handleStart}
        onStrokeMove={handleMove}
        onStrokeEnd={handleEnd}
      >
        <GlyphGuide strokes={strokes} size={SIZE} />
      </TraceCanvas>
    </div>
  );
}
