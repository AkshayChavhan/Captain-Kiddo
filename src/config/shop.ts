import { UnlockType } from "@prisma/client";

/**
 * Reward-shop catalog.
 *
 * Items kids buy with STARS (not money). Each entry is one cosmetic the child can
 * unlock (avatar / sticker / theme). Kept in config so adding an item is a
 * one-line change. `itemKey` is stored in the Unlock row and must be stable.
 */
export interface ShopItem {
  type: UnlockType;
  /** Stable id stored in Unlock.itemKey. NEVER change once live. */
  itemKey: string;
  /** Kid-facing label. */
  label: string;
  /** A preview emoji. */
  emoji: string;
  /** Cost in STARS (integer). */
  starCost: number;
}

export const SHOP_ITEMS: ShopItem[] = [
  // Avatars
  { type: UnlockType.AVATAR, itemKey: "astronaut", label: "Astronaut", emoji: "🧑‍🚀", starCost: 20 },
  { type: UnlockType.AVATAR, itemKey: "dragon", label: "Dragon", emoji: "🐉", starCost: 30 },
  { type: UnlockType.AVATAR, itemKey: "robot", label: "Robot", emoji: "🤖", starCost: 25 },
  // Stickers
  { type: UnlockType.STICKER, itemKey: "rainbow", label: "Rainbow", emoji: "🌈", starCost: 10 },
  { type: UnlockType.STICKER, itemKey: "star", label: "Gold Star", emoji: "🌟", starCost: 10 },
  // Themes
  { type: UnlockType.THEME, itemKey: "space", label: "Space Theme", emoji: "🚀", starCost: 50 },
  { type: UnlockType.THEME, itemKey: "ocean", label: "Ocean Theme", emoji: "🌊", starCost: 50 },
];

/** Find a shop item by type + key (for server-side cost lookup). */
export function getShopItem(
  type: UnlockType,
  itemKey: string
): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.type === type && i.itemKey === itemKey);
}
