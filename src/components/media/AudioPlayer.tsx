"use client";

import { motion } from "framer-motion";
import type { AudioPlayerApi } from "@/hooks/useAudioPlayer";
import { formatTime } from "@/lib/format";

/**
 * AudioPlayer — the SHARED transport UI for all media (songs, lullabies, stories).
 *
 * It's "controlled": it doesn't own the audio, it just renders controls for an
 * `AudioPlayerApi` (from useAudioPlayer) passed in. That keeps it reusable — each
 * media screen sets up its own audio + surroundings (lyrics, sleep timer, scene)
 * and drops this transport in.
 *
 * Big kid-friendly play/pause button + a tappable progress bar.
 */
export function AudioPlayer({
  player,
  accentClass = "bg-kiddo-purple",
}: Readonly<{
  player: AudioPlayerApi;
  /** Tailwind bg class for the play button (lets each screen theme it). */
  accentClass?: string;
}>) {
  const { playing, position, duration, toggle, seek } = player;
  const progress = duration > 0 ? position / duration : 0;

  // Tap anywhere on the bar to seek to that fraction of the track.
  const handleSeek = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    seek(Math.max(0, Math.min(1, fraction)) * duration);
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      {/* Big play / pause button */}
      <motion.button
        type="button"
        onClick={toggle}
        whileTap={{ scale: 0.92 }}
        aria-label={playing ? "Pause" : "Play"}
        className={`flex min-h-tap min-w-tap items-center justify-center rounded-full text-5xl text-white shadow-xl ${accentClass}`}
        style={{ width: "5.5rem", height: "5.5rem" }}
      >
        {playing ? "⏸️" : "▶️"}
      </motion.button>

      {/* Progress bar (tap to seek) */}
      <button
        type="button"
        onClick={handleSeek}
        aria-label="Seek"
        className="h-4 w-full overflow-hidden rounded-full bg-gray-200"
      >
        <div
          className={`h-full ${accentClass}`}
          style={{ width: `${progress * 100}%` }}
        />
      </button>

      {/* Time labels */}
      <div className="flex w-full justify-between text-sm font-bold text-gray-600">
        <span>{formatTime(position)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
