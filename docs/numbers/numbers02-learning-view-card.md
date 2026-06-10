# 🔢 numbers02-learning-view-card

> **Phase B · Ticket B3** — Build the learning view: a **big number card** with an
> **object-counting visual** (number 3 = 🍎🍎🍎), plus simple Back/Next navigation
> through the tier's range.

---

## 🎯 Goal

This is the heart of the Numbers lesson. A pre-reader sees a number **two ways at
once** — the symbol and the quantity — so they connect "3" with *three things*.

---

## 🗺️ Where this lives

```
/learn/numbers/easy   ->  src/app/learn/[module]/[difficulty]/page.tsx  (server)
                          src/app/learn/[module]/[difficulty]/LearningView.tsx (client)
                          src/components/learning/NumberCard.tsx (client)
```

The TierCard from `numbers01` links here. Now both dynamic segments are used:
`[module]` (e.g. `numbers`) **and** `[difficulty]` (e.g. `easy`).

---

## 🃏 `NumberCard` — the core visual

```tsx
const items = Array.from({ length: value }); // make `value` objects
...
<div className="text-8xl ...">{value}</div>   // the big numeral
<div className="flex flex-wrap ...">
  {items.map((_, i) => <span key={i}>🍎</span>)} // that many apples
</div>
```

### The key trick: turning a number into that many objects

```ts
Array.from({ length: value })
```

This makes an array with `value` empty slots, which we `.map()` into `value` emoji.
So `value = 3` renders three apples. For bigger numbers the row **wraps** to multiple
lines (`flex-wrap`), so even "20" looks tidy.

### Accessibility & audio hook

- The card is a real `<button>` with `aria-label={"Number 3"}` — screen-reader and
  semantically tappable.
- It accepts an optional `onTap` prop. **Audio isn't wired yet** (that's `numbers03`);
  `onTap` is the hook the audio ticket will use to play "Three!" when tapped.
- The counting emoji is swappable via an `emoji` prop (defaults to 🍎), so other
  modules/themes can count with different objects.

---

## 🖥️ `LearningView` — stepping through the numbers

A **client component** (it holds the "current number" in `useState`):

```tsx
const from = tier.range?.from ?? 1;  // Easy -> 1
const to   = tier.range?.to   ?? 5;  // Easy -> 5
const [current, setCurrent] = useState(from);
```

It reads the **range from the tier config** (`tiers.ts`): Easy is 1–5, Medium 1–10,
Hard 1–20. Then it shows:

- a **back arrow** to return to the tier list,
- a **progress label** (`🌱 Easy · 3 / 5`),
- the **`NumberCard`** for the current number,
- big **Back / Next** buttons that clamp to the range and disable at the ends.

```tsx
onClick={() => setCurrent((n) => Math.min(to, n + 1))} // Next, never past `to`
disabled={isLast}                                       // grey out at the end
```

> 🧠 `Math.max`/`Math.min` **clamp** the value so the child can't go below `from` or
> above `to` — simple, bug-proof bounds.

---

## 🧭 The page (server component) — validating the URL

```tsx
const module = getModule(params.module);
if (!module) notFound();

const difficulty = Difficulty[params.difficulty.toUpperCase()]; // "easy" -> EASY
if (!difficulty) notFound();

const tier = getTier(difficulty);
return <LearningView moduleSlug={params.module} tier={tier} />;
```

The page is a **server component** so it can `notFound()` (404) on a bad URL *before*
any client JavaScript loads. It does two validations:

1. Is `params.module` a real module? (`getModule`)
2. Is `params.difficulty` a real tier? We uppercase the URL segment (`"easy"` →
   `"EASY"`) and look it up on the `Difficulty` enum.

Then it passes the validated tier down to the client `LearningView`.

> 🧠 **The server/client split again:** the page (server) validates + 404s; the view
> (client) handles interactive state. Each does what it's best at.

---

## ♻️ Still a template

`NumberCard` is Numbers-specific, but the **structure** (a page that validates →
hands to a client view that steps through tier content) is the pattern every module
reuses. Alphabets would swap `NumberCard` for a `LetterCard`; everything else stays.

---

## 🧪 Running it (after `npm install`)

```bash
npm run dev
# /learn/numbers        -> tap "Easy"
# /learn/numbers/easy   -> see "1" with 🍎, tap Next to walk 1..5
```

---

## ✅ Result

Kids can open a tier and step through its numbers, each shown as a big numeral **and**
a matching count of objects — the central "see the number, see the quantity" lesson.

---

## ➡️ Next ticket

**B4 · `numbers03-howler-audio-taps`** — make the number card **talk**: tapping it
plays the number's sound with Howler (audio-first learning), wiring into the `onTap`
hook we added today.
