# 🔑 auth01-session-foundation

> **Auth feature · part 1** — The login foundation: password hashing, a signed
> session cookie, and making `getActiveParentId`/`getActiveChildId` return **real**
> values. (Login UI comes in auth02; the guest gate in auth03.)

---

## 🎯 Goal

Stand up real authentication where **login = the Parent account**. After this, the
placeholders that returned `null` everywhere finally resolve to the logged-in parent
and their child — so all the per-parent features (unlocked modules, payments,
dashboard, progress) light up.

---

## 🗄️ Schema: `Parent.passwordHash`

```prisma
passwordHash String?   // login password, hashed (scrypt), never plain text
```

The `Parent` model already had `email @unique` and `pinHash`. We add `passwordHash`
for login. (Run `npm run db:push` + `db:generate` after pulling.)

---

## 🔒 Shared secret hashing — [`src/lib/hash.ts`](../../src/lib/hash.ts)

The PIN already used scrypt + salt + constant-time compare. We **extracted** that into
a generic `hashSecret` / `verifySecret` so the **password reuses the exact same proven
logic**:

```ts
hashSecret(secret)  -> "salt:hash"   (scrypt, random salt)
verifySecret(secret, stored) -> bool (constant-time timingSafeEqual)
```

`pin.ts` now just delegates to it (`hashPin` → `hashSecret`), so PIN callers are
unchanged. One hashing implementation, two uses (PIN + password).

> 🧠 **DRY for security code especially:** having *one* audited hashing path is safer
> than two copies that could drift. The password gets salting + constant-time compare
> for free.

---

## 🍪 The signed session — [`src/lib/session.ts`](../../src/lib/session.ts)

After login we store the parent's id in a cookie — but a raw `parentId` cookie would
be **forgeable** (a kid could set `kk_session=<someone's id>`). So we **sign** it:

```
cookie value = "<parentId>.<HMAC_SHA256(parentId, AUTH_SECRET)>"
```

On every read we recompute the HMAC and compare (constant-time). If it doesn't match,
the cookie is rejected:

```ts
getSessionParentId():
  const [id, sig] = split cookie
  return timingSafeEqual(sign(id), sig) ? id : null
```

- **`httpOnly`** → JS can't read/forge it.
- **HMAC-signed with `AUTH_SECRET`** → can't be tampered with; only our server can
  mint a valid one.
- 30-day expiry; `secure` in production.

> 🧠 **Same HMAC idea as Razorpay verification (pay03).** A signature you can only
> produce with the secret = proof of authenticity. Here it proves "our server issued
> this session", so the id inside can be trusted.

`createSession(parentId)` / `destroySession()` set and clear it.

### New env var

```
AUTH_SECRET="..."   # signs the session cookie; openssl rand -hex 32 in prod
```

---

## 🔗 Placeholders become real

```ts
// activeParent.ts
getActiveParentId() -> getSessionParentId()   // the logged-in parent (or null)

// activeChild.ts
getActiveChildId()  -> the logged-in parent's FIRST child (or null)
```

This is the moment everything threaded through the app comes alive. Recall the honest
placeholders we kept noting — *"wired but dormant until auth"*? This flips them on:

- access checks (`canAccessModule`, `canAccessMedia`) now see the real parent,
- the parent dashboard loads the real account's children/progress/payments,
- progress saving (quizzes, tracing) now has a real `childId` to save under.

> The active child is the parent's first profile for now; a "pick which child" selector
> can later store a chosen id and this helper would prefer that. Single source of truth,
> so that change is one function.

---

## 🧪 After pulling

```bash
npm run db:push && npm run db:generate   # the new passwordHash field
# set AUTH_SECRET in .env
```

(No UI yet — that's auth02. This part is the plumbing.)

---

## ✅ Result

Real password hashing (shared with the PIN), a forgery-proof signed session cookie, and
`getActiveParentId`/`getActiveChildId` resolving to the logged-in parent + child. The
app's per-parent features now have a real identity to hang on.

---

## ➡️ Next

**auth02** — the sign-up / log-in UI + server actions (create account, log in, log out),
and **auth03** — the guest gate: no login required to play the **first item of each
module's Easy tier**, then "log in to keep playing".
