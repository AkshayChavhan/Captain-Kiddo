# ✅ Captain Kiddo — Master Plan & Progress Tracker

> This is the **single checklist** for the whole project. Every row is one small,
> topic-wise **commit** with a matching **learning doc** of the same name.
>
> **Legend:** ⬜ = not started · 🟡 = in progress · ✅ = done
>
> 📄 For each ticket, the doc lives at `docs/<area>/<commit-name>.md`.
> The **doc filename = the commit name**, always.

---

## 📊 Progress Summary

| Phase | Area | Done / Total |
|-------|------|--------------|
| A | Project Setup & Foundation | 0 / 12 |
| B | Numbers Learning Module | 0 / 9 |
| C | Media Playback | 0 / 7 |
| D | Parent Dashboard & Payments | 0 / 9 |
| — | **TOTAL** | **0 / 37** |

> Update these counts as tickets are completed.

---

## 🅰️ Phase A — Project Setup & Foundation

| # | Status | Commit / Doc name | What it does |
|---|--------|-------------------|--------------|
| A1 | ⬜ | `setup01-folder-structure` | Create the full Next.js + project folder layout |
| A2 | ⬜ | `setup02-dependencies` | Install & document all stack dependencies |
| A3 | ⬜ | `setup03-env-template` | `.env.example` template + setup commands |
| A4 | ⬜ | `schema01-parent-child-models` | Prisma: `Parent` & `Child` models |
| A5 | ⬜ | `schema02-progress-testresult` | Prisma: tier-aware `Progress` + `TestResult` |
| A6 | ⬜ | `schema03-access-payment-models` | Prisma: `ModuleAccess` + `Payment` models |
| A7 | ⬜ | `schema04-unlock-rewardshop` | Prisma: `Unlock` (reward shop) model |
| A8 | ⬜ | `schema05-mediacontent-lyric` | Prisma: `MediaContent` + embedded `Lyric` type |
| A9 | ⬜ | `setup04-prisma-client-singleton` | Hot-reload-safe Prisma client singleton |
| A10 | ⬜ | `setup05-module-registry` | Central module registry config (one-line to add a module) |
| A11 | ⬜ | `setup06-access-helpers` | `canAccessModule()` + `unlockedDifficulties()` |
| A12 | ⬜ | `pwa01-manifest-and-service-worker` | PWA: manifest, service worker, offline caching, next.config |

---

## 🅱️ Phase B — Numbers Learning Module (reusable template)

| # | Status | Commit / Doc name | What it does |
|---|--------|-------------------|--------------|
| B1 | ⬜ | `theme01-tailwind-kid-theme` | Tailwind kid-friendly theme (colors, rounded, big targets) |
| B2 | ⬜ | `numbers01-module-home-tiers` | Module home: 3 tiers with 🔒 on locked tiers |
| B3 | ⬜ | `numbers02-learning-view-card` | Big number card + object-counting visuals |
| B4 | ⬜ | `numbers03-howler-audio-taps` | Tap-to-play audio with Howler |
| B5 | ⬜ | `numbers04-framer-animations` | Bounce/scale Framer Motion animations |
| B6 | ⬜ | `numbers05-quiz-tap-answer` | Quiz: tap-the-correct-answer + star rewards |
| B7 | ⬜ | `numbers06-quiz-drag-drop` | Quiz: drag-and-drop numeral↔quantity matching |
| B8 | ⬜ | `numbers07-celebration-confetti` | Confetti / star-burst celebration + audio feedback |
| B9 | ⬜ | `numbers08-save-progress-api` | Save Progress (upsert), unlock next tier, award stars + API routes |

---

## 🅲 Phase C — Media Playback (Audio Features)

| # | Status | Commit / Doc name | What it does |
|---|--------|-------------------|--------------|
| C1 | ⬜ | `media01-shared-audio-player` | Shared Howler-based `AudioPlayer` component |
| C2 | ⬜ | `media02-content-gating` | Respect `isFree`/`priceInPaise` gating from `MediaContent` |
| C3 | ⬜ | `media03-singalong-player` | Sing-along player base (load song + lyrics) |
| C4 | ⬜ | `media04-lyric-sync-highlight` | Karaoke lyric sync (rAF + startSec/endSec) + bouncing ball |
| C5 | ⬜ | `media05-singalong-mascot` | Dancing Captain Kiddo mascot |
| C6 | ⬜ | `media06-lullaby-sleep-timer` | Lullaby calming player + sleep timer (fade → pause) |
| C7 | ⬜ | `media07-sleep-stories-player` | Sleep-story narrated player + gentle scene animation |

---

## 🅳 Phase D — Parent Dashboard & Payments

| # | Status | Commit / Doc name | What it does |
|---|--------|-------------------|--------------|
| D1 | ⬜ | `parent01-pin-protection` | Parent PIN gate (kids can't pass) |
| D2 | ⬜ | `parent02-child-profiles` | Manage multiple child profiles (name, age, avatar) |
| D3 | ⬜ | `parent03-progress-dashboard` | Per-child progress: modules, tiers, stars |
| D4 | ⬜ | `parent04-weak-areas` | Derive "weak areas" from TestResult attempts vs score |
| D5 | ⬜ | `parent05-daily-goals` | Set daily learning goals |
| D6 | ⬜ | `pay01-create-order-api` | Create-order API → PENDING Payment (500 paise) |
| D7 | ⬜ | `pay02-razorpay-checkout` | Razorpay checkout on client |
| D8 | ⬜ | `pay03-verify-and-grant-access` | Server-side HMAC verify → PAID → ModuleAccess (atomic) + ₹39 bundle |
| D9 | ⬜ | `shop01-reward-shop` | Reward shop: spend stars to unlock cosmetics |

---

## 📝 How we work (the learning loop)

For **each ticket**, the loop is:

1. 🧑‍💻 I write the **code** for one small topic.
2. 📄 I write a matching **learning doc** (`docs/<area>/<commit-name>.md`) explaining
   *what* and *why*, in beginner-friendly language.
3. 💬 I **explain** it to you in chat.
4. 👀 **You review.**
5. 💾 We **commit** with the exact name (e.g. `git commit -m "numbers01-module-home-tiers"`).
6. ✅ We **tick this plan** (update the status + summary counts).
7. ➡️ Move to the next ticket.

> Everything stays on the **`dev`** branch. We merge to **`main`** when a phase is
> stable.
