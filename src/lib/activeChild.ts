import "server-only";
import { prisma } from "@/lib/prisma";
import { getActiveParentId } from "@/lib/activeParent";

/**
 * Active-child helper.
 *
 * Many kid-facing screens need to know "which child profile is playing right
 * now?" — to load their progress, unlocked tiers, stars, etc.
 *
 * Resolution: if a parent is logged in, we use their FIRST child (oldest profile)
 * as the active child. A future "pick which child" selector can override this by
 * storing a chosen childId in a cookie; this helper would read that first, then
 * fall back to the first child. Returns null if not logged in or no children yet.
 */
export async function getActiveChildId(): Promise<string | null> {
  const parentId = await getActiveParentId();
  if (!parentId) return null;

  const child = await prisma.child.findFirst({
    where: { parentId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return child?.id ?? null;
}
