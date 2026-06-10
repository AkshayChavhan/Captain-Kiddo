"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { speak } from "@/lib/speak";
import { useSpeak } from "@/hooks/useSpeak";
import { useQuizStore } from "@/store/quizStore";
import { Celebration } from "@/components/shared/Celebration";
import { useCelebration } from "@/hooks/useCelebration";
import type { ContentItem } from "@/config/moduleContent";

const QUESTIONS_PER_QUIZ = 5;
const CHOICES = 3;

/**
 * ItemQuiz — a generic "match the item" quiz that works for ANY module.
 *
 * Shows one item's big VISUAL (its emoji) + speaks it, and asks the child to tap
 * the matching LABEL among a few choices. Used for Colors and Alphabets (and any
 * future module). Numbers keeps its own count-based quizzes; this is the general
 * fallback so every module has a real quiz, not a numbers one.
 *
 * Pure-ish picking is index-derived (varied per question index) since Math.random
 * is fine on the client here.
 */
export function ItemQuiz({
  items,
  onFinish,
}: Readonly<{
  items: ContentItem[];
  onFinish?: () => void;
}>) {
  const addCorrect = useQuizStore((s) => s.addCorrect);
  const addWrong = useQuizStore((s) => s.addWrong);
  const stars = useQuizStore((s) => s.stars);

  const { celebrating, celebrate } = useCelebration();

  const [solved, setSolved] = useState(0);
  const [wrongPick, setWrongPick] = useState<string | null>(null);

  // Build a question: a correct item + distractor labels, shuffled.
  const question = useMemo(() => {
    if (items.length === 0) return null;
    const answer = items[Math.floor(Math.random() * items.length)];

    const labels = new Set<string>([answer.label]);
    const max = Math.min(CHOICES, items.length);
    while (labels.size < max) {
      labels.add(items[Math.floor(Math.random() * items.length)].label);
    }
    const options = Array.from(labels);
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return { answer, options };
    // Rebuild each time we advance a question.
  }, [items, solved]);

  // Speak the prompt item when the question changes (TTS, on appear); the child
  // can tap the prompt to hear it again.
  const sayPrompt = useSpeak(question?.answer.speak ?? "", { onAppear: true });

  if (!question) return null;

  const pick = (label: string) => {
    if (label === question.answer.label) {
      celebrate();
      speak("Great job!");
      addCorrect();
      const next = solved + 1;
      setSolved(next);
      setWrongPick(null);
      if (next >= QUESTIONS_PER_QUIZ) onFinish?.();
    } else {
      speak("Try again!");
      addWrong();
      setWrongPick(label);
      globalThis.setTimeout(() => setWrongPick(null), 600);
    }
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-8">
      <Celebration show={celebrating} />

      <div className="flex w-full items-center justify-between text-xl font-bold">
        <span>⭐ {stars}</span>
        <span className="text-gray-600">
          {solved} / {QUESTIONS_PER_QUIZ}
        </span>
      </div>

      {/* The prompt: the item's visual (tap to hear again) */}
      <button
        type="button"
        onClick={() => sayPrompt()}
        className="kiddo-card flex min-h-tap w-full items-center justify-center bg-white text-7xl"
        aria-label="Hear again"
      >
        {question.answer.emoji}
      </button>

      <p className="text-xl font-bold text-gray-700">Which one is it?</p>

      <div className="grid w-full grid-cols-1 gap-4">
        {question.options.map((label) => {
          const isWrong = wrongPick === label;
          return (
            <motion.button
              key={label}
              type="button"
              onClick={() => pick(label)}
              whileTap={{ scale: 0.96 }}
              animate={isWrong ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
              className={`kiddo-btn ${isWrong ? "bg-kiddo-red" : "bg-kiddo-purple"}`}
            >
              {label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
