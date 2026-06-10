import { Difficulty } from "@prisma/client";

/**
 * Guest (logged-out) access rules.
 *
 * A guest may play the FIRST item of each module's EASY tier — a free taste.
 * Everything beyond that (more items, Medium/Hard tiers, quizzes, the parent
 * area) requires logging in. These are pure helpers so the same rule is applied
 * consistently on the server and the client.
 */

/** How many items a guest may play at the start of the Easy tier. */
export const GUEST_FREE_ITEMS = 1;

/**
 * Can a guest view this item index of this tier?
 * Only Easy, and only the first GUEST_FREE_ITEMS items.
 *
 * (Quizzes and the parent area are gated separately by a server-side redirect to
 * /login, since they're entirely past the free taste.)
 */
export function guestCanViewItem(
  difficulty: Difficulty,
  index: number
): boolean {
  return difficulty === Difficulty.EASY && index < GUEST_FREE_ITEMS;
}
