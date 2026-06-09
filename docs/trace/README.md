# ✍️ Alphabet Tracing — Feature Spec (Phase E)

> **Goal:** Help kids (ages 3–6) learn **how to write** alphabets by tracing them
> with their finger on a touchscreen — not just recognizing them.

This document is the **detailed spec** for the tracing feature. The step-by-step
build is tracked as tickets **E1–E6** in [`../PLAN.md`](../PLAN.md), and each
ticket has its own learning doc in this folder.

---

## 🎯 What the child experiences

1. **One letter at a time** appears big on the screen as a light **guide outline**
   (e.g. the letter `A`).
2. The letter's **sound plays automatically** (audio-first — kids can't read), and
   an encouraging voice invites them to trace it.
3. The child **places a finger on the start point and drags along the letter's
   shape** to "write" it, following the correct stroke direction.
4. **If they trace correctly** (finger stays on the path):
   - ⭐ A celebratory animation plays.
   - The app moves on to the **next letter**.
5. **If they make a mistake** (finger strays off the path):
   - 🔴 The **whole screen blinks red 3 times** as a gentle "oops, try again" signal.
   - The trace **resets** and the child retries the **same letter**.

---

## 🧠 How it works (technical overview)

| Piece | Idea | Built in |
|-------|------|----------|
| **Trace canvas** | An HTML `<canvas>` (or SVG) that listens to **pointer events** so it works for both finger (touch) and mouse. As the child drags, we record the path of points. | `trace01` |
| **Letter guide paths** | Each letter has a predefined **stroke path** (the correct shape + direction). Stored as reusable data so adding letters is easy. | `trace02` |
| **On-path detection** | For each point the finger touches, check the **distance to the nearest point on the guide path**. If it's within a tolerance → on path. If it goes beyond → mistake. | `trace03` |
| **Red-blink feedback** | On a mistake, flash a full-screen red overlay **3 times** (Framer Motion / CSS), then clear the trace for a retry. | `trace04` |
| **Success + audio** | On a correct trace, play success animation and audio. Letter sound + voice guidance throughout. | `trace05` |
| **Flow + progress** | Sequence letters one-by-one and **save progress** (reuse the `Progress` model: `childId + module="alphabets" + difficulty`). | `trace06` |

---

## 🧒 Kid-friendly design rules (from the project brief)

- **Audio-first:** every letter speaks; kids don't rely on reading.
- **Large tap/trace targets:** the letter fills most of the screen; the on-path
  tolerance is forgiving so small hands aren't frustrated.
- **Gentle failure:** the red blink is short and calm — a hint to retry, never a
  scary "wrong!" It blinks exactly **3 times** then lets them try again.
- **Celebratory success:** stars/confetti reward correct tracing.

---

## ♻️ Reusability

The tracing engine is built generic so it can later trace:
- **Uppercase** letters (A–Z)
- **Lowercase** letters (a–z)
- **Numbers** (0–9) — the same canvas + path + detection logic applies.

Adding a new traceable character = adding one more **guide path** entry.

---

## 🔗 Related

- Master checklist: [`../PLAN.md`](../PLAN.md) → Phase E
- Project brief: [`../PROJECT_DETAILS.md`](../PROJECT_DETAILS.md) → Phase E
- This is part of the **Alphabets** learning module.
