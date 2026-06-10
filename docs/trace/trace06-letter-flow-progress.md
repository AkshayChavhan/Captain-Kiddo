# ✍️🏁 trace06-letter-flow-progress

> **Phase E · Ticket E6** (the final ticket!) — Sequence letters one-at-a-time into a
> full activity and save tracing progress. **Completes the alphabet-tracing feature
> and the whole plan.** 🎉

---

## 🎯 Goal

Turn the single-letter experience (E1–E5) into a real **activity**: go through the
letters one by one, and when the child finishes, **save their progress** like any other
learning module.

---

## 🔁 The flow — [`TraceActivity.tsx`](../../src/components/learning/TraceActivity.tsx)

```tsx
const letters = TRACEABLE_LETTERS;     // from the guide config (E2)
const current = letters[index];
...
<TraceLetter key={current} letter={current} onComplete={handleComplete} />
```

Each `TraceLetter` (E4/E5) calls `onComplete` when its letter is traced successfully.
We advance:

```tsx
const handleComplete = () => setIndex((i) => {
  const next = i + 1;
  if (next >= letters.length) { setFinished(true); saveProgress(); return i; }
  return next;
});
```

- One letter done → next letter.
- Last letter done → finished screen + save.

### The `key={current}` detail

```tsx
<TraceLetter key={current} letter={current} ... />
```

Giving `TraceLetter` a `key` tied to the current letter makes React **remount** it on
each new letter — which resets its internal state (the `done`/`wentOff` refs) and
**replays the audio** (it speaks the new letter on mount). Same keyed-remount trick we
used to replay the number-card animation in `numbers04`.

---

## 💾 Saving progress — reusing `/api/progress`

When the set is finished, we save via the **same API the Numbers module used**
(`numbers08`) — no new endpoint:

```tsx
await fetch("/api/progress", {
  method: "POST",
  body: JSON.stringify({
    childId,
    module: "alphabets",
    difficulty: Difficulty.EASY,
    starsEarned: letters.length,   // a star per letter
    isCompleted: true,
  }),
});
```

So tracing slots straight into the existing progress system: it upserts the
`alphabets` Progress row, marks it complete, and awards stars to `Child.totalStars` —
all server-side, atomically (the logic from `numbers08`). The parent dashboard's
progress/stars (Phase D) will reflect tracing automatically.

> 🧠 **The payoff of a good API.** Because `/api/progress` was built generic (any
> `module` slug), a brand-new feature in a different phase records progress with
> **zero** backend changes. That's what "reusable" buys you.

### Honest placeholder, one more time

```tsx
if (!childId) return;   // no active child yet -> save no-ops, child still plays
```

`childId` comes from `getActiveChildId()` (still the Phase D placeholder). Same pattern
as everywhere: wired correctly, dormant until child selection exists.

---

## 🌐 The route + entry point

- **[`/trace/page.tsx`](../../src/app/trace/page.tsx)** — a server component that reads
  the active child and renders `TraceActivity`.
- **Home page** — a new **"✍️ Trace Letters"** tile links to `/trace`, so the activity
  is reachable from the kid-facing home.

---

## 🧩 The complete tracing feature

```
home -> "Trace Letters" ✍️
  -> letter appears, speaks its name 🔊         (E5 audio-first)
  -> child traces over the dotted guide          (E1 canvas + E2 guide)
       ├─ on path + ~70% covered -> "Great job!" + ⭐ burst, next letter  (E3 + E5)
       └─ strays off -> "Try again!" + screen blinks RED 3×, retry        (E3 + E4)
  -> all letters done -> 🎉 + save progress (stars, completed)            (E6)
```

Exactly the feature from the spec ([`docs/trace/README.md`](./README.md)) — including
the **red-blink-3×-on-mistake** behavior you asked for.

---

## 🧪 Running it (after `npm install`)

```bash
npm run dev
# home -> "Trace Letters" -> trace each letter; finish -> celebration + progress saved
```

---

## ✅ Result — Phase E & the whole plan complete! 🎉

Alphabet tracing is a full activity: letter-by-letter, audio-first, with the red-blink
mistake feedback and a star-burst on success, saving progress through the existing
system. **All 43 tickets across Phases A–E are done.**

> A: Foundation · B: Numbers template · C: Media (sing-along/lullaby/story) ·
> D: Parent dashboard + Razorpay payments + reward shop · E: Alphabet tracing ✅

---

## 🏁 Where to go from here

The codebase is a complete, documented build. Natural next steps (outside the plan):

- **`npm install` + `npm run db:push`** and run it — validate end-to-end with real
  data (most features are wired but dormant until an **active parent/child** is
  selected, which is the one honest placeholder threaded throughout).
- Add the **real auth** that fills `getActiveParentId` / `getActiveChildId`.
- Fill in **content**: audio files (`/public/audio/...`), the rest of the A–Z letter
  paths, real module/media data.
- Each commit + its doc in `docs/` is a learning checkpoint — read them in order.
