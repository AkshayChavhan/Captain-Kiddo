/**
 * Module Registry — the single source of truth for every LEARNING MODULE.
 *
 * WHY THIS EXISTS:
 * Adding a new learning module (Shapes, Fruits, Vehicles…) should be a ONE-LINE
 * change: add an entry to the array below. Everything else — the home grid, the
 * paywall, access checks, progress — reads from here. No scattered edits.
 *
 * RULES BAKED IN:
 *  - `slug` matches the `module` string stored in Prisma (Progress, ModuleAccess…).
 *  - Money is ALWAYS integer paise (₹5 = 500). Free modules use 0.
 *  - Free starter modules: Numbers, Alphabets, Colors. Everything else costs ₹5.
 */

/** One learning module's metadata. */
export interface ModuleConfig {
  /** Stable id used in the DB and URLs. NEVER change once live. e.g. "numbers". */
  slug: string;
  /** Kid-facing name shown in the UI. e.g. "Numbers". */
  title: string;
  /** A big friendly icon for the module card. */
  emoji: string;
  /** Tailwind-friendly theme color (hex) for the module's card/screens. */
  color: string;
  /** Free modules are playable without payment. */
  isFree: boolean;
  /** Price in PAISE (integer). 0 for free modules; 500 = ₹5 for paid ones. */
  priceInPaise: number;
}

/** The price of any single paid module: ₹5 = 500 paise. */
export const PAID_MODULE_PRICE_IN_PAISE = 500;

/** The "unlock everything" bundle price: ₹39 = 3900 paise. */
export const BUNDLE_PRICE_IN_PAISE = 3900;

/** The special slug representing the ₹39 "unlock all modules" bundle. */
export const BUNDLE_SLUG = "ALL";

/**
 * THE REGISTRY.
 * To add a module: copy a line, change the values. That's it.
 */
export const MODULES: ModuleConfig[] = [
  // --- FREE starter modules ---------------------------------------------------
  { slug: "numbers",   title: "Numbers",   emoji: "🔢", color: "#FF6B6B", isFree: true,  priceInPaise: 0 },
  { slug: "alphabets", title: "Alphabets", emoji: "🔤", color: "#4ECDC4", isFree: true,  priceInPaise: 0 },
  { slug: "colors",    title: "Colors",    emoji: "🎨", color: "#FFD93D", isFree: true,  priceInPaise: 0 },

  // --- PAID modules (₹5 each) -------------------------------------------------
  { slug: "animals",   title: "Animals",   emoji: "🐾", color: "#6C5CE7", isFree: false, priceInPaise: PAID_MODULE_PRICE_IN_PAISE },
  { slug: "shapes",    title: "Shapes",    emoji: "🔺", color: "#00B894", isFree: false, priceInPaise: PAID_MODULE_PRICE_IN_PAISE },
  { slug: "fruits",    title: "Fruits",    emoji: "🍎", color: "#E17055", isFree: false, priceInPaise: PAID_MODULE_PRICE_IN_PAISE },
];

// ---------------------------------------------------------------------------
// Convenience lookups (so other files don't re-scan the array each time).
// ---------------------------------------------------------------------------

/** Quick map from slug -> module, for O(1) lookups. */
const MODULE_BY_SLUG: Record<string, ModuleConfig> = Object.fromEntries(
  MODULES.map((m) => [m.slug, m])
);

/** Get a module by its slug, or undefined if it doesn't exist. */
export function getModule(slug: string): ModuleConfig | undefined {
  return MODULE_BY_SLUG[slug];
}

/** All free modules. */
export function getFreeModules(): ModuleConfig[] {
  return MODULES.filter((m) => m.isFree);
}

/** All paid modules. */
export function getPaidModules(): ModuleConfig[] {
  return MODULES.filter((m) => !m.isFree);
}
