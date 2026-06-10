"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { submitPin } from "@/app/parent/actions";

/**
 * PinPad — a 4-digit PIN entry for the parent gate.
 *
 * Big number buttons (kid-proof in the sense that a kid won't know the PIN, but
 * the UI is simple). On 4 digits it calls the submitPin server action; on success
 * it refreshes so the now-unlocked parent area renders.
 */
export function PinPad() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const press = (digit: string) => {
    if (pending || pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    setError(null);
    if (next.length === 4) submit(next);
  };

  const submit = (value: string) => {
    startTransition(async () => {
      const res = await submitPin(value);
      if (res.ok) {
        router.refresh(); // re-render the parent page (now unlocked)
      } else {
        setError(res.error ?? "Wrong PIN.");
        setPin("");
        setShake(true);
        globalThis.setTimeout(() => setShake(false), 500);
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="font-kiddo text-2xl font-bold">Grown-ups only 🔒</h1>

      {/* The 4 dots showing progress */}
      <motion.div
        className="flex gap-3"
        animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-5 w-5 rounded-full ${
              i < pin.length ? "bg-kiddo-purple" : "bg-gray-300"
            }`}
          />
        ))}
      </motion.div>

      {error && <p className="text-kiddo-red font-bold">{error}</p>}

      {/* Number pad */}
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => press(d)}
            disabled={pending}
            className="kiddo-btn bg-kiddo-teal disabled:opacity-50"
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPin((p) => p.slice(0, -1))}
          disabled={pending}
          className="kiddo-btn bg-gray-400"
        >
          ⌫
        </button>
        <button
          type="button"
          onClick={() => press("0")}
          disabled={pending}
          className="kiddo-btn bg-kiddo-teal disabled:opacity-50"
        >
          0
        </button>
      </div>
    </div>
  );
}
