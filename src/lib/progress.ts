/**
 * Progress + test-result persistence (server-side).
 *
 * These functions write to the database, so they run ONLY on the server (called
 * from API routes / server actions, never from the client directly).
 *
 * Key behaviors:
 *  - saveProgress upserts the single Progress row for (child, module, tier),
 *    and when a tier is completed it awards stars to Child.totalStars — both in
 *    ONE transaction so the star balance can't drift from the progress.
 *  - The unique constraint @@unique([childId, module, difficulty]) (schema02) is
 *    what makes the upsert safe.
 */
import { Difficulty } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Input for saving a child's progress in a tier. */
export interface SaveProgressInput {
  childId: string;
  module: string;
  difficulty: Difficulty;
  /** Stars earned in this play session. */
  starsEarned: number;
  /** Whether the child finished the tier (unlocks the next one). */
  isCompleted: boolean;
}

/**
 * Upsert a child's progress for one tier, and award stars atomically.
 *
 * Returns the saved progress row.
 */
export async function saveProgress(input: SaveProgressInput) {
  const { childId, module, difficulty, starsEarned, isCompleted } = input;

  // Run progress upsert + star award together so they never get out of sync.
  return prisma.$transaction(async (tx) => {
    const progress = await tx.progress.upsert({
      where: {
        // Targets the single row guaranteed unique by the schema constraint.
        childId_module_difficulty: { childId, module, difficulty },
      },
      create: {
        childId,
        module,
        difficulty,
        starsEarned,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      update: {
        // Add to any stars already earned in this tier.
        starsEarned: { increment: starsEarned },
        // Only ever flip completion ON (don't un-complete a finished tier).
        ...(isCompleted ? { isCompleted: true, completedAt: new Date() } : {}),
      },
    });

    // Award the freshly-earned stars to the child's spendable balance.
    if (starsEarned > 0) {
      await tx.child.update({
        where: { id: childId },
        data: { totalStars: { increment: starsEarned } },
      });
    }

    return progress;
  });
}

/** Input for recording one quiz attempt. */
export interface SaveTestResultInput {
  childId: string;
  module: string;
  difficulty: Difficulty;
  score: number;
  total: number;
}

/**
 * Record a single quiz attempt (we keep every attempt for weak-area analysis).
 */
export async function saveTestResult(input: SaveTestResultInput) {
  return prisma.testResult.create({ data: input });
}
