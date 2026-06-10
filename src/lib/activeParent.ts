import "server-only";
import { getSessionParentId } from "@/lib/session";

/**
 * Active-parent helper.
 *
 * Returns the logged-in parent's id (from the signed session cookie), or null if
 * no one is logged in. Access checks (which paid modules/media the family
 * unlocked) read this, since access is per-parent.
 *
 * This is the single source of truth for "which parent" — every caller (access
 * checks, dashboard, payments) goes through here.
 */
export async function getActiveParentId(): Promise<string | null> {
  return getSessionParentId();
}
