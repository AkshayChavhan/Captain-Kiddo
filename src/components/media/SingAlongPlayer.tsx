"use client";

import { motion } from "framer-motion";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { AudioPlayer } from "@/components/media/AudioPlayer";
import { activeLyricIndex } from "@/lib/lyrics";
import type { LyricLine, Song } from "@/types/media";

/**
 * SingAlongPlayer — karaoke-style sing-along.
 *
 * Reuses the shared useAudioPlayer + AudioPlayer. As the song plays, the ACTIVE
 * lyric line (the one whose [startSec, endSec] contains the current time) scales
 * up + brightens while the others dim, and a bouncing ball sits above it — the
 * classic karaoke cue. Driven by the player's `position`, which useAudioPlayer
 * updates via requestAnimationFrame (media01), so the highlight tracks smoothly.
 *
 * The dancing mascot is added next in media05. Bright and joyful, per the brief.
 */
export function SingAlongPlayer({ song }: Readonly<{ song: Song }>) {
  const player = useAudioPlayer(song.audioUrl);

  // Which lyric line is active right now (or -1 if none / before the first line).
  const activeIndex = activeLyricIndex(song.lyrics, player.position);

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 bg-kiddo-yellow/20 p-6">
      {/* Cover + title */}
      <header className="flex flex-col items-center gap-2 pt-2 text-center">
        {song.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={song.coverImage}
            alt=""
            className="h-32 w-32 rounded-blob object-cover shadow-lg"
          />
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-blob bg-kiddo-pink text-6xl shadow-lg">
            🎵
          </div>
        )}
        <h1 className="font-kiddo text-3xl font-bold">{song.title}</h1>
      </header>

      {/* Lyrics — the active line lights up with a bouncing ball above it. */}
      <section className="flex w-full max-w-sm flex-1 flex-col items-center gap-3 overflow-y-auto py-2">
        {song.lyrics.length === 0 ? (
          <p className="text-gray-500">La la la! 🎶</p>
        ) : (
          song.lyrics.map((line, i) => (
            <LyricLineView
              key={`${line.startSec}-${line.text}`}
              line={line}
              active={i === activeIndex}
            />
          ))
        )}
      </section>

      {/* Shared transport */}
      <AudioPlayer player={player} accentClass="bg-kiddo-pink" />
    </main>
  );
}

/**
 * One lyric line. When active it brightens + scales up and shows a bouncing ball
 * above it; otherwise it sits dim.
 */
function LyricLineView({
  line,
  active,
}: Readonly<{
  line: LyricLine;
  active: boolean;
}>) {
  return (
    <div className="flex flex-col items-center">
      {/* The bouncing ball — only over the active line. */}
      {active && (
        <motion.span
          className="text-2xl"
          aria-hidden="true"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        >
          🔴
        </motion.span>
      )}

      <motion.p
        // Active line pops bigger and bright; inactive lines stay small + dim.
        animate={{
          scale: active ? 1.15 : 1,
          opacity: active ? 1 : 0.45,
        }}
        transition={{ duration: 0.2 }}
        className={`text-center text-xl font-bold ${
          active ? "text-kiddo-purple" : "text-gray-400"
        }`}
      >
        {line.text}
      </motion.p>
    </div>
  );
}
