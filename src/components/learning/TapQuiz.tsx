"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSound } from "@/hooks/useSound";
import { FEEDBACK_AUDIO } from "@/config/audio";
import { useQuizStore } from "@/store/quizStore";
import { makeTapQuestion, type TapQuestion } from "@/lib/quiz";
import { Celebration } from "@/components/shared/Celebration";
import { useCelebration } from "@/hooks/useCelebration";

const COUNT_EMOJI = "🍎";
const QUESTIONS_PER_QUIZ = 5;

/**
 * TapQuiz — "tap the correct answer".
 *
 * Shows a quantity (e.g. 🍎🍎🍎) and three number choices. The child taps the
 * number that matches the count. Correct -> star + "Great job!"; wrong -> gentle
 * "Try again!" and they can retry. After QUESTIONS_PER_QUIZ correct answers the
 * quiz is finished and onFinish() fires.
 *
 * Drag-and-drop matching is a separate quiz type (numbers06); this is the
 * tap-to-answer one.
 */
export function TapQuiz({
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

  const playCorrect = useSound(FEEDBACK_AUDIO.correct);
  const playWrong = useSound(FEEDBACK_AUDIO.wrong);
  const { celebrating, celebrate } = useCelebration();

  const [question, setQuestion] = useState<TapQuestion | null>(null);
  const [solved, setSolved] = useState(0); // correct answers so far
  // Track a wrong tap so we can flash that option red briefly.
  const [wrongPick, setWrongPick] = useState<number | null>(null);

  // Make the first question on mount and whenever we advance.
  useEffect(() => {
    setQuestion(makeTapQuestion(from, to));
  }, [from, to, solved]);

  if (!question) return null;

  const handlePick = (picked: number) => {
    if (picked === question.answer) {
      playCorrect();
      celebrate(); // star-burst on a correct answer
      addCorrect();
      const next = solved + 1;
      setSolved(next);
      setWrongPick(null);
      if (next >= QUESTIONS_PER_QUIZ) onFinish?.();
      // advancing `solved` triggers the effect to build the next question
    } else {
      playWrong();
      addWrong();
      setWrongPick(picked);
      // clear the red flash shortly after
      globalThis.setTimeout(() => setWrongPick(null), 600);
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

      {/* The quantity to count */}
      <div className="kiddo-card flex min-h-tap w-full flex-wrap items-center justify-center gap-1 bg-white text-4xl">
        {Array.from({ length: question.answer }, (_, i) => `q-${i}`).map(
          (key) => (
            <span key={key} role="img" aria-hidden="true">
              {COUNT_EMOJI}
            </span>
          )
        )}
      </div>

      <p className="text-xl font-bold text-gray-700">How many?</p>

      {/* The number choices */}
      <div className="grid w-full grid-cols-3 gap-4">
        {question.options.map((opt) => {
          const isWrong = wrongPick === opt;
          return (
            <motion.button
              key={opt}
              type="button"
              onClick={() => handlePick(opt)}
              whileTap={{ scale: 0.95 }}
              // Flash red on a wrong pick, otherwise the bright option color.
              animate={isWrong ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
              className={`kiddo-btn ${isWrong ? "bg-kiddo-red" : "bg-kiddo-purple"}`}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
