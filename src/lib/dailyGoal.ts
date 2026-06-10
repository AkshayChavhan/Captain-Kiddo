import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Daily-goal progress (SERVER ONLY).
 *
 * Counts how many LEVELS (tier completions) a child finished TODAY, to compare
 * against their dailyGoal. "Today" is based on the server's local day start.
 */

/** Count tier completions for a child since the start of today. */
export async function getTodayLevelsCompleted(childId: string): Promise<number> {
  // Start of today (server local time). Note: scheduling/Date is fine here at
  // request time — this runs on the server when the dashboard is rendered.
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  // A "level" finished today = a Progress row marked completed with completedAt
  // today. (completedAt is set when isCompleted flips true — see numbers08.)
  return prisma.progress.count({
    where: {
      childId,
      isCompleted: true,
      completedAt: { gte: startOfToday },
    },
  });
}
