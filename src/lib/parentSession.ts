import "server-only";
import { cookies } from "next/headers";

/**
 * Parent-area "unlocked" session (SERVER ONLY).
 *
 * After a parent enters the correct PIN, we set a short-lived cookie marking the
 * parent area as unlocked for this session. The kid-facing app never sets it.
 *
 * NOTE: this is a SIMPLE gate (a presence cookie), separate from full account
 * authentication. Real auth (NextAuth) + linking the cookie to a specific parent
 * account is wired in a later Phase D auth ticket; for now it gates access to the
 * parent UI behind the PIN. getActiveParentId() stays the single source of truth
 * for "which parent".
 */

const COOKIE = "kk_parent_unlocked";
// How long the parent area stays unlocked after a correct PIN (minutes).
const TTL_MINUTES = 15;

/** Mark the parent area as unlocked (called after a verified PIN). */
export function unlockParentArea(): void {
  cookies().set(COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: TTL_MINUTES * 60,
    path: "/",
  });
}

/** Lock the parent area again (e.g. a "lock" button). */
export function lockParentArea(): void {
  cookies().delete(COOKIE);
}

/** Is the parent area currently unlocked? */
export function isParentAreaUnlocked(): boolean {
  return cookies().get(COOKIE)?.value === "1";
}
