import "server-only";
import { Difficulty } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MODULES } from "@/config/modules";
import { TIERS } from "@/config/tiers";

/**
 * Per-child progress summary (SERVER ONLY).
 *
 * Reads a child's Progress rows and rolls them up into a shape the parent
 * dashboard can render: per module, which tiers are completed, and overall counts.
 */

/** Progress for one module: which tiers are done. */
export interface ModuleProgress {
  slug: string;
  title: string;
  emoji: string;
  /** Completed tiers, in order (e.g. [EASY, MEDIUM]). */
  completedTiers: Difficulty[];
  /** Total tiers (always 3) for showing "2 / 3". */
  totalTiers: number;
}

/** The whole summary for one child. */
export interface ChildProgressSummary {
  totalStars: number;
  /** Count of modules with at least one completed tier. */
  modulesStarted: number;
  /** Count of modules fully completed (all 3 tiers). */
  modulesCompleted: number;
  /** Total tiers completed across all modules. */
  tiersCompleted: number;
  modules: ModuleProgress[];
}

/** Build the progress summary for a child. */
export async function getChildProgressSummary(
  childId: string
): Promise<ChildProgressSummary> {
  const [child, completedRows] = await Promise.all([
    prisma.child.findUnique({
      where: { id: childId },
      select: { totalStars: true },
    }),
    prisma.progress.findMany({
      where: { childId, isCompleted: true },
      select: { module: true, difficulty: true },
    }),
  ]);

  // Group completed tiers by module slug.
  const byModule = new Map<string, Set<Difficulty>>();
  for (const row of completedRows) {
    const set = byModule.get(row.module) ?? new Set<Difficulty>();
    set.add(row.difficulty);
    byModule.set(row.module, set);
  }

  const tierOrder = TIERS.map((t) => t.difficulty);

  const modules: ModuleProgress[] = MODULES.map((m) => {
    const done = byModule.get(m.slug) ?? new Set<Difficulty>();
    // Keep completed tiers in the canonical EASY->MEDIUM->HARD order.
    const completedTiers = tierOrder.filter((t) => done.has(t));
    return {
      slug: m.slug,
      title: m.title,
      emoji: m.emoji,
      completedTiers,
      totalTiers: tierOrder.length,
    };
  });

  const modulesStarted = modules.filter((m) => m.completedTiers.length > 0).length;
  const modulesCompleted = modules.filter(
    (m) => m.completedTiers.length === m.totalTiers
  ).length;
  const tiersCompleted = completedRows.length;

  return {
    totalStars: child?.totalStars ?? 0,
    modulesStarted,
    modulesCompleted,
    tiersCompleted,
    modules,
  };
}
