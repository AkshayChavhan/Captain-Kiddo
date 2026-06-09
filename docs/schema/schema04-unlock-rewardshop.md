# 🗄️ schema04-unlock-rewardshop

> **Phase A · Ticket A7** — Add the **`UnlockType`** enum and the **`Unlock`** model:
> the reward shop where kids spend **stars** (not money) on cosmetics.

---

## 🎯 Goal

Model the **reward shop**: kids earn ⭐ stars by learning, then spend them on fun
cosmetics (avatars, stickers, themes). This keeps kids motivated — a classic
gamification loop.

---

## 💎 Stars vs Money — two different currencies

This is the key idea to understand. Captain Kiddo has **two separate economies**:

| | **Money (paise)** | **Stars** |
|--|-------------------|-----------|
| Who spends it | The **parent** | The **child** |
| What it buys | Paid learning modules | Cosmetics (avatars, stickers, themes) |
| Models | `Payment` + `ModuleAccess` | `Unlock` |
| Real-world value | Yes (real ₹) | No (earned in-app) |

> 🧠 Keeping them separate means a kid can *never* spend real money — they only ever
> spend the stars they earned. This is exactly why the reward shop is its own model.

---

## 🏷️ The `UnlockType` enum

```prisma
enum UnlockType {
  AVATAR
  STICKER
  THEME
}
```

The three categories of cosmetic rewards. An enum keeps the categories fixed and
typo-proof, just like `Difficulty` and `PaymentStatus` before it.

---

## 🛍️ The `Unlock` model

```prisma
model Unlock {
  type     UnlockType // AVATAR | STICKER | THEME
  itemKey  String     // e.g. "astronaut-avatar"
  starCost Int        // how many stars it cost
  childId  String     @db.ObjectId
  @@unique([childId, type, itemKey])
}
```

### The fields

| Field | Why |
|-------|-----|
| `type` | Which category of cosmetic. |
| `itemKey` | The specific item, e.g. `"astronaut-avatar"`. A string key so adding new items needs no schema change. |
| `starCost` | How many stars it cost — kept as a record (audit trail) of what was paid. |
| `childId` | Which child owns it (cosmetics belong to a kid, not the parent). |

### The `@@unique([childId, type, itemKey])` constraint

A child can't buy the **same item twice**. The database enforces it, so our "buy"
logic stays simple — we don't have to manually check for duplicates.

---

## 🔄 How a purchase will work (preview of `shop01`)

When a kid buys a sticker for 20 stars, the reward-shop logic (built later) will, in
one atomic step:

1. Check `Child.totalStars >= starCost`.
2. Subtract: `totalStars -= starCost`.
3. Create an `Unlock` row recording the item.

The `Unlock` row is the **proof of ownership**; `Child.totalStars` is the **wallet**.
Doing both together (atomically) prevents a kid from "double-spending" stars.

> 💡 Why store `starCost` on the row if the price is known elsewhere? Because prices
> might change later. Recording what was *actually* paid keeps history honest.

---

## 🔗 Back-relation added to `Child`

```prisma
unlocks Unlock[]
```

So from a child we can list every cosmetic they own (to show "your collection" or
apply their chosen avatar/theme).

---

## ✅ Result

The reward shop is now modeled: kids spend earned **stars** on **avatars, stickers,
and themes**, each recorded as an `Unlock` they own — completely separate from the
real-money module-purchase system.

---

## ➡️ Next ticket

**A8 · `schema05-mediacontent-lyric`** — the final schema model: **`MediaContent`**
(songs, lullabies, sleep stories) with an **embedded `Lyric` composite type** for
synced karaoke-style sing-along lyrics.
