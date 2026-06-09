# 📘 Captain Kiddo — Project Details

> This document stores the **full project brief**. It is the single source of truth
> for *what* we are building and *why*. Every plan, commit, and learning doc traces
> back to something written here.

---

## 1. What is Captain Kiddo?

**Captain Kiddo** is a **Progressive Web App (PWA)** — an early childhood learning
app for **ages 3–6**.

- **Who uses it:** Parents set it up; kids use it.
- **What it teaches:** Numbers, alphabets, animals, colors, and more — in a fun,
  **gamified** way.
- **Extra content:** Lullabies, sleep stories, and sing-along songs.

> 🧒 **Why "audio-first" matters:** Kids aged 3–6 often *can't read yet*. So the app
> must lead with **sound, color, and animation**, not text.

---

## 2. Tech Stack (strict — do not substitute)

| Area | Technology | Why it's used |
|------|-----------|---------------|
| Framework | **Next.js 14+** (App Router) | Full-stack React with file-based routing |
| Language | **TypeScript** | Type safety = fewer bugs, easier learning |
| UI Library | **React** | Component-based UI |
| Styling | **Tailwind CSS** | Utility-first styling, fast to build |
| Animations | **Framer Motion** | Smooth, declarative animations |
| State | **Zustand** | Tiny, simple global state |
| Database | **MongoDB** via **Prisma** | Document DB + type-safe ORM |
| Audio | **Howler.js** | Reliable cross-browser audio playback |
| Payments | **Razorpay** | Indian payment gateway (INR) |
| App type | **PWA** | Installable, offline, portrait-locked, fullscreen |

---

## 3. Business Model

- **Free starter modules:** Numbers, Alphabets, Colors.
- **Paid modules:** Every other module costs **₹5** (stored as **500 paise**).
- **Payment is tied to the PARENT account** — pay once, **all of that parent's
  children** get access.
- **Difficulty tiers:** Every learning module has **3 tiers** — Easy → Medium → Hard.
  - Unlocked **sequentially**: Medium unlocks **only after Easy is completed**.
- **Media content** (lullabies / stories / songs) is **separate** and has its own
  free/paid tiers.
- **Bundle offer:** "Unlock **all** modules for **₹39**" alongside single ₹5 buys.

---

## 4. Hard Requirements (non-negotiable rules)

These rules must hold across the entire codebase:

1. 💰 **Money is always an integer in paise.** Never use floats for money.
   (₹5 = `500`, ₹39 = `3900`.)
2. 🔗 **All Prisma relations use `@db.ObjectId`.**
3. 🛠️ Use **`prisma db push`** (NOT `prisma migrate`) — MongoDB workflow.
4. 🔐 **Payments are verified SERVER-SIDE only** (HMAC signature check).
   **Never trust the client.**
5. 🧒 **Kid-friendly UX:**
   - Large tap targets
   - **Audio-first** (kids can't read)
   - Bright colors, rounded shapes
   - Celebratory animations
6. 🔢 **Paywall/checkout is gated behind a parent PIN** — kids can't trigger purchases.
7. 🧼 Code must be **clean, commented, production-ready TypeScript** — modular and
   easy to extend.

---

## 5. Data Models (high-level)

The Prisma schema must cover these models. Details are designed in the schema docs.

| Model | Purpose |
|-------|---------|
| **Parent** | The account owner. Holds PIN, owns children + payments. |
| **Child** | A kid profile (name, age, avatar, totalStars). |
| **Progress** | Tier-aware progress: `childId + module + difficulty`, `isCompleted`. |
| **TestResult** | Quiz attempts vs scores (used to derive "weak areas"). |
| **Unlock** | Reward shop items kids buy with stars (avatars/stickers/themes). |
| **ModuleAccess** | Which paid modules a parent has unlocked. |
| **Payment** | Razorpay payment records (PENDING → PAID), amount in paise. |
| **MediaContent** | Songs/lullabies/stories + embedded **Lyric** composite type. |

---

## 6. Feature Areas (the big picture)

The project is delivered in **four phases**, each becoming a group of commits:

### Phase A — Project Setup & Foundation
Folder structure, Prisma schema, Prisma client singleton, module registry config,
access-check helpers, PWA setup, `.env` template + setup commands.

### Phase B — The Numbers Learning Module (reusable template)
A complete module (home with tiers, learning view, quiz, celebrations, audio
feedback, progress saving, API routes) — clean enough to **duplicate** for
Alphabets, Animals, etc.

### Phase C — Media Playback (Audio Features)
- **Sing-along songs** with karaoke-style synced lyric highlighting + bouncing ball
  + dancing mascot.
- **Lullabies** with a calming player + sleep timer (fade to 0 then pause).
- **Sleep stories** with gentle scene animation.
- Shared **Howler-based AudioPlayer** component for all three.

### Phase D — Parent Dashboard & Payments
- **PIN-protected parent dashboard:** manage child profiles, per-child progress,
  weak areas, daily goals.
- **Razorpay payment flow:** create-order → checkout → server-side verify → grant
  `ModuleAccess` (atomic). Bundle option included.
- **Reward shop:** kids spend stars to unlock cosmetics.

---

## 7. Branch Strategy

| Branch | Purpose |
|--------|---------|
| **`main`** | Production / stable code only. |
| **`dev`** | Active development — all learning commits land here first. |

---

## 8. Commit & Doc Naming Convention

Every piece of work is a **small, topic-wise commit**. The commit name and its
learning-doc filename are **identical**.

| Topic area | Prefix | Example commit / doc name |
|-----------|--------|---------------------------|
| Project setup | `setup01-`, `setup02-`… | `setup01-folder-structure` |
| Schema | `schema01-`, `schema02-`… | `schema01-parent-model` |
| Authentication | `auth01-`, `auth02-`… | `auth01-login-page` |
| Theme / UI | `theme01-`, `theme02-`… | `theme01-tailwind-config` |
| Numbers module | `numbers01-`… | `numbers01-module-home` |
| Media | `media01-`… | `media01-audio-player` |
| Parent / payments | `parent01-`, `pay01-`… | `pay01-create-order-api` |
| Reward shop | `shop01-`… | `shop01-star-balance` |
| PWA | `pwa01-`… | `pwa01-manifest` |

> 📄 **Rule:** For commit `auth01-login-page`, there is a doc
> `docs/auth/auth01-login-page.md` explaining exactly what that commit did and why,
> written for a **student or learning developer**.

See [`PLAN.md`](./PLAN.md) for the full checklist of every topic.
