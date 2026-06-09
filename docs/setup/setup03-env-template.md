# 🔐 setup03-env-template

> **Phase A · Ticket A3** — Create the `.env.example` template (database URL,
> Razorpay keys, app URL) and document how to configure secrets safely.

---

## 🎯 Goal

Set up **environment variables** the right way: a shareable *template* committed to
git, and the *real secrets* kept private and never committed.

---

## ❓ What is an environment variable?

An **environment variable** is a value that lives *outside* your code — things like
passwords, API keys, and connection strings. Why not just put them in the code?

- 🔒 **Security:** secrets in code get pushed to GitHub for the world to see.
- 🔄 **Flexibility:** the same code can use different values in development vs
  production (e.g. test payment keys locally, live keys in production).

In Next.js, these live in a file called **`.env`** at the project root.

---

## 📄 Two files: template vs real

| File | Committed to git? | Contains | Purpose |
|------|-------------------|----------|---------|
| `.env.example` | ✅ **Yes** | Variable **names** + fake placeholder values | A shareable blueprint so anyone knows *what* to set |
| `.env` | ❌ **No** (git-ignored) | The **real** secret values | What the app actually reads |

> 🧠 **The pattern:** commit the *shape* (`.env.example`), hide the *secrets*
> (`.env`). Our `.gitignore` already ignores `.env`, so it can never be committed
> by accident.

---

## 🔑 The variables we defined

```bash
DATABASE_URL=...                      # MongoDB connection string (Prisma)
NEXT_PUBLIC_RAZORPAY_KEY_ID=...       # Razorpay public key (safe in browser)
RAZORPAY_KEY_SECRET=...               # Razorpay SECRET (server-side only!)
NEXT_PUBLIC_APP_URL=...               # The app's base URL
```

### ⭐ The most important rule: `NEXT_PUBLIC_`

In Next.js, the **prefix decides who can see the variable**:

| Prefix | Visible to | Use for |
|--------|-----------|---------|
| `NEXT_PUBLIC_...` | **Browser AND server** | Public values (e.g. Razorpay *key id*, app URL) |
| *(no prefix)* | **Server only** | **Secrets** (e.g. Razorpay *secret*, DB URL) |

This is why:
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` → fine for the browser (it's public anyway).
- `RAZORPAY_KEY_SECRET` → **no prefix**, so it *never* reaches the browser. This
  enforces our hard rule: **payments are verified server-side only, never trust the
  client.**

> ⚠️ If you accidentally put a secret behind `NEXT_PUBLIC_`, it gets bundled into
> the JavaScript sent to every kid's phone. Anyone could read it. **Secrets get no
> prefix.**

---

## 🗄️ A note on `DATABASE_URL` (MongoDB + Prisma)

- Prisma with MongoDB needs a **replica set**. MongoDB Atlas provides this
  automatically (free tier is fine).
- The database name (`captain_kiddo`) goes right after the last `/` in the URL.
- Never share this string publicly — it contains your DB username & password.

---

## ⚙️ Setup commands (the full first-time flow)

```bash
# 1. Install dependencies
npm install

# 2. Create your real env file from the template
cp .env.example .env
#    ...then open .env and fill in real values.

# 3. Push the Prisma schema to MongoDB (after schema exists — tickets A4–A8)
npm run db:push

# 4. Generate the Prisma client
npm run db:generate

# 5. Start the dev server
npm run dev
```

Open `http://localhost:3000` to see the app.

---

## ✅ Result

Secrets are now configured the professional way: a committed **template** that
documents what's needed, and a private **`.env`** that holds the real values and
never touches git. The `NEXT_PUBLIC_` convention keeps our payment secret safely on
the server.

---

## ➡️ Next ticket

**A4 · `schema01-parent-child-models`** — start the Prisma schema with the
**`Parent`** and **`Child`** models (the account owner and the kid profiles),
using `@db.ObjectId` for all relations.
