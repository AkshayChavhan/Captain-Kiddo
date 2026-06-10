# 🗣️ modules04-text-to-speech

> **Change** — Replace pre-recorded `.mp3` audio for learning content with the
> browser's built-in **text-to-speech** (Web Speech API). No audio files, no 404s —
> the device *reads the words aloud*.

---

## 🎯 Why

The app referenced `/audio/numbers/1.mp3`, `/audio/colors/red.mp3`, etc. — files that
didn't exist, causing constant **404s** and silence. Recording dozens of clips is a
lot of work. Instead, the browser can **speak any text for free**, offline, with zero
dependencies. Feed it `"one"`, `"yellow"`, `"lion"` → it says it out loud.

---

## 🔊 The TTS core — [`src/lib/speak.ts`](../../src/lib/speak.ts)

```ts
speak("yellow");   // the device says "yellow"
```

Uses `window.speechSynthesis` (the **Web Speech API**, built into all modern
browsers):

```ts
const u = new SpeechSynthesisUtterance(text);
u.rate = 0.9; u.pitch = 1.1;   // a touch slower + higher = kid-friendly
window.speechSynthesis.cancel(); // stop any current speech so taps don't stack
window.speechSynthesis.speak(u);
```

- **No install, no files, no network.** It's part of the browser.
- Safe everywhere: if a browser lacks support, it just does nothing (never throws).

### The hook — [`useSpeak`](../../src/hooks/useSpeak.ts)

```ts
const say = useSpeak(text, { onAppear: true });
```

Returns a stable `say()` and, with `onAppear`, speaks once when the component mounts
(or `text` changes) — the **audio-first "say it as it appears"** behavior. Components
keyed by the current item remount per item, so it speaks each new item automatically.

---

## 📝 What gets spoken — [`moduleContent.ts`](../../src/config/moduleContent.ts)

`ContentItem` lost its `audio: string` (file path) and gained `speak: string` (the
word to say):

| Module | `speak` value | Says |
|--------|---------------|------|
| Numbers | `NUMBER_WORDS[n]` | "three" (not "3") |
| Colors | the key | "yellow" |
| Alphabets | the letter | "A" |
| Animals/Shapes/Fruits | the key | "lion", "triangle", "apple" |

> Numbers spell out as words (`"3"` → `"three"`) so TTS reads them naturally; the
> on-screen label still shows the digit.

---

## 🔁 Everywhere audio used to play, now speaks

| Component | Before (mp3) | After (TTS) |
|-----------|--------------|-------------|
| `ItemCard` | `useSound(item.audio)` | `useSpeak(item.speak, {onAppear})` |
| `ItemQuiz` | prompt mp3 + feedback mp3 | speak prompt + `speak("Great job!"/"Try again!")` |
| `TapQuiz` / `DragDropQuiz` | feedback mp3 | `speak("Great job!"/"Try again!")` |
| `TraceGlyph` | `audioSrc` prop + feedback mp3 | `speakText` prop + `speak(...)` |

Auto-speak on appear, tap to replay — consistent across learning + tracing + quizzes.

---

## 🧹 Removed (now dead)

Since nothing references the audio-file system anymore, these were deleted:

- `src/hooks/useSound.ts` (the mp3 play hook)
- `src/config/audio.ts` (the mp3 path helpers)
- `src/components/learning/TraceLetter.tsx` + `LetterGuide.tsx` — superseded by the
  generic `TraceGlyph` + `GlyphGuide` (TraceActivity now uses `TraceGlyph`)
- `src/components/learning/NumberCard.tsx` — superseded by the generic `ItemCard`

> 🎵 **Media players are untouched.** Songs / lullabies / sleep stories play **real
> audio files** via `useAudioPlayer` (you can't text-to-speech a lullaby). TTS only
> replaces the *spoken-label* learning audio.

---

## 🧒 The result

```
Tap 1   -> "one"        (and auto-spoken when it appears)
Tap 🟡  -> "yellow"
Tap A   -> "A"
Tap 🦁  -> "lion"
Quiz:   prompt spoken; correct -> "Great job!", wrong -> "Try again!"
Trace:  the glyph is spoken; off-path -> "Try again!" + red blink
```

No audio files to record, no 404s, works offline. Adding a new item = just its
`label`/`emoji`/`speak` text.

---

## 📝 Note

TTS **voices vary by device/OS** (the system's installed voices). It always *works*,
but the exact voice differs between phones/browsers. If you later want a single
consistent custom voice, you can reintroduce per-item audio files and prefer them when
present — but the default now is zero-setup and always-on.
