import { redirect } from "next/navigation";
import { isParentAreaUnlocked } from "@/lib/parentSession";
import { getActiveParentId } from "@/lib/activeParent";
import { prisma } from "@/lib/prisma";
import { getChildProgressSummary } from "@/lib/progressSummary";
import { getChildWeakAreas } from "@/lib/weakAreas";
import { getTodayLevelsCompleted } from "@/lib/dailyGoal";
import { BUNDLE_SLUG } from "@/config/modules";
import { DEFAULT_AVATAR } from "@/config/avatars";
import { PinPad } from "@/components/parent/PinPad";
import { UnlockModules } from "@/components/parent/UnlockModules";
import { RewardShop } from "@/components/parent/RewardShop";
import {
  ChildProfiles,
  type ChildSummary,
} from "@/components/parent/ChildProfiles";
import { ChildProgress } from "@/components/parent/ChildProgress";
import { DailyGoal } from "@/components/parent/DailyGoal";

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
  // The parent area requires a logged-in account first (login = the Parent).
  // The PIN gate below is an extra kid-lock on top of being logged in.
  if (!(await getActiveParentId())) {
    redirect("/login?next=/parent");
  }

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
        select: {
          id: true,
          name: true,
          age: true,
          avatar: true,
          totalStars: true,
          dailyGoal: true,
        },
        orderBy: { createdAt: "asc" },
      })
    : [];

  // Per-child progress summaries + weak areas + today's goal progress (parallel).
  const progress = await Promise.all(
    children.map(async (c) => {
      const [summary, weakAreas, completedToday] = await Promise.all([
        getChildProgressSummary(c.id),
        getChildWeakAreas(c.id),
        getTodayLevelsCompleted(c.id),
      ]);
      return { child: c, summary, weakAreas, completedToday };
    })
  );

  // What modules has this parent already unlocked? (For the buy section.)
  const access = parentId
    ? await prisma.moduleAccess.findMany({
        where: { parentId },
        select: { module: true },
      })
    : [];
  const unlockedSlugs = access.map((a) => a.module);
  const hasBundle = unlockedSlugs.includes(BUNDLE_SLUG);

  // Reward-shop data: each child's star balance + which items they already own.
  const childIds = children.map((c) => c.id);
  const unlocks = childIds.length
    ? await prisma.unlock.findMany({
        where: { childId: { in: childIds } },
        select: { childId: true, type: true, itemKey: true },
      })
    : [];
  const ownedByChild: Record<string, string[]> = {};
  for (const u of unlocks) {
    const list = ownedByChild[u.childId] ?? [];
    list.push(`${u.type}:${u.itemKey}`);
    ownedByChild[u.childId] = list;
  }
  const shopChildren = children.map((c) => ({
    id: c.id,
    name: c.name,
    totalStars: c.totalStars,
  }));

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
          {progress.map(({ child, summary, weakAreas, completedToday }) => (
            <div key={child.id} className="flex flex-col gap-2">
              <ChildProgress
                name={child.name}
                avatar={child.avatar ?? DEFAULT_AVATAR}
                summary={summary}
                weakAreas={weakAreas}
              />
              <DailyGoal
                childId={child.id}
                goal={child.dailyGoal}
                completedToday={completedToday}
              />
            </div>
          ))}
        </section>
      )}

      {/* Buy / unlock modules (Razorpay checkout) */}
      <UnlockModules unlockedSlugs={unlockedSlugs} hasBundle={hasBundle} />

      {/* Reward shop — kids spend earned stars on cosmetics */}
      <RewardShop childrenList={shopChildren} ownedByChild={ownedByChild} />
    </main>
  );
}
