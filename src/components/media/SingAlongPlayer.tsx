"use client";

import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { AudioPlayer } from "@/components/media/AudioPlayer";
import type { Song } from "@/types/media";

/**
 * SingAlongPlayer — the sing-along base.
 *
 * Loads a song via the shared useAudioPlayer + AudioPlayer, shows the cover and
 * title, and lays out the lyric lines. This ticket (media03) is the BASE: lyrics
 * render statically. The karaoke sync — highlighting the active line and the
 * bouncing ball driven by playback time — is added in media04, and the dancing
 * mascot in media05. The structure here is built so those just plug in.
 *
 * Bright and joyful, per the brief.
 */
export function SingAlongPlayer({ song }: Readonly<{ song: Song }>) {
  const player = useAudioPlayer(song.audioUrl);

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

      {/* Lyrics — each line is keyed by its start time so media04 can target the
          active one. For now they're all shown in the resting (dim) style. */}
      <section className="flex w-full max-w-sm flex-1 flex-col items-center gap-3 overflow-y-auto py-2">
        {song.lyrics.length === 0 ? (
          <p className="text-gray-500">La la la! 🎶</p>
        ) : (
          song.lyrics.map((line) => (
            <p
              key={`${line.startSec}-${line.text}`}
              className="text-center text-xl font-bold text-gray-400"
            >
              {line.text}
            </p>
          ))
        )}
      </section>

      {/* Shared transport */}
      <AudioPlayer player={player} accentClass="bg-kiddo-pink" />
    </main>
  );
}
