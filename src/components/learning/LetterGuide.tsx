"use client";

import { getLetterStrokes } from "@/config/letterPaths";

/**
 * LetterGuide — the faint outline of a letter, drawn as an SVG overlay for the
 * child to trace over.
 *
 * Uses the SAME normalized stroke data (config/letterPaths) that on-path detection
 * uses in trace03, so what the child sees is exactly what we check against. Drawn
 * with a dashed, light stroke plus a green start dot so kids know where to begin.
 *
 * Sits inside TraceCanvas's pointer-events-none overlay slot, so it's purely
 * visual — the finger draws on the canvas beneath it.
 */
export function LetterGuide({
  letter,
  size = 320,
}: Readonly<{
  letter: string;
  size?: number;
}>) {
  const strokes = getLetterStrokes(letter);
  if (!strokes) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="absolute inset-0"
    >
      {strokes.map((stroke, si) => {
        // Build an SVG polyline from the normalized points scaled to `size`.
        const points = stroke
          .map((p) => `${p.x * size},${p.y * size}`)
          .join(" ");
        const start = stroke[0];
        return (
          <g key={`stroke-${si}-${points.length}`}>
            <polyline
              points={points}
              fill="none"
              stroke="#c7c7d9"
              strokeWidth={16}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="2 18"
            />
            {/* Start dot for this stroke. */}
            <circle
              cx={start.x * size}
              cy={start.y * size}
              r={10}
              fill="#00B894"
            />
          </g>
        );
      })}
    </svg>
  );
}
