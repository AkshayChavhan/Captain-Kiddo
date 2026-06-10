import { getPaidModules, BUNDLE_SLUG, BUNDLE_PRICE_IN_PAISE } from "@/config/modules";
import { BuyButton } from "@/components/parent/BuyButton";

/**
 * UnlockModules — the parent's "buy modules" section (server component).
 *
 * Lists paid modules the parent hasn't unlocked yet (each a ₹5 BuyButton) plus the
 * "unlock everything" bundle. The set of already-unlocked slugs is computed on the
 * server and passed in, so we only show what's actually still buyable.
 */
export function UnlockModules({
  unlockedSlugs,
  hasBundle,
}: Readonly<{
  unlockedSlugs: string[];
  hasBundle: boolean;
}>) {
  // If the parent owns the "ALL" bundle, everything is unlocked — nothing to sell.
  if (hasBundle) {
    return (
      <section className="flex w-full max-w-md flex-col gap-2">
        <h2 className="font-kiddo text-2xl font-bold">Modules</h2>
        <p className="text-gray-500">All modules unlocked! 🎉</p>
      </section>
    );
  }

  const unlocked = new Set(unlockedSlugs);
  const buyable = getPaidModules().filter((m) => !unlocked.has(m.slug));

  if (buyable.length === 0) {
    return (
      <section className="flex w-full max-w-md flex-col gap-2">
        <h2 className="font-kiddo text-2xl font-bold">Modules</h2>
        <p className="text-gray-500">All modules unlocked! 🎉</p>
      </section>
    );
  }

  return (
    <section className="flex w-full max-w-md flex-col gap-3">
      <h2 className="font-kiddo text-2xl font-bold">Unlock modules</h2>

      {/* The bundle — best value, shown first. */}
      <BuyButton
        target={BUNDLE_SLUG}
        label="Unlock ALL modules"
        priceInPaise={BUNDLE_PRICE_IN_PAISE}
        accentClass="bg-kiddo-purple"
      />

      {/* Individual ₹5 modules. */}
      {buyable.map((m) => (
        <BuyButton
          key={m.slug}
          target={m.slug}
          label={`${m.emoji} ${m.title}`}
          priceInPaise={m.priceInPaise}
        />
      ))}
    </section>
  );
}
