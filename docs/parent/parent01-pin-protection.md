# 🔐 parent01-pin-protection

> **Phase D · Ticket D1** — The **parent PIN gate**: a 4-digit PIN that protects the
> parent area (and, later, checkout) so kids can't make purchases.

---

## 🎯 Goal

Lock the grown-up area behind a PIN. A child tapping around must **not** be able to
reach the dashboard or trigger a payment. The PIN check must be **server-side and
safe** — never trusting the browser.

> ⚠️ **Security ticket.** This is the first of Phase D's sensitive work. The choices
> below (hashing, server-only, cookie session) are deliberate; they're called out so
> you can review them.

---

## 🧂 Hashing the PIN — [`src/lib/pin.ts`](../../src/lib/pin.ts)

We **never store the PIN in plain text**. We hash it with Node's built-in **scrypt**
(no extra dependency) and store `"salt:hash"`:

```ts
export async function hashPin(pin) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scryptAsync(pin, salt, 64);
  return `${salt}:${derived.toString("hex")}`;
}
```

Verifying re-derives the hash from the entered PIN + stored salt and compares **in
constant time**:

```ts
export async function verifyPin(pin, stored) {
  const [salt, hashHex] = stored.split(":");
  const derived = await scryptAsync(pin, salt, 64);
  return timingSafeEqual(derived, Buffer.from(hashHex, "hex"));
}
```

Two security details:

- **Salt** — a random per-PIN value so identical PINs hash differently (defeats
  precomputed/rainbow-table attacks).
- **`timingSafeEqual`** — compares in constant time so an attacker can't learn the
  hash byte-by-byte from how long the comparison takes.

> 🧠 **Why scrypt?** It's a deliberately slow, memory-hard hash — good against
> brute force — and it's **built into Node**, so no new dependency. (bcrypt/argon2
> are fine alternatives; scrypt keeps the stack lean.)

### `import "server-only"` — a guardrail

Both `pin.ts` and `parentSession.ts` start with:

```ts
import "server-only";
```

This makes the **build fail** if the file is ever imported into client code. It's a
safety net so the crypto/cookie logic can never accidentally ship to the browser.
(That's why `server-only` is now a declared dependency in `package.json`.)

---

## 🍪 The "unlocked" session — [`src/lib/parentSession.ts`](../../src/lib/parentSession.ts)

After a correct PIN, we set a short-lived **httpOnly cookie** marking the parent area
unlocked for ~15 minutes:

```ts
cookies().set("kk_parent_unlocked", "1", {
  httpOnly: true,                                  // JS can't read it
  secure: process.env.NODE_ENV === "production",   // HTTPS-only in prod
  sameSite: "lax",
  maxAge: 15 * 60,
});
```

- **`httpOnly`** → client JavaScript can't read or forge it.
- **Short TTL** → if the phone is handed to a kid later, the gate re-locks soon.
- `isParentAreaUnlocked()` just checks the cookie on the server.

> 🧠 **Scope note (flagged for review):** this is a *simple presence gate*, separate
> from full account login. It proves "someone entered the PIN recently", not "this
> exact parent is authenticated". Real auth (NextAuth) + tying the session to a
> specific parent account is a later Phase D decision. `getActiveParentId()` remains
> the single source of truth for *which* parent.

---

## ⚙️ Server Actions — [`src/app/parent/actions.ts`](../../src/app/parent/actions.ts)

`"use server"` functions run only on the server. The client form calls them directly:

| Action | What it does |
|--------|--------------|
| `submitPin(pin)` | Validate 4 digits → load the parent's `pinHash` → `verifyPin` → unlock on success. Returns `{ ok }` (no sensitive detail leaks). |
| `setPin(pin)` | Hash a new PIN and store it (first-time setup / change). |
| `lockParent()` | Clear the cookie (hand the phone back). |

```ts
const valid = await verifyPin(pin, parent.pinHash);
if (!valid) return { ok: false, error: "Wrong PIN. Try again." };
unlockParentArea();
```

> 🔐 **The check is entirely server-side.** The browser sends the entered PIN to a
> server action; the comparison happens on the server against the stored hash. The
> client never sees the hash and never decides if the PIN is right.

---

## 🔢 The PIN pad UI — [`PinPad.tsx`](../../src/components/parent/PinPad.tsx)

A client component: big number buttons, 4 progress dots, a backspace. On the 4th
digit it calls `submitPin`. On success it `router.refresh()`es so the now-unlocked
page re-renders the dashboard; on failure it shakes and clears.

```tsx
if (next.length === 4) submit(next);   // auto-submit at 4 digits
// ...
res.ok ? router.refresh() : (setError(...), shake);
```

---

## 🚪 The gated page — [`/parent/page.tsx`](../../src/app/parent/page.tsx)

A **server component** that branches on the lock state:

```tsx
const unlocked = isParentAreaUnlocked();
if (!unlocked) return <PinPad />;          // locked -> PIN entry
return <Dashboard />;                       // unlocked -> grown-up area
```

Because the check runs **on the server**, a kid can't bypass it by fiddling with
client state — the dashboard HTML isn't even sent until the cookie is present.

> The media 🔒 paywall (from C2) already points here (`/parent`), so locked media
> sends kids to this PIN gate — exactly the "checkout only behind the PIN" rule.

---

## 🧪 Running it (after `npm install` + a parent with a PIN)

```bash
npm run dev
# /parent -> PIN pad. Enter the 4-digit PIN -> dashboard unlocks for ~15 min.
```

(Until real auth selects a parent, `getActiveParentId()` returns null, so this is
wired but dormant — same honest-placeholder approach as the rest of the app.)

---

## ✅ Result

The parent area is gated by a 4-digit PIN that is hashed (scrypt + salt), verified
server-side in constant time, and unlocked via a short-lived httpOnly cookie — with
`server-only` guardrails so none of it can leak to the browser. Kids can't reach the
dashboard or checkout.

---

## ➡️ Next ticket

**D2 · `parent02-child-profiles`** — manage multiple child profiles (name, age,
avatar) inside the now-protected parent area.
