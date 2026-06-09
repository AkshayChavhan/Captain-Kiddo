# 📚 Captain Kiddo — Documentation

Welcome! This folder is your **learning companion** for the Captain Kiddo project.
Every feature is built in **small, topic-wise commits**, and **each commit has a
matching doc here** that explains what it did and why — written for students and
developers who want to *learn*, not just copy.

---

## 🗺️ Start here

| Document | What it's for |
|----------|---------------|
| [`PROJECT_DETAILS.md`](./PROJECT_DETAILS.md) | The full project brief — what we're building & the rules. |
| [`PLAN.md`](./PLAN.md) | The master checklist — every ticket with ✅/⬜ status. |

---

## 📂 How docs are organized

Docs are grouped by topic area. **The doc filename is always the same as the
commit name.**

```
docs/
├── PROJECT_DETAILS.md     ← project brief
├── PLAN.md                ← master checklist (tick as we go)
├── README.md              ← you are here
├── setup/                 ← setup0X-*  (folder structure, deps, env, prisma client, registry, helpers)
├── schema/                ← schema0X-* (Prisma models, one topic each)
├── theme/                 ← theme0X-*  (Tailwind kid theme, UI primitives)
├── numbers/               ← numbers0X-* (the Numbers module, our reusable template)
├── media/                 ← media0X-*  (sing-along, lullaby, sleep stories)
├── parent/                ← parent0X-* (parent dashboard, PIN, child profiles)
├── pay/                   ← pay0X-*    (Razorpay create-order, checkout, verify)
├── shop/                  ← shop0X-*   (reward shop)
├── pwa/                   ← pwa0X-*    (manifest, service worker, offline)
└── auth/                  ← auth0X-*   (authentication, when we add it)
```

---

## 🔁 The learning loop (how each topic is built)

1. Code for **one small topic** is written.
2. A matching **doc** (same name as the commit) is written here.
3. It's **explained** in plain language.
4. **You review.**
5. We **commit** with the exact topic name.
6. We **tick** [`PLAN.md`](./PLAN.md).
7. Move to the **next topic**.

> 💡 **Tip for learners:** Read the commit and its doc *together*. The commit shows
> *what changed*; the doc explains *why* and *how it fits the bigger picture*.

---

## 🌿 Branches

- **`dev`** — all learning commits land here first.
- **`main`** — stable / production code.
