/**
 * Active-child helper.
 *
 * Many kid-facing screens need to know "which child profile is playing right
 * now?" — to load their progress, unlocked tiers, stars, etc.
 *
 * ⚠️ PLACEHOLDER FOR NOW:
 * Choosing the active child happens in the parent dashboard (Phase D), which
 * stores the selected childId (e.g. in a cookie/session). Until that exists,
 * this returns null, and screens fall back to sensible defaults (e.g. only the
 * EASY tier unlocked).
 *
 * Centralizing it here means that when Phase D wires up real child selection,
 * we change ONLY this function — every screen that calls it just works.
 */
export async function getActiveChildId(): Promise<string | null> {
  // TODO (Phase D, parent02-child-profiles): read the selected childId from the
  // session/cookie set when a parent picks which child is using the app.
  return null;
}
