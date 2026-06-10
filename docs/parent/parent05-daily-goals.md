# 🎯 parent05-daily-goals

> **Phase D · Ticket D5** — Let parents set a **daily learning goal** per child
> (levels/day) and show today's progress toward it. Completes the parent *dashboard*
> (payments come next).

---

## 🎯 Goal

A parent can say "I'd like Maya to finish 3 levels a day," and the dashboard shows how
many she's done today vs that goal.

---

## 🗄️ A new schema field — `Child.dailyGoal`

```prisma
// Daily learning goal: number of LEVELS (tier completions) per day. 0 = no goal.
dailyGoal Int @default(0)
```

We measure the goal in **levels** (tier completions) — a concrete, countable unit the
app already tracks (a `Progress` row flipping to `isCompleted`). An `Int`, default `0`
meaning "no goal set".

> ⚠️ **Schema changed:** after pulling this, run `npm run db:push` (sync the field to
> MongoDB) and `npm run db:generate` (regenerate the Prisma client) so the new field
> is known. (We use `db push`, not migrate — the MongoDB workflow.)

---

## ⚙️ Setting the goal — server action [`setDailyGoal`](../../src/app/parent/children/actions.ts)

```ts
export async function setDailyGoal(childId, goal) {
  // gate check (PIN + active parent)...
  if (!Number.isInteger(goal) || goal < 0 || goal > 20) return { ok: false, ... };
  const res = await prisma.child.updateMany({
    where: { id: childId, parentId: guard.parentId },   // scoped to THIS parent
    data: { dailyGoal: goal },
  });
  ...
}
```

Same safety pattern as the other child actions:
- **Gate-checked** (PIN entered + active parent) server-side.
- **Bounds** the goal (0–20).
- **Scoped** with `updateMany({ where: { id, parentId } })` so a parent can only
  update *their own* child (authorization, not just authentication).

---

## 📅 Today's progress — [`src/lib/dailyGoal.ts`](../../src/lib/dailyGoal.ts)

```ts
export async function getTodayLevelsCompleted(childId) {
  const startOfToday = new Date(year, month, date);   // midnight, server local
  return prisma.progress.count({
    where: { childId, isCompleted: true, completedAt: { gte: startOfToday } },
  });
}
```

We count `Progress` rows whose `completedAt` is **today**. This works because
`numbers08` sets `completedAt` when a tier is finished — so "levels completed today"
falls right out of data we already store.

> 🧠 **`Date` here is fine.** Some environments forbid `Date.now()` in *scheduled*
> code (it breaks resumability), but this runs at **request time** on the server when
> the dashboard renders — a normal place to read the current date. "Today" uses the
> server's local midnight.

---

## 🎨 The UI — [`DailyGoal.tsx`](../../src/components/parent/DailyGoal.tsx)

A small client component with a **stepper** (− / number / +) and today's tally:

```tsx
{goal > 0
  ? <p>{completedToday} / {goal} levels today {met ? "✅" : ""}</p>
  : <p>No goal set</p>}
```

- Tapping +/− calls `setDailyGoal` (clamped 0–20) and `router.refresh()`es.
- When `completedToday >= goal` (and a goal is set), it shows ✅ — a little win for
  the parent to see.

It renders right under each child's `ChildProgress` card, so a child's progress and
goal sit together.

---

## 🖥️ Wiring — [`/parent/page.tsx`](../../src/app/parent/page.tsx)

`dailyGoal` is added to the child `select`, and `getTodayLevelsCompleted` joins the
**parallel** per-child fetch:

```tsx
const [summary, weakAreas, completedToday] = await Promise.all([
  getChildProgressSummary(c.id),
  getChildWeakAreas(c.id),
  getTodayLevelsCompleted(c.id),
]);
```

Each child's three independent reads run at once; all children run at once. (Same
parallel pattern, now three queries deep.)

---

## 🧪 Running it (after `npm install` + `db push`)

```bash
npm run db:push && npm run db:generate   # the new dailyGoal field
npm run dev
# /parent -> unlock -> set a child's goal with +/- ; finishing levels today
#   increments "X / goal levels today", ✅ when met
```

---

## ✅ Result — parent dashboard complete

Parents can now set per-child daily goals and watch today's progress toward them. With
D1–D5 done, the **dashboard** is finished: PIN gate, child profiles, progress,
weak areas, and goals.

---

## ➡️ Next ticket

**D6 · `pay01-create-order-api`** — the Razorpay payment flow begins: a server API
that creates a Razorpay order and a PENDING `Payment` row (amount 500 paise). ⚠️ The
next three tickets handle **real money** — server-side order creation and HMAC
verification.
