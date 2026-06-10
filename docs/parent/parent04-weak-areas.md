# 💪 parent04-weak-areas

> **Phase D · Ticket D4** — Derive each child's **weak areas** from their
> `TestResult` history (attempts vs score), so parents see what to help with.

---

## 🎯 Goal

Turn raw quiz history into a useful insight: *"Numbers (Hard) — 45% over 3 tries."* A
parent shouldn't read tables of scores; they should see **what to practice**.

---

## 🧠 The analysis — [`src/lib/weakAreas.ts`](../../src/lib/weakAreas.ts)

This is why we kept **every** `TestResult` attempt back in `schema02` (instead of just
the latest). Now we mine that history.

### The algorithm

```ts
for (const r of results) {
  const pct = (r.score / r.total) * 100;     // this attempt's score %
  group[module:difficulty].sumPercent += pct;
  group[module:difficulty].attempts   += 1;
}
// average each group; flag the low ones
```

1. **Group** every attempt by `module:difficulty` (e.g. `numbers:HARD`).
2. **Average** the score percentage across that group's attempts.
3. **Flag as weak** if the average is below a threshold — *and* there are enough
   attempts to trust it.

### Two tuning knobs

```ts
const WEAK_THRESHOLD = 60;   // below 60% average -> weak
const MIN_ATTEMPTS   = 2;    // need >=2 attempts before judging
```

- **`WEAK_THRESHOLD`** — what counts as "struggling".
- **`MIN_ATTEMPTS`** — avoids over-reacting to a single bad try. One 40% could be a
  fluke; a *pattern* of low scores is a real weak area.

> 🧠 **Why a minimum sample size?** Judging from one attempt is noisy — a kid might
> have been distracted. Requiring ≥2 attempts makes the signal trustworthy. This is
> a small but important bit of "don't cry wolf" product thinking.

### Output

A sorted list (**weakest first**) of `{ moduleTitle, tierLabel, averagePercent,
attempts }`. Score% is computed from the stored integer `score`/`total` — we never
stored a float (the money/integer discipline applies to scores too).

> 🧠 **`server-only`** — reads the DB; never bundled to the client.

---

## 🎨 Showing it — [`ChildProgress.tsx`](../../src/components/parent/ChildProgress.tsx)

Weak areas slot into the existing per-child card (it already shows progress), in a
soft red "needs practice" box — only when there are any:

```tsx
{weakAreas.length > 0 && (
  <div className="bg-kiddo-red/10 ...">
    <p>💪 Needs practice</p>
    {weakAreas.map((w) => (
      <p>{w.moduleTitle} ({w.tierLabel}) — {w.averagePercent}% over {w.attempts} tries</p>
    ))}
  </div>
)}
```

No weak areas → nothing shown (we don't nag when a child is doing fine).

---

## 🖥️ Fetching — [`/parent/page.tsx`](../../src/app/parent/page.tsx)

Per child we now fetch the summary **and** weak areas together, and both children
are processed in parallel:

```tsx
const progress = await Promise.all(children.map(async (c) => {
  const [summary, weakAreas] = await Promise.all([
    getChildProgressSummary(c.id),
    getChildWeakAreas(c.id),
  ]);
  return { child: c, summary, weakAreas };
}));
```

> 🧠 **Nested `Promise.all`:** the inner one fetches a single child's two
> independent queries at once; the outer one does that for all children at once.
> Everything that *can* run in parallel does.

---

## 🔗 The data trail

```
quiz finishes (numbers08) -> POST /api/test-results -> TestResult row (every attempt)
                                                          │
parent dashboard (D4) -----------------------------------┘ reads history -> weak areas
```

The learning side records attempts; the parent side analyzes them. Keeping full
history (not just the best score) is what makes the analysis possible.

---

## 🧪 Running it (after `npm install` + quiz history)

```bash
npm run dev
# /parent -> unlock -> a child with low repeated scores shows a
#   "💪 Needs practice" box listing the weak module+tier(s)
```

---

## ✅ Result

Parents see actionable weak areas — the specific module+tier a child keeps scoring low
on, with the average and attempt count — derived from the full `TestResult` history.

---

## ➡️ Next ticket

**D5 · `parent05-daily-goals`** — let parents set a daily learning goal (e.g. minutes
or levels per day) for each child.
