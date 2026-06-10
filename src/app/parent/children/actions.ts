"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getActiveParentId } from "@/lib/activeParent";
import { isParentAreaUnlocked } from "@/lib/parentSession";

/**
 * Server Actions for managing child profiles.
 *
 * Every action re-checks BOTH that the parent area is unlocked (PIN entered) AND
 * that we have an active parent — the gate isn't just UI, it's enforced here on
 * the server so a kid (or a crafted request) can't add/remove profiles.
 *
 * Children always belong to the active parent; we never accept a parentId from
 * the client.
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/** Guard: must be unlocked AND have an active parent. Returns the parentId. */
async function requireParent(): Promise<
  { ok: true; parentId: string } | { ok: false; error: string }
> {
  if (!isParentAreaUnlocked()) {
    return { ok: false, error: "Parent area is locked." };
  }
  const parentId = await getActiveParentId();
  if (!parentId) return { ok: false, error: "No parent account found." };
  return { ok: true, parentId };
}

export async function addChild(input: {
  name: string;
  age: number;
  avatar?: string;
}): Promise<ActionResult> {
  const guard = await requireParent();
  if (!guard.ok) return { ok: false, error: guard.error };

  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Please enter a name." };
  if (!Number.isInteger(input.age) || input.age < 1 || input.age > 12) {
    return { ok: false, error: "Age must be between 1 and 12." };
  }

  await prisma.child.create({
    data: {
      name,
      age: input.age,
      avatar: input.avatar ?? null,
      parentId: guard.parentId, // never from the client
    },
  });

  revalidatePath("/parent");
  return { ok: true };
}

export async function removeChild(childId: string): Promise<ActionResult> {
  const guard = await requireParent();
  if (!guard.ok) return { ok: false, error: guard.error };

  // Only delete a child that belongs to THIS parent (deleteMany scopes the where).
  const res = await prisma.child.deleteMany({
    where: { id: childId, parentId: guard.parentId },
  });
  if (res.count === 0) return { ok: false, error: "Child not found." };

  revalidatePath("/parent");
  return { ok: true };
}
