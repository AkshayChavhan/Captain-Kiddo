# 🔑 setup06-access-helpers

> **Phase A · Ticket A11** — Write the access-control helpers at
> [`src/lib/access.ts`](../../src/lib/access.ts): `canAccessModule(parentId, module)`
> and `unlockedDifficulties(childId, module)`.

---

## 🎯 Goal

Put the two most important access rules in **one file** so every screen and API
route asks the same question the same way:

1. **Can this family open this module?** (free vs paid)
2. **Which difficulty tiers can this child play?** (sequential unlocking)

> 🧠 **Why centralize?** If these rules were copy-pasted across many components,
> one of them would eventually be wrong — and a wrong access check means either a
> kid hitting a paywall they already paid through, or a paid module leaking for
> free. Define the rule **once**, call it everywhere.

---

## 1️⃣ `canAccessModule(parentId, moduleSlug)`

```ts
const module = getModule(moduleSlug);
if (!module) return false;          // unknown slug -> deny (fail closed)
if (module.isFree) return true;     // free modules always open

const access = await prisma.moduleAccess.findFirst({
  where: { parentId, module: { in: [moduleSlug, BUNDLE_SLUG] } },
  select: { id: true },
});
return access !== null;
```

### The logic, step by step

1. **Look up the module** in the registry. If the slug is unknown → **deny**.
   This is "**fail closed**": when unsure, say *no*. (The opposite, "fail open",
   would leak content on a typo — bad.)
2. **Free module?** → allow immediately.
3. **Paid module?** → check the database for a `ModuleAccess` row for this parent
   that is **either** this exact module **or** the `"ALL"` bundle. The
   `module: { in: [slug, "ALL"] }` checks both in a single query.

### Why it takes `parentId` (not `childId`)

The business rule: *"pay once, all their children get access."* Access lives on the
**parent**, so we check the parent's access rows. Every child of that parent
inherits it automatically.

---

## 2️⃣ `unlockedDifficulties(childId, moduleSlug)`

This enforces: **EASY → MEDIUM → HARD, unlocked in order.** A tier opens only when
the previous tier is **completed**.

```ts
const rows = await prisma.progress.findMany({
  where: { childId, module: moduleSlug, isCompleted: true },
  select: { difficulty: true },
});
const completed = new Set(rows.map((r) => r.difficulty));

const unlocked: Difficulty[] = [];
for (let i = 0; i < TIER_ORDER.length; i++) {
  const tier = TIER_ORDER[i];
  if (i === 0) { unlocked.push(tier); continue; }     // EASY: always open
  if (completed.has(TIER_ORDER[i - 1])) unlocked.push(tier); // prev done -> open
  else break;                                          // prev not done -> stop
}
return unlocked;
```

### The logic, step by step

1. Fetch this child's **completed** tiers for the module (one query).
2. Put them in a `Set` for instant `has()` checks.
3. Walk the tiers **in order** (`[EASY, MEDIUM, HARD]`):
   - **EASY** is always unlocked.
   - Each later tier unlocks **only if the previous tier is completed**.
   - The moment we hit a tier whose predecessor isn't done, we **stop** — nothing
     beyond it can be unlocked.

### Examples

| Child's completed tiers | Result |
|-------------------------|--------|
| (none) | `[EASY]` |
| EASY | `[EASY, MEDIUM]` |
| EASY, MEDIUM | `[EASY, MEDIUM, HARD]` |
| MEDIUM only (shouldn't happen) | `[EASY]` — we stop because EASY isn't marked done |

That last row shows why the **"stop at the first gap"** logic is safe: tiers can't be
skipped even if the data is weird.

---

## 🧩 How the two helpers work together

They answer **different** questions and are usually used as a pair:

```ts
// In a module screen / API route:
if (!(await canAccessModule(parentId, "animals"))) {
  // show the paywall 🔒
} else {
  const tiers = await unlockedDifficulties(childId, "animals");
  // render EASY/MEDIUM/HARD, locking the ones not in `tiers`
}
```

- `canAccessModule` → **family-level** gate (did they pay / is it free?).
- `unlockedDifficulties` → **child-level** progress gate (which tiers has *this kid*
  earned?).

Two different concerns, cleanly separated.

---

## 🛡️ Design choices worth noticing

- **Fail closed** on unknown modules — security default.
- **Single queries** — each helper hits the DB once, not in a loop.
- **Reads the registry** for `isFree`, so pricing/free-status stays consistent with
  `setup05`.
- **Enum-driven tier order** — `TIER_ORDER` uses the real `Difficulty` enum, so it
  can't drift from the schema.

---

## ✅ Result

The app now has trustworthy, reusable access control: one function decides *if a
family can open a module*, another decides *which tiers a child has unlocked* — both
enforcing the business rules in exactly one place.

---

## ➡️ Next ticket

**A12 · `pwa01-manifest-and-service-worker`** — the final Phase A ticket: PWA setup
(manifest, service worker, offline caching, `next.config`) so Captain Kiddo is
installable, fullscreen, portrait-locked, and works offline.
