# 🔢 numbers01-module-home-tiers

> **Phase B · Ticket B2** — Build the module home screen showing the three
> difficulty tiers (Easy/Medium/Hard) with 🔒 locks on tiers the child hasn't
> unlocked yet. Built as the **reusable template** for every module.

---

## 🎯 Goal

When a kid taps a module (e.g. Numbers), show three big level cards — **Easy,
Medium, Hard** — with the locked ones showing 🔒 until the previous level is
finished. This screen works for *any* module, just by changing the URL slug.

---

## 🗺️ The screens & routes

```
/                      -> home: grid of all modules        (src/app/page.tsx)
/learn/numbers         -> Numbers home: the 3 tiers         (src/app/learn/[module]/page.tsx)
/learn/numbers/easy    -> the Easy learning view            (built in numbers02)
```

The `[module]` folder name in `src/app/learn/[module]/` is a **dynamic route**: the
part of the URL there becomes `params.module` (`"numbers"`, `"colors"`, …). One file
serves *every* module. ✅ This is what makes it a template.

---

## 🧩 New config: `src/config/tiers.ts`

```ts
export const TIERS: TierConfig[] = [
  { difficulty: EASY,   label: "Easy",   emoji: "🌱", color: "green",  range: {1,5} },
  { difficulty: MEDIUM, label: "Medium", emoji: "⭐", color: "yellow", range: {1,10} },
  { difficulty: HARD,   label: "Hard",   emoji: "🔥", color: "red",    range: {1,20} },
];
```

Just like the module registry, the three tiers are described **once** here (label,
emoji, color, and the Numbers ranges from the brief: Easy 1–5, Medium 1–10, Hard
1–20). Screens read from this instead of hard-coding tier details.

---

## 🃏 The `TierCard` component (`src/components/learning/TierCard.tsx`)

A `"use client"` component (it needs interactivity — tap/hover animations). It shows
one tier as a big card and behaves differently based on `locked`:

| State | Looks like | Tappable? |
|-------|-----------|-----------|
| **Unlocked** | bright tier color, tier emoji | ✅ links to the learning view |
| **Locked** | greyed out, 🔒 icon | ❌ not a link, `aria-disabled` |

```tsx
whileTap={locked ? undefined : { scale: 0.95 }}   // press feedback (Framer Motion)
whileHover={locked ? undefined : { scale: 1.03 }} // gentle invite
```

Unlocked cards wrap in a `<Link>` to `/learn/<module>/<difficulty>`; locked cards are
plain non-clickable `<div>`s. Kids literally **can't** enter a locked tier.

> 🧠 **Why a client component here?** Server components can't use interactivity like
> `whileTap`/`onClick`. The card needs tap feedback, so it's a client component. The
> *page* around it stays a server component (so it can hit the database).

---

## 🖥️ The module home page (`src/app/learn/[module]/page.tsx`)

This is a **server component** (note the `async`). Server components can `await`
database calls directly — perfect for computing locks before the page renders.

```tsx
const module = getModule(params.module);
if (!module) notFound();                       // unknown slug -> 404

const childId = await getActiveChildId();
const unlocked = childId
  ? await unlockedDifficulties(childId, moduleSlug) // from A11!
  : [Difficulty.EASY];                              // no child yet -> Easy only

const unlockedSet = new Set(unlocked);
// ...render a TierCard per tier, locked = !unlockedSet.has(tier.difficulty)
```

### Reusing the access helper from A11

We call **`unlockedDifficulties(childId, moduleSlug)`** — the helper we wrote in
`setup06`. It returns the tiers the child has earned (e.g. `[EASY, MEDIUM]`). We turn
that into a `Set` and mark every other tier as locked. The sequential-unlock business
rule lives in that one helper; this screen just *displays* the result.

---

## 🧒 Honest placeholder: `getActiveChildId()`

Screens need to know *which child* is playing. That selection happens in the parent
dashboard (Phase D), so for now `src/lib/activeChild.ts` returns `null`, and the page
falls back to **"only Easy unlocked."**

> 💡 **Why a placeholder instead of faking a child?** Pretending a child is logged in
> would hide the missing piece and break later. A clearly-marked `null` + sensible
> default keeps the app runnable *and* honest. When Phase D wires real child
> selection, we change **only** this one function.

---

## 🏠 Updated home page (`src/app/page.tsx`)

The placeholder home is replaced with a **module grid**: a card per module (from the
registry), each linking to `/learn/<slug>`. (Paid-module 🔒 locks + paywall come in
Phase D — for now everything links through so we can build the learning flow.)

---

## ♻️ Why this is a template

Nothing here says "numbers" except the data. The route is `[module]`, the tiers come
from config, the locks come from a generic helper. To get the Animals home screen,
you literally just visit `/learn/animals` — **no new code**.

---

## 🧪 Running it (after `npm install`)

```bash
npm run dev
# visit http://localhost:3000        -> module grid
# tap Numbers (or visit /learn/numbers) -> Easy unlocked, Medium/Hard locked 🔒
```

---

## ✅ Result

A reusable module-home screen renders the three tiers with correct 🔒 locks driven by
the child's real progress, and the app now has a navigable home → module → tier flow.

---

## ➡️ Next ticket

**B3 · `numbers02-learning-view-card`** — the actual learning view: a big number card
with an object-counting visual (number 3 = three apples), the heart of the Numbers
lesson.
