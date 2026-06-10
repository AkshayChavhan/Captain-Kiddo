import { notFound } from "next/navigation";
import { Difficulty } from "@prisma/client";
import { getModule } from "@/config/modules";
import { getTier } from "@/config/tiers";
import { QuizRunner } from "./QuizRunner";

/**
 * Quiz route — e.g. /learn/numbers/easy/quiz
 *
 * Validates the module + difficulty (same pattern as the learning view), then
 * hands off to the interactive <QuizRunner>. Server component so bad URLs 404
 * before any client code loads.
 */
export default function QuizPage({
  params,
}: Readonly<{
  params: { module: string; difficulty: string };
}>) {
  const module = getModule(params.module);
  if (!module) notFound();

  const difficulty = (Difficulty as Record<string, Difficulty>)[
    params.difficulty.toUpperCase()
  ];
  if (!difficulty) notFound();

  return <QuizRunner moduleSlug={params.module} tier={getTier(difficulty)} />;
}
