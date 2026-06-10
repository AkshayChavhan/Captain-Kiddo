# 🎧 media01-shared-audio-player

> **Phase C · Ticket C1** — Build the **shared Howler-based AudioPlayer** that all
> three media types (sing-along, lullaby, sleep stories) reuse.

---

## 🎯 Goal

One reliable audio engine + one transport UI, reused everywhere. Each media screen
adds its own surroundings (lyrics, sleep timer, scene) but **never re-implements
play/pause/seek**.

---

## 🪝 `useAudioPlayer` — the media audio engine — [`src/hooks/useAudioPlayer.ts`](../../src/hooks/useAudioPlayer.ts)

`useSound` (from `numbers03`) was fire-and-forget — perfect for a tap blip. **Media
is different**: we need play/pause *state*, the current *time*, and *seeking*. So
this is a fuller hook.

### What it returns

```ts
{ playing, position, duration, play, pause, toggle, seek, setVolume }
```

### Tracking time with requestAnimationFrame

The most important part — the sing-along player needs to know *exactly* where in the
song we are, many times per second, to highlight the right lyric:

```ts
const tick = () => {
  const t = howlRef.current?.seek();      // Howler: current time in seconds
  if (typeof t === "number") setPosition(t);
  rafRef.current = requestAnimationFrame(tick);  // ~60 times/sec while playing
};
```

> 🧠 **Why `requestAnimationFrame` (rAF)?** It runs ~60fps, in sync with the screen's
> repaint. Polling with `setInterval` would be choppier and waste work when the tab
> is hidden. rAF gives smooth, efficient time updates — ideal for the bouncing-ball
> lyric sync coming in `media04`. We only run the loop **while playing** and cancel
> it on pause/unmount.

### Howler event wiring

```ts
new Howl({
  src: [src], html5: true, loop,
  onload: () => setDuration(howl.duration()),
  onplay: () => setPlaying(true),
  onpause/onstop: () => setPlaying(false),
  onend: () => { ...; onEnd?.(); },
});
```

- **`html5: true`** streams long files (songs/stories) instead of decoding them
  fully up front — lighter on phones.
- We mirror Howler's events into React state (`playing`, `duration`) so the UI
  reacts.
- **`onEnd` via a ref** — we keep the latest `onEnd` callback in a ref so changing it
  doesn't force the `Howl` to be torn down and rebuilt. (Rebuilding on every render
  would restart the audio.)

### Cleanup

When `src` changes or the component unmounts, we `howl.unload()` and cancel the rAF
loop — no leaked audio, no orphan timers.

---

## 🕹️ `AudioPlayer` — the shared transport UI — [`src/components/media/AudioPlayer.tsx`](../../src/components/media/AudioPlayer.tsx)

A **controlled** component: it doesn't own the audio, it just renders controls for an
`AudioPlayerApi` you pass in.

```tsx
const player = useAudioPlayer("/audio/songs/twinkle.mp3");
<AudioPlayer player={player} accentClass="bg-kiddo-teal" />
```

> 🧠 **Controlled vs self-contained:** by taking the player *as a prop*, the same UI
> works for a song (with lyrics around it), a lullaby (with a sleep timer), or a
> story (with a scene). The screen owns the audio; the transport just drives it.
> This is the reuse the brief asks for.

### What it shows

- A **big round play/pause button** (kid-sized, `whileTap` press feedback). The
  emoji flips ▶️/⏸️ with the `playing` state.
- A **tappable progress bar** — tap anywhere to seek:

```tsx
const fraction = (e.clientX - rect.left) / rect.width;  // where you tapped
seek(fraction * duration);                              // jump there
```

- **Time labels** (`position` / `duration`) via a small `formatTime` helper
  (`75 -> "1:15"`).

### Theming per screen

`accentClass` (a Tailwind bg class) lets each screen tint the controls — bright
purple for songs, calm tones for lullabies — without changing the component.

---

## 🧰 New helper — [`src/lib/format.ts`](../../src/lib/format.ts)

```ts
formatTime(seconds) // 75 -> "1:15"
```

Tiny, pure, reused by every player for the time display.

---

## 🧭 How the three media screens will use this

| Screen (later ticket) | Adds around the shared player |
|-----------------------|-------------------------------|
| Sing-along (`media03/04/05`) | synced lyrics + bouncing ball + dancing mascot |
| Lullaby (`media06`) | dimmed UI + drifting stars + **sleep timer** |
| Sleep story (`media07`) | slow scene animation + soft transitions |

All of them: `const player = useAudioPlayer(content.audioUrl)` then
`<AudioPlayer player={player} />`. The engine + transport never change.

---

## 🧪 Running it (after `npm install` + an audio file)

```bash
npm run dev
# a screen using <AudioPlayer> shows play/pause + a seekable bar + times
```

---

## ✅ Result

Captain Kiddo now has one shared, reliable audio foundation: a Howler hook that tracks
time via rAF (ready for lyric sync) and a kid-friendly, themeable transport UI — the
base every media feature in Phase C builds on.

---

## ➡️ Next ticket

**C2 · `media02-content-gating`** — respect the `isFree` / `priceInPaise` gating on
`MediaContent`, so paid songs/stories show a 🔒 and can't play until unlocked.
