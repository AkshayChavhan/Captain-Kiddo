"use client";

import { useSound } from "@/hooks/useSound";
import { numberAudio } from "@/config/audio";

/**
 * NumberCard — the core visual of a Numbers lesson.
 *
 * Shows ONE number two ways at once so pre-readers connect the symbol to a
 * quantity:
 *   1. the big numeral (e.g. "3")
 *   2. that many objects counted out (e.g. 🍎🍎🍎)
 *
 * AUDIO-FIRST: tapping the card speaks the number (via Howler / useSound). Framer
 * Motion bounce animations are added next in numbers04. The optional onTap prop
 * still runs on tap, so callers can compose extra behavior on top of the audio.
 */

/** The object emoji used to count out a number (swappable per module/theme). */
const COUNT_EMOJI = "🍎";

export function NumberCard({
  value,
  emoji = COUNT_EMOJI,
  onTap,
}: Readonly<{
  /** The number to show, e.g. 3. */
  value: number;
  /** Which object to count with (defaults to apples). */
  emoji?: string;
  /** Optional extra tap handler, run after the number's sound plays. */
  onTap?: () => void;
}>) {
  // Build a stable list of keys, one per object to render (e.g. 3 -> 3 apples).
  const itemKeys = Array.from({ length: Math.max(0, value) }, (_, i) => `obj-${i}`);

  // Audio-first: load this number's spoken clip and play it on tap.
  const playNumber = useSound(numberAudio(value));

  const handleTap = () => {
    playNumber(); // speak the number, e.g. "Three!"
    onTap?.(); // let callers add extra behavior
  };

  return (
    <button
      type="button"
      onClick={handleTap}
      aria-label={`Number ${value}`}
      className="kiddo-card flex min-h-tap w-full max-w-sm flex-col items-center gap-4 bg-white"
    >
      {/* The big numeral */}
      <div className="font-kiddo text-8xl font-extrabold text-kiddo-purple">
        {value}
      </div>

      {/* The counted objects — wraps to multiple rows for larger numbers */}
      <div className="flex flex-wrap items-center justify-center gap-1 text-4xl">
        {itemKeys.map((key) => (
          <span key={key} role="img" aria-hidden="true">
            {emoji}
          </span>
        ))}
      </div>
    </button>
  );
}
