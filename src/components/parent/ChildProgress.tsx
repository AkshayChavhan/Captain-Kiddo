import { TIERS } from "@/config/tiers";
import type { ChildProgressSummary } from "@/lib/progressSummary";

/**
 * ChildProgress — presentational summary of one child's learning progress.
 *
 * Pure (no state, no client interactivity) so it renders on the server. Shows
 * top-line counts plus a per-module tier breakdown (filled vs empty pips).
 */
export function ChildProgress({
  name,
  avatar,
  summary,
}: Readonly<{
  name: string;
  avatar: string;
  summary: ChildProgressSummary;
}>) {
  return (
    <div className="kiddo-card flex flex-col gap-4 bg-white">
      {/* Header: who + headline stats */}
      <div className="flex items-center gap-3">
        <span className="text-4xl">{avatar}</span>
        <div>
          <p className="text-lg font-bold">{name}</p>
          <p className="text-sm text-gray-500">
            ⭐ {summary.totalStars} · {summary.modulesCompleted} done ·{" "}
            {summary.tiersCompleted} levels
          </p>
        </div>
      </div>

      {/* Per-module tier breakdown */}
      <div className="flex flex-col gap-2">
        {summary.modules.map((m) => (
          <div key={m.slug} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-bold">
              <span className="text-xl">{m.emoji}</span>
              {m.title}
            </span>
            {/* One pip per tier; filled if that tier is completed. */}
            <span className="flex gap-1">
              {TIERS.map((t) => {
                const done = m.completedTiers.includes(t.difficulty);
                return (
                  <span
                    key={t.difficulty}
                    title={`${t.label}${done ? " ✓" : ""}`}
                    className={`h-3 w-3 rounded-full ${
                      done ? "bg-kiddo-green" : "bg-gray-200"
                    }`}
                  />
                );
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
