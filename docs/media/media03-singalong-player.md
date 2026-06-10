# 🎤 media03-singalong-player

> **Phase C · Ticket C3** — The sing-along player **base**: load a song + its
> embedded lyrics and wire up the shared `AudioPlayer`, ready for karaoke sync.

---

## 🎯 Goal

Build the song screen scaffold: fetch a song (with its embedded lyrics), gate it,
show cover + title + lyrics, and play it with the shared transport. The *karaoke
highlighting* comes next (C4) — this ticket sets the stage so C4 just plugs in.

---

## 🧱 A clean type boundary — [`src/types/media.ts`](../../src/types/media.ts)

```ts
export interface LyricLine { text: string; startSec: number; endSec: number; }
export interface Song { id; title; audioUrl; coverImage?; lyrics: LyricLine[]; }
```

These are **plain view types**, separate from Prisma's generated types. The server
page fetches a `MediaContent` row and **maps** it to a `Song` before handing it to
the client player.

> 🧠 **Why map instead of passing the Prisma object?** It keeps the client component
> depending on a small, stable shape we control — not the full DB model. If the
> schema gains fields, the player's contract doesn't change. Clean boundaries make
> components easier to reason about and reuse.

---

## 🎶 The player base — [`SingAlongPlayer.tsx`](../../src/components/media/SingAlongPlayer.tsx)

```tsx
const player = useAudioPlayer(song.audioUrl);
...
<AudioPlayer player={player} accentClass="bg-kiddo-pink" />
```

It reuses **everything** from C1: `useAudioPlayer` for the audio, `AudioPlayer` for
the transport. The sing-along screen just adds the song-specific surroundings:

- **Cover + title** (a 🎵 placeholder if there's no cover image).
- **Lyrics list** — each line rendered, keyed by `startSec + text`.
- **Bright, joyful** styling (`bg-kiddo-yellow/20`, pink accents) per the brief.

### Built for C4 to plug into

Right now every lyric line renders in the **resting (dim) style** (`text-gray-400`).
The keys are tied to each line's `startSec`, so the next ticket can target the active
line by playback time and swap its style (scale up + brighten) + add the bouncing
ball. The layout won't need to change — only the per-line state.

---

## 🌐 The route — [`/media/songs/[id]/page.tsx`](../../src/app/media/songs/[id]/page.tsx)

A **server component** that:

1. **Fetches** the `MediaContent` by id.
2. **Validates** it exists and is actually a `SONG` (else 404).
3. **Maps** the row (incl. embedded `lyrics`) to the `Song` view type.
4. **Gates** it (next section).
5. Renders `<MediaGate>` wrapping `<SingAlongPlayer>`.

```tsx
const content = await prisma.mediaContent.findUnique({ where: { id } });
if (!content || content.type !== MediaType.SONG) notFound();
const song: Song = { ...map fields..., lyrics: content.lyrics.map(...) };
```

Note the embedded `lyrics` come back **with** the document automatically — that's the
payoff of the `Lyric` composite type from `schema05` (no join needed).

---

## 🔒 Gating, fail-safe — using C2

```tsx
const parentId = await getActiveParentId();
const canPlay = content.isFree
  ? true
  : parentId
    ? await canAccessMedia(parentId, { id, isFree })
    : false;            // no parent yet -> paid content stays LOCKED
```

We reuse `canAccessMedia` from C2. The important safety detail: if there's no active
parent (auth is Phase D), paid content defaults to **locked**, never leaked. Free
content always plays.

### Another honest placeholder — [`getActiveParentId`](../../src/lib/activeParent.ts)

Like `getActiveChildId`, this returns `null` until Phase D wires real auth. It's the
**single** place to change when auth lands — every access check then works unchanged.

---

## 🧪 Running it (after `npm install` + a song in the DB)

```bash
npm run dev
# /media/songs/<id> -> cover + title + lyrics + play/seek transport
#   (free song plays; paid song shows the 🔒 MediaGate)
```

---

## ✅ Result

The sing-along screen exists end-to-end: it loads a real song with embedded lyrics,
enforces free/paid gating safely, and plays via the shared transport — with the lyric
layout already shaped for the karaoke sync coming next.

---

## ➡️ Next ticket

**C4 · `media04-lyric-sync-highlight`** — the karaoke magic: highlight the active
lyric line (scale + brighten, others dim) and add the bouncing ball, driven by the
player's `position` (rAF time) against each line's `startSec`/`endSec`.
