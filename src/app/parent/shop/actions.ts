"use server";

import { revalidatePath } from "next/cache";
import { UnlockType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getShopItem } from "@/config/shop";
import { getActiveParentId } from "@/lib/activeParent";

/**
 * Buy a reward-shop item with a child's STARS.
 *
 * Stars are an in-app currency (not money). Requires a logged-in parent. The COST
 * comes from config server-side — the client only says which item, never how many
 * stars. The balance check, deduction, and Unlock creation happen in ONE
 * transaction so a child can't "double-spend".
 */

export interface ShopResult {
  ok: boolean;
  error?: string;
}

export async function buyWithStars(
  childId: string,
  type: UnlockType,
  itemKey: string
): Promise<ShopResult> {
  // Gate: must be a logged-in parent.
  const parentId = await getActiveParentId();
  if (!parentId) return { ok: false, error: "Please log in." };

  // Resolve the authoritative cost from config (never trust a client price).
  const item = getShopItem(type, itemKey);
  if (!item) return { ok: false, error: "Unknown item." };

  try {
    await prisma.$transaction(async (tx) => {
      // Load the child, scoped to this parent (authorization).
      const child = await tx.child.findFirst({
        where: { id: childId, parentId },
        select: { id: true, totalStars: true },
      });
      if (!child) throw new Error("Child not found.");

      // Already owned? (the @@unique backstop, checked early for a nice message)
      const owned = await tx.unlock.findFirst({
        where: { childId, type, itemKey },
        select: { id: true },
      });
      if (owned) throw new Error("Already unlocked.");

      // Enough stars?
      if (child.totalStars < item.starCost) {
        throw new Error("Not enough stars.");
      }

      // Deduct stars and record the unlock — together.
      await tx.child.update({
        where: { id: childId },
        data: { totalStars: { decrement: item.starCost } },
      });
      await tx.unlock.create({
        data: { childId, type, itemKey, starCost: item.starCost },
      });
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not buy." };
  }

  revalidatePath("/parent");
  return { ok: true };
}
