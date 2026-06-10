"use client";

/**
 * NumberCard — the core visual of a Numbers lesson.
 *
 * Shows ONE number two ways at once so pre-readers connect the symbol to a
 * quantity:
 *   1. the big numeral (e.g. "3")
 *   2. that many objects counted out (e.g. 🍎🍎🍎)
 *
 * "Audio-first" tap-to-play sound and Framer Motion bounce animations are added
 * in the next tickets (numbers03 audio, numbers04 animations); this ticket is
 * the visual card itself. The optional onTap prop is the hook those will use.
 */

/** The object emoji used to count out a number (swappable per module/theme). */
const COUNT_EMOJI = "🍎";

export function NumberCard({
  value,
  emoji = COUNT_EMOJI,
  onTap,
}: {
  /** The number to show, e.g. 3. */
  value: number;
  /** Which object to count with (defaults to apples). */
  emoji?: string;
  /** Optional tap handler (used later for audio playback). */
  onTap?: () => void;
}) {
  // Build an array of `value` items to render that many objects.
  const items = Array.from({ length: Math.max(0, value) });

  return (
    <button
      type="button"
      onClick={onTap}
      aria-label={`Number ${value}`}
      className="kiddo-card flex min-h-tap w-full max-w-sm flex-col items-center gap-4 bg-white"
    >
      {/* The big numeral */}
      <div className="font-kiddo text-8xl font-extrabold text-kiddo-purple">
        {value}
      </div>

      {/* The counted objects — wraps to multiple rows for larger numbers */}
      <div className="flex flex-wrap items-center justify-center gap-1 text-4xl">
        {items.map((_, i) => (
          <span key={i} role="img" aria-hidden="true">
            {emoji}
          </span>
        ))}
      </div>
    </button>
  );
}
