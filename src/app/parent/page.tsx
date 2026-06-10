import { redirect } from "next/navigation";
import { getActiveParentId } from "@/lib/activeParent";
import { prisma } from "@/lib/prisma";
import { getChildProgressSummary } from "@/lib/progressSummary";
import { getChildWeakAreas } from "@/lib/weakAreas";
import { getTodayLevelsCompleted } from "@/lib/dailyGoal";
import { BUNDLE_SLUG } from "@/config/modules";
import { DEFAULT_AVATAR } from "@/config/avatars";
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
 * The kid-resistance is the deliberate SLIDE gesture on the home screen
 * (SlideToParent) — a toddler poking the screen can't open it. Once a parent
 * slides in, they get the dashboard directly (no PIN). The only requirement is
 * being logged in (login = the Parent account); guests are sent to /login.
 *
 * Server component so the login check + data fetch happen on the server.
 */
export default async function ParentPage() {
  const parentId = await getActiveParentId();
  if (!parentId) {
    redirect("/login?next=/parent");
  }
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
