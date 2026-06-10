"use client";

import { useCallback, useEffect } from "react";
import { speak } from "@/lib/speak";

/**
 * useSpeak — speak a word via browser TTS.
 *
 * Returns a stable `say()` that speaks the given `text`. With `{ onAppear: true }`
 * it also speaks once when the component mounts (or when `text` changes) — the
 * audio-first "say it as it appears" behavior. Components keyed by the current
 * item remount per item, so onAppear fires per item.
 */
export function useSpeak(text: string, opts?: { onAppear?: boolean }) {
  const onAppear = opts?.onAppear ?? false;

  const say = useCallback(() => {
    speak(text);
  }, [text]);

  useEffect(() => {
    if (onAppear) say();
  }, [onAppear, say]);

  return say;
}
