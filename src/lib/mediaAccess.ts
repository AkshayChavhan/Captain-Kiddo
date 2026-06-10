/**
 * Media access-control helper.
 *
 * MediaContent carries its OWN free/paid gating (isFree + priceInPaise), separate
 * from learning modules. This decides whether a given parent can play a piece of
 * media.
 *
 * Access rule (mirrors the module rule from src/lib/access.ts):
 *   - free media (isFree) plays for everyone, OR
 *   - the parent unlocked this specific media, OR
 *   - the parent bought the "ALL" bundle.
 *
 * Paid media reuses the existing ModuleAccess table with a namespaced key,
 * `media:<mediaId>`, so we don't need a separate access model. (If media
 * purchases grow their own needs later, this is the one place to change.)
 */
import { prisma } from "@/lib/prisma";
import { BUNDLE_SLUG } from "@/config/modules";

/** The ModuleAccess key under which a paid media unlock is stored. */
export function mediaAccessKey(mediaId: string): string {
  return `media:${mediaId}`;
}

/** Minimal shape we need to gate a piece of media. */
export interface GatableMedia {
  id: string;
  isFree: boolean;
}

/**
 * Can this parent play this media item?
 *
 * @param parentId the owning parent's id (access is per-parent, like modules)
 * @param media    the media's id + isFree flag
 */
export async function canAccessMedia(
  parentId: string,
  media: GatableMedia
): Promise<boolean> {
  // Free content always plays.
  if (media.isFree) return true;

  // Otherwise require an unlock for this specific media, or the "ALL" bundle.
  const access = await prisma.moduleAccess.findFirst({
    where: {
      parentId,
      module: { in: [mediaAccessKey(media.id), BUNDLE_SLUG] },
    },
    select: { id: true },
  });

  return access !== null;
}
