# 🗂️ setup05-module-registry

> **Phase A · Ticket A10** — Build the central **module registry** at
> [`src/config/modules.ts`](../../src/config/modules.ts): one array describing every
> learning module, so adding a new module is a **one-line change**.

---

## 🎯 Goal

Have **one place** that lists every learning module and its metadata. The home grid,
paywall, access checks, and screens all read from here — so adding "Vehicles" later
means adding *one line*, not editing ten files.

---

## 💡 The idea: configuration over duplication

Imagine the module info (name, emoji, price, free-or-paid) were sprinkled across the
home page, the paywall, the access logic, etc. Adding a module would mean hunting
down every spot. Bugs guaranteed.

Instead we keep a **single registry**. This is the *"single source of truth"*
principle: define a fact **once**, read it **everywhere**.

---

## 🧱 The `ModuleConfig` shape

```ts
export interface ModuleConfig {
  slug: string;         // stable id used in DB + URLs, e.g. "numbers"
  title: string;        // kid-facing name, e.g. "Numbers"
  emoji: string;        // big friendly icon, e.g. "🔢"
  color: string;        // theme color (hex) for the card/screens
  isFree: boolean;      // playable without payment?
  priceInPaise: number; // 0 if free; 500 (= ₹5) if paid
}
```

### ⭐ Why `slug` is special

The `slug` (e.g. `"numbers"`) is the **stable identifier**. It's:
- stored in the database (the `module` field on `Progress`, `ModuleAccess`, etc.),
- used in URLs (`/learn/numbers`).

> ⚠️ **Never change a slug once the app is live** — it would orphan every saved
> progress row and access record tied to the old slug. The `title` (display name)
> can change freely; the `slug` cannot.

### 💰 `priceInPaise`, not `price`

Following the golden money rule: prices are **integer paise**. Free modules are `0`;
paid ones are `500` (₹5). No floats, ever.

---

## 📋 The registry itself

```ts
export const MODULES: ModuleConfig[] = [
  // FREE starter modules
  { slug: "numbers",   title: "Numbers",   emoji: "🔢", color: "#FF6B6B", isFree: true,  priceInPaise: 0 },
  { slug: "alphabets", title: "Alphabets", emoji: "🔤", color: "#4ECDC4", isFree: true,  priceInPaise: 0 },
  { slug: "colors",    title: "Colors",    emoji: "🎨", color: "#FFD93D", isFree: true,  priceInPaise: 0 },
  // PAID modules (₹5 each)
  { slug: "animals",   title: "Animals",   emoji: "🐾", color: "#6C5CE7", isFree: false, priceInPaise: 500 },
  { slug: "shapes",    title: "Shapes",    emoji: "🔺", color: "#00B894", isFree: false, priceInPaise: 500 },
  { slug: "fruits",    title: "Fruits",    emoji: "🍎", color: "#E17055", isFree: false, priceInPaise: 500 },
];
```

The first three (Numbers, Alphabets, Colors) are **free** per the business model.
The rest cost **₹5**. To add a module, copy a line and edit the values. Done.

> The paid modules listed (Animals, Shapes, Fruits) are examples — add/remove freely.

---

## 🔢 Shared price constants

```ts
export const PAID_MODULE_PRICE_IN_PAISE = 500;  // ₹5
export const BUNDLE_PRICE_IN_PAISE      = 3900; // ₹39 "unlock all"
export const BUNDLE_SLUG                = "ALL";
```

We name these instead of hard-coding `500`/`3900` in many files. If a price ever
changes, we edit it **once**. `BUNDLE_SLUG = "ALL"` matches the special slug our
`ModuleAccess`/`Payment` models use for the bundle (from `schema03`).

---

## 🔎 Convenience lookups

```ts
export function getModule(slug: string): ModuleConfig | undefined { ... }
export function getFreeModules(): ModuleConfig[] { ... }
export function getPaidModules(): ModuleConfig[] { ... }
```

- `getModule("numbers")` → that module (or `undefined`). Backed by a slug→module map
  for fast O(1) lookups.
- `getFreeModules()` / `getPaidModules()` → filter helpers the UI uses to show the
  free vs locked sections of the grid.

These keep other files clean — they ask the registry questions instead of
re-scanning the array themselves.

---

## 🔗 How this connects to everything else

| Reads the registry | Uses it for |
|--------------------|-------------|
| Home grid (later) | Render a card per module (emoji, title, color). |
| Access helpers (A11) | Look up `isFree` / `priceInPaise` for a slug. |
| Paywall / checkout (Phase D) | Show price, build the Razorpay order. |
| Learning modules (Phase B) | The `slug` ties screens + progress together. |

---

## ✅ Result

There's now **one tidy list** describing every module. Adding "Vehicles 🚗" later is
genuinely a one-line change, and price/free-status stays consistent everywhere
because everyone reads the same source.

---

## ➡️ Next ticket

**A11 · `setup06-access-helpers`** — write `canAccessModule(parentId, module)` and
`unlockedDifficulties(childId, module)`: the functions that enforce *who can play
what* and *which tiers are unlocked*, using the schema + this registry.
