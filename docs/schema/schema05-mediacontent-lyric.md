# 🗄️ schema05-mediacontent-lyric

> **Phase A · Ticket A8** — Add the final schema piece: the **`MediaContent`** model
> (songs, lullabies, sleep stories) with an **embedded `Lyric` composite type** for
> synced sing-along lyrics. This completes the whole data layer. 🎉

---

## 🎯 Goal

Model the **audio content** (sing-along songs, lullabies, sleep stories) and learn a
new MongoDB superpower: **embedded composite types**.

---

## 🧩 The big new idea: composite types (`type` vs `model`)

In MongoDB, a document can contain **nested objects** right inside it. Prisma calls
these **composite types**, declared with `type` instead of `model`:

| | `model` | `type` (composite) |
|--|---------|--------------------|
| Stored as | Its own **collection** (table) | **Embedded** inside a parent document |
| Has an `id`? | Yes | No |
| Has relations? | Yes | No — it's just nested data |
| Example | `MediaContent` | `Lyric` |

> 🧠 **When to embed vs relate?** Embed data that *only ever exists as part of its
> parent* and is *always loaded with it*. A song's lyrics are meaningless without the
> song and always shown with it → perfect to embed. A child belongs to a parent but
> also has its own life (progress, stars) → that's a relation, not embedding.

---

## 🎵 The `Lyric` composite type

```prisma
type Lyric {
  text     String // "Twinkle twinkle little star"
  startSec Float  // when this line becomes active (seconds)
  endSec   Float  // when it stops being active
}
```

Each `Lyric` is **one line of a song plus its time window**. This is the heart of
the **karaoke sing-along** feature (built later in `media04`):

- During playback we track the current time (via Howler + `requestAnimationFrame`).
- When the time falls inside a line's `[startSec, endSec]`, **that line lights up**
  (scales + brightens) and the **bouncing ball** sits over it. Other lines dim.

```
time = 2.5s
  ┌──────────────────────────────────────────┐
  │  Twinkle twinkle little star   [0.0–2.0]  │  ← dim (past)
  │  How I wonder what you are     [2.0–4.0]  │  ← ACTIVE ⭐ (ball here)
  │  Up above the world so high    [4.0–6.0]  │  ← dim (future)
  └──────────────────────────────────────────┘
```

> 💡 **Why `Float` for the times?** Audio timestamps are fractional seconds (2.5s,
> 4.25s). This is *not money* — fractional precision is correct here. (Money stays
> integer paise; time is naturally a `Float`.)

---

## 📦 The `MediaType` enum

```prisma
enum MediaType {
  SONG     // sing-along (uses lyrics)
  LULLABY  // calming sleep music
  STORY    // narrated sleep stories
}
```

Three kinds of audio, each with a different player UI later in Phase C. Songs use
the lyrics; lullabies and stories usually don't.

---

## 🎧 The `MediaContent` model

```prisma
model MediaContent {
  type         MediaType
  title        String
  audioUrl     String    // played via Howler
  coverImage   String?
  durationSec  Float?
  isFree       Boolean   @default(false)
  priceInPaise Int       @default(0)
  lyrics       Lyric[]   // EMBEDDED array of lyric lines
}
```

### Its own free/paid gating

The brief says media content has **its own free/paid tiers**, separate from learning
modules. So `MediaContent` carries its **own** gating fields:

```prisma
isFree       Boolean @default(false)
priceInPaise Int     @default(0)   // integer paise — same money rule as everywhere
```

The shared `AudioPlayer` (ticket `media02`) checks these before playing paid content.

### The embedded lyrics array

```prisma
lyrics Lyric[]
```

Because `Lyric` is a composite `type`, this array lives **inside each
`MediaContent` document** in MongoDB — no separate collection, no join. When we load
a song, its lyrics come along automatically. Lullabies/stories simply have an empty
array.

---

## 🗺️ Where this leaves the schema

The data layer is now **complete**. Every model the project needs exists:

```
Parent ──< Child ──< Progress
  │          │   └──< TestResult
  │          └──< Unlock            (stars → cosmetics)
  ├──< Payment ──< ModuleAccess     (money → module access)
MediaContent  (embeds Lyric[])      (songs/lullabies/stories)
```

Enums: `Difficulty`, `PaymentStatus`, `UnlockType`, `MediaType`.
Composite type: `Lyric`.

---

## 🧪 Applying the full schema

Now that the schema is complete, you can sync it (once `.env` has a real
`DATABASE_URL`):

```bash
npm run db:push      # create all collections in MongoDB
npm run db:generate  # regenerate the type-safe Prisma client
```

---

## ✅ Result

The schema is **done**. We can store accounts, kids, tier-aware progress, quiz
history, real-money purchases, star-based cosmetics, and audio content with synced
karaoke lyrics — all type-safe.

---

## ➡️ Next ticket

**A9 · `setup04-prisma-client-singleton`** — create a hot-reload-safe Prisma client
singleton in `src/lib`, so we don't exhaust database connections during development.
