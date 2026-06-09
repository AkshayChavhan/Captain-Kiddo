# 📦 setup02-dependencies

> **Phase A · Ticket A2** — Document every dependency in our tech stack: what each
> library does, why we chose it, and how to install everything.

---

## 🎯 Goal

Understand **what each library in `package.json` is for** before we start using it.
When you know *why* a tool is in the project, the code that uses it later makes far
more sense.

---

## 🧱 Runtime dependencies (shipped to users)

These are listed under `"dependencies"` — they run in the actual app.

| Library | Version | What it does | Why we chose it |
|---------|---------|--------------|-----------------|
| **next** | 14.2.5 | The React **framework**: routing, server components, API routes, bundling. | App Router gives us pages + backend APIs in one project. Required by the brief. |
| **react** | 18.3.1 | The UI library — builds the screen from **components**. | Next.js is built on React. |
| **react-dom** | 18.3.1 | Connects React to the browser DOM (renders components to real HTML). | Always paired with React for web apps. |
| **@prisma/client** | 5.18 | The **type-safe database client** we call at runtime (`prisma.child.findMany()`…). | Gives autocomplete + type safety for every DB query. |
| **zustand** | 4.5 | Tiny **global state** manager (e.g. "which child is active right now"). | Much simpler than Redux; perfect for a small app. |
| **framer-motion** | 11.3 | **Animation** library — bounces, scales, confetti, screen transitions. | Declarative animations = kid-friendly delight with little code. |
| **howler** | 2.2 | **Audio** playback engine (play letter sounds, songs, lullabies). | Reliable across browsers; gives us playback time for lyric syncing. |
| **razorpay** | 2.9 | The **payment** SDK (server-side order creation + verification). | Indian gateway (INR), required for the ₹5 / ₹39 model. |

---

## 🛠️ Development dependencies (build-time only)

These are under `"devDependencies"` — tools used while building, **not shipped** to
the user's browser.

| Library | What it does | Why we need it |
|---------|--------------|----------------|
| **typescript** | The TypeScript compiler + type checker. | Our whole codebase is `.ts`/`.tsx`. |
| **@types/node** | Type definitions for Node.js APIs. | So TS understands server-side code. |
| **@types/react**, **@types/react-dom** | Types for React. | Autocomplete + type safety in components. |
| **@types/howler** | Types for Howler (it ships plain JS). | So `new Howl(...)` is type-checked. |
| **prisma** | The Prisma **CLI** (`prisma db push`, `prisma studio`, `prisma generate`). | Manages the schema & generates the client. |
| **tailwindcss** | The utility-CSS framework. | All our styling. |
| **postcss**, **autoprefixer** | CSS post-processors Tailwind runs through. | Tailwind needs them; autoprefixer adds vendor prefixes. |
| **eslint**, **eslint-config-next** | The linter + Next's recommended rules. | Catches mistakes & keeps code consistent. |

> 💡 **dependency vs devDependency:** if the *running app in the browser/server*
> needs it → `dependencies`. If only your *computer while building* needs it →
> `devDependencies`. Example: `framer-motion` animates for the user (runtime), but
> `typescript` just compiles code on your machine (dev).

---

## 🗂️ The npm scripts (from `package.json`)

Run these with `npm run <name>`:

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the local dev server (hot reload) at `http://localhost:3000`. |
| `npm run build` | Build the optimized production bundle. |
| `npm run start` | Run the production build. |
| `npm run lint` | Check code for problems with ESLint. |
| `npm run db:push` | Push the Prisma schema to MongoDB (creates/updates collections). |
| `npm run db:generate` | Regenerate the Prisma client after schema changes. |
| `npm run db:studio` | Open Prisma Studio — a visual DB browser in your browser. |

---

## ⚙️ How to install everything

From the project root:

```bash
# 1. Install all dependencies listed in package.json
npm install

# 2. Generate the Prisma client (after the schema exists)
npm run db:generate
```

That's it — `npm install` reads `package.json` and downloads every library into
`node_modules/` (which is git-ignored, so it never gets committed).

> ⚠️ **Note:** We've **declared** the dependencies in `package.json`, but actually
> running `npm install` downloads ~hundreds of MB into `node_modules/`. Do that on
> your machine when you're ready to run the app. The schema-related steps
> (`db:generate`, `db:push`) only work **after** we create `prisma/schema.prisma`
> in the next tickets (A4–A8).

---

## 🧪 How to verify

After `npm install`, you can confirm the stack is wired up:

```bash
npm run dev
```

Then open `http://localhost:3000` — you should see the placeholder
"🦸 Captain Kiddo — Project scaffold is ready" page from `setup01`.

---

## ✅ Result

Every library in the project now has a clear purpose you understand. The
`package.json` is the **contract**: anyone who clones the repo runs `npm install`
and gets the exact same toolset.

---

## ➡️ Next ticket

**A3 · `setup03-env-template`** — create the `.env.example` template (database URL,
Razorpay keys, etc.) and document the setup commands, so secrets are configured
safely without ever committing real values.
