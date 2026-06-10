"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setDailyGoal } from "@/app/parent/children/actions";

/**
 * DailyGoal — set a child's daily learning goal (levels/day) and show today's
 * progress toward it.
 *
 * The goal is stored on Child.dailyGoal via a server action; `completedToday`
 * is computed on the server and passed in.
 */
export function DailyGoal({
  childId,
  goal,
  completedToday,
}: Readonly<{
  childId: string;
  goal: number;
  completedToday: number;
}>) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState(goal);

  const save = (next: number) => {
    const clamped = Math.max(0, Math.min(20, next));
    setValue(clamped);
    startTransition(async () => {
      await setDailyGoal(childId, clamped);
      router.refresh();
    });
  };

  const met = goal > 0 && completedToday >= goal;

  return (
    <div className="flex items-center justify-between gap-3 rounded-kiddo bg-kiddo-blue/10 p-3">
      <div className="text-sm">
        <p className="font-bold text-gray-700">🎯 Daily goal</p>
        {goal > 0 ? (
          <p className="text-gray-600">
            {completedToday} / {goal} levels today {met ? "✅" : ""}
          </p>
        ) : (
          <p className="text-gray-500">No goal set</p>
        )}
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => save(value - 1)}
          disabled={pending || value <= 0}
          aria-label="Decrease goal"
          className="h-10 w-10 rounded-full bg-gray-200 text-xl font-bold disabled:opacity-40"
        >
          −
        </button>
        <span className="w-6 text-center text-lg font-bold">{value}</span>
        <button
          type="button"
          onClick={() => save(value + 1)}
          disabled={pending || value >= 20}
          aria-label="Increase goal"
          className="h-10 w-10 rounded-full bg-kiddo-blue text-xl font-bold text-white disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}
