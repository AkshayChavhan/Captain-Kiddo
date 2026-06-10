# 🎤✨ media04-lyric-sync-highlight

> **Phase C · Ticket C4** — The karaoke magic: highlight the **active** lyric line
> (scale up + brighten, others dim) and add a **bouncing ball** above it, driven by
> the player's playback time.

---

## 🎯 Goal

As the song plays, the line being sung should **light up** and a **ball should bounce
over it** — the classic sing-along cue that tells a pre-reader *"sing this part now!"*

---

## 🧮 Finding the active line — [`src/lib/lyrics.ts`](../../src/lib/lyrics.ts)

A **pure** function: given the current time and the lyric lines, which line is
active?

```ts
export function activeLyricIndex(lines, timeSec): number {
  let active = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (timeSec >= line.startSec && timeSec < line.endSec) return i; // exact hit
    if (timeSec >= line.startSec) active = i;  // most recent started line
  }
  return active;
}
```

- **Exact hit:** time is inside `[startSec, endSec)` → that line is active.
- **Gap handling:** if there's a tiny gap between one line ending and the next
  starting, we keep highlighting the **most recent line that started**, so the
  highlight doesn't flicker off between words.
- Returns `-1` before the first line starts.

> 🧠 **Why a pure helper?** The "which line is active" logic is easy to get wrong
> (off-by-one, gaps). Isolating it as a pure function makes it testable and keeps the
> component focused on *rendering*, not timing math.

---

## ⏱️ What drives it: the rAF position from C1

Remember `useAudioPlayer` updates `position` ~60×/sec via `requestAnimationFrame`
(media01). The component just reads it every render:

```tsx
const activeIndex = activeLyricIndex(song.lyrics, player.position);
```

Because `position` updates smoothly, the active line recomputes smoothly — no extra
timers needed here. **This is exactly why C1 tracked time with rAF.** The pieces were
designed to fit.

---

## 🎨 Rendering the highlight — `LyricLineView`

Each line is its own small component that animates based on `active`:

```tsx
<motion.p
  animate={{ scale: active ? 1.15 : 1, opacity: active ? 1 : 0.45 }}
  transition={{ duration: 0.2 }}
  className={active ? "text-kiddo-purple" : "text-gray-400"}
>
  {line.text}
</motion.p>
```

- **Active** → scales to `1.15`, full opacity, bright purple.
- **Inactive** → normal size, dimmed (`opacity 0.45`), grey.
- The 0.2s transition makes the change glide instead of snapping.

---

## 🔴 The bouncing ball

Shown **only above the active line**, bouncing forever while it's active:

```tsx
{active && (
  <motion.span
    animate={{ y: [0, -10, 0] }}
    transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
  >
    🔴
  </motion.span>
)}
```

- `y: [0, -10, 0]` → up then back down (a bounce).
- `repeat: Infinity` → keeps bouncing as long as the line is active.
- It naturally appears over whichever line is currently active and disappears when
  the song moves on, because it's rendered inside that line's view only when
  `active` is true.

> 🧠 **Keyframe arrays:** giving an animated property an *array* (`[0, -10, 0]`) tells
> Framer Motion to tween through those values in order — a compact way to express a
> bounce without writing separate keyframes.

---

## 🧩 How C3 made this drop-in

C3 already rendered every line keyed by `startSec` in the dim style. C4 only had to:
1. compute `activeIndex` from `player.position`, and
2. pass `active={i === activeIndex}` to each line.

No layout changes — exactly the "build the stage now, plug in the magic next"
approach from C3. Clean tickets compound.

---

## 🧪 Running it (after `npm install` + a song with timed lyrics)

```bash
npm run dev
# /media/songs/<id> -> play -> the current line brightens + grows, ball bounces
#   over it, other lines dim; highlight follows the music line-by-line
```

(The lyric `startSec`/`endSec` values in the DB are what make the timing right.)

---

## ✅ Result

The sing-along is now true karaoke: the active line scales up, brightens, and gets a
bouncing ball, all perfectly tracking the music via the rAF-driven playback time —
joyful and readable-by-ear for little kids.

---

## ➡️ Next ticket

**C5 · `media05-singalong-mascot`** — add a **dancing Captain Kiddo mascot** to the
sing-along screen so kids can copy along, bouncing in time with the song.
