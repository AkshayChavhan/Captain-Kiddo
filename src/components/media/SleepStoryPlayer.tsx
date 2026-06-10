"use client";

import { motion } from "framer-motion";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { AudioPlayer } from "@/components/media/AudioPlayer";
import type { MediaItem } from "@/types/media";

/**
 * SleepStoryPlayer — a narrated bedtime-story player.
 *
 * Audio-first and calming: a slow, gentle scene drifts behind the narration (soft
 * clouds + moon), with long, soft transitions. Reuses the shared AudioPlayer for
 * play/seek. Unlike the lullaby this has no sleep timer (a story has a natural
 * end), and unlike the sing-along there are no lyrics — the focus is listening.
 */
export function SleepStoryPlayer({ item }: Readonly<{ item: MediaItem }>) {
  const player = useAudioPlayer(item.audioUrl);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-indigo-950 p-6 text-indigo-100">
      {/* Slow gentle scene: a moon and a few clouds drifting very slowly. */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-12 -translate-x-1/2 text-7xl opacity-80">
          🌝
        </div>
        {["10%", "55%", "30%"].map((top, i) => (
          <motion.div
            key={top}
            className="absolute text-5xl opacity-40"
            style={{ top }}
            initial={{ x: "-30%" }}
            // Drift slowly across the screen and loop — soothing, never abrupt.
            animate={{ x: "120%" }}
            transition={{
              duration: 40 + i * 10,
              delay: i * 6,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            ☁️
          </motion.div>
        ))}
      </div>

      {/* Title */}
      <header className="z-10 pt-6 text-center">
        <h1 className="font-kiddo text-2xl font-bold">{item.title}</h1>
        <p className="text-sm text-indigo-300">Close your eyes and listen 💫</p>
      </header>

      {/* A softly breathing storyteller, since it's audio-first. */}
      <motion.div
        className="z-10 text-7xl"
        aria-hidden="true"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        🧸
      </motion.div>

      {/* Transport (soft accent) */}
      <div className="z-10 pb-2">
        <AudioPlayer player={player} accentClass="bg-indigo-500" />
      </div>
    </main>
  );
}
