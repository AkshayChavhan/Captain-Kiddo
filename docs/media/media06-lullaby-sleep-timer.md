# 🌙 media06-lullaby-sleep-timer

> **Phase C · Ticket C6** — A **calming** lullaby player (dimmed screen, drifting
> stars/moon) with a **sleep timer** (10/15/20 min) that gently fades the volume to
> 0 then pauses.

---

## 🎯 Goal

Bedtime mode. The opposite of the bright sing-along: a dark, soothing screen, looping
lullaby, and a sleep timer so music doesn't play all night if the child drifts off.

---

## 🔉 New audio capability: fade out — [`useAudioPlayer`](../../src/hooks/useAudioPlayer.ts)

We extended the shared hook with one method:

```ts
fadeOutAndPause: (durationMs) => {
  const current = howl.volume();
  howl.fade(current, 0, durationMs);          // smooth ramp to silence
  howl.once("fade", () => { howl.pause(); howl.volume(current); });
}
```

- **`howl.fade(from, to, ms)`** is Howler's built-in volume ramp. We go from the
  current volume → 0 over `durationMs`.
- When the fade **finishes** (`once("fade")`), we **pause** and **restore** the
  volume — so if the child taps play again later, it starts at full volume, not
  silent.

> 🧠 A gentle fade (not an abrupt stop) is the whole point — it eases a sleeping
> child into silence without a jarring cut.

---

## ⏲️ The sleep timer — [`useSleepTimer`](../../src/hooks/useSleepTimer.ts)

A reusable countdown hook. You give it an `onElapse` callback; it counts down and
fires it at zero.

```ts
const { remainingSec, activeMinutes, start, cancel } = useSleepTimer(onElapse);
start(15);  // begin a 15-minute countdown
```

Key details:

- A `setInterval` ticks every second, decrementing `remainingSec`.
- At zero it **clears the interval, calls `onElapse`**, and resets.
- `onElapse` is held in a **ref** so changing it doesn't restart the countdown.
- The interval is **cleared on unmount** (no ticking after the screen closes).
- `activeMinutes` tells the UI which preset is running (to highlight it).

> 🧠 **Why a ref for `onElapse`?** Same reason as in `useAudioPlayer`: callbacks are
> often recreated each render. Storing it in a ref lets the timer always call the
> latest version *without* tearing down and restarting the interval every render.

The lullaby wires the two together:

```tsx
const { ... } = useSleepTimer(() => player.fadeOutAndPause(FADE_MS));
```

→ timer hits zero → **fade out over 8s → pause**. Calm and automatic.

---

## 🌌 The calming UI — [`LullabyPlayer`](../../src/components/media/LullabyPlayer.tsx)

A deliberate mood-shift from the sing-along:

| Sing-along | Lullaby |
|------------|---------|
| Bright yellow/pink | **Dark slate** (`bg-slate-900`) |
| Dancing mascot | **Soft moon 🌙 + drifting stars ⭐** |
| Fast, energetic | **Slow** 6s star drifts |
| Plays once | **Loops** (`useAudioPlayer(src, { loop: true })`) |

The stars drift with a slow looping float (`y` + fading `opacity`), each with a
staggered `delay` so they don't move in unison:

```tsx
animate={{ y: [0, -12, 0], opacity: [0.3, 0.7, 0.3] }}
transition={{ duration: 6, delay: s.delay, repeat: Infinity }}
```

### The sleep-timer controls

Three preset buttons (10/15/20m). Tapping one **starts** that countdown; tapping the
active one again **cancels** it. While running, it shows "Sleeping in m:ss ⏳".

```tsx
onClick={() => (active ? cancel() : start(min))}
```

It reuses the shared `AudioPlayer` transport (with a dim `bg-slate-600` accent) — same
play/pause/seek, different mood.

---

## 🌐 The route — [`/media/lullabies/[id]`](../../src/app/media/lullabies/[id]/page.tsx)

Identical pattern to the song route (C3): fetch the `MediaContent`, verify it's a
`LULLABY` (else 404), gate via `canAccessMedia`, wrap in `MediaGate`. The
**`MediaItem`** view type (no lyrics) is used for lullabies and stories.

---

## 🧪 Running it (after `npm install` + a lullaby in the DB)

```bash
npm run dev
# /media/lullabies/<id> -> dim screen, drifting stars, looping lullaby
#   tap "15m" -> after 15 min it fades out over ~8s and pauses
```

---

## ✅ Result

A soothing bedtime player: dark calming visuals, a looping lullaby, and a real sleep
timer that fades to silence and pauses — reusing the shared audio engine + transport,
just dressed for sleep.

---

## ➡️ Next ticket

**C7 · `media07-sleep-stories-player`** — the last media player: a narrated
sleep-story player with a slow, gentle scene animation and soft transitions
(audio-first), completing Phase C.
