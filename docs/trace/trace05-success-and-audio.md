# 🎉 trace05-success-and-audio

> **Phase E · Ticket E5** — The success side: a celebration when the letter is traced
> correctly, plus audio-first letter sound + encouraging voice guidance.

---

## 🎯 Goal

Reward a good trace. When the child successfully traces the letter, they hear "Great
job!" and get a star-burst. And throughout, the experience is **audio-first** — the
letter speaks its name, since kids can't read.

---

## 🗣️ Audio-first — [`src/config/audio.ts`](../../src/config/audio.ts)

```ts
letterAudio("A") -> "/audio/letters/a.mp3"
```

We added a letter-audio path helper (alongside `numberAudio`). The `TraceLetter`
component:

- **Speaks the letter when it appears** (`useEffect` on mount) — so even a non-reader
  knows which letter to trace.
- **Lets the child tap the title** to hear it again (the "Trace the A! 🔊" button).
- Plays **"Great job!"** on success and **"Try again!"** on an off-path mistake —
  reusing the same `FEEDBACK_AUDIO` + `useSound` from the Numbers module.

> 🧠 **Reuse:** `useSound` (numbers03) and `FEEDBACK_AUDIO` work here unchanged — the
> tracing feature didn't need a new audio system, just the existing one. (Add the
> `/audio/letters/*.mp3` files; until then it's silent but everything else works.)

---

## ✅ Real success scoring — `traceCoverage` in [`src/lib/trace.ts`](../../src/lib/trace.ts)

E4 counted "stayed on path" as success. But a child could dab a tiny on-path mark and
"pass". So E5 adds **coverage**: did they trace *most of the whole letter*?

```ts
traceCoverage(drawn, strokes) -> 0..1
```

### How it works

1. **Sample points evenly along the guide** (6 per segment) — a set of points that
   represent "the whole letter".
2. For each sample, check if **any drawn point** is nearby (within tolerance).
3. Coverage = fraction of guide samples that were covered.

```ts
const covered = samples.filter((s) => nearestDistance(s, drawn) <= tolerance).length;
return covered / samples.length;
```

Then success requires **both**:

```ts
if (!wentOff && traceCoverage(path, scaled) >= 0.7) { /* success! */ }
```

- `!wentOff` — they never strayed off the letter (E3/E4), **and**
- `coverage >= 0.7` — they actually traced ~70%+ of it.

> 🧠 **Why 70%, not 100%?** Demanding a perfect trace would frustrate a 3-year-old.
> 70% means "you traced essentially the whole letter" while forgiving small gaps. A
> tunable middle-ground, same spirit as the forgiving on-path tolerance.

---

## 🎊 The celebration

On success we reuse the **`Celebration`** star-burst and **`useCelebration`** hook from
the Numbers module (`numbers07`):

```tsx
const { celebrating, celebrate } = useCelebration();
...
playGreat();   // "Great job!"
celebrate();   // ⭐ star-burst
onComplete?.(); // tell the parent flow (E6) this letter is done
```

So a correct trace = encouraging voice + the same joyful star-burst kids already know
from quizzes. Consistent rewards across the app.

### Guards against double-firing

```tsx
const doneRef = useRef(false);   // this letter already completed?
if (doneRef.current || wentOffRef.current) return;
```

Refs ensure success fires **once** per letter and that a failed attempt can't also
register success.

---

## 🧩 The full single-letter experience now

```
letter appears -> speaks its name 🔊
child traces:
  ├─ on path + covers ~70%+  -> "Great job!" + ⭐ burst -> onComplete
  └─ strays off the path     -> "Try again!" + screen blinks red 3x (E4)
```

Everything for **one** letter is done. The only thing left is sequencing **many**
letters and saving progress — that's E6.

---

## 🧪 Using it (preview)

```tsx
<TraceLetter letter="A" onComplete={() => goToNextLetter()} />
```

---

## ✅ Result

A correct trace now celebrates with voice + a star-burst, success requires really
tracing the letter (coverage, not a dab), and the whole thing is audio-first — the
letter speaks itself. One letter is a complete, joyful mini-experience.

---

## ➡️ Next ticket

**E6 · `trace06-letter-flow-progress`** (the last!) — sequence letters one-at-a-time
into a full activity and save tracing progress, completing the alphabet-tracing feature
and the whole plan.
