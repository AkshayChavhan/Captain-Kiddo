# 🔊 modules02-tap-to-speak-all-modules

> **Feature** — Every tappable item in every module speaks its name: numbers say
> "one/two…", letters their name, colors the color, and **animals/shapes/fruits say
> the animal/shape/fruit name**.

---

## 🎯 Goal

Audio-first learning across *all* modules. A child taps a lion → hears "Lion"; taps a
triangle → hears "Triangle"; taps a banana → hears "Banana". Same for numbers, letters,
and colors.

---

## ✅ The mechanism already existed

`ItemCard` (from the content-driven fix) already speaks an item on tap:

```tsx
const play = useSound(item.audio);
<motion.button onClick={() => play()}>...</motion.button>
```

So the only thing missing was **content + audio paths** for the modules that were still
empty (Animals, Shapes, Fruits showed "coming soon"). This ticket fills those in.

---

## 🗂️ A shared name-audio helper — [`src/config/audio.ts`](../../src/config/audio.ts)

```ts
nameAudio("animals", "lion") -> "/audio/animals/lion.mp3"
```

One helper for all word-based modules (animals, shapes, fruits, colors). The `key` is a
stable, lowercase, file-safe id that becomes the audio filename.

---

## 🐾 Content for Animals, Shapes, Fruits — [`moduleContent.ts`](../../src/config/moduleContent.ts)

Each is a list of `{ key, label, emoji }` entries, mapped to speak-on-tap items:

```ts
export const ANIMALS = [
  { key: "lion", label: "Lion", emoji: "🦁" },
  { key: "dog",  label: "Dog",  emoji: "🐶" }, ...
];
// + SHAPES (circle, square, triangle, star, heart, diamond)
// + FRUITS (apple, banana, grapes, orange, strawberry, watermelon)
```

A small helper maps any word-list to content items that speak their name:

```ts
function wordItems(module, entries) {
  return entries.map((e) => ({
    label: e.label, emoji: e.emoji, count: 1,
    audio: nameAudio(module, e.key),   // taps -> speaks the name
  }));
}
```

And `getModuleItems` now handles them:

```ts
case "animals": return wordItems("animals", ANIMALS);
case "shapes":  return wordItems("shapes", SHAPES);
case "fruits":  return wordItems("fruits", FRUITS);
```

Colors was also switched to the same `nameAudio("colors", key)` helper for consistency.

---

## 🔊 What speaks now, by module

| Module | Tap an item → hear |
|--------|--------------------|
| 🔢 Numbers | "One", "Two", "Three"… (`/audio/numbers/3.mp3`) |
| 🔤 Alphabets | "A", "B", "C"… (`/audio/letters/a.mp3`) |
| 🎨 Colors | "Red", "Blue"… (`/audio/colors/red.mp3`) |
| 🐾 Animals | "Lion", "Dog"… (`/audio/animals/lion.mp3`) |
| 🔺 Shapes | "Circle", "Triangle"… (`/audio/shapes/circle.mp3`) |
| 🍎 Fruits | "Apple", "Banana"… (`/audio/fruits/apple.mp3`) |

Their **quizzes** also speak the prompt (the generic `ItemQuiz` plays the item's audio),
so the whole experience is audio-first.

---

## 🎙️ The audio files you need to add

The code references these paths; drop matching `.mp3` files under `/public/audio/...`:

```
public/audio/numbers/1.mp3 … 20.mp3
public/audio/letters/a.mp3 … z.mp3
public/audio/colors/red.mp3, blue.mp3, …
public/audio/animals/lion.mp3, dog.mp3, …
public/audio/shapes/circle.mp3, square.mp3, …
public/audio/fruits/apple.mp3, banana.mp3, …
```

> Until a clip exists, that tap is silently a no-op (`useSound` handles missing files
> safely) — everything else still works. The **filenames must match the `key`s** in
> `moduleContent.ts`.

> 💡 You can record these, or generate them with a text-to-speech tool, naming each
> file after its key.

---

## ✅ Result

Every item in every module now speaks its name on tap — numbers, letters, colors,
animals, shapes, and fruits — using one shared `nameAudio` helper and per-module content
lists. Adding more items (or a new module) is just more entries + matching audio files.
