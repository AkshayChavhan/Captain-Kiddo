import { notFound } from "next/navigation";
import Link from "next/link";
import { getModule } from "@/config/modules";
import { TIERS } from "@/config/tiers";
import { unlockedDifficulties } from "@/lib/access";
import { TierCard } from "@/components/learning/TierCard";
import { Difficulty } from "@prisma/client";
import { getActiveChildId } from "@/lib/activeChild";

/**
 * Module home screen — e.g. /learn/numbers
 *
 * Shows the module's three difficulty tiers. Tiers the child hasn't unlocked
 * yet appear locked (🔒). This is the reusable template every module uses; only
 * the [module] slug in the URL changes.
 *
 * Server component: it reads the child's unlocked tiers from the database before
 * rendering, so the locks are always accurate.
 */
export default async function ModuleHomePage({
  params,
}: Readonly<{
  params: { module: string };
}>) {
  const moduleSlug = params.module;
  const module = getModule(moduleSlug);

  // Unknown module slug -> 404.
  if (!module) notFound();

  // Which child is playing right now. (Active-child selection is wired up in the
  // parent dashboard later; this helper centralizes how we get it.)
  const childId = await getActiveChildId();

  // Work out which tiers this child has unlocked. With no active child yet, only
  // EASY is available (a sensible default for a fresh start).
  const unlocked: Difficulty[] = childId
    ? await unlockedDifficulties(childId, moduleSlug)
    : [Difficulty.EASY];

  const unlockedSet = new Set(unlocked);

  return (
    <main
      className="flex min-h-screen flex-col items-center gap-8 p-6"
      style={{ backgroundColor: `${module.color}22` }} // tint bg with module color
    >
      {/* Top bar: a big, always-visible way back to the home screen. */}
      <div className="flex w-full max-w-md items-center">
        <Link
          href="/"
          aria-label="Go to home screen"
          className="kiddo-btn bg-kiddo-green px-5 py-2 text-lg"
        >
          🏠 Home
        </Link>
      </div>

      {/* Module title */}
      <header className="flex flex-col items-center gap-2 text-center">
        <div className="text-7xl">{module.emoji}</div>
        <h1 className="font-kiddo text-4xl font-bold">{module.title}</h1>
        <p className="text-lg text-gray-600">Pick a level to start!</p>
      </header>

      {/* The three tiers */}
      <section className="grid w-full max-w-md grid-cols-1 gap-5">
        {TIERS.map((tier) => (
          <TierCard
            key={tier.difficulty}
            moduleSlug={moduleSlug}
            tier={tier}
            locked={!unlockedSet.has(tier.difficulty)}
          />
        ))}

        {/* Numbers also has a "learn to write" tracing activity. */}
        {moduleSlug === "numbers" && (
          <Link href="/learn/numbers/write" className="block">
            <div className="kiddo-card flex min-h-tap flex-col items-center justify-center gap-2 bg-kiddo-pink text-center text-white">
              <div className="text-5xl">✍️</div>
              <div className="text-2xl font-bold">Write Numbers</div>
              <div className="text-lg opacity-90">Trace 0–9 with your finger</div>
            </div>
          </Link>
        )}
      </section>
    </main>
  );
}
