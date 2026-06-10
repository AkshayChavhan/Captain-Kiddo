/**
 * Letter guide paths.
 *
 * Each uppercase letter is described as one or more STROKES. A stroke is an
 * ordered list of points in a normalized 0..1 coordinate space (0,0 = top-left,
 * 1,1 = bottom-right of the tracing area). We scale these to the canvas size at
 * render / detection time.
 *
 * The SAME data powers two things:
 *   - the visible guide outline a child traces over (trace02), and
 *   - on-path detection: "is the finger near the letter's path?" (trace03).
 *
 * To add a letter: add an entry. To keep this readable we define a representative
 * set; the structure extends to all of A–Z (and numbers) the same way.
 */

/** A normalized point, each coordinate in [0, 1]. */
export interface NormPoint {
  x: number;
  y: number;
}

/** A letter = one or more strokes; each stroke is an ordered point list. */
export type LetterStrokes = NormPoint[][];

/**
 * The guide data. Coordinates trace each letter in natural writing order so the
 * child draws it the "right" way.
 */
export const LETTER_PATHS: Record<string, LetterStrokes> = {
  A: [
    [ { x: 0.5, y: 0.1 }, { x: 0.2, y: 0.9 } ], // left diagonal
    [ { x: 0.5, y: 0.1 }, { x: 0.8, y: 0.9 } ], // right diagonal
    [ { x: 0.32, y: 0.6 }, { x: 0.68, y: 0.6 } ], // crossbar
  ],
  B: [
    [ { x: 0.3, y: 0.1 }, { x: 0.3, y: 0.9 } ], // spine
    [
      { x: 0.3, y: 0.1 }, { x: 0.65, y: 0.15 }, { x: 0.7, y: 0.3 },
      { x: 0.65, y: 0.45 }, { x: 0.3, y: 0.5 },
    ], // top bump
    [
      { x: 0.3, y: 0.5 }, { x: 0.68, y: 0.55 }, { x: 0.73, y: 0.72 },
      { x: 0.68, y: 0.86 }, { x: 0.3, y: 0.9 },
    ], // bottom bump
  ],
  C: [
    [
      { x: 0.75, y: 0.25 }, { x: 0.5, y: 0.12 }, { x: 0.25, y: 0.3 },
      { x: 0.2, y: 0.5 }, { x: 0.25, y: 0.7 }, { x: 0.5, y: 0.88 },
      { x: 0.75, y: 0.75 },
    ],
  ],
  D: [
    [ { x: 0.3, y: 0.1 }, { x: 0.3, y: 0.9 } ], // spine
    [
      { x: 0.3, y: 0.1 }, { x: 0.65, y: 0.2 }, { x: 0.75, y: 0.5 },
      { x: 0.65, y: 0.8 }, { x: 0.3, y: 0.9 },
    ], // bowl
  ],
  L: [
    [ { x: 0.3, y: 0.1 }, { x: 0.3, y: 0.9 }, { x: 0.75, y: 0.9 } ],
  ],
  O: [
    [
      { x: 0.5, y: 0.1 }, { x: 0.25, y: 0.25 }, { x: 0.2, y: 0.5 },
      { x: 0.25, y: 0.75 }, { x: 0.5, y: 0.9 }, { x: 0.75, y: 0.75 },
      { x: 0.8, y: 0.5 }, { x: 0.75, y: 0.25 }, { x: 0.5, y: 0.1 },
    ],
  ],
  T: [
    [ { x: 0.2, y: 0.12 }, { x: 0.8, y: 0.12 } ], // top bar
    [ { x: 0.5, y: 0.12 }, { x: 0.5, y: 0.9 } ], // stem
  ],
};

/** The letters we currently have guide data for, in order. */
export const TRACEABLE_LETTERS = Object.keys(LETTER_PATHS);

/** Get the strokes for a letter (uppercase), or undefined. */
export function getLetterStrokes(letter: string): LetterStrokes | undefined {
  return LETTER_PATHS[letter.toUpperCase()];
}

/** Scale a letter's normalized strokes to a pixel size. */
export function scaleStrokes(
  strokes: LetterStrokes,
  size: number
): { x: number; y: number }[][] {
  return strokes.map((stroke) =>
    stroke.map((p) => ({ x: p.x * size, y: p.y * size }))
  );
}
