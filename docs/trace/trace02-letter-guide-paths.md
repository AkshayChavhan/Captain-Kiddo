# ✍️ trace02-letter-guide-paths

> **Phase E · Ticket E2** — Define the letter outline guide data (the stroke path for
> each letter) and show it as the overlay to trace over.

---

## 🎯 Goal

Give each letter a **path** — the line the child should trace — and render it as a
faint guide. Crucially, the *same* data will drive the on-path check in E3, so "what
the child sees" and "what we grade against" are identical.

---

## 🗺️ Representing a letter — [`src/config/letterPaths.ts`](../../src/config/letterPaths.ts)

A letter is **one or more strokes**; each stroke is an ordered list of **normalized
points** (coords in `0..1`):

```ts
A: [
  [ {x:0.5,y:0.1}, {x:0.2,y:0.9} ],          // left diagonal
  [ {x:0.5,y:0.1}, {x:0.8,y:0.9} ],          // right diagonal
  [ {x:0.32,y:0.6}, {x:0.68,y:0.6} ],        // crossbar
],
```

### Two design choices worth understanding

1. **Normalized 0..1 coordinates.** We *don't* hard-code pixels. `0,0` is the
   top-left of the tracing area, `1,1` the bottom-right. We multiply by the actual
   canvas `size` when drawing or checking. So the same letter works at any size
   (phone, tablet) — just scale.

   ```ts
   scaleStrokes(strokes, size) // {x,y} in 0..1  ->  pixels
   ```

2. **Multiple strokes, in writing order.** "A" is three separate pen strokes; "T" is
   two. Modeling strokes separately (and listing points in natural writing order)
   means we can later guide a child stroke-by-stroke and check direction. The start of
   each stroke is where the child should begin.

> 🧠 **One source of truth for guide + grading.** Because the visible outline (this
> ticket) and the correctness check (next ticket) read the *same* `LETTER_PATHS`, they
> can never disagree. If we tweak a letter's shape, both update together.

### Coverage

We define a representative set (A, B, C, D, L, O, T) to prove the structure. **Adding
the rest of A–Z (or numbers) is just more entries** — no code changes. `TRACEABLE_LETTERS`
lists what we currently have.

---

## 🎨 The guide overlay — [`LetterGuide.tsx`](../../src/components/learning/LetterGuide.tsx)

An **SVG** drawn over the canvas (inside `TraceCanvas`'s `pointer-events-none` overlay
slot from E1, so it's purely visual):

```tsx
<polyline
  points={scaledPoints}
  stroke="#c7c7d9" strokeWidth={16}
  strokeLinecap="round" strokeDasharray="2 18"  // dotted, friendly
/>
<circle cx={start.x} cy={start.y} r={10} fill="#00B894" />  // green "start here" dot
```

- **Dashed light line** = "trace along here", without looking like the finished
  letter.
- **Green start dot** per stroke = "begin here", so a pre-reader knows where to put
  their finger.
- **SVG** (not canvas) for the guide because it's static and scales crisply; the
  *drawing* stays on the canvas underneath.

---

## 🧩 How E1 + E2 fit

```tsx
<TraceCanvas onStrokeEnd={...}>
  <LetterGuide letter="A" />   {/* overlay slot from E1 */}
</TraceCanvas>
```

The child sees the dotted "A" with start dots, and draws on the canvas beneath. E1
captures the finger path; E2 shows what to trace. E3 will compare the two.

---

## 🧪 Using it (preview)

```tsx
import { TRACEABLE_LETTERS } from "@/config/letterPaths";
// render a TraceCanvas + LetterGuide for each letter in TRACEABLE_LETTERS
```

---

## ✅ Result

Every supported letter has a normalized, multi-stroke path that renders as a friendly
dotted guide with start dots — and is the exact data the next ticket grades the
child's tracing against.

---

## ➡️ Next ticket

**E3 · `trace03-on-path-detection`** — detect whether the child's finger stays ON the
letter's path vs strays off, by measuring each drawn point's distance to the guide.
