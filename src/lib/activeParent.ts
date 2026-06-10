/**
 * Active-parent helper.
 *
 * Returns the signed-in parent's id — needed for access checks (which paid
 * modules/media the family unlocked) since access is per-parent.
 *
 * ⚠️ PLACEHOLDER FOR NOW:
 * Real parent authentication (NextAuth) and the parent session land in Phase D.
 * Until then this returns null, and access checks fall back safely (free content
 * plays; paid content stays locked so it never leaks).
 *
 * Centralizing it means when auth is wired, we change ONLY this function — every
 * caller (access checks, dashboard) just works.
 */
export async function getActiveParentId(): Promise<string | null> {
  // TODO (Phase D, auth/parent session): read the authenticated parent's id.
  return null;
}
