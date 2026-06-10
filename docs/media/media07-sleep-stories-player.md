# 📖 media07-sleep-stories-player

> **Phase C · Ticket C7** (the last one!) — A narrated **sleep-story** player with a
> slow, gentle scene animation and soft transitions (audio-first). **Completes Phase
> C.** 🎉

---

## 🎯 Goal

A bedtime story screen focused on **listening**. Soft, dark visuals with a very slow
drifting scene so there's something calm to look at without being stimulating, while
the narration plays.

---

## 🌌 The player — [`SleepStoryPlayer`](../../src/components/media/SleepStoryPlayer.tsx)

It reuses the now-familiar pieces: `useAudioPlayer` + the shared `AudioPlayer`. The
new flavor is a **slow drifting scene**.

### The drifting clouds

```tsx
<motion.div
  initial={{ x: "-30%" }}
  animate={{ x: "120%" }}              // drift fully across the screen
  transition={{ duration: 40 + i * 10, delay: i * 6, repeat: Infinity, ease: "linear" }}
>
  ☁️
</motion.div>
```

- Each cloud crosses the screen over **40–60 seconds** — *very* slow on purpose.
- `ease: "linear"` keeps the drift perfectly steady (no acceleration), which reads as
  calm; a springy/eased motion would feel "busy".
- Staggered `delay`s spread the clouds out so they don't move in a clump.
- A 🌝 moon sits still above, and a 🧸 storyteller **breathes** slowly
  (`scale: [1, 1.05, 1]`, 4s) since the screen is audio-first.

> 🧠 **Design intent:** every motion here is *slow and steady*. Fast or bouncy
> animation (great for the sing-along) would be wrong for bedtime — the medium is the
> message. Same Framer Motion tool, opposite tuning.

### What it deliberately omits

- **No lyrics** (it's narration, not a song) → uses the `MediaItem` type.
- **No sleep timer** (a story has a natural end, unlike a looping lullaby).
- **No loop** (it plays once to the end).

So it's the *simplest* of the three players — just calm visuals around the shared
transport.

---

## 🌐 The route — [`/media/stories/[id]`](../../src/app/media/stories/[id]/page.tsx)

The exact same server pattern as songs and lullabies: fetch the `MediaContent`,
verify it's a `STORY` (else 404), gate via `canAccessMedia`, wrap in `MediaGate`.

> 🧠 **Three players, one pattern.** Song / lullaby / story routes are nearly
> identical — fetch, check type, gate, render the right player. That consistency is
> intentional: once you understand one media route, you understand all three.

---

## 🧩 Phase C wrap-up: the shared-foundation payoff

Look back at how the three media features were built:

| Feature | Unique part | Reused from earlier |
|---------|-------------|---------------------|
| Sing-along | lyric sync + bouncing ball + mascot | `useAudioPlayer`, `AudioPlayer`, gating |
| Lullaby | sleep timer + fade-out + calm UI | `useAudioPlayer`, `AudioPlayer`, gating |
| Sleep story | slow drifting scene | `useAudioPlayer`, `AudioPlayer`, gating |

Each new player added **only its distinctive piece** because C1 (shared audio engine
+ transport) and C2 (gating) did the heavy lifting first. That's the whole argument
for building foundations early.

---

## 🧪 Running it (after `npm install` + a story in the DB)

```bash
npm run dev
# /media/stories/<id> -> dark scene, slow drifting clouds + moon, narration plays
```

---

## ✅ Result — Phase C complete! 🎉

All three media experiences are done:
- 🎤 **Sing-along** — synced karaoke lyrics, bouncing ball, dancing mascot
- 🌙 **Lullaby** — calming visuals + sleep timer that fades to silence
- 📖 **Sleep story** — slow, gentle narrated scene

…all on one shared, gated Howler audio foundation.

---

## ➡️ Next phase

**Phase D — Parent Dashboard & Payments**: the PIN-protected parent area, child
profiles, progress/weak-areas, daily goals, and the Razorpay payment + reward-shop
flows. This is where the `getActiveParentId` / `getActiveChildId` placeholders finally
get real. Starts with **D1 · `parent01-pin-protection`**.
