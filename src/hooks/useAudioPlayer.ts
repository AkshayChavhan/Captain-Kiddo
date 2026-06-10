"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Howl } from "howler";

/**
 * useAudioPlayer — a fuller Howler wrapper for MEDIA playback (songs, lullabies,
 * stories), as opposed to the fire-and-forget `useSound` used for tap effects.
 *
 * It tracks play/pause state and the current playback time (updated via
 * requestAnimationFrame), and exposes controls. The lyric-sync, sleep-timer, and
 * story players all build on this one hook so behavior stays consistent.
 *
 * Returns: { playing, position, duration, play, pause, toggle, seek, setVolume }
 */
export interface AudioPlayerApi {
  /** Is the audio currently playing? */
  playing: boolean;
  /** Current position in seconds. */
  position: number;
  /** Total duration in seconds (0 until loaded). */
  duration: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  /** Jump to a position (seconds). */
  seek: (seconds: number) => void;
  /** Set volume 0..1. */
  setVolume: (v: number) => void;
  /**
   * Gently fade the volume to 0 over `durationMs`, then pause (and restore the
   * volume so a later play starts at full). Used by the lullaby sleep timer.
   */
  fadeOutAndPause: (durationMs: number) => void;
}

export function useAudioPlayer(
  src: string | null,
  opts?: { loop?: boolean; onEnd?: () => void }
): AudioPlayerApi {
  const howlRef = useRef<Howl | null>(null);
  const rafRef = useRef<number | null>(null);

  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  // Keep the latest onEnd without re-creating the Howl when it changes.
  const onEndRef = useRef(opts?.onEnd);
  onEndRef.current = opts?.onEnd;

  // (Re)create the Howl whenever the src (or loop) changes.
  useEffect(() => {
    if (!src) {
      howlRef.current = null;
      setPlaying(false);
      setPosition(0);
      setDuration(0);
      return;
    }

    const howl = new Howl({
      src: [src],
      html5: true, // stream long media instead of decoding it all up front
      loop: opts?.loop ?? false,
      onload: () => setDuration(howl.duration()),
      onplay: () => setPlaying(true),
      onpause: () => setPlaying(false),
      onstop: () => setPlaying(false),
      onend: () => {
        if (!(opts?.loop ?? false)) setPlaying(false);
        onEndRef.current?.();
      },
    });
    howlRef.current = howl;

    return () => {
      howl.unload();
      howlRef.current = null;
    };
  }, [src, opts?.loop]);

  // While playing, tick the position each animation frame (smooth, ~60fps). This
  // is what the lyric-sync player reads to highlight the active line.
  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const tick = () => {
      const howl = howlRef.current;
      if (howl) {
        const t = howl.seek();
        if (typeof t === "number") setPosition(t);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing]);

  const play = useCallback(() => howlRef.current?.play(), []);
  const pause = useCallback(() => howlRef.current?.pause(), []);
  const toggle = useCallback(() => {
    const howl = howlRef.current;
    if (!howl) return;
    if (howl.playing()) howl.pause();
    else howl.play();
  }, []);
  const seek = useCallback((seconds: number) => {
    howlRef.current?.seek(seconds);
    setPosition(seconds);
  }, []);
  const setVolume = useCallback((v: number) => {
    howlRef.current?.volume(Math.max(0, Math.min(1, v)));
  }, []);

  const fadeOutAndPause = useCallback((durationMs: number) => {
    const howl = howlRef.current;
    if (!howl) return;
    const current = howl.volume();
    // Howler's fade(from, to, duration_ms) ramps the volume smoothly.
    howl.fade(current, 0, durationMs);
    // When the fade reaches 0, pause and restore the volume for next time.
    howl.once("fade", () => {
      howl.pause();
      howl.volume(current);
    });
  }, []);

  return {
    playing,
    position,
    duration,
    play,
    pause,
    toggle,
    seek,
    setVolume,
    fadeOutAndPause,
  };
}
