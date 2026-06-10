# 🎉 numbers07-celebration-confetti

> **Phase B · Ticket B8** — A confetti / star-burst **celebration** on correct
> answers (Framer Motion), plus the encouraging audio feedback, to make wins feel
> big.

---

## 🎯 Goal

A correct answer should feel **exciting**. We add a star-burst animation that fires
on every right answer in both quizzes, reinforcing success the way a high-five would.

---

## ✨ The `Celebration` component — [`src/components/shared/Celebration.tsx`](../../src/components/shared/Celebration.tsx)

A full-screen star-burst — built with **Framer Motion only**, no extra confetti
library (the brief specifies Framer Motion for animations, so we keep dependencies
lean).

### How the burst works

We pre-compute evenly-spaced outward directions using basic trigonometry:

```ts
const STARS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;   // spread 12 stars around a circle
  return { x: Math.cos(angle) * RADIUS, y: Math.sin(angle) * RADIUS };
});
```

> 🧠 **The math:** a full circle is `2π` radians. Dividing it into 12 equal angles
> and taking `cos`/`sin` of each gives 12 points evenly around a circle — the
> directions our stars fly. (You don't need to memorize this; just know `cos`/`sin`
> turn an angle into an x/y direction.)

Each star animates from the center outward, growing then fading:

```tsx
initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
animate={{ x: star.x, y: star.y, scale: 1, opacity: 0 }}
transition={{ duration: 0.8, ease: "easeOut" }}
```

Plus a big 🌟 that bounces in the middle (`scale: [0, 1.3, 1]` — overshoot then
settle).

### Two important details

- **`pointer-events: none`** — the overlay never blocks taps underneath. The child
  can keep playing even while stars are flying.
- **`<AnimatePresence>`** — lets the whole overlay **fade out** cleanly when `show`
  flips back to false.

```tsx
<Celebration show={celebrating} />   // controlled by a boolean
```

---

## 🪝 The `useCelebration` hook — [`src/hooks/useCelebration.ts`](../../src/hooks/useCelebration.ts)

So both quizzes don't duplicate the "show it, then hide it after a moment" logic:

```ts
const { celebrating, celebrate } = useCelebration();
// call celebrate() on a correct answer; `celebrating` auto-resets after ~900ms
```

It sets `celebrating = true`, then a `setTimeout` flips it back to false. The timer is
**cleared on unmount** so it never fires on a component that's gone:

```ts
useEffect(() => () => { if (timerRef.current) globalThis.clearTimeout(timerRef.current); }, []);
```

> 🧠 **Why clear timers on unmount?** If the child leaves the quiz mid-celebration, a
> leftover timer calling `setState` on an unmounted component is a classic React
> warning/leak. Clearing it in the effect's cleanup avoids that.

---

## 🔌 Wired into both quizzes

In `TapQuiz` and `DragDropQuiz`, a correct answer now also fires the burst:

```tsx
if (correct) {
  playCorrect();   // "Great job!" audio (from numbers03)
  celebrate();     // ⭐ star-burst
  addCorrect();    // +1 star in the tally
  ...
}
```

Both render `<Celebration show={celebrating} />` at the top of their layout. So every
right answer = encouraging sound **and** a star-burst. The audio + visual together
make the win feel substantial.

---

## 🧹 Self-review cleanup (done this ticket)

The editor flagged a lint rule while wiring timers: **prefer `globalThis` over
`window`**. I swept all timer calls across the new code to use `globalThis.setTimeout`
/ `globalThis.clearTimeout` (in `TapQuiz` and `useCelebration`).

> 🧠 **Why `globalThis`?** `window` only exists in browsers; `globalThis` is the
> standard, environment-agnostic global. Preferring it keeps code consistent and
> portable (and quiets the linter). Functionally identical here, but the better
> habit.

---

## 🧪 Running it (after `npm install`)

```bash
npm run dev
# /learn/numbers/easy/quiz -> answer correctly -> stars burst out + "Great job!"
```

---

## ✅ Result

Correct answers now trigger a joyful Framer-Motion star-burst plus encouraging audio,
in both quiz types — wins feel like wins. The celebration is a clean, reusable
component + hook that any future screen can drop in.

---

## ➡️ Next ticket

**B9 · `numbers08-save-progress-api`** — the final Numbers ticket: save progress
(upsert the `Progress` row), mark the tier completed to **unlock the next tier**,
award stars to `Child.totalStars`, and add the API routes for progress + test
results.
