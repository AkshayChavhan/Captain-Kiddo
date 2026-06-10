import "server-only";
import { Difficulty } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getModule } from "@/config/modules";
import { getTier } from "@/config/tiers";

/**
 * Weak-area analysis (SERVER ONLY).
 *
 * "Weak areas" are module+tier combinations where the child has been scoring low
 * across their quiz attempts. We read every TestResult (we kept the full history
 * for exactly this — see schema02), group by module+difficulty, average the
 * score percentage, and flag the groups below a threshold.
 */

/** A module+tier the child is struggling with. */
export interface WeakArea {
  module: string;
  moduleTitle: string;
  difficulty: Difficulty;
  tierLabel: string;
  /** Average score across attempts, 0..100 (rounded). */
  averagePercent: number;
  /** How many attempts this is based on. */
  attempts: number;
}

/** Below this average %, a module+tier is considered "weak". */
const WEAK_THRESHOLD = 60;
/** Need at least this many attempts before we judge an area (avoid noise). */
const MIN_ATTEMPTS = 2;

/** Compute a child's weak areas from their TestResult history. */
export async function getChildWeakAreas(childId: string): Promise<WeakArea[]> {
  const results = await prisma.testResult.findMany({
    where: { childId },
    select: { module: true, difficulty: true, score: true, total: true },
  });

  // Accumulate score% per module+difficulty.
  interface Acc {
    sumPercent: number;
    attempts: number;
  }
  const groups = new Map<string, Acc & { module: string; difficulty: Difficulty }>();

  for (const r of results) {
    if (r.total <= 0) continue; // guard against bad data
    const key = `${r.module}:${r.difficulty}`;
    const pct = (r.score / r.total) * 100;
    const g =
      groups.get(key) ??
      { sumPercent: 0, attempts: 0, module: r.module, difficulty: r.difficulty };
    g.sumPercent += pct;
    g.attempts += 1;
    groups.set(key, g);
  }

  const weak: WeakArea[] = [];
  for (const g of groups.values()) {
    if (g.attempts < MIN_ATTEMPTS) continue;
    const averagePercent = Math.round(g.sumPercent / g.attempts);
    if (averagePercent >= WEAK_THRESHOLD) continue;

    const mod = getModule(g.module);
    weak.push({
      module: g.module,
      moduleTitle: mod?.title ?? g.module,
      difficulty: g.difficulty,
      tierLabel: getTier(g.difficulty).label,
      averagePercent,
      attempts: g.attempts,
    });
  }

  // Weakest first.
  weak.sort((a, b) => a.averagePercent - b.averagePercent);
  return weak;
}
