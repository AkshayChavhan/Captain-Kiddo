# ✏️ numbers05-quiz-tap-answer

> **Phase B · Ticket B6** — The first quiz type: **tap the correct answer**. Show a
> quantity (🍎🍎🍎) and let the child tap the matching number, earning ⭐ stars.

---

## 🎯 Goal

Turn passive learning into active practice. The child sees a count of objects and
taps the number that matches. Correct → a star + "Great job!"; wrong → a gentle
"Try again!" with a little red shake, then they retry.

---

## 🗺️ Where this lives

```
/learn/numbers/easy/quiz   ->  .../quiz/page.tsx        (server: validates URL)
                               .../quiz/QuizRunner.tsx  (client: drives the session)
                               src/components/learning/TapQuiz.tsx (the quiz UI)
src/store/quizStore.ts         (Zustand: live star/score tally)
src/lib/quiz.ts                (pure question generator)
```

The learning view now shows a **"Quiz ✏️"** button when the child reaches the last
number — a natural "you've seen them all, now try!" flow.

---

## 🧮 The question generator — [`src/lib/quiz.ts`](../../src/lib/quiz.ts)

A **pure function** (no React, no DB) that builds one question:

```ts
makeTapQuestion(from, to, optionCount = 3) -> { answer, options }
```

- Picks a random `answer` in the tier range.
- Adds distinct random **distractors** until there are `optionCount` choices.
- **Shuffles** them (Fisher–Yates) so the answer isn't always in the same spot.

```ts
// Fisher–Yates shuffle
for (let i = arr.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [arr[i], arr[j]] = [arr[j], arr[i]];
}
```

> 🧠 **Why keep it pure?** Pure functions are easy to reason about and test — same
> input, same output, no side effects. The randomness is *injected* (`rand =
> Math.random` by default), so a test could pass a fixed `rand` to make it
> deterministic. Logic like this stays out of components on purpose.

---

## ⭐ The Zustand store — [`src/store/quizStore.ts`](../../src/store/quizStore.ts)

A tiny global store for the **current quiz session**:

```ts
const useQuizStore = create<QuizState>((set) => ({
  stars: 0, answered: 0, correct: 0,
  addCorrect: () => set((s) => ({ stars: s.stars+1, answered: s.answered+1, correct: s.correct+1 })),
  addWrong:   () => set((s) => ({ answered: s.answered+1 })),
  reset:      () => set({ stars: 0, answered: 0, correct: 0 }),
}));
```

### Why Zustand here?

The star tally needs to be readable by several pieces (the quiz, the header, the
finish screen) without **prop-drilling** it through every component. Zustand gives a
global store with almost no boilerplate:

```ts
const stars = useQuizStore((s) => s.stars);     // read just what you need
const addCorrect = useQuizStore((s) => s.addCorrect); // grab an action
```

> 🧠 This is an **in-memory, session-only** tally — it drives the UI live. Persisting
> the final result to the database (and awarding `Child.totalStars`) happens in
> `numbers08`. Keeping the live tally and the saved result separate keeps each simple.

---

## 🃏 The quiz UI — [`TapQuiz.tsx`](../../src/components/learning/TapQuiz.tsx)

Shows the quantity, asks "How many?", and renders the number choices:

```tsx
const handlePick = (picked) => {
  if (picked === question.answer) {
    playCorrect(); addCorrect();        // ⭐ + "Great job!"
    setSolved(solved + 1);              // advance -> effect builds next question
    if (next >= QUESTIONS_PER_QUIZ) onFinish?.();
  } else {
    playWrong(); addWrong();            // "Try again!"
    setWrongPick(picked);               // flash this option red + shake
    setTimeout(() => setWrongPick(null), 600);
  }
};
```

### Wrong-answer feedback (kid-appropriate)

A wrong tap **shakes** the chosen button and turns it red briefly — never a scary
"WRONG", just a clear "not that one, try again":

```tsx
animate={isWrong ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}  // a quick wiggle
className={`kiddo-btn ${isWrong ? "bg-kiddo-red" : "bg-kiddo-purple"}`}
```

### Advancing questions

When `solved` increases, a `useEffect` keyed on `solved` builds the **next**
question. After `QUESTIONS_PER_QUIZ` (5) correct answers, `onFinish()` fires.

> 🔊 Feedback sounds use the same `useSound` hook from `numbers03` with
> `FEEDBACK_AUDIO.correct` / `.wrong`. (Add those mp3s under `public/audio/feedback/`;
> until then taps are silent but everything else works.)

---

## 🧭 The runner & route

- **`QuizRunner.tsx`** (client) — `reset()`s the store on mount, renders `TapQuiz`,
  and on finish shows a 🎉 celebration with the star total + a "Done" link back to
  the tiers.
- **`quiz/page.tsx`** (server) — validates `module` + `difficulty` from the URL (same
  pattern as the learning page) and 404s on bad URLs before handing off.

> ⚠️ **Not yet wired:** saving the result + unlocking the next tier (that's
> `numbers08`). For now finishing just celebrates and returns to the tier list.

---

## ♻️ Template note

`TapQuiz` counts with 🍎 and asks "How many?", which is Numbers-specific — but the
**structure** (pure generator → Zustand tally → quiz component → runner → validated
route) is the reusable quiz skeleton every module copies.

---

## ✅ Result

Kids can now take a "tap the matching number" quiz: bright choices, star rewards,
encouraging audio, and gentle shake-and-retry on mistakes — with a clean separation
between question logic, live tally, and UI.

---

## ➡️ Next ticket

**B7 · `numbers06-quiz-drag-drop`** — the second quiz type: **drag-and-drop matching**
(drag a numeral onto the group with the right quantity).
