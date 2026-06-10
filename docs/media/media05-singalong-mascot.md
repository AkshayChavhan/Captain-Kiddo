# 🦸💃 media05-singalong-mascot

> **Phase C · Ticket C5** — Add a **dancing Captain Kiddo mascot** to the sing-along
> screen so kids can copy along, bouncing in time with the song.

---

## 🎯 Goal

Give kids a character to **mimic**. When the song plays, the mascot dances; when it
pauses, the mascot rests. Copying the mascot keeps little ones engaged and moving.

---

## 🦸 The `Mascot` component — [`src/components/shared/Mascot.tsx`](../../src/components/shared/Mascot.tsx)

A small **reusable** character (it lives in `shared/` because we'll use it elsewhere
too — celebrations, empty states). It has two moods driven by the `dancing` prop:

```tsx
animate={dancing
  ? { y: [0, -12, 0], rotate: [-6, 6, -6], scale: [1, 1.06, 1] }  // DANCE
  : { scale: [1, 1.03, 1] }                                       // idle "breath"
}
transition={{ duration: dancing ? 0.7 : 2.4, repeat: Infinity, ease: "easeInOut" }}
```

- **Dancing** → bobs up/down (`y`), sways (`rotate`), and pulses (`scale`) on a fast
  0.7s loop — a simple, lively "dance".
- **Idle** → a slow 2.4s breathing pulse so it feels alive even when paused.
- `repeat: Infinity` keeps whichever loop running.

### Built to be replaced later

It uses an emoji stand-in (🦸) via an `emoji` prop and a `size` prop. When a real
mascot illustration (image / Lottie animation) is ready, we swap the inner content
**here** and every caller gets the upgrade for free — no caller changes.

> 🧠 **Why combine `y` + `rotate` + `scale`?** Layering a few simple looping
> transforms reads as a coordinated "dance" far more cheaply than hand-authoring a
> complex keyframe sequence. Small motions, combined, feel alive.

---

## 🔌 Wiring it into the sing-along — [`SingAlongPlayer.tsx`](../../src/components/media/SingAlongPlayer.tsx)

One line, between the title and the lyrics:

```tsx
<Mascot dancing={player.playing} />
```

The mascot's dance is bound to **`player.playing`** (from `useAudioPlayer`):

- Press play → `playing` becomes true → mascot dances.
- Press pause → `playing` becomes false → mascot settles into its idle breath.

So the character literally moves *with the music* the child controls. No extra state,
no timers — it just reads the player's existing `playing` flag.

---

## 🧱 The pattern, again: reuse what's already there

Notice this ticket added almost no new logic — it leaned on:

- `player.playing` from the shared `useAudioPlayer` (media01),
- Framer Motion, already in the stack,
- a tiny reusable component in `shared/`.

That's the dividend of the earlier foundation tickets: features near the end of a
phase get small because the building blocks already exist.

---

## 🧪 Running it (after `npm install`)

```bash
npm run dev
# /media/songs/<id> -> press play -> Captain Kiddo bounces and sways with the song;
#   pause -> it gently rests. Sing and dance along!
```

---

## ✅ Result

The sing-along screen now has a joyful dancing Captain Kiddo that moves while the
song plays and rests when paused — a copy-along buddy for kids, and a reusable mascot
the rest of the app can use too.

---

## ➡️ Next ticket

**C6 · `media06-lullaby-sleep-timer`** — switch moods entirely: a **calming** lullaby
player (dimmed screen, drifting stars/moon) with a **sleep timer** (10/15/20 min) that
gently fades the volume to 0 and pauses.
