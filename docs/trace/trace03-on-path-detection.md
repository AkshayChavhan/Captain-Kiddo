# ✍️ trace03-on-path-detection

> **Phase E · Ticket E3** — Detect whether the child's finger stays **ON** the
> letter's path vs strays **off**, by measuring each drawn point's distance to the
> guide.

---

## 🎯 Goal

Given a point the child drew and the letter's guide path, answer one question:
**"Is the finger on the letter, or has it wandered off?"** That yes/no is what drives
the success vs red-blink feedback in the next tickets.

---

## 📐 The math: point-to-segment distance — [`src/lib/trace.ts`](../../src/lib/trace.ts)

A letter's guide is a series of **line segments** (consecutive points). "On path"
means the finger is close to one of those segments. So the core primitive is: *how far
is a point from a line segment?*

```ts
distanceToSegment(p, a, b)   // distance from p to segment a—b
```

### How it works (the standard technique)

1. **Project** the point `p` onto the infinite line through `a`–`b`. The projection
   position is a value `t` (0 = at `a`, 1 = at `b`).
2. **Clamp** `t` to `[0, 1]` — because we want the nearest point on the *segment*, not
   the infinite line. (If the foot of the perpendicular falls past an endpoint, the
   nearest point *is* that endpoint.)
3. Measure the distance from `p` to that clamped closest point.

```ts
let t = ((p.x - a.x)*dx + (p.y - a.y)*dy) / lenSq;  // projection
t = clamp(t, 0, 1);                                  // stay on the segment
const closest = { x: a.x + t*dx, y: a.y + t*dy };
return hypot(p - closest);                           // the distance
```

> 🧠 **Why clamp?** Without it we'd measure distance to the infinite line, so a finger
> way *beyond* a stroke's end could count as "on path". Clamping to the segment's ends
> keeps the check honest. (We also handle the degenerate `a == b` case — distance to
> the point.)

---

## 🔤 Nearest across the whole letter

A letter has **multiple strokes** (A has 3). The finger is on path if it's near **any**
segment of **any** stroke:

```ts
distanceToStrokes(p, strokes) // min distance over every segment of every stroke
```

We scan all segments and keep the smallest distance. Then:

```ts
export function isPointOnPath(p, strokes, tolerance = 36) {
  return distanceToStrokes(p, strokes) <= tolerance;
}
```

---

## 🎚️ Tolerance — forgiving on purpose

```ts
tolerance = 36   // pixels
```

The brief stresses kid-friendliness. A 3-year-old can't trace precisely, so the
on-path band is **generous** (~36px). The guide line is drawn thick (16px) too, so as
long as the finger is roughly over the dotted letter, it counts. Too tight a tolerance
would frustrate; too loose would let any scribble pass — 36px is a comfortable middle
we can tune.

> 🧠 **Coordinates are in pixels here.** The caller scales the normalized guide
> (`scaleStrokes`, from E2) to the canvas size first, so the drawn points and the guide
> are in the same pixel space before we measure.

---

## 🧪 Pure + testable

`trace.ts` has **no React, no DOM** — just geometry. That means:

```ts
isPointOnPath({x:160,y:160}, scaledStrokes)  // true/false, deterministic
```

is trivial to unit-test and reason about. The interactive wiring (when to call it,
what to do with the answer) lives in the component layer — keeping the tricky math
isolated and verifiable.

---

## 🔌 How E4/E6 will use it

```ts
// on each onStrokeMove point:
if (!isPointOnPath(point, scaledStrokes)) {
  // -> the finger went off the letter -> trigger the red-blink feedback (E4)
}
// on stroke end: if all points stayed on path -> success (E5/E6)
```

E4 turns an off-path point into the **screen blinking red 3×**; E5/E6 handle success
+ the letter-by-letter flow.

---

## ✅ Result

We can now tell, for any drawn point, whether it's on the letter's path — using clean
point-to-segment geometry with a kid-forgiving tolerance, as a pure, testable
function. This is the grading engine the feedback builds on.

---

## ➡️ Next ticket

**E4 · `trace04-red-blink-feedback`** — when the finger goes off the path, blink the
whole screen **red 3 times**, then reset for a retry.
