import {
  getModule,
  BUNDLE_SLUG,
  BUNDLE_PRICE_IN_PAISE,
} from "@/config/modules";

/**
 * Server-side pricing resolution.
 *
 * Given what the parent wants to buy (a module slug or the "ALL" bundle), return
 * the authoritative price IN PAISE. The amount is ALWAYS derived here on the
 * server from config — never taken from the client (which could lie about price).
 */
export interface ResolvedPurchase {
  /** What we're charging for: a module slug or "ALL". */
  target: string;
  amountInPaise: number;
  label: string;
}

/** Resolve a purchase target to its price, or null if invalid / not purchasable. */
export function resolvePurchase(target: string): ResolvedPurchase | null {
  // The "unlock everything" bundle.
  if (target === BUNDLE_SLUG) {
    return {
      target: BUNDLE_SLUG,
      amountInPaise: BUNDLE_PRICE_IN_PAISE,
      label: "Unlock all modules",
    };
  }

  // A single paid module.
  const module = getModule(target);
  if (!module) return null; // unknown slug
  if (module.isFree) return null; // free modules aren't purchasable
  if (module.priceInPaise <= 0) return null; // guard against bad config

  return {
    target: module.slug,
    amountInPaise: module.priceInPaise,
    label: `Unlock ${module.title}`,
  };
}
