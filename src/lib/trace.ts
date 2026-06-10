/**
 * Trace on-path detection (pure geometry — no React/DOM).
 *
 * Decides whether a drawn point is "on" the letter's guide path, by measuring its
 * distance to the nearest guide segment. Pure + framework-free so it's easy to
 * reason about and test.
 *
 * Coordinates here are in PIXELS (the caller scales the normalized guide to the
 * canvas size first, via scaleStrokes).
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * Distance from point `p` to the line SEGMENT a–b (not the infinite line).
 * Standard "project p onto the segment, clamp to its ends, measure" approach.
 */
export function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;

  // Degenerate segment (a == b): just distance to the point.
  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);

  // t = how far along a->b the projection of p falls, clamped to [0,1].
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  // The closest point on the segment, then the distance to it.
  const cx = a.x + t * dx;
  const cy = a.y + t * dy;
  return Math.hypot(p.x - cx, p.y - cy);
}

/**
 * Smallest distance from `p` to ANY segment across ALL strokes of the letter.
 * (A letter is multiple strokes; the finger is "on path" if near any of them.)
 */
export function distanceToStrokes(p: Point, strokes: Point[][]): number {
  let min = Infinity;
  for (const stroke of strokes) {
    for (let i = 1; i < stroke.length; i++) {
      const d = distanceToSegment(p, stroke[i - 1], stroke[i]);
      if (d < min) min = d;
    }
    // A single-point stroke (no segments) — distance to that point.
    if (stroke.length === 1) {
      const d = Math.hypot(p.x - stroke[0].x, p.y - stroke[0].y);
      if (d < min) min = d;
    }
  }
  return min;
}

/**
 * Is a drawn point on the path, within `tolerance` pixels of the guide?
 * Tolerance is forgiving by default — little fingers aren't precise.
 */
export function isPointOnPath(
  p: Point,
  strokes: Point[][],
  tolerance = 36
): boolean {
  return distanceToStrokes(p, strokes) <= tolerance;
}
