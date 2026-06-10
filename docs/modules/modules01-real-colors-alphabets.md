# 🎨🔤 modules01-real-colors-alphabets

> **Bug fix / feature (post-plan)** — Every module was showing the **Numbers** game.
> This makes the learning view + quiz **content-driven** so Colors shows colors,
> Alphabets shows letters, and Numbers still shows numbers.

---

## 🐞 The bug

The Numbers module was built as the "reusable template", but the other modules' content
was never created. `LearningView` **hard-coded `NumberCard`**, so opening *any* module
(Colors, Alphabets, Animals…) showed numbers + counting apples — just with a different
title and background tint.

> Symptom the user saw: *"When I open a module except Numbers, I still see only Numbers
> games."* Exactly right.

---

## ✅ The fix: content-driven modules

Instead of one hard-coded game, each module now **supplies its items**, and the views
render whatever the module defines.

### 1. Module content — [`src/config/moduleContent.ts`](../../src/config/moduleContent.ts)

```ts
getModuleItems(moduleSlug, range) -> ContentItem[]
```

A `ContentItem` is `{ label, emoji, count, audio }`:

| Module | Items | Example item |
|--------|-------|--------------|
| numbers | the tier's number range | `{ label:"3", emoji:"🍎", count:3, audio:".../3.mp3" }` |
| colors | a palette | `{ label:"Red", emoji:"🔴", count:1, audio:".../red.mp3" }` |
| alphabets | letters | `{ label:"A", emoji:"🍎", count:1, audio:".../a.mp3" }` |

Numbers still "count out" N emoji (`count: n`); colors/letters show one visual. A
module with no content yet returns `[]` → the view shows a friendly "coming soon".

> 🧠 **One switch, many modules.** Adding real content to a module is now editing this
> one file — the views don't change.

### 2. Generic card — [`ItemCard`](../../src/components/learning/ItemCard.tsx)

`NumberCard` generalized: shows an item's big `label` + `count` copies of its `emoji`,
speaks `audio` on tap, with the same bounce/stagger animations. Works for a number, a
color, or a letter.

### 3. Content-driven `LearningView` — [`LearningView.tsx`](../../src/app/learn/[module]/[difficulty]/LearningView.tsx)

```tsx
const items = getModuleItems(moduleSlug, tier.range);
if (items.length === 0) return <ComingSoon />;
// step through items[index] with Back/Next, render <ItemCard item={items[index]} />
```

It now indexes a **list of items** (not a numeric range), so it shows the right content
per module. Empty content → "New games coming soon! 🚧" instead of a broken/wrong view.

### 4. Generic quiz — [`ItemQuiz`](../../src/components/learning/ItemQuiz.tsx)

The Numbers quizzes (count→numeral) don't fit colors/letters. So non-Numbers modules
get a **"match the item" quiz**: show an item's visual + speak it, tap the correct label
among choices. Numbers keeps its bespoke tap + drag rounds.

`QuizRunner` branches on the module:

```tsx
isNumbers
  ? (TapQuiz -> DragDropQuiz)     // count-based, as before
  : <ItemQuiz items={items} />    // generic match-the-item
```

Both paths award stars and save progress through the same `/api/progress`.

---

## 🧒 What each module is now

| Module | Learn | Quiz |
|--------|-------|------|
| 🔢 Numbers | numerals + counted apples (+ "Write Numbers" tracing) | count→numeral tap + drag |
| 🎨 Colors | the color + its name, spoken | tap the color's name |
| 🔤 Alphabets | the letter + a "X is for…" emoji, spoken | tap the letter |
| others (paid) | "coming soon" until content is added | — |

---

## 🧩 Why this was the right fix

The user picked "build real Colors + Alphabets" over a quick "coming soon". This does
that **and** sets up every future module: the engine is now generic, so Animals/Shapes/
Fruits just need entries in `moduleContent.ts`. The fake-numbers-everywhere bug is gone.

> Content to fill in later: the `/public/audio/colors/*.mp3` and the rest of A–Z (the
> alphabet list is a starter set). Silent but fully functional without the audio files.

---

## 🧪 Running it (after `npm install`)

```bash
npm run dev
# /learn/colors    -> red/blue/green... (not numbers!)  -> quiz: tap the color name
# /learn/alphabets -> A/B/C... with picture             -> quiz: tap the letter
# /learn/numbers   -> numbers as before + "Write Numbers"
```

---

## ✅ Result

Modules now show their **own** content. Colors teaches colors, Alphabets teaches
letters, Numbers stays Numbers — all from one content-driven learning view + quiz, with
a graceful "coming soon" for modules not built yet.
