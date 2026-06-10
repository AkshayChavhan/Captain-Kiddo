import { NextResponse } from "next/server";
import { Difficulty } from "@prisma/client";
import { getModule } from "@/config/modules";
import { saveTestResult } from "@/lib/progress";

/**
 * POST /api/test-results
 *
 * Records one quiz attempt (score out of total). We keep every attempt so the
 * parent dashboard can later derive weak areas. Server-side validation only.
 *
 * Body: { childId, module, difficulty, score, total }
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { childId, module, difficulty, score, total } =
    (body ?? {}) as Record<string, unknown>;

  if (typeof childId !== "string" || !childId) {
    return NextResponse.json({ error: "childId required" }, { status: 400 });
  }
  if (typeof module !== "string" || !getModule(module)) {
    return NextResponse.json({ error: "unknown module" }, { status: 400 });
  }
  if (typeof difficulty !== "string" || !(difficulty in Difficulty)) {
    return NextResponse.json({ error: "invalid difficulty" }, { status: 400 });
  }
  if (typeof score !== "number" || score < 0) {
    return NextResponse.json({ error: "invalid score" }, { status: 400 });
  }
  if (typeof total !== "number" || total <= 0 || score > total) {
    return NextResponse.json({ error: "invalid total" }, { status: 400 });
  }

  const result = await saveTestResult({
    childId,
    module,
    difficulty: difficulty as Difficulty,
    score,
    total,
  });

  return NextResponse.json({ result });
}
