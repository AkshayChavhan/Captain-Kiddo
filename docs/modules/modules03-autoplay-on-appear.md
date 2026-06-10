# 🔊▶️ modules03-autoplay-on-appear

> **Improvement** — Items now **speak automatically when they appear** (audio-first),
> not only when tapped. Tapping still replays the sound.

---

## 🎯 Why

For a 3–6-year-old who can't read, hearing the item the moment it shows is the whole
point of "audio-first". Before, the learning card stayed silent until tapped — which
was inconsistent with the tracing/quiz screens (those already auto-spoke). Now it's
consistent: **appear → speak; tap → replay.**

---

## 🪝 The robust way: autoplay-on-load — [`src/hooks/useSound.ts`](../../src/hooks/useSound.ts)

We added an option to the shared sound hook:

```ts
const play = useSound(src, { autoplay: true });
```

Implementation — play in Howler's **`onload`** callback:

```ts
new Howl({ src: [src], html5: true, preload: true,
  onload: autoplay ? () => howl.play() : undefined });
```

> 🧠 **Why `onload`, not a `useEffect(() => play())`?** A `useEffect` could fire
> *before* the audio file finished loading, so `play()` would be a silent no-op (a
> subtle race). Playing inside `onload` waits until the clip is actually ready — it
> always speaks. This is the reliable "play on appear".

`play` is still returned for **tap-to-replay** (`onClick={() => play()}`), so both
behaviors work from one hook.

---

## 🔁 Applied everywhere that auto-speaks

Four spots used the old `useEffect(() => playX())` pattern; all now use
`{ autoplay: true }` (and their redundant effects + `useEffect` imports were removed):

| Component | Speaks on appear |
|-----------|------------------|
| [`ItemCard`](../../src/components/learning/ItemCard.tsx) | the learning item (number/letter/color/animal/shape/fruit) |
| [`ItemQuiz`](../../src/components/learning/ItemQuiz.tsx) | the quiz prompt (replays per question) |
| [`TraceGlyph`](../../src/components/learning/TraceGlyph.tsx) | the glyph being traced (letters/numbers) |
| [`TraceLetter`](../../src/components/learning/TraceLetter.tsx) | the letter being traced |

Each is keyed by the current item/letter in its parent, so a new item **remounts** the
component → the clip loads → `onload` speaks it. Moving to the next item speaks the next
one automatically.

---

## 🧒 The experience now

```
Card shows 🦁 "Lion"
  -> auto: "Lion!"        (on appear)
Child taps the card
  -> "Lion!" again        (replay)
Next item ➡️ shows 🐶 "Dog"
  -> auto: "Dog!"
```

Same for numbers, letters, colors, shapes, fruits — and the glyphs while tracing.

---

## ✅ Result

Every learning item and quiz prompt now speaks itself the moment it appears (reliably,
via `onload`), with tap-to-replay preserved — true audio-first behavior across the whole
app, from one shared hook option.

> (Still needs the actual `/audio/...` files to make sound — see
> [`modules02`](./modules02-tap-to-speak-all-modules.md) for the paths.)
