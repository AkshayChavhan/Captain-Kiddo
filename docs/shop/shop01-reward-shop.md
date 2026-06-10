# 🛍️ shop01-reward-shop

> **Phase D · Ticket D9** (the last!) — The **reward shop**: kids spend their earned
> `totalStars` to unlock avatars/stickers/themes (the `Unlock` model), deducting from
> their balance atomically. **Completes Phase D.** 🎉

---

## 🎯 Goal

Close the gamification loop. Kids *earn* stars by learning (quizzes); here they *spend*
them on fun cosmetics. This is the **stars** economy — completely separate from the
real-money module purchases.

---

## 💎 Stars, not money (recap)

| | Money flow (pay01–03) | Reward shop (this ticket) |
|--|----------------------|---------------------------|
| Currency | real ₹ (paise) | earned ⭐ stars |
| Buys | learning modules | cosmetics |
| Models | `Payment` + `ModuleAccess` | `Unlock` |
| Risk | real charges | none (in-app points) |

A kid can **never** spend real money — only the stars they earned. That separation is
why the shop is its own model and flow.

---

## 🛒 The catalog — [`src/config/shop.ts`](../../src/config/shop.ts)

```ts
export const SHOP_ITEMS: ShopItem[] = [
  { type: AVATAR,  itemKey: "astronaut", label: "Astronaut", emoji: "🧑‍🚀", starCost: 20 },
  { type: STICKER, itemKey: "rainbow",   label: "Rainbow",   emoji: "🌈",   starCost: 10 },
  { type: THEME,   itemKey: "space",     label: "Space Theme", emoji: "🚀", starCost: 50 },
  // ...
];
```

Items live in config (one-line to add one). `itemKey` is the **stable id** stored in
`Unlock.itemKey` — like module slugs, never change it once live. `starCost` is an
integer (counts, like all our discrete values).

---

## ⚛️ Buying atomically — [`buyWithStars`](../../src/app/parent/shop/actions.ts)

The heart of the ticket. In **one transaction**:

```ts
await prisma.$transaction(async (tx) => {
  const child = await tx.child.findFirst({ where: { id: childId, parentId } }); // scoped
  if (already owned) throw "Already unlocked.";
  if (child.totalStars < item.starCost) throw "Not enough stars.";

  await tx.child.update({ where: { id: childId }, data: { totalStars: { decrement: item.starCost } } });
  await tx.unlock.create({ data: { childId, type, itemKey, starCost: item.starCost } });
});
```

### Why a transaction matters here

The **check** (enough stars? not already owned?) and the **two writes** (deduct stars,
create the unlock) must be inseparable. If they weren't:

- Two rapid taps could both pass the balance check, then both deduct → **double-spend**
  (negative stars, or one item paid twice).

The transaction makes the read-check-write one atomic unit, so a child can't spend
stars they don't have. The `@@unique([childId, type, itemKey])` constraint
(`schema04`) is the final backstop against owning the same item twice.

> 🧠 **Same lesson as payments:** any "check balance, then change balance" operation
> needs to be atomic, or concurrency will eventually corrupt the balance.

### Server decides the cost

```ts
const item = getShopItem(type, itemKey);   // cost from config, not the client
```

Just like real payments: the client says *which item*; the server looks up the
*cost*. A client can't claim a 50-star theme costs 1 star.

### Gated to the parent

The shop action runs behind the **PIN gate** (`isParentAreaUnlocked`) and is scoped to
the parent's own child — consistent with all the other management actions.

---

## 🎨 The UI — [`RewardShop`](../../src/components/parent/RewardShop.tsx)

- The parent **picks which child** is spending (stars belong to a child), shown with
  each child's ⭐ balance.
- The catalog renders as cards: **owned** items show "Owned ✓"; affordable ones show a
  `⭐ cost` buy button; unaffordable ones are disabled/greyed.
- Buying calls `buyWithStars` and `router.refresh()`es so balances + owned state
  update.

```tsx
const owned = new Set(ownedByChild[selected.id] ?? []);   // "type:itemKey" keys
const affordable = selected.totalStars >= item.starCost;
```

---

## 🖥️ Wiring — [`/parent/page.tsx`](../../src/app/parent/page.tsx)

The dashboard fetches every child's existing `Unlock`s and builds an owned-map:

```tsx
const unlocks = await prisma.unlock.findMany({ where: { childId: { in: childIds } }, select: {...} });
// ownedByChild[childId] = ["AVATAR:astronaut", "STICKER:rainbow", ...]
<RewardShop childrenList={shopChildren} ownedByChild={ownedByChild} />
```

So the shop knows each child's balance and what they already own, server-computed.

---

## 🧪 Running it (after `npm install` + a child with stars)

```bash
npm run dev
# /parent -> unlock -> Reward Shop -> pick a child -> buy an item with stars
#   stars deduct, item shows "Owned ✓"; not enough stars -> button disabled
```

---

## ✅ Result — Phase D complete! 🎉

The reward shop lets kids spend earned stars on cosmetics, with the cost resolved
server-side and the balance deduction + unlock done atomically (no double-spend). With
D1–D9 done, the **entire parent + payments + rewards side is finished**:

> PIN gate · child profiles · progress · weak areas · daily goals · Razorpay
> create→checkout→verify · reward shop.

---

## ➡️ Next phase

**Phase E — Alphabet Tracing** (the feature you added): kids trace letters with a
finger, with the screen blinking red 3× on a mistake. Starts with **E1 ·
`trace01-trace-canvas`**.
