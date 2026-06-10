"use client";

import { motion } from "framer-motion";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useSleepTimer } from "@/hooks/useSleepTimer";
import { AudioPlayer } from "@/components/media/AudioPlayer";
import { formatTime } from "@/lib/format";
import type { MediaItem } from "@/types/media";

/** The sleep-timer presets, in minutes. */
const TIMER_PRESETS = [10, 15, 20];

/** A few drifting stars for the calm background. */
const STARS = [
  { left: "15%", top: "20%", delay: 0 },
  { left: "70%", top: "15%", delay: 1.5 },
  { left: "40%", top: "35%", delay: 0.8 },
  { left: "82%", top: "45%", delay: 2.2 },
  { left: "25%", top: "55%", delay: 1.1 },
];

/**
 * LullabyPlayer — a CALMING player for bedtime.
 *
 * The opposite mood to the sing-along: a dark, dimmed screen with a soft moon and
 * slowly drifting stars. Includes a SLEEP TIMER (10/15/20 min) that, when it
 * elapses, gently fades the volume to 0 and pauses — so music doesn't blare all
 * night if the child falls asleep.
 *
 * Loops the audio (lullabies repeat) and reuses the shared AudioPlayer transport.
 */
export function LullabyPlayer({ item }: Readonly<{ item: MediaItem }>) {
  const player = useAudioPlayer(item.audioUrl, { loop: true });

  // When the timer elapses, fade out gently then pause.
  const { remainingSec, activeMinutes, start, cancel, FADE_MS } = useSleepTimer(
    () => player.fadeOutAndPause(FADE_MS)
  );

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-slate-900 p-6 text-slate-200">
      {/* Soft moon */}
      <div className="pointer-events-none absolute right-8 top-10 text-6xl opacity-80">
        🌙
      </div>

      {/* Drifting stars */}
      {STARS.map((s) => (
        <motion.span
          key={`${s.left}-${s.top}`}
          className="pointer-events-none absolute text-xl opacity-60"
          style={{ left: s.left, top: s.top }}
          animate={{ y: [0, -12, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{
            duration: 6,
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          ⭐
        </motion.span>
      ))}

      {/* Title */}
      <header className="z-10 pt-6 text-center">
        <h1 className="font-kiddo text-2xl font-bold">{item.title}</h1>
        <p className="text-sm text-slate-400">Sweet dreams 💤</p>
      </header>

      {/* Transport (dimmed accent) */}
      <div className="z-10 flex flex-col items-center gap-6">
        <AudioPlayer player={player} accentClass="bg-slate-600" />

        {/* Sleep timer */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-slate-400">Sleep timer</p>
          <div className="flex gap-3">
            {TIMER_PRESETS.map((min) => {
              const active = activeMinutes === min;
              return (
                <button
                  key={min}
                  type="button"
                  onClick={() => (active ? cancel() : start(min))}
                  className={`rounded-kiddo px-4 py-2 text-lg font-bold ${
                    active
                      ? "bg-slate-300 text-slate-900"
                      : "bg-slate-700 text-slate-200"
                  }`}
                >
                  {min}m
                </button>
              );
            })}
          </div>
          {remainingSec !== null && (
            <p className="text-sm text-slate-300">
              Sleeping in {formatTime(remainingSec)} ⏳
            </p>
          )}
        </div>
      </div>

      <footer className="z-10 pb-2" />
    </main>
  );
}
