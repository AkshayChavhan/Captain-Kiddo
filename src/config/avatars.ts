/**
 * Avatar presets — the emoji a child can pick as their profile picture.
 *
 * Stored as the emoji string in Child.avatar. Kept in config so adding an avatar
 * is a one-line change (and the reward shop can later unlock more of these).
 */
export const AVATARS = [
  "🦄", "🐯", "🐸", "🐧", "🦊", "🐼", "🐵", "🦁", "🐰", "🐨",
] as const;

/** The default avatar if a child hasn't picked one. */
export const DEFAULT_AVATAR = "🐻";
