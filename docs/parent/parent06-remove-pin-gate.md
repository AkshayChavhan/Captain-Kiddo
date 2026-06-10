# 🔓 parent06-remove-pin-gate

> **Change** — Remove the parent PIN entirely. The **slide gesture** is now the only
> kid-resistance: once a (logged-in) parent slides in, they get the dashboard
> directly.

---

## 🎯 Why

The PIN was a second lock on top of login. With the deliberate **slide-to-open**
gesture (`SlideToParent`) already keeping toddlers out, the PIN was redundant friction.
Now: **slide → (must be logged in) → dashboard.** No PIN to set, enter, or forget.

---

## 🧹 What was removed

| Deleted | Was |
|---------|-----|
| `src/components/parent/PinPad.tsx` | the 4-digit PIN entry UI |
| `src/app/parent/actions.ts` | submitPin / setPin / lockParent server actions |
| `src/lib/parentSession.ts` | the "area unlocked" cookie (isParentAreaUnlocked) |
| `src/lib/pin.ts` | hashPin / verifyPin (PIN-specific wrappers) |

> `src/lib/hash.ts` (the shared `hashSecret`/`verifySecret`) **stays** — login still
> uses it for passwords. Only the PIN-specific wrapper went.
> `Parent.pinHash` stays in the schema as an unused optional field (harmless; removing
> it would need a `db push`).

---

## 🔁 What changed (the gate is now just "logged in")

Everywhere that checked `isParentAreaUnlocked()` (the PIN), the guard is now simply a
logged-in parent (`getActiveParentId()`), which those spots already checked:

| File | Before | After |
|------|--------|-------|
| `/parent/page.tsx` | login → PIN pad → dashboard | login → **dashboard** |
| `children/actions.ts` | unlocked + parent | **parent** |
| `shop/actions.ts` | unlocked + parent | **parent** |
| `api/payments/create-order` | unlocked + parent | **parent** |

So the server still enforces "must be a logged-in parent" on every sensitive action —
just not a separate PIN.

---

## 🛡️ Is it still kid-safe?

Yes — the protection moved, it didn't disappear:

1. **The slide gesture** (`SlideToParent`) — a toddler poking the screen can't open the
   grown-up area; it takes a deliberate left-to-right drag.
2. **Login** — the dashboard (and checkout, profiles, shop) still require being logged
   in, enforced server-side.

What's gone is only the *extra* 4-digit step after that.

---

## ✅ Result

`/parent` shows the dashboard directly for a logged-in parent who slides in. No PIN
anywhere — simpler for parents, still protected by the slide + login.
