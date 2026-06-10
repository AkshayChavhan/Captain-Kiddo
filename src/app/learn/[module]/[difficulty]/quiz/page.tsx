import { notFound, redirect } from "next/navigation";
import { Difficulty } from "@prisma/client";
import { getModule } from "@/config/modules";
import { getTier } from "@/config/tiers";
import { getActiveChildId } from "@/lib/activeChild";
import { getActiveParentId } from "@/lib/activeParent";
import { QuizRunner } from "./QuizRunner";

/**
 * Quiz route — e.g. /learn/numbers/easy/quiz
 *
 * Validates the module + difficulty (same pattern as the learning view), reads
 * the active child, then hands off to the interactive <QuizRunner>. Server
 * component so bad URLs 404 before any client code loads.
 */
export default async function QuizPage({
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

  // Quizzes are past the free taste — guests must log in.
  if (!(await getActiveParentId())) {
    redirect(
      `/login?next=/learn/${params.module}/${params.difficulty}/quiz`
    );
  }

  const childId = await getActiveChildId();

  return (
    <QuizRunner
      moduleSlug={params.module}
      tier={getTier(difficulty)}
      childId={childId}
    />
  );
}
