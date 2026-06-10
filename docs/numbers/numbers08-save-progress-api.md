# 💾 numbers08-save-progress-api

> **Phase B · Ticket B9** (the last one!) — Save progress: upsert the `Progress`
> row, mark the tier completed (which **unlocks the next tier**), award stars to
> `Child.totalStars`, and add the API routes. **Completes the Numbers module
> template.** 🎉

---

## 🎯 Goal

Make progress **stick**. When a child finishes a quiz, persist it so: the next tier
unlocks, their star balance grows, and the parent dashboard can later see their
results. All writes happen **server-side**.

---

## 🧠 The persistence logic — [`src/lib/progress.ts`](../../src/lib/progress.ts)

Two functions, both server-only (they touch the database).

### `saveProgress` — upsert + award stars, atomically

```ts
return prisma.$transaction(async (tx) => {
  const progress = await tx.progress.upsert({
    where: { childId_module_difficulty: { childId, module, difficulty } },
    create: { ...,  isCompleted, completedAt: isCompleted ? new Date() : null },
    update: {
      starsEarned: { increment: starsEarned },
      ...(isCompleted ? { isCompleted: true, completedAt: new Date() } : {}),
    },
  });
  if (starsEarned > 0) {
    await tx.child.update({ where: { id: childId }, data: { totalStars: { increment: starsEarned } } });
  }
  return progress;
});
```

Three important ideas:

1. **Upsert** = update-or-insert. Thanks to the `@@unique([childId, module,
   difficulty])` constraint from `schema02`, there's exactly one row per tier, so we
   can target it by that composite key (`childId_module_difficulty`). First finish
   creates it; replays update it.

2. **`isCompleted: true` unlocks the next tier.** Setting this is the *only* thing
   needed — the `unlockedDifficulties` helper (A11) reads completed tiers and opens
   the next one automatically. We never "un-complete" a tier (note the conditional).

3. **`$transaction` makes it atomic.** The progress upsert and the
   `Child.totalStars` increment happen **together or not at all**. If the star
   update failed on its own, a child's balance could drift from their actual
   progress. A transaction prevents that.

> 🧠 **`increment` instead of read-then-write:** `{ increment: n }` lets the database
> add atomically. Reading the old value, adding in JS, and writing it back would
> race if two updates overlapped. Let the DB do the math.

### `saveTestResult` — keep every attempt

```ts
return prisma.testResult.create({ data: input });
```

We `create` (not upsert) a row per attempt, because the parent dashboard derives
**weak areas** from the *history* of attempts (schema02). Never overwrite.

---

## 🌐 The API routes

### `POST /api/progress` — [`src/app/api/progress/route.ts`](../../src/app/api/progress/route.ts)

A Next.js **Route Handler**: a file named `route.ts` exporting an HTTP method
function becomes an API endpoint. This one:

1. Parses the JSON body (400 on bad JSON).
2. **Validates every field** — childId present, module exists, difficulty is a real
   enum value, stars ≥ 0, isCompleted is a boolean.
3. Calls `saveProgress` and returns the saved row.

```ts
export async function POST(request: Request) {
  const body = await request.json();
  // ...validate each field, 400 if wrong...
  const progress = await saveProgress({ ... });
  return NextResponse.json({ progress });
}
```

> 🔐 **Never trust the client.** The browser sends *what happened*; the server
> validates it and does the writing. We check the module against the registry and
> the difficulty against the enum so junk can't reach the database.

### `POST /api/test-results` — [`src/app/api/test-results/route.ts`](../../src/app/api/test-results/route.ts)

Same shape: validate `{ childId, module, difficulty, score, total }` (with
`score ≤ total`, `total > 0`) and record the attempt.

---

## 🔌 Saving when a quiz finishes — `QuizRunner`

When the drag round finishes (stage → `done`), the runner fires the save:

```tsx
const handleDragFinish = () => {
  setStage("done");
  void saveSession();   // POST progress + test-result in parallel
};
```

`saveSession` POSTs to both APIs with the session totals from the Zustand store
(`stars`, `correct`, `answered`), marking `isCompleted: true`.

### The active-child dependency (honest again)

The page passes `childId` from `getActiveChildId()`. Today that's still the Phase D
placeholder returning `null`, so:

```tsx
if (!childId) return; // nothing to save yet — but the child still plays + celebrates
```

> 💡 The whole flow is wired and correct; it just **no-ops the save** until a child
> can be selected (Phase D). When that lands, saving starts working with **zero
> changes here** — only `getActiveChildId` changes. Failures are swallowed so a
> network hiccup never blocks a kid's celebration.

---

## ♻️ Template complete

The Numbers module now demonstrates the **full learning loop**, end to end:

> module home (locked tiers) → learning view (numeral + objects + audio + animation)
> → quizzes (tap + drag, stars, celebration) → **save progress → unlock next tier →
> award stars**.

Every piece is generic except the Numbers-specific visuals. To build **Alphabets**,
copy the pattern, swap `NumberCard` for a `LetterCard`, and add an `alphabets` entry
to the registry. That was the whole point of Phase B. ✅

---

## 🧪 Running it (after `npm install` + a real DB + an active child)

```bash
npm run db:push           # create collections
npm run dev
# finish a quiz -> POST /api/progress -> tier marked complete, next tier unlocks,
#                  Child.totalStars increases
```

---

## ✅ Result — Phase B complete! 🎉

Progress persists atomically, finishing a tier unlocks the next, stars are awarded,
and quiz attempts are recorded for later analysis — all behind validated server-side
API routes. The **reusable Numbers module template is done**.

---

## ➡️ Next phase

**Phase C — Media Playback**: the shared Howler `AudioPlayer`, then sing-along (synced
karaoke lyrics), lullabies (sleep timer), and sleep stories. Starts with **C1 ·
`media01-shared-audio-player`**.
