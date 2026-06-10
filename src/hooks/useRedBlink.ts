"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useRedBlink — flash a "blink" state ON/OFF a fixed number of times.
 *
 * Used by the tracing feature: when a child traces OFF the letter's path, the
 * whole screen blinks red 3 times as a gentle "oops, try again" cue. Returns
 * { blinking, blink } — pass `blinking` to the red overlay, call blink() on a
 * mistake.
 *
 * Implementation: toggle the flag on/off `times * 2` steps (on, off, on, off, ...)
 * on an interval. Self-clears and is cancelled on unmount.
 */
export function useRedBlink({
  times = 3,
  intervalMs = 180,
}: { times?: number; intervalMs?: number } = {}) {
  const [blinking, setBlinking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setBlinking(false);
  }, []);

  const blink = useCallback(() => {
    // Restart cleanly if a blink is already running.
    if (timerRef.current) clearInterval(timerRef.current);

    let step = 0;
    const totalSteps = times * 2; // each blink = on + off
    setBlinking(true); // start ON immediately

    timerRef.current = setInterval(() => {
      step += 1;
      if (step >= totalSteps) {
        stop();
        return;
      }
      // Odd step -> off, even step -> on.
      setBlinking(step % 2 === 0);
    }, intervalMs);
  }, [times, intervalMs, stop]);

  // Clean up if the component unmounts mid-blink.
  useEffect(() => stop, [stop]);

  return { blinking, blink };
}
