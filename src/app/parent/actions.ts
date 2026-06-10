"use server";

import { prisma } from "@/lib/prisma";
import { verifyPin, hashPin } from "@/lib/pin";
import { getActiveParentId } from "@/lib/activeParent";
import {
  unlockParentArea,
  lockParentArea,
} from "@/lib/parentSession";

/**
 * Server Actions for the parent PIN gate.
 *
 * These run ONLY on the server ("use server"), so the PIN check and hashing never
 * touch the client. The client form calls submitPin() with the entered PIN.
 */

export interface PinResult {
  ok: boolean;
  error?: string;
}

/**
 * Verify an entered PIN for the active parent and, if correct, unlock the parent
 * area. Returns { ok } so the client can show an error without learning anything
 * sensitive.
 */
export async function submitPin(pin: string): Promise<PinResult> {
  // Basic shape check: PINs are 4 digits.
  if (!/^\d{4}$/.test(pin)) {
    return { ok: false, error: "Enter your 4-digit PIN." };
  }

  const parentId = await getActiveParentId();
  if (!parentId) {
    // No parent account resolved yet (real auth lands later in Phase D).
    return { ok: false, error: "No parent account found." };
  }

  const parent = await prisma.parent.findUnique({
    where: { id: parentId },
    select: { pinHash: true },
  });

  if (!parent?.pinHash) {
    return { ok: false, error: "No PIN set yet." };
  }

  const valid = await verifyPin(pin, parent.pinHash);
  if (!valid) {
    return { ok: false, error: "Wrong PIN. Try again." };
  }

  unlockParentArea();
  return { ok: true };
}

/**
 * Set (or change) the active parent's PIN. Used during setup. Stores only the
 * hash. After setting, unlock the area so the parent can continue.
 */
export async function setPin(pin: string): Promise<PinResult> {
  if (!/^\d{4}$/.test(pin)) {
    return { ok: false, error: "PIN must be 4 digits." };
  }

  const parentId = await getActiveParentId();
  if (!parentId) {
    return { ok: false, error: "No parent account found." };
  }

  const pinHash = await hashPin(pin);
  await prisma.parent.update({ where: { id: parentId }, data: { pinHash } });

  unlockParentArea();
  return { ok: true };
}

/** Lock the parent area (kid hands the phone back). */
export async function lockParent(): Promise<void> {
  lockParentArea();
}
