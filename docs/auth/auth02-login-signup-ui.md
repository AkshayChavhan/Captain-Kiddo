# 🔐 auth02-login-signup-ui

> **Auth feature · part 2** — The sign-up / log-in UI + server actions, and showing
> login state on the home page.

---

## 🎯 Goal

Let parents actually create an account and log in (email + password), starting the
signed session from `auth01`. Logging in **is** logging into the Parent account.

---

## ⚙️ Server actions — [`src/app/(auth)/actions.ts`](../../src/app/(auth)/actions.ts)

`"use server"` — passwords are hashed/verified on the server, never on the client.

### `signUp`

```ts
- validate name / email format / password length (>= 6)
- reject if email already registered (Parent.email is @unique)
- passwordHash = hashSecret(password)          // scrypt, from auth01
- create the Parent
- createSession(parent.id)                      // log them in immediately
```

### `logIn`

```ts
const parent = await prisma.parent.findUnique({ where: { email } });
const valid = parent?.passwordHash && await verifySecret(password, parent.passwordHash);
if (!parent || !valid) return { error: "Wrong email or password." };
createSession(parent.id);
```

> 🔐 **One generic error.** Whether the email doesn't exist *or* the password is wrong,
> we return the **same** "Wrong email or password." Revealing "no such email" would let
> someone probe which emails are registered (account enumeration). Same message = no
> leak.

### `logOut`

```ts
destroySession();   // clears the signed cookie
```

---

## 🖼️ The form — [`AuthForm`](../../src/components/auth/AuthForm.tsx)

One component, two modes (toggle between **Log in** and **Sign up**):

- Sign up shows a name field; both show email + password.
- Calls the matching action; on success `router.replace(redirectTo)` + `refresh()`.
- Shows the server's error message inline.
- `autoComplete` hints (`new-password` / `current-password`) so browsers/password
  managers behave.

---

## 🚪 The page — [`/login`](../../src/app/(auth)/login/page.tsx)

A server component:

```ts
if (await getActiveParentId()) redirect(next);   // already logged in -> leave
// else render <AuthForm redirectTo={next} />
```

### The `?next=` redirect (done safely)

Gated pages send the parent to `/login?next=/learn/animals`, and after login we send
them back. But we **only allow internal paths**:

```ts
const next = searchParams.next?.startsWith("/") ? searchParams.next : "/";
```

> 🧠 **Open-redirect guard.** If we blindly redirected to whatever `next` said, an
> attacker could craft `/login?next=https://evil.com` and bounce a logged-in user off
> to a phishing site. Requiring `next` to start with `/` keeps redirects on our own
> site.

---

## 🏠 Home shows login state — [`/page.tsx`](../../src/app/page.tsx)

The home page is now `async` and checks `getActiveParentId()`:

- **Guest** → a "Log in to play all games" button.
- **Logged in** → a small `LogoutButton` (clears the session + refreshes).

---

## 🗂️ Why the `(auth)` folder?

`src/app/(auth)/` is a Next.js **route group** — the parentheses mean it groups files
**without** adding `/auth` to the URL. So the page is `/login`, not `/auth/login`, while
the auth files stay tidy together.

---

## 🧪 Running it (after `npm install` + db push + AUTH_SECRET)

```bash
npm run dev
# /login -> Sign up (name/email/password) -> logged in -> home shows "Log out"
# log out -> home shows "Log in to play all games"
```

---

## ✅ Result

Parents can sign up and log in with email + password; the session from auth01 is
created on success; the home page reflects login state. The account they log into is
the Parent account that owns children, payments, and unlocks.

---

## ➡️ Next

**auth03** — the guest gate: a logged-out visitor can play the **first item of each
module's Easy tier** for free; going further (more items, other tiers, the dashboard)
sends them to `/login`.
