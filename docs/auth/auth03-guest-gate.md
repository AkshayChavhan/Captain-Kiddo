# 🚪 auth03-guest-gate

> **Auth feature · part 3** — The guest gate: a logged-out visitor may play the
> **first item of each module's Easy tier** for free; going further sends them to
> `/login`.

---

## 🎯 Goal

Let a new visitor *try* the app without an account — but only a taste — so they see the
value, then sign in to unlock everything. Specifically: **the first item of every
module's Easy tier**, then a friendly login wall.

---

## 📏 The rule, in one place — [`src/lib/guestAccess.ts`](../../src/lib/guestAccess.ts)

```ts
export const GUEST_FREE_ITEMS = 1;

guestCanViewItem(difficulty, index) =>
  difficulty === EASY && index < GUEST_FREE_ITEMS;
```

A pure helper so the **same rule** is applied consistently. A guest can view Easy item
`0`; anything else (more items, Medium/Hard, quizzes) is past the taste. Tuning the
allowance later = changing `GUEST_FREE_ITEMS`.

---

## 🧱 Where the gate is enforced

Defense at each entry point a guest could reach:

### 1. The learning view — [`LearningView.tsx`](../../src/app/learn/[module]/[difficulty]/LearningView.tsx)

The route passes `loggedIn` (from `getActiveParentId()`), and the view checks:

```tsx
// Guest opening a non-Easy tier -> already past the taste -> gate.
if (!loggedIn && !guestCanViewItem(tier.difficulty, 0)) return <LoginGate />;
// Guest who advanced past the free items -> gate.
if (!loggedIn && index >= GUEST_FREE_ITEMS) return <LoginGate />;
```

And the **Next button** turns into a "Log in ➡️" link once a guest is on the last free
item:

```tsx
const guestAtLimit = !loggedIn && index >= GUEST_FREE_ITEMS - 1;
{guestAtLimit ? <Link href="/login?next=...">Log in ➡️</Link> : ...Next/Quiz...}
```

So a guest sees Easy item 1, hears it, can tap it — and the moment they try to go on,
they're invited to log in.

### 2. The quiz route — [`quiz/page.tsx`](../../src/app/learn/[module]/[difficulty]/quiz/page.tsx)

Quizzes are entirely past the taste, so the **server redirects** guests:

```ts
if (!(await getActiveParentId())) redirect(`/login?next=.../quiz`);
```

### 3. The parent area — [`parent/page.tsx`](../../src/app/parent/page.tsx)

The dashboard now requires being logged in *before* the PIN gate:

```ts
if (!(await getActiveParentId())) redirect("/login?next=/parent");
// ...then the PIN gate (an extra kid-lock on top of being logged in)
```

> 🧠 **Login vs PIN — two different locks.** Login proves *who the account is*; the PIN
> stops a *kid* from wandering into the grown-up area on a logged-in device. A guest
> must pass both to reach the dashboard.

---

## 🚦 The gate screen — [`LoginGate.tsx`](../../src/components/auth/LoginGate.tsx)

A friendly 🔒 "Log in to keep playing!" with a login button that carries `?next=` back
to the current page (via `usePathname`), so after signing in the parent lands right
where they were.

---

## 🔒 Server-enforced, not just UI

Notice the gates are **server-side** (the route reads `getActiveParentId()` and redirects;
the view receives a server-computed `loggedIn`). A guest can't bypass them by fiddling
with client state — the quiz/dashboard server components redirect before any content is
sent, and the learning view's `loggedIn` comes from the signed session, not the browser.

---

## 🧒 The guest journey

```
Guest opens Animals -> Easy -> 🦁 "Lion" (plays, audio)   ✅ free taste
  taps "Log in ➡️"        -> /login?next=/learn/animals/easy
Guest opens a quiz / Medium tier / /parent -> redirected to /login
After signing in           -> back to where they were, everything unlocked
```

---

## 🧪 Running it (after `npm install` + db push + AUTH_SECRET)

```bash
npm run dev
# logged out: /learn/colors/easy shows the first color, then "Log in" wall
#             /learn/colors/easy/quiz and /parent -> redirect to /login
# log in -> all items, all tiers, quizzes, dashboard
```

---

## ✅ Result — login feature complete

A logged-out visitor gets a real taste (first Easy item of each module), then a
friendly, `next`-aware login wall. Quizzes and the parent area require login,
server-enforced. Combined with auth01 (session) + auth02 (UI), Captain Kiddo now has
real accounts: **log in to play everything; try the first game of each module without
one.**

---

## 🔗 Recap of the auth feature

| Part | What |
|------|------|
| auth01 | password hashing (shared w/ PIN) + signed session + real `getActiveParentId`/`getActiveChildId` |
| auth02 | sign-up / log-in UI + actions; home shows login state |
| auth03 | guest gate (first Easy item free) + login walls on quiz/dashboard |
