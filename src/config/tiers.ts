/**
 * Tier configuration — shared metadata for the three difficulty tiers.
 *
 * Every learning module has the same three tiers (EASY -> MEDIUM -> HARD),
 * unlocked sequentially. This file describes how each tier looks and what range
 * of content it covers, so the module home and learning views read from here
 * instead of hard-coding tier details.
 */
import { Difficulty } from "@prisma/client";

/** Display + range metadata for one tier. */
export interface TierConfig {
  /** The enum value stored in the DB. */
  difficulty: Difficulty;
  /** Kid-facing label. */
  label: string;
  /** A friendly icon. */
  emoji: string;
  /** Tailwind kiddo color class suffix (e.g. "green" -> bg-kiddo-green). */
  color: string;
  /**
   * The numeric range this tier covers FOR THE NUMBERS MODULE.
   * (Numbers: Easy 1–5, Medium 1–10, Hard 1–20.) Other modules can ignore this
   * and use their own content; it's optional metadata.
   */
  range?: { from: number; to: number };
}

/** The three tiers, in unlock order. */
export const TIERS: TierConfig[] = [
  { difficulty: Difficulty.EASY,   label: "Easy",   emoji: "🌱", color: "green",  range: { from: 1, to: 5 } },
  { difficulty: Difficulty.MEDIUM, label: "Medium", emoji: "⭐", color: "yellow", range: { from: 1, to: 10 } },
  { difficulty: Difficulty.HARD,   label: "Hard",   emoji: "🔥", color: "red",    range: { from: 1, to: 20 } },
];

/** Look up a tier's config by its Difficulty enum value. */
export function getTier(difficulty: Difficulty): TierConfig {
  // Non-null assertion is safe: TIERS covers every Difficulty value.
  return TIERS.find((t) => t.difficulty === difficulty)!;
}
