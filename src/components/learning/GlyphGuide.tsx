"use client";

import type { LetterStrokes } from "@/config/letterPaths";

/**
 * GlyphGuide — the faint dotted outline of ANY glyph (letter or number), drawn as
 * an SVG overlay to trace over. Generalized from LetterGuide: it takes the
 * normalized strokes directly, so the same component works for A–Z and 0–9.
 *
 * Sits inside TraceCanvas's pointer-events-none slot — purely visual.
 */
export function GlyphGuide({
  strokes,
  size = 320,
}: Readonly<{
  strokes: LetterStrokes;
  size?: number;
}>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="absolute inset-0"
    >
      {strokes.map((stroke, si) => {
        const points = stroke.map((p) => `${p.x * size},${p.y * size}`).join(" ");
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
            <circle cx={start.x * size} cy={start.y * size} r={10} fill="#00B894" />
          </g>
        );
      })}
    </svg>
  );
}
