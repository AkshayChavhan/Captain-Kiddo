"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** How long the gentle fade-out lasts when the timer fires (ms). */
const FADE_MS = 8000;

/**
 * useSleepTimer — a countdown that, when it reaches zero, runs an `onElapse`
 * callback (the lullaby player passes a fade-out-then-pause). Designed for the
 * 10/15/20-minute sleep timer.
 *
 * Returns { remainingSec, activeMinutes, start, cancel, FADE_MS }.
 *  - start(minutes): begin/replace a countdown.
 *  - cancel(): stop it.
 *  - remainingSec: seconds left (for the UI), or null if no timer running.
 *  - activeMinutes: which preset is running (for highlighting), or null.
 */
export function useSleepTimer(onElapse: () => void) {
  const [remainingSec, setRemainingSec] = useState<number | null>(null);
  const [activeMinutes, setActiveMinutes] = useState<number | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Keep the latest onElapse without restarting the timer when it changes.
  const onElapseRef = useRef(onElapse);
  onElapseRef.current = onElapse;

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    clearTick();
    setRemainingSec(null);
    setActiveMinutes(null);
  }, [clearTick]);

  const start = useCallback(
    (minutes: number) => {
      clearTick();
      setActiveMinutes(minutes);
      setRemainingSec(minutes * 60);

      intervalRef.current = setInterval(() => {
        setRemainingSec((prev) => {
          if (prev === null) return null;
          const next = prev - 1;
          if (next <= 0) {
            clearTick();
            onElapseRef.current(); // fade out + pause
            setActiveMinutes(null);
            return null;
          }
          return next;
        });
      }, 1000);
    },
    [clearTick]
  );

  // Clean up the interval if the component unmounts mid-countdown.
  useEffect(() => clearTick, [clearTick]);

  return { remainingSec, activeMinutes, start, cancel, FADE_MS };
}
