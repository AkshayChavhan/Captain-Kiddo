/**
 * Quiz question generators (pure functions).
 *
 * Kept free of React/DB so they're easy to test and reuse across quiz types.
 * Randomness is injected via a `rand` function (defaults to Math.random) so the
 * same logic can be made deterministic in tests.
 */

/** A single "tap the correct answer" question. */
export interface TapQuestion {
  /** The quantity shown to the child (they must pick this number). */
  answer: number;
  /** The shuffled options to tap (includes `answer` plus distractors). */
  options: number[];
}

type Rand = () => number;

/** Pick a random integer in [min, max] inclusive. */
function randInt(min: number, max: number, rand: Rand): number {
  return min + Math.floor(rand() * (max - min + 1));
}

/**
 * Build one tap-quiz question for a numeric range.
 *
 * @param from        lowest number in the tier (e.g. 1)
 * @param to          highest number in the tier (e.g. 5)
 * @param optionCount how many choices to show (default 3)
 * @param rand        randomness source (default Math.random)
 */
export function makeTapQuestion(
  from: number,
  to: number,
  optionCount = 3,
  rand: Rand = Math.random
): TapQuestion {
  // Don't ask for more distinct options than the range can supply.
  const span = to - from + 1;
  const count = Math.min(optionCount, span);

  const answer = randInt(from, to, rand);

  // Collect distinct options, always including the correct answer.
  const options = new Set<number>([answer]);
  while (options.size < count) {
    options.add(randInt(from, to, rand));
  }

  // Shuffle so the answer isn't always in the same slot (Fisher–Yates).
  const arr = Array.from(options);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return { answer, options: arr };
}
