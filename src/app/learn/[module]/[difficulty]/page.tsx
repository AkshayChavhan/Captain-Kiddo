import { notFound } from "next/navigation";
import { Difficulty } from "@prisma/client";
import { getModule } from "@/config/modules";
import { getTier } from "@/config/tiers";
import { getActiveParentId } from "@/lib/activeParent";
import { LearningView } from "./LearningView";

/**
 * Learning view route — e.g. /learn/numbers/easy
 *
 * Validates the module + difficulty from the URL, then hands off to the
 * interactive <LearningView>. Server component so we can 404 cleanly on bad URLs
 * before any client code loads.
 */
export default async function LearningPage({
  params,
}: Readonly<{
  params: { module: string; difficulty: string };
}>) {
  const module = getModule(params.module);
  if (!module) notFound();

  // Map the URL segment ("easy") to the Difficulty enum (EASY).
  const difficultyKey = params.difficulty.toUpperCase();
  const difficulty = (Difficulty as Record<string, Difficulty>)[difficultyKey];
  if (!difficulty) notFound();

  const tier = getTier(difficulty);
  const loggedIn = Boolean(await getActiveParentId());

  return (
    <LearningView moduleSlug={params.module} tier={tier} loggedIn={loggedIn} />
  );
}
