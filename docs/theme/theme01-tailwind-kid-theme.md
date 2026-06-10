# 🎨 theme01-tailwind-kid-theme

> **Phase B · Ticket B1** — Build the kid-friendly **Tailwind theme**: bright
> colors, rounded shapes, big tap targets, and playful animations that every
> screen will reuse.

---

## 🎯 Goal

Establish the **visual design language** once, in the Tailwind config, so every
screen we build after this automatically looks consistent and kid-appropriate.

---

## 🧒 The kid-UX rules driving these choices

From the project brief: *large tap targets, bright colors, rounded shapes,
celebratory animations* — because the users are **3–6 years old** and often **can't
read**. So the design must be:

| Rule | How the theme delivers it |
|------|---------------------------|
| Bright colors | A `kiddo` color palette |
| Rounded shapes | Big `borderRadius` values (`kiddo`, `blob`) |
| Large tap targets | `min-w-tap` / `min-h-tap` (64px minimum) |
| Celebratory motion | `bounceIn` + `wiggle` animations |

---

## 🌈 The color palette

```ts
colors: {
  kiddo: {
    red: "#FF6B6B", teal: "#4ECDC4", yellow: "#FFD93D", purple: "#6C5CE7",
    green: "#00B894", orange: "#E17055", pink: "#FD79A8", blue: "#74B9FF",
  },
},
```

These become Tailwind classes like `bg-kiddo-red`, `text-kiddo-purple`,
`border-kiddo-teal`. The colors **match the module registry** (`setup05`) so a
module's card color and its screens stay visually in sync.

---

## ⭕ Rounded shapes

```ts
borderRadius: {
  kiddo: "1.5rem", // friendly roundness for cards/buttons
  blob: "2.5rem",  // extra-round for big playful surfaces
},
```

Sharp corners feel "serious/corporate"; round corners feel soft and friendly — right
for little kids. Use `rounded-kiddo` on buttons/cards and `rounded-blob` on large
surfaces.

---

## 👆 Big tap targets

```ts
minWidth:  { tap: "4rem" }, // 64px
minHeight: { tap: "4rem" },
```

Apple/Google recommend ~44–48px minimum touch targets. For **kids**, bigger is
better — small fingers, developing motor control. `min-w-tap min-h-tap` guarantees
a button is never too small to press.

---

## ✨ Playful animations

```ts
keyframes: {
  bounceIn: { "0%": {scale .3, opacity 0}, "60%": {scale 1.1, opacity 1}, "100%": {scale 1} },
  wiggle:   { "0%,100%": {rotate -3deg}, "50%": {rotate 3deg} },
},
animation: {
  bounceIn: "bounceIn 0.5s ease-out",   // pop something in (rewards, cards)
  wiggle:   "wiggle 0.4s ease-in-out infinite", // playful "press me!" hint
},
```

Use `animate-bounceIn` when something appears (a star, a card) and `animate-wiggle`
to draw attention. (For richer, interactive animations we'll use **Framer Motion**
later; these CSS ones are the lightweight baseline.)

---

## 🔤 Playful font (placeholder)

```ts
fontFamily: {
  kiddo: ["var(--font-kiddo)", "Comic Sans MS", "system-ui", "sans-serif"],
},
```

`font-kiddo` is ready for a real rounded display font later (loaded via
`next/font`, which sets the `--font-kiddo` CSS variable). For now it falls back to
friendly system fonts.

---

## 🧱 Reusable component classes — [`globals.css`](../../src/app/globals.css)

Two classes save us from repeating the same utilities everywhere:

```css
@layer components {
  .kiddo-btn  { @apply min-w-tap min-h-tap rounded-kiddo px-6 py-4 text-2xl
                       font-bold text-white shadow-lg transition-transform active:scale-95; }
  .kiddo-card { @apply rounded-blob bg-white p-6 shadow-xl; }
}
```

- **`.kiddo-btn`** — the standard big, round, bouncy button. `active:scale-95` gives
  a satisfying "press" feel. Add a color with `bg-kiddo-red` etc.
- **`.kiddo-card`** — a soft white rounded surface for grouping content.

`@apply` lets us bundle Tailwind utilities into one class — used inside
`@layer components` so it slots into Tailwind's ordering correctly.

---

## 📱 App-feel base tweaks — [`globals.css`](../../src/app/globals.css)

```css
@layer base {
  html, body {
    user-select: none;                    /* no text selection for kids */
    -webkit-tap-highlight-color: transparent; /* no blue tap flash */
    overscroll-behavior: none;            /* no pull-to-refresh / bounce */
  }
}
```

These small touches make the web app **feel like a native app** — no accidental text
selection, no jarring tap highlights, no rubber-band scrolling.

---

## 🧪 Using the theme (example)

```tsx
<button className="kiddo-btn bg-kiddo-purple animate-bounceIn">
  Play! 🎮
</button>

<div className="kiddo-card">
  <h2 className="font-kiddo text-kiddo-red text-3xl">Numbers</h2>
</div>
```

---

## ✅ Result

A consistent, kid-friendly design language is now available everywhere as Tailwind
classes. Every screen in Phase B and beyond can use `kiddo-*` colors, `rounded-kiddo`,
`min-*-tap`, `animate-bounceIn`, `.kiddo-btn`, and `.kiddo-card` for instant
consistency.

---

## ➡️ Next ticket

**B2 · `numbers01-module-home-tiers`** — the Numbers module home screen showing the
three difficulty tiers (Easy/Medium/Hard) with 🔒 locks on tiers the child hasn't
unlocked yet (using `unlockedDifficulties` from A11).
