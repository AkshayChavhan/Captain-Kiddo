# 🔴 trace04-red-blink-feedback

> **Phase E · Ticket E4** — When the finger goes off the path, blink the whole
> screen **red 3 times**, then reset for a retry. *(The feature you specifically
> asked for.)*

---

## 🎯 Goal

Give a clear, gentle "oops — try again" signal when a child traces off the letter: the
screen flashes **red exactly 3 times**, then they can have another go. No words, no
scary noise — just a visual cue a pre-reader understands.

---

## 🔁 The blink hook — [`src/hooks/useRedBlink.ts`](../../src/hooks/useRedBlink.ts)

```ts
const { blinking, blink } = useRedBlink({ times: 3 });
// call blink() on a mistake; pass `blinking` to the red overlay
```

### How "3 blinks" works

One blink = **on then off**. So 3 blinks = `3 * 2 = 6` steps: `on, off, on, off, on,
off`. We toggle the flag on an interval and stop after the steps run out:

```ts
let step = 0;
const totalSteps = times * 2;
setBlinking(true);                       // start ON
timerRef.current = setInterval(() => {
  step += 1;
  if (step >= totalSteps) { stop(); return; }
  setBlinking(step % 2 === 0);           // even step -> on, odd -> off
}, intervalMs);                          // 180ms per step
```

- Restarts cleanly if `blink()` is called again mid-blink.
- **Cleared on unmount** (the `useEffect(() => stop, ...)`) so no timer fires on a gone
  component.

> 🧠 **Exactly 3, by construction.** Counting steps (`times * 2`) and stopping makes
> the blink count precise — not "blink for a while". The brief said *3 times*, so we
> count to 3.

---

## 🟥 The overlay — [`RedBlinkOverlay.tsx`](../../src/components/learning/RedBlinkOverlay.tsx)

A full-screen red layer whose opacity follows the `blinking` flag:

```tsx
<div className="pointer-events-none fixed inset-0 z-50 bg-kiddo-red transition-opacity duration-100"
     style={{ opacity: show ? 0.55 : 0 }} />
```

- **`pointer-events-none`** → it never blocks the child's next attempt.
- **`opacity 0.55`** (not full red) + a 100ms fade → each flash is **soft**, a hint
  rather than an alarm. Kid-appropriate: "not quite", not "ERROR".

---

## 🧩 Tying it all together — [`TraceLetter.tsx`](../../src/components/learning/TraceLetter.tsx)

This component connects every tracing piece built so far:

```
TraceCanvas (E1)  — captures the finger path
  └ LetterGuide (E2) — shows the dotted letter to trace
on-path detection (E3) — checks each point
red blink (E4)    — flashes on the first off-path point
```

### The off-path → blink logic

```tsx
const scaled = scaleStrokes(getLetterStrokes(letter), SIZE);  // guide in pixels

handleStart: wentOff = false;                 // new attempt
handleMove(point):
  if (wentOff) return;                        // already failed this attempt
  if (!isPointOnPath(point, scaled)) {        // E3 check
    wentOff = true;
    blink();                                  // 🔴 blink red 3x
  }
```

- We scale the normalized guide (E2) to canvas pixels **once** (`useMemo`).
- On **each move point**, we run the E3 `isPointOnPath` check.
- The **first** point that strays off sets a `wentOff` ref and fires `blink()`. We use
  a **ref** (not state) so checking it on every move doesn't cause re-renders, and so
  one mistake triggers the blink only once per attempt.

### And success?

```tsx
handleEnd(path):
  if (!wentOff && path.length > 3) onComplete?.();
```

If the child finished **without** straying, we call `onComplete`. (Fuller success
scoring — did they cover the *whole* letter, not just a corner — and the celebration
come in E5; the letter-by-letter flow in E6. This ticket's deliverable is the
**off-path → red-blink-3×** behavior.)

> 🧠 **Why a ref for `wentOff`?** The move handler fires many times per drag. A ref
> lets us remember "this attempt already failed" without re-rendering on every pixel,
> and ensures the screen blinks **once** per off-path attempt, not repeatedly.

---

## 🧪 Using it (preview)

```tsx
<TraceLetter letter="A" onComplete={() => console.log("traced A!")} />
// trace along the dotted A -> ok; wander off -> screen blinks red 3 times
```

---

## ✅ Result

Straying off the letter now blinks the screen red exactly 3 times — soft,
non-blocking, and precise — then the child can try again. The tracing canvas, guide,
detection, and feedback are wired into one `TraceLetter` component.

---

## ➡️ Next ticket

**E5 · `trace05-success-and-audio`** — the success side: a celebration when the letter
is traced correctly, plus audio-first letter sound + encouraging voice guidance.
