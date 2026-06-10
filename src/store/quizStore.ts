"use client";

import { create } from "zustand";

/**
 * quizStore — tiny Zustand store for the CURRENT quiz session.
 *
 * Tracks stars earned and questions answered during one quiz run (in memory).
 * When the quiz finishes we persist the result to the DB (numbers08); this store
 * is just the live, client-side tally that drives the UI.
 *
 * WHY ZUSTAND: it's a minimal global store — any component in the quiz tree can
 * read/update the tally without prop-drilling, and there's no boilerplate.
 */
interface QuizState {
  /** Stars earned so far this session. */
  stars: number;
  /** How many questions answered (right or wrong). */
  answered: number;
  /** How many answered correctly. */
  correct: number;

  /** Record a correct answer (+1 star). */
  addCorrect: () => void;
  /** Record a wrong answer (no star). */
  addWrong: () => void;
  /** Reset the tally (call when starting a new quiz). */
  reset: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  stars: 0,
  answered: 0,
  correct: 0,

  addCorrect: () =>
    set((s) => ({
      stars: s.stars + 1,
      answered: s.answered + 1,
      correct: s.correct + 1,
    })),

  addWrong: () =>
    set((s) => ({
      answered: s.answered + 1,
    })),

  reset: () => set({ stars: 0, answered: 0, correct: 0 }),
}));
