# 🔒 media02-content-gating

> **Phase C · Ticket C2** — Respect the `isFree` / `priceInPaise` gating on
> `MediaContent`, so paid songs/stories show a 🔒 and can't play until unlocked.

---

## 🎯 Goal

Media content has its **own** free/paid tiers (separate from learning modules). This
ticket adds the rule that decides *who can play what*, plus the 🔒 paywall UI shown
for locked content.

---

## 🧠 The access helper — [`src/lib/mediaAccess.ts`](../../src/lib/mediaAccess.ts)

This mirrors `canAccessModule` from `setup06`, but for media:

```ts
export async function canAccessMedia(parentId, media): Promise<boolean> {
  if (media.isFree) return true;                 // free -> always plays
  const access = await prisma.moduleAccess.findFirst({
    where: { parentId, module: { in: [mediaAccessKey(media.id), BUNDLE_SLUG] } },
    select: { id: true },
  });
  return access !== null;
}
```

### The reuse decision: namespaced `ModuleAccess` keys

Our schema has a `ModuleAccess` table (per-parent unlocks) keyed by a `module`
string. Rather than add a **new** access model just for media, we **reuse**
`ModuleAccess` with a namespaced key:

```ts
mediaAccessKey("abc123") -> "media:abc123"
```

So unlocking a paid song creates a `ModuleAccess` row with `module = "media:abc123"`.
Module unlocks use plain slugs (`"animals"`); media unlocks use `"media:<id>"`. They
never collide, and the `"ALL"` bundle still unlocks everything.

> 🧠 **Why reuse instead of a new model?** Less schema, one access pattern to reason
> about, and the bundle "just works". This `mediaAccess.ts` file is the single place
> to change if media purchases ever need their own model — a deliberate, documented
> choice rather than scattered logic.

### Per-parent, like modules

Access is checked against the **parent** (pay once → all children can play), exactly
like learning modules. Same business rule, same shape.

---

## 🚪 The paywall UI — [`src/components/media/MediaGate.tsx`](../../src/components/media/MediaGate.tsx)

A wrapper that shows the player when unlocked, or a friendly lock when not:

```tsx
<MediaGate locked={!canPlay} priceInPaise={media.priceInPaise} title={media.title}>
  <AudioPlayer player={player} />   {/* only rendered when unlocked */}
</MediaGate>
```

- **Unlocked** → renders `children` (the actual player).
- **Locked** → shows 🔒, the title, the price (`₹5`), and a **"Grown-ups 🔑"** button
  that routes to `/parent`.

### Kids can't buy — checkout is behind the parent PIN

The lock's button goes to the **parent area** (`/parent`), *not* a checkout. Per the
brief, **checkout is only reachable behind the parent PIN** so a child can't trigger
a purchase. The gate just says "ask a grown-up"; the actual paywall/Razorpay flow
lives in Phase D behind the PIN.

### Money display

`formatPaise(500) -> "₹5"` — we store integer paise everywhere and only convert to a
rupee string at the very edge, for display. We never do math on rupees.

---

## 🔗 How free vs paid flows

```
MediaContent.isFree?
  ├── true  -> always playable
  └── false -> canAccessMedia(parentId, media)?
                 ├── parent unlocked "media:<id>"  -> play
                 ├── parent has "ALL" bundle        -> play
                 └── otherwise                      -> 🔒 MediaGate
```

---

## 🧪 Running it (after `npm install`)

```tsx
// In a media screen:
const canPlay = media.isFree || (await canAccessMedia(parentId, media));
<MediaGate locked={!canPlay} priceInPaise={media.priceInPaise} title={media.title}>
  ...player...
</MediaGate>
```

---

## ✅ Result

Media now respects its free/paid gating: free content plays for everyone, paid
content shows a kid-friendly 🔒 with the price and points to the grown-up area — and
the gating reuses the existing per-parent `ModuleAccess` system via namespaced keys.

---

## ➡️ Next ticket

**C3 · `media03-singalong-player`** — the sing-along player base: load a song +
its embedded lyrics and wire up the shared `AudioPlayer`, ready for karaoke sync.
