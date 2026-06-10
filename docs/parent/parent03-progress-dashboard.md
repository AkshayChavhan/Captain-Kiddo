# 📊 parent03-progress-dashboard

> **Phase D · Ticket D3** — Show **per-child progress**: modules completed, tiers
> reached, and stars earned — read from the `Progress` rows.

---

## 🎯 Goal

Give parents an at-a-glance view of how each child is doing: how many levels they've
finished, which modules are complete, and their star total.

---

## 🧮 Rolling up the data — [`src/lib/progressSummary.ts`](../../src/lib/progressSummary.ts)

A server-only function turns raw `Progress` rows into a dashboard-friendly shape:

```ts
getChildProgressSummary(childId) -> {
  totalStars, modulesStarted, modulesCompleted, tiersCompleted, modules[]
}
```

### How it works

1. **Two queries in parallel** (`Promise.all`): the child's `totalStars`, and all
   their **completed** progress rows (`isCompleted: true`).

2. **Group completed tiers by module** into a `Map<slug, Set<Difficulty>>`:

```ts
for (const row of completedRows) {
  byModule.get(row.module) ?? new Set() ... .add(row.difficulty);
}
```

3. **Walk the module registry** (not the DB rows) so every module appears — even ones
   the child hasn't started — and list its completed tiers **in canonical order**:

```ts
const completedTiers = tierOrder.filter((t) => done.has(t)); // EASY->MEDIUM->HARD
```

4. **Derive the headline counts**: modules started (≥1 tier), modules fully completed
   (all 3 tiers), total tiers completed.

> 🧠 **Why iterate the registry, not the rows?** If we only listed modules with
> progress, a brand-new child would show an empty dashboard. Iterating `MODULES`
> guarantees a complete, stable view (every module, with empty progress shown as
> empty) — the UI doesn't have to guess what's missing.

> 🧠 **`server-only`** again — this reads the DB, so it must never reach the client.

---

## 🎨 The display — [`ChildProgress.tsx`](../../src/components/parent/ChildProgress.tsx)

A **pure presentational** component (no state, no `"use client"`) → it renders on the
server. It shows:

- A header: avatar, name, and headline stats (`⭐ 12 · 2 done · 5 levels`).
- A **per-module tier breakdown** using three pips — filled green if that tier is
  completed, grey if not:

```tsx
{TIERS.map((t) => {
  const done = m.completedTiers.includes(t.difficulty);
  return <span className={done ? "bg-kiddo-green" : "bg-gray-200"} title={t.label} />;
})}
```

So a parent sees, per module, something like `🔢 Numbers  ● ● ○` (Easy + Medium done,
Hard not yet) — readable in a glance.

---

## 🖥️ Wiring into the dashboard — [`/parent/page.tsx`](../../src/app/parent/page.tsx)

After loading the children, we fetch each one's summary **in parallel** and render a
Progress section:

```tsx
const progress = await Promise.all(
  children.map(async (c) => ({ child: c, summary: await getChildProgressSummary(c.id) }))
);
```

```tsx
{progress.map(({ child, summary }) => (
  <ChildProgress name={child.name} avatar={child.avatar ?? DEFAULT_AVATAR} summary={summary} />
))}
```

> 🧠 **`Promise.all` for parallel fetches:** each child's summary is independent, so
> we fetch them all at once instead of awaiting one-by-one. Less waiting, same result.

---

## 🔗 Closing the loop with Phase B

Remember `numbers08` saved progress (`isCompleted` + stars) when a quiz finished. This
dashboard is the **other end** of that: it *reads* those same `Progress` rows and
`Child.totalStars`. The learning side writes; the parent side reads. Same data, two
views.

> (As noted before, saving is dormant until an active child is selected — so until
> auth/child-selection lands, these summaries show zeros. The pipeline is correct;
> it just needs real data flowing in.)

---

## 🧪 Running it (after `npm install` + progress data)

```bash
npm run dev
# /parent -> unlock -> Progress section shows each child's stars, completed
#   modules, and per-module tier pips
```

---

## ✅ Result

Parents get a clear per-child progress view — stars, completed modules, and a
tier-by-tier breakdown — rolled up from the `Progress` rows the learning modules
write.

---

## ➡️ Next ticket

**D4 · `parent04-weak-areas`** — derive each child's "weak areas" from their
`TestResult` history (attempts vs score), so parents see what to help with.
