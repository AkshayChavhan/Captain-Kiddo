# 🔊 numbers03-howler-audio-taps

> **Phase B · Ticket B4** — Make the number card **talk**: tapping it plays the
> number's sound with **Howler.js** (the "audio-first" core of the app).

---

## 🎯 Goal

Kids aged 3–6 often can't read, so **sound is how they learn**. Tapping the big "3"
should say *"Three!"*. This ticket adds a reusable audio hook and wires it into the
`NumberCard`.

---

## 🪝 The reusable `useSound` hook — [`src/hooks/useSound.ts`](../../src/hooks/useSound.ts)

A tiny wrapper around Howler so any component can play a short clip:

```ts
const play = useSound("/audio/numbers/3.mp3");
<button onClick={play}>Play</button>
```

### Why a hook instead of `new Howl()` inline?

Creating `new Howl(...)` on every render would pile up audio objects (a memory
leak). The hook:

1. **Lazily creates one `Howl` per `src`**, stored in a `useRef` (survives renders).
2. **Reloads only when `src` changes** (the `useEffect` dependency).
3. **Cleans up** (`howl.unload()`) when the component unmounts or `src` changes.

```ts
useEffect(() => {
  if (!src) return;                       // null src -> no-op (safe before files exist)
  const howl = new Howl({ src: [src], html5: true, preload: true });
  howlRef.current = howl;
  return () => { howl.unload(); };        // cleanup
}, [src]);
```

### Why `html5: true`?

HTML5 audio **streams** the file instead of fully decoding it into memory up front.
For lots of tiny clips on a phone, that's lighter and faster to start.

### The `play` function

```ts
const play = useCallback(() => {
  howl.stop();   // restart cleanly if tapped rapidly
  howl.play();
}, []);
```

`stop()` before `play()` means rapid taps **restart** the sound instead of stacking
overlapping copies. `useCallback` keeps the function reference stable.

---

## 🗂️ Audio paths in one place — [`src/config/audio.ts`](../../src/config/audio.ts)

```ts
export function numberAudio(value: number): string {
  return `/audio/numbers/${value}.mp3`;
}
export const FEEDBACK_AUDIO = {
  correct: "/audio/feedback/great-job.mp3",
  wrong:   "/audio/feedback/try-again.mp3",
};
```

Components ask for *"the sound for number 3"* — they don't hard-code paths. If we
reorganize `/public/audio` later, we edit **this file only**.

> 🎵 **You need to add the actual `.mp3` files** under `public/audio/...`. Until
> then taps are silent (the hook safely does nothing for a missing/null clip; the
> browser may just log a load warning — it won't crash).

---

## 🔌 Wiring it into `NumberCard`

```tsx
const playNumber = useSound(numberAudio(value)); // load "/audio/numbers/<value>.mp3"

const handleTap = () => {
  playNumber();  // speak the number, e.g. "Three!"
  onTap?.();     // still run any caller-provided handler
};
```

Tapping the card now **speaks the number first**, then runs any extra `onTap`
behavior a parent component passes. The card is "audio-first" by default, and still
composable.

---

## 🧹 Self-review cleanups (done this ticket)

While wiring audio, the editor flagged two lint rules, which I fixed across all the
components written so far — a good habit before the pile of code grows:

| Rule | Fix |
|------|-----|
| **No array index as React `key`** | Build stable keys (`obj-0`, `obj-1`, …) instead of `key={i}`. Index keys can cause subtle bugs when lists reorder. |
| **Mark component props read-only** | Wrap prop types in `Readonly<{ ... }>`. Props should never be mutated; this makes that explicit. |

> 🧠 **Why bother?** These are cheap to fix now and prevent real bugs later
> (index-keys) or accidental prop mutation. Keeping the code lint-clean as we go is
> easier than a big cleanup at the end.

---

## 🧪 Running it (after `npm install` + adding audio files)

```bash
npm run dev
# /learn/numbers/easy -> tap the number card -> it says the number
```

---

## ✅ Result

The Numbers learning view is now **audio-first**: tapping a number speaks it, powered
by a clean, reusable `useSound` hook that the quizzes and media players will reuse
too.

---

## ➡️ Next ticket

**B5 · `numbers04-framer-animations`** — add Framer Motion bounce/scale animations to
the number card and transitions, so numbers pop in playfully as kids move through
them.
