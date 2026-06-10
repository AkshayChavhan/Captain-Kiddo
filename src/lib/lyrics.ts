/**
 * Lyric timing helpers (pure).
 *
 * Given the current playback time and the song's lyric lines, work out which
 * line is active. Kept pure (no React) so it's easy to reason about and test.
 */
import type { LyricLine } from "@/types/media";

/**
 * Find the index of the lyric line active at `timeSec`, or -1 if none.
 *
 * A line is active when timeSec is within [startSec, endSec). Lines are assumed
 * sorted by startSec; we scan and return the last one that has started and not
 * yet ended.
 */
export function activeLyricIndex(lines: LyricLine[], timeSec: number): number {
  let active = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (timeSec >= line.startSec && timeSec < line.endSec) {
      return i; // exact hit
    }
    // Track the most recent line that has already started (covers small gaps
    // between lines so the highlight doesn't flicker off between words).
    if (timeSec >= line.startSec) active = i;
  }
  return active;
}
