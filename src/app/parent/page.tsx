import { isParentAreaUnlocked } from "@/lib/parentSession";
import { getActiveParentId } from "@/lib/activeParent";
import { prisma } from "@/lib/prisma";
import { getChildProgressSummary } from "@/lib/progressSummary";
import { DEFAULT_AVATAR } from "@/config/avatars";
import { PinPad } from "@/components/parent/PinPad";
import {
  ChildProfiles,
  type ChildSummary,
} from "@/components/parent/ChildProfiles";
import { ChildProgress } from "@/components/parent/ChildProgress";

/**
 * Parent area entry — /parent
 *
 * If the area is locked, show the PIN pad. Once unlocked (correct PIN this
 * session), show the dashboard: child profiles now, with progress/goals/payments
 * added in the following Phase D tickets.
 *
 * Server component so the lock check + data fetch happen on the server — a kid
 * can't bypass the gate by tampering with client state.
 */
export default async function ParentPage() {
  if (!isParentAreaUnlocked()) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <PinPad />
      </main>
    );
  }

  // Unlocked: load this parent's children.
  const parentId = await getActiveParentId();
  const children: ChildSummary[] = parentId
    ? await prisma.child.findMany({
        where: { parentId },
        select: { id: true, name: true, age: true, avatar: true, totalStars: true },
        orderBy: { createdAt: "asc" },
      })
    : [];

  // Per-child progress summaries (fetched in parallel).
  const progress = await Promise.all(
    children.map(async (c) => ({
      child: c,
      summary: await getChildProgressSummary(c.id),
    }))
  );

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-6">
      <header className="pt-6 text-center">
        <h1 className="font-kiddo text-3xl font-bold">Parent Dashboard</h1>
        <p className="text-gray-600">Welcome back! 👋</p>
      </header>

      <ChildProfiles kids={children} />

      {/* Per-child progress */}
      {progress.length > 0 && (
        <section className="flex w-full max-w-md flex-col gap-4">
          <h2 className="font-kiddo text-2xl font-bold">Progress</h2>
          {progress.map(({ child, summary }) => (
            <ChildProgress
              key={child.id}
              name={child.name}
              avatar={child.avatar ?? DEFAULT_AVATAR}
              summary={summary}
            />
          ))}
        </section>
      )}

      {/* Weak areas, daily goals, payments, and the reward shop come in
          parent04–parent05, pay01–pay03, shop01. */}
    </main>
  );
}
