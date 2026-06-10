# ✨ numbers04-framer-animations

> **Phase B · Ticket B5** — Add **Framer Motion** bounce/scale animations so numbers
> pop in playfully as the child steps through them.

---

## 🎯 Goal

Make the number card feel **alive and rewarding**. When a new number appears, the
big numeral should **bounce in** and the counting objects should **pop in one-by-one**
(a delightful "counting up" effect). Stepping between numbers should feel smooth.

---

## 🧩 What is Framer Motion?

A React animation library. You swap a normal element (`<div>`) for a `motion`
element (`<motion.div>`) and describe **states** instead of writing keyframes by
hand. We use three core ideas here: **variants**, **stagger**, and
**AnimatePresence**.

---

## 1️⃣ Variants — named animation states

Instead of scattering animation values around, we define named states and switch
between them:

```tsx
initial="hidden"   // start here
animate="visible"  // animate to here on mount
exit="exit"        // animate to here on unmount (needs AnimatePresence)
```

The big numeral's variants give it a **springy bounce**:

```tsx
variants={{
  hidden:  { scale: 0.3, opacity: 0 },
  visible: { scale: 1, opacity: 1,
             transition: { type: "spring", stiffness: 400, damping: 12 } },
}}
```

> 🧠 A **spring** transition (instead of a fixed duration) gives that natural,
> slightly-overshooting "boing" — much more playful than a linear fade. `stiffness`
> = how snappy, `damping` = how quickly it settles.

---

## 2️⃣ Stagger — the objects pop in one-by-one

The card (the container) tells its children to animate **in sequence**, not all at
once:

```tsx
// on the container (motion.button)
variants={{
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
}}
```

```tsx
// on each object (motion.span)
variants={{
  hidden:  { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
}}
```

- `staggerChildren: 0.08` → each apple appears 80ms after the previous one.
- `delayChildren: 0.15` → wait 150ms (for the numeral to bounce) before the apples
  start.

The result: "3" bounces in, then 🍎 … 🍎 … 🍎 pop in one at a time — like the app is
**counting them out** for the child. 🎉

> 🧠 **How stagger works:** a parent `motion` element with named variants
> *propagates* those variant names to its `motion` children. So setting the parent to
> `"visible"` triggers every child's `"visible"` — spaced out by `staggerChildren`.

---

## 3️⃣ Replaying the animation on each new number

Animations only run when a component **mounts**. To replay them every time the number
changes, the parent gives the card a `key` tied to the value:

```tsx
// LearningView.tsx
<AnimatePresence mode="wait">
  <NumberCard key={current} value={current} />
</AnimatePresence>
```

- **`key={current}`** → when `current` changes (1 → 2), React treats it as a *new*
  card: the old one unmounts, a new one mounts → enter animation replays.
- **`<AnimatePresence>`** → lets the **outgoing** card run its `exit` animation
  *before* it's removed (otherwise it would just vanish instantly).
- **`mode="wait"`** → wait for the old card to finish exiting before the new one
  enters, so they don't overlap messily.

The card's `exit` variant:

```tsx
exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } }
```

So: old number shrinks/fades out → new number bounces in. Smooth. ✨

---

## 4️⃣ Tap feedback

The whole card also presses in when tapped:

```tsx
whileTap={{ scale: 0.96 }}
```

A tiny touch, but it makes the card feel physical and responsive under little
fingers.

---

## 🧠 Why this matters for kids

Bright motion is **feedback** for pre-readers: the bounce says "here's a new number!",
the staggered pops reinforce **counting**, and the press confirms "you touched it".
Motion does the job words would do for an older user.

---

## 🧪 Running it (after `npm install`)

```bash
npm run dev
# /learn/numbers/easy -> tap Next: the number bounces in, objects pop in one-by-one
```

---

## ✅ Result

The number card now bounces in, counts its objects out with a staggered pop, presses
on tap, and swaps smoothly between numbers — turning a static card into a lively,
rewarding little experience.

---

## ➡️ Next ticket

**B6 · `numbers05-quiz-tap-answer`** — the first quiz type: "tap the correct answer"
(match the spoken/shown number to the right option), awarding stars for correct taps.
