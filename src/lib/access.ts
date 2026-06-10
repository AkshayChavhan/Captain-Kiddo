/**
 * Access-control helpers.
 *
 * Two questions the whole app needs to answer, in ONE place:
 *   1. canAccessModule(parentId, module)      -> can this family open the module?
 *   2. unlockedDifficulties(childId, module)  -> which tiers can this child play?
 *
 * Centralizing these means the rules ("free vs paid", "tiers unlock in order")
 * live here and nowhere else — every screen and API route calls these instead of
 * re-implementing the logic (and getting it subtly wrong).
 */
import { Difficulty } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getModule, BUNDLE_SLUG } from "@/config/modules";

/**
 * Can a PARENT's family access a learning module?
 *
 * Access is granted if ANY of these is true:
 *   - the module is FREE (per the registry), OR
 *   - the parent bought this specific module (a ModuleAccess row exists), OR
 *   - the parent bought the ₹39 "ALL" bundle (a ModuleAccess row for "ALL").
 *
 * Access is tied to the PARENT, so all their children inherit it ("pay once").
 *
 * @param parentId  the owning parent's id
 * @param moduleSlug the module slug, e.g. "animals"
 */
export async function canAccessModule(
  parentId: string,
  moduleSlug: string
): Promise<boolean> {
  const module = getModule(moduleSlug);

  // Unknown module slug -> no access (fail closed, never fail open).
  if (!module) return false;

  // Free modules are always playable.
  if (module.isFree) return true;

  // Otherwise the parent must have a matching access row: either this exact
  // module, or the "ALL" bundle. One query checks both.
  const access = await prisma.moduleAccess.findFirst({
    where: {
      parentId,
      module: { in: [moduleSlug, BUNDLE_SLUG] },
    },
    select: { id: true },
  });

  return access !== null;
}

/** The tiers in their fixed unlock order. */
const TIER_ORDER: Difficulty[] = [
  Difficulty.EASY,
  Difficulty.MEDIUM,
  Difficulty.HARD,
];

/**
 * Which difficulty tiers has a CHILD unlocked in a module?
 *
 * Rule: tiers unlock SEQUENTIALLY. EASY is always available. MEDIUM unlocks only
 * after EASY is completed; HARD only after MEDIUM is completed. We walk the tiers
 * in order and stop unlocking as soon as we hit one whose previous tier isn't done.
 *
 * NOTE: this answers "which tiers are unlocked", not "can the family open the
 * module" — callers should usually check canAccessModule() first.
 *
 * @param childId    the child's id
 * @param moduleSlug the module slug, e.g. "numbers"
 * @returns the unlocked tiers, e.g. [EASY] or [EASY, MEDIUM]
 */
export async function unlockedDifficulties(
  childId: string,
  moduleSlug: string
): Promise<Difficulty[]> {
  // Pull this child's completed tiers for the module in one query.
  const rows = await prisma.progress.findMany({
    where: { childId, module: moduleSlug, isCompleted: true },
    select: { difficulty: true },
  });

  const completed = new Set(rows.map((r) => r.difficulty));

  // EASY is always unlocked. Each later tier unlocks only if the one before it
  // is completed. Stop at the first locked tier.
  const unlocked: Difficulty[] = [];
  for (let i = 0; i < TIER_ORDER.length; i++) {
    const tier = TIER_ORDER[i];

    if (i === 0) {
      unlocked.push(tier); // EASY — always available
      continue;
    }

    const previousTier = TIER_ORDER[i - 1];
    if (completed.has(previousTier)) {
      unlocked.push(tier); // previous tier done -> this tier unlocks
    } else {
      break; // previous tier NOT done -> stop; nothing further unlocks
    }
  }

  return unlocked;
}
