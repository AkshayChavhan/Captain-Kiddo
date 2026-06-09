# 🏗️ setup01-folder-structure

> **Phase A · Ticket A1** — Scaffold the Next.js 14 (App Router) + TypeScript
> project structure with every folder we'll need across the whole app.

---

## 🎯 Goal

Create a clean, organized skeleton so that as we build features, **every new file
has an obvious home**. A good folder structure is the foundation of an
easy-to-extend app.

---

## 📁 The folder structure we created

```
captain_kiddo/
├── package.json            ← project name, scripts, and dependency list
├── tsconfig.json           ← TypeScript settings (incl. the "@/..." path alias)
├── next.config.mjs         ← Next.js config (PWA bits added later)
├── tailwind.config.ts      ← Tailwind setup (kid theme added in theme01)
├── postcss.config.mjs      ← runs Tailwind + Autoprefixer
├── .gitignore              ← files git should NOT track (node_modules, .env, etc.)
│
├── prisma/                 ← database schema lives here (schema.prisma comes next)
│
├── public/                 ← static files served as-is at the site root
│   ├── audio/              ← song/lullaby/story sound files
│   ├── images/             ← pictures, illustrations
│   └── icons/              ← PWA app icons
│
└── src/                    ← ALL our source code
    ├── app/                ← Next.js App Router (pages = folders here)
    │   ├── layout.tsx      ← wraps every page (the <html>/<body> shell)
    │   ├── page.tsx        ← the home page ("/")
    │   └── globals.css     ← global styles + Tailwind directives
    │
    ├── components/         ← reusable React UI pieces, grouped by area
    │   ├── ui/             ← tiny generic building blocks (Button, Card…)
    │   ├── learning/       ← learning-module UI (number cards, quizzes…)
    │   ├── media/          ← audio players (sing-along, lullaby, stories)
    │   ├── parent/         ← parent dashboard UI
    │   └── shared/         ← shared across many areas (mascot, confetti…)
    │
    ├── lib/                ← helper code & logic (Prisma client, access helpers…)
    ├── config/            ← static configuration (the module registry)
    ├── store/             ← Zustand global state stores
    ├── types/             ← shared TypeScript type definitions
    └── hooks/             ← custom React hooks (useAudio, etc.)
```

---

## 🧩 Why each folder exists

| Folder | Why it's here |
|--------|---------------|
| `src/app/` | Next.js **App Router**: each folder becomes a URL route. `layout.tsx` is the shared shell; `page.tsx` is a page. |
| `src/components/` | Reusable UI. **Grouped by feature area** so it doesn't become a junk drawer. |
| `src/lib/` | Non-UI logic: the Prisma client, access-check helpers, payment verification. |
| `src/config/` | Static config like the **module registry** — change one line to add a module. |
| `src/store/` | **Zustand** stores for global state (e.g. the active child profile). |
| `src/types/` | Shared TypeScript types so models/shapes are defined once. |
| `src/hooks/` | Custom React hooks (reusable stateful logic, e.g. audio control). |
| `prisma/` | Database schema (`schema.prisma`) — added in the next tickets. |
| `public/` | Static assets served directly (audio, images, icons). |

---

## 📄 The config files explained (for beginners)

### `package.json`
The "control panel" of a Node project. Two important parts:
- **`scripts`** — shortcuts you run with `npm run <name>`:
  - `dev` → start the local dev server
  - `build` / `start` → production build & run
  - `db:push` → push the Prisma schema to MongoDB (we use **push**, not migrate)
  - `db:studio` → open a visual DB browser
- **`dependencies`** — the exact libraries from our strict tech stack
  (Next, React, Prisma, Zustand, Framer Motion, Howler, Razorpay).

### `tsconfig.json`
TypeScript's settings. The key line for us:
```json
"paths": { "@/*": ["./src/*"] }
```
This is the **`@` alias**. Instead of ugly relative imports like
`../../../lib/prisma`, we write:
```ts
import { prisma } from "@/lib/prisma";
```
`@` always means "the `src` folder". Cleaner and never breaks when you move files.

### `next.config.mjs`
Next.js options. Minimal for now — `reactStrictMode` helps catch bugs in dev.
PWA settings come later in `pwa01`.

### `tailwind.config.ts` + `postcss.config.mjs` + `globals.css`
These three make **Tailwind CSS** work:
- `tailwind.config.ts` — tells Tailwind which files to scan (`./src/**`).
- `postcss.config.mjs` — runs Tailwind + Autoprefixer when CSS is built.
- `globals.css` — pulls Tailwind in via `@tailwind base/components/utilities`.

### `.gitignore`
Lists files git should **ignore**. Most important: `.env` and `node_modules`.
⚠️ **Never commit real secrets** — that's why `.env` is ignored.

---

## ❓ What's a `.gitkeep` file?

Git can't track an **empty** folder. To keep our nice structure visible in the
repo before we add real files, we drop an empty `.gitkeep` file in each empty
folder. It has no special meaning to git — it's just a placeholder. We delete it
once a real file lands in that folder.

---

## ✅ Result

Running the project now shows a placeholder home page that says
"🦸 Captain Kiddo — Project scaffold is ready." Every folder we'll need already
exists, so future tickets just drop files into the right place.

---

## ➡️ Next ticket

**A2 · `setup02-dependencies`** — document and install all the stack dependencies,
and explain what each library does and why we chose it.
