import { NextResponse } from "next/server";
import { Difficulty } from "@prisma/client";
import { getModule } from "@/config/modules";
import { saveProgress } from "@/lib/progress";

/**
 * POST /api/progress
 *
 * Saves a child's progress for a tier (upsert + award stars). Called when a quiz
 * session finishes. All writes happen SERVER-SIDE here; the client only sends the
 * facts of what happened.
 *
 * Body: { childId, module, difficulty, starsEarned, isCompleted }
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { childId, module, difficulty, starsEarned, isCompleted } =
    (body ?? {}) as Record<string, unknown>;

  // --- Validate every field (never trust the client) ---
  if (typeof childId !== "string" || !childId) {
    return NextResponse.json({ error: "childId required" }, { status: 400 });
  }
  if (typeof module !== "string" || !getModule(module)) {
    return NextResponse.json({ error: "unknown module" }, { status: 400 });
  }
  if (
    typeof difficulty !== "string" ||
    !(difficulty in Difficulty)
  ) {
    return NextResponse.json({ error: "invalid difficulty" }, { status: 400 });
  }
  if (typeof starsEarned !== "number" || starsEarned < 0) {
    return NextResponse.json({ error: "invalid starsEarned" }, { status: 400 });
  }
  if (typeof isCompleted !== "boolean") {
    return NextResponse.json({ error: "invalid isCompleted" }, { status: 400 });
  }

  const progress = await saveProgress({
    childId,
    module,
    difficulty: difficulty as Difficulty,
    starsEarned,
    isCompleted,
  });

  return NextResponse.json({ progress });
}
