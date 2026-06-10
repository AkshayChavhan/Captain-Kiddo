/**
 * Number guide paths (0–9).
 *
 * Same structure as letterPaths.ts: each digit is one or more STROKES, each a
 * list of normalized 0..1 points in natural writing order. Reused by the SAME
 * trace canvas, guide overlay, and on-path detection that letters use — adding
 * number tracing is mostly this data, not new engine code.
 */
import type { LetterStrokes, NormPoint } from "@/config/letterPaths";

/** Re-export the point type under a number-friendly name. */
export type { NormPoint };

export const NUMBER_PATHS: Record<string, LetterStrokes> = {
  "0": [
    [
      { x: 0.5, y: 0.1 }, { x: 0.28, y: 0.25 }, { x: 0.22, y: 0.5 },
      { x: 0.28, y: 0.75 }, { x: 0.5, y: 0.9 }, { x: 0.72, y: 0.75 },
      { x: 0.78, y: 0.5 }, { x: 0.72, y: 0.25 }, { x: 0.5, y: 0.1 },
    ],
  ],
  "1": [
    [ { x: 0.35, y: 0.25 }, { x: 0.5, y: 0.1 }, { x: 0.5, y: 0.9 } ],
    [ { x: 0.32, y: 0.9 }, { x: 0.68, y: 0.9 } ], // base
  ],
  "2": [
    [
      { x: 0.25, y: 0.3 }, { x: 0.4, y: 0.12 }, { x: 0.62, y: 0.14 },
      { x: 0.72, y: 0.32 }, { x: 0.6, y: 0.52 }, { x: 0.3, y: 0.72 },
      { x: 0.22, y: 0.9 }, { x: 0.78, y: 0.9 },
    ],
  ],
  "3": [
    [
      { x: 0.28, y: 0.2 }, { x: 0.55, y: 0.1 }, { x: 0.72, y: 0.27 },
      { x: 0.5, y: 0.48 },
    ], // top bump
    [
      { x: 0.5, y: 0.48 }, { x: 0.74, y: 0.62 }, { x: 0.6, y: 0.86 },
      { x: 0.3, y: 0.82 },
    ], // bottom bump
  ],
  "4": [
    [ { x: 0.6, y: 0.1 }, { x: 0.22, y: 0.62 }, { x: 0.78, y: 0.62 } ], // diagonal + bar
    [ { x: 0.62, y: 0.3 }, { x: 0.62, y: 0.9 } ], // stem
  ],
  "5": [
    [ { x: 0.7, y: 0.12 }, { x: 0.32, y: 0.12 }, { x: 0.3, y: 0.45 } ], // top + down
    [
      { x: 0.3, y: 0.45 }, { x: 0.55, y: 0.4 }, { x: 0.74, y: 0.6 },
      { x: 0.6, y: 0.86 }, { x: 0.3, y: 0.82 },
    ], // belly
  ],
  "6": [
    [
      { x: 0.68, y: 0.16 }, { x: 0.42, y: 0.22 }, { x: 0.28, y: 0.5 },
      { x: 0.3, y: 0.74 }, { x: 0.5, y: 0.9 }, { x: 0.7, y: 0.78 },
      { x: 0.72, y: 0.6 }, { x: 0.5, y: 0.5 }, { x: 0.3, y: 0.6 },
    ],
  ],
  "7": [
    [ { x: 0.24, y: 0.12 }, { x: 0.76, y: 0.12 }, { x: 0.42, y: 0.9 } ],
  ],
  "8": [
    [
      { x: 0.5, y: 0.5 }, { x: 0.3, y: 0.32 }, { x: 0.5, y: 0.1 },
      { x: 0.7, y: 0.32 }, { x: 0.5, y: 0.5 }, { x: 0.3, y: 0.7 },
      { x: 0.5, y: 0.9 }, { x: 0.7, y: 0.7 }, { x: 0.5, y: 0.5 },
    ],
  ],
  "9": [
    [
      { x: 0.7, y: 0.5 }, { x: 0.5, y: 0.6 }, { x: 0.3, y: 0.4 },
      { x: 0.45, y: 0.16 }, { x: 0.68, y: 0.22 }, { x: 0.72, y: 0.5 },
      { x: 0.6, y: 0.9 },
    ],
  ],
};

/** The digits we have guide data for, in order. */
export const TRACEABLE_NUMBERS = Object.keys(NUMBER_PATHS);

/** Get the strokes for a digit ("0".."9"), or undefined. */
export function getNumberStrokes(digit: string): LetterStrokes | undefined {
  return NUMBER_PATHS[digit];
}
