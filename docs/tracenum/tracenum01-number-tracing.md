# 🔢✍️ tracenum01-number-tracing

> **Bonus feature (post-plan)** — Let kids **write numbers** by tracing the digits
> 0–9 with their finger, the same way they trace letters. Requested after the main
> 43-ticket plan was complete.

---

## 🎯 Goal

Add a "learn to write numbers" activity to the Numbers module: trace each digit 0–9
over a dotted guide, with the same red-blink-on-mistake and star-burst-on-success the
letter tracing has.

---

## ♻️ The big idea: reuse the trace engine

The alphabet-tracing tickets (E1–E6) were built **generic on purpose**. Number tracing
is almost entirely **data + a thin flow**, not new engine code. Here's what was reused
vs added:

| Reused (unchanged) | Added (this feature) |
|--------------------|----------------------|
| `TraceCanvas` (pointer capture + draw) | `numberPaths.ts` — 0–9 stroke data |
| on-path detection (`trace.ts`) | `GlyphGuide` — guide generalized from `LetterGuide` |
| red-blink (`useRedBlink`) | `TraceGlyph` — engine generalized from `TraceLetter` |
| celebration, audio (`useSound`) | `NumberTraceActivity` + `/learn/numbers/write` |

> 🧠 **Why this was cheap:** because E2/E3 used **normalized stroke data** and a
> generic distance check, a digit is just another set of strokes. The hard part
> (capture, detection, feedback) was already done.

---

## 🔢 Number stroke data — [`src/config/numberPaths.ts`](../../src/config/numberPaths.ts)

Same shape as `letterPaths.ts`: each digit is one+ strokes of normalized `0..1`
points in writing order.

```ts
"1": [
  [ {x:0.35,y:0.25}, {x:0.5,y:0.1}, {x:0.5,y:0.9} ],  // flag + stem
  [ {x:0.32,y:0.9}, {x:0.68,y:0.9} ],                 // base
],
```

`TRACEABLE_NUMBERS` lists 0–9; `getNumberStrokes("3")` returns its strokes.

---

## 🧱 Generalizing the components

To avoid duplicating the letter tracer, two pieces were lifted to be glyph-agnostic:

- **[`GlyphGuide`](../../src/components/learning/GlyphGuide.tsx)** — like `LetterGuide`
  but takes `strokes` directly (instead of looking up a letter). Draws the dotted
  outline + green start dots for *any* glyph.
- **[`TraceGlyph`](../../src/components/learning/TraceGlyph.tsx)** — the engine from
  `TraceLetter`, now taking `strokes`, `audioSrc`, and `promptLabel` as **props**. All
  the behavior (speak on appear, on-path check, red-blink-3×, coverage≥70% success,
  star-burst) is identical — it just doesn't care whether the glyph is a letter or a
  number.

So letters use the letter data + `TraceGlyph`-style logic, and numbers use the digit
data + `TraceGlyph`. (The original `TraceLetter` still works; new code uses the generic
`TraceGlyph`.)

---

## 🔁 The flow — [`NumberTraceActivity`](../../src/components/learning/NumberTraceActivity.tsx)

Mirrors the alphabet activity:

```tsx
<TraceGlyph
  key={current}                            // remount per digit -> reset + replay audio
  strokes={getNumberStrokes(current)}
  audioSrc={numberAudio(Number(current))}  // reuses the spoken-number clips!
  promptLabel={`Trace the ${current}!`}
  onComplete={handleComplete}              // -> next digit
/>
```

- Walks 0–9 one at a time; each success advances.
- On finishing, **saves progress** to the `numbers` module via the same
  `/api/progress` endpoint — so writing numbers contributes to the child's stars and
  the parent dashboard, no backend changes.
- The spoken-digit audio (`numberAudio`) is the **same** clips the Numbers *learning*
  view already uses — reuse on top of reuse.

---

## 🚪 Entry point — [`/learn/numbers/write`](../../src/app/learn/numbers/write/page.tsx)

A server route (reads the active child) renders the activity. The Numbers module home
([`/learn/numbers`](../../src/app/learn/[module]/page.tsx)) now shows a **"✍️ Write
Numbers — Trace 0–9 with your finger"** tile (only for the numbers module).

---

## 🧒 The experience

```
/learn/numbers -> "Write Numbers ✍️"
  -> "3" appears, speaks "Three!" 🔊
  -> child traces over the dotted 3
       ├─ on path + ~70% -> "Great job!" + ⭐ burst -> next digit
       └─ strays off -> "Try again!" + screen blinks RED 3×, retry
  -> all digits done -> 🎉 + progress saved
```

Exactly the writing experience the letters have — now for numbers too.

---

## 🧪 Running it (after `npm install`)

```bash
npm run dev
# /learn/numbers -> "Write Numbers" -> trace 0–9
```

(Add `/public/audio/numbers/*.mp3` for the spoken digits; silent but functional
without them.)

---

## ✅ Result

Kids can now **write numbers** by tracing them, reusing the entire letter-tracing
engine — proof that the generic trace components (canvas, guide, detection, feedback)
were worth building. Adding *more* traceable glyphs (lowercase letters, symbols) is now
just more stroke data.
