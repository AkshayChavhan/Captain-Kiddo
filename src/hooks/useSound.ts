"use client";

import { useCallback, useEffect, useRef } from "react";
import { Howl } from "howler";

/**
 * useSound — a tiny wrapper around Howler for playing short sound effects.
 *
 * WHY A HOOK:
 * Creating a `new Howl(...)` on every render would leak audio objects. This hook
 * lazily creates ONE Howl per `src`, caches it in a ref, and cleans it up when
 * the component unmounts or the src changes.
 *
 * USAGE:
 *   const play = useSound("/audio/numbers/3.mp3");
 *   <button onClick={play}>Play</button>
 *
 * Pass `null` for src to get a no-op `play` (handy before audio files exist).
 *
 * Set `{ autoplay: true }` to speak as soon as the clip is LOADED — the robust
 * way to "play on appear" (it waits for load, avoiding a play-before-ready race).
 */
export function useSound(
  src: string | null,
  opts?: { autoplay?: boolean }
) {
  const howlRef = useRef<Howl | null>(null);
  const autoplay = opts?.autoplay ?? false;

  useEffect(() => {
    // No src -> nothing to load.
    if (!src) {
      howlRef.current = null;
      return;
    }

    const howl = new Howl({
      src: [src],
      // HTML5 audio streams the file instead of fully decoding it up front —
      // better for many short clips and lower memory on phones.
      html5: true,
      preload: true,
      // Speak on appear: play once the file is ready (no play-before-load race).
      onload: autoplay ? () => howl.play() : undefined,
    });
    howlRef.current = howl;

    // Cleanup: unload the audio when src changes or the component unmounts.
    return () => {
      howl.unload();
      howlRef.current = null;
    };
  }, [src, autoplay]);

  // Stable play function. Stops any in-flight play first so rapid taps restart
  // the sound cleanly rather than overlapping.
  const play = useCallback(() => {
    const howl = howlRef.current;
    if (!howl) return;
    howl.stop();
    howl.play();
  }, []);

  return play;
}
