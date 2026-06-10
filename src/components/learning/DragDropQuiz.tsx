"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { speak } from "@/lib/speak";
import { useQuizStore } from "@/store/quizStore";
import { makeTapQuestion, type TapQuestion } from "@/lib/quiz";
import { Celebration } from "@/components/shared/Celebration";
import { useCelebration } from "@/hooks/useCelebration";

const COUNT_EMOJI = "🍎";
const QUESTIONS_PER_QUIZ = 5;

/**
 * DragDropQuiz — "drag the numeral onto the matching group".
 *
 * Shows a draggable number chip and several object groups (e.g. 🍎🍎 / 🍎🍎🍎🍎).
 * The child drags the number onto the group whose count matches. Correct -> star
 * + celebrate; wrong -> the chip springs back + "try again".
 *
 * TOUCH NOTE: native HTML5 drag-and-drop is unreliable on phones, so we use
 * Framer Motion's `drag` (pointer-based, works for finger + mouse) and detect the
 * drop by comparing the chip's release point against each group's bounding box.
 */
export function DragDropQuiz({
  from,
  to,
  onFinish,
}: Readonly<{
  from: number;
  to: number;
  onFinish?: () => void;
}>) {
  const addCorrect = useQuizStore((s) => s.addCorrect);
  const addWrong = useQuizStore((s) => s.addWrong);
  const stars = useQuizStore((s) => s.stars);

  const { celebrating, celebrate } = useCelebration();

  const [question, setQuestion] = useState<TapQuestion | null>(null);
  const [solved, setSolved] = useState(0);

  // Refs to each drop-target group, so we can read their on-screen positions.
  const groupRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  // A nonce we bump to force the draggable chip to reset to its origin.
  const [resetNonce, setResetNonce] = useState(0);

  useEffect(() => {
    setQuestion(makeTapQuestion(from, to));
  }, [from, to, solved]);

  if (!question) return null;

  // Called when the chip is released. `point` is the pointer's screen position.
  const handleDragEnd = (point: { x: number; y: number }) => {
    // Find which group (if any) the chip was dropped over.
    let droppedOn: number | null = null;
    groupRefs.current.forEach((el, count) => {
      const r = el.getBoundingClientRect();
      const inside =
        point.x >= r.left &&
        point.x <= r.right &&
        point.y >= r.top &&
        point.y <= r.bottom;
      if (inside) droppedOn = count;
    });

    if (droppedOn === question.answer) {
      speak("Great job!");
      celebrate(); // star-burst on a correct drop
      addCorrect();
      const next = solved + 1;
      setSolved(next);
      if (next >= QUESTIONS_PER_QUIZ) onFinish?.();
    } else {
      speak("Try again!");
      addWrong();
      // Spring the chip back to its starting spot for another try.
      setResetNonce((n) => n + 1);
    }
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-8">
      <Celebration show={celebrating} />

      {/* Star tally + progress */}
      <div className="flex w-full items-center justify-between text-xl font-bold">
        <span>⭐ {stars}</span>
        <span className="text-gray-600">
          {solved} / {QUESTIONS_PER_QUIZ}
        </span>
      </div>

      <p className="text-center text-xl font-bold text-gray-700">
        Drag the number to the matching group!
      </p>

      {/* The draggable number chip */}
      <motion.div
        key={resetNonce} // bumping the key snaps the chip back to origin
        drag
        dragSnapToOrigin
        onDragEnd={(_e, info) => handleDragEnd(info.point)}
        whileDrag={{ scale: 1.15, zIndex: 10 }}
        className="kiddo-btn z-10 cursor-grab bg-kiddo-purple active:cursor-grabbing"
      >
        {question.answer}
      </motion.div>

      {/* The drop-target groups */}
      <div className="grid w-full grid-cols-2 gap-4">
        {question.options.map((count) => (
          <div
            key={count}
            ref={(el) => {
              if (el) groupRefs.current.set(count, el);
              else groupRefs.current.delete(count);
            }}
            className="kiddo-card flex min-h-tap flex-wrap items-center justify-center gap-1 bg-white text-3xl"
          >
            {Array.from({ length: count }, (_, i) => `g-${count}-${i}`).map(
              (k) => (
                <span key={k} role="img" aria-hidden="true">
                  {COUNT_EMOJI}
                </span>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
