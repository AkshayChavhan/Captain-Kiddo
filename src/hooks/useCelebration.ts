"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useCelebration — show a brief celebration, then auto-hide it.
 *
 * Returns `{ celebrating, celebrate }`. Call `celebrate()` on a correct answer;
 * `celebrating` becomes true and flips back to false after `durationMs`. Pass
 * `celebrating` to the <Celebration> overlay's `show` prop.
 *
 * The timeout is cleared on unmount so it never fires on a gone component.
 */
export function useCelebration(durationMs = 900) {
  const [celebrating, setCelebrating] = useState(false);
  const timerRef = useRef<number | null>(null);

  const celebrate = useCallback(() => {
    setCelebrating(true);
    if (timerRef.current) globalThis.clearTimeout(timerRef.current);
    timerRef.current = globalThis.setTimeout(
      () => setCelebrating(false),
      durationMs
    );
  }, [durationMs]);

  useEffect(() => {
    return () => {
      if (timerRef.current) globalThis.clearTimeout(timerRef.current);
    };
  }, []);

  return { celebrating, celebrate };
}
