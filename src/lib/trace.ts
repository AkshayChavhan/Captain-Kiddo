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

/** Smallest distance from a point to any point in a set (or Infinity if empty). */
function nearestDistance(p: Point, others: Point[]): number {
  let min = Infinity;
  for (const o of others) {
    const d = Math.hypot(p.x - o.x, p.y - o.y);
    if (d < min) min = d;
  }
  return min;
}

/**
 * What fraction of the GUIDE has the child actually traced over?
 *
 * Prevents "cheating" by scribbling on one corner: we sample points ALONG each
 * guide stroke and check how many have a drawn point nearby. Returns 0..1.
 *
 * @param drawn      the child's drawn points
 * @param strokes    the letter's guide strokes (pixels)
 * @param tolerance  how close a drawn point must be to "cover" a guide point
 */
export function traceCoverage(
  drawn: Point[],
  strokes: Point[][],
  tolerance = 40
): number {
  // Sample points evenly along every guide segment.
  const samples: Point[] = [];
  for (const stroke of strokes) {
    for (let i = 1; i < stroke.length; i++) {
      const a = stroke[i - 1];
      const b = stroke[i];
      const steps = 6; // points per segment
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        samples.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      }
    }
  }
  if (samples.length === 0) return 0;

  const covered = samples.filter(
    (s) => nearestDistance(s, drawn) <= tolerance
  ).length;
  return covered / samples.length;
}
