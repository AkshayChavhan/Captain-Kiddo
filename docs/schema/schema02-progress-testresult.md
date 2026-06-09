# 🗄️ schema02-progress-testresult

> **Phase A · Ticket A5** — Add the **`Difficulty`** enum, the tier-aware
> **`Progress`** model, and the **`TestResult`** model.

---

## 🎯 Goal

Track **how far each child has gotten** in each module, tier by tier, and **record
every quiz attempt** so the parent dashboard can later spot weak areas.

---

## 🪜 The `Difficulty` enum

```prisma
enum Difficulty {
  EASY
  MEDIUM
  HARD
}
```

An **enum** is a fixed list of allowed values. A tier can only be `EASY`, `MEDIUM`,
or `HARD` — nothing else. Using an enum (instead of a free-text string) means typos
like `"esay"` become impossible; the database and TypeScript both enforce it.

> 🔒 **Business rule:** tiers unlock **sequentially** — `MEDIUM` only after `EASY`
> is completed, `HARD` only after `MEDIUM`. The *enforcement* lives in the access
> helpers (ticket A11). This enum just defines the three valid tiers.

---

## 📈 The `Progress` model — one row per (child, module, tier)

```prisma
model Progress {
  module      String     // e.g. "numbers"
  difficulty  Difficulty // EASY | MEDIUM | HARD
  isCompleted Boolean    @default(false)
  starsEarned Int        @default(0)
  completedAt DateTime?
  childId     String     @db.ObjectId
  child       Child      @relation(...)
  @@unique([childId, module, difficulty])
}
```

### The key idea: the `@@unique` constraint

```prisma
@@unique([childId, module, difficulty])
```

This says: **there can be at most ONE progress row** for a given combination of
child + module + tier. Why this matters:

- A child playing *Numbers / Easy* has exactly one progress row for it.
- When they make progress, we **`upsert`** (update if it exists, create if not) —
  the unique constraint guarantees we never accidentally create duplicates.
- This is what makes the "save progress" logic in the learning module clean and
  safe (we'll see it in `numbers08`).

### The fields

| Field | Why |
|-------|-----|
| `module` | The module slug (e.g. `"numbers"`) from our registry. A string keeps it flexible — adding a module needs no schema change. |
| `difficulty` | Which tier this row tracks. |
| `isCompleted` | Flips to `true` when the tier is finished → this is what **unlocks the next tier**. |
| `starsEarned` | Stars earned inside this tier (Int — a count). |
| `completedAt` | Optional timestamp; set when completed. `?` means it can be null until then. |

---

## 📝 The `TestResult` model — every quiz attempt

```prisma
model TestResult {
  module     String
  difficulty Difficulty
  score      Int   // got right
  total      Int   // out of how many
  createdAt  DateTime @default(now())
  childId    String @db.ObjectId
  child      Child  @relation(...)
}
```

### Why store *every* attempt (not just the best/latest)?

The brief wants the parent dashboard to show **"weak areas"** — derived from
*attempts vs score*. If a child keeps scoring low on *Numbers / Hard* across many
attempts, that's a weak area worth flagging.

To compute that later, we need the **history**, so each quiz attempt becomes its own
row. We never overwrite past attempts.

### Why `score` + `total` as two integers?

We store `score` (got right) and `total` (out of) separately, both as `Int`. The
percentage is `score / total`, computed when needed — we **don't store a float**.
This mirrors the project's "discrete values are integers" discipline.

---

## 🔗 Back-relations added to `Child`

We also updated the `Child` model so it can list its progress and results:

```prisma
progress    Progress[]
testResults TestResult[]
```

In Prisma, a relation is declared on **both sides**: `Progress`/`TestResult` point
to a `Child`, and `Child` holds arrays pointing back. Both sides must agree or
`prisma db push` complains.

---

## 🗂️ Indexes & collection names

```prisma
@@index([childId])            // Progress: fast "all progress for this child"
@@index([childId, module])    // TestResult: fast "this child's results in a module"
@@map("progress")
@@map("test_results")
```

We index the fields we'll filter by most, and map to clean snake_case collection
names.

---

## ✅ Result

The database can now answer:
- *"Has this child completed Numbers / Easy?"* → the `Progress` row's `isCompleted`.
- *"How has this child been doing on quizzes?"* → the `TestResult` history.

These two models power both the **tier-unlock logic** and the **parent dashboard's
weak-area analysis** later.

---

## ➡️ Next ticket

**A6 · `schema03-access-payment-models`** — add **`ModuleAccess`** (which paid
modules a parent has unlocked) and **`Payment`** (Razorpay records, amounts in
paise, PENDING → PAID).
