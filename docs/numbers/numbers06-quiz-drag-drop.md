# 🎯 numbers06-quiz-drag-drop

> **Phase B · Ticket B7** — The second quiz type: **drag-and-drop matching**. Drag a
> numeral onto the group of objects with the matching quantity.

---

## 🎯 Goal

A different, more physical way to practice: the child **drags the number** (e.g. "3")
onto the group showing that many objects (🍎🍎🍎). Right → star + celebrate; wrong →
the chip springs back to try again.

---

## ⚠️ The hard part: drag-and-drop on touchscreens

The browser's built-in **HTML5 drag-and-drop** (`draggable`, `ondrop`) was designed
for a *mouse* and works **poorly on phones** — which is exactly our audience. So we
don't use it.

Instead we use **Framer Motion's `drag`**, which is **pointer-based**: it works the
same for a finger or a mouse. We then detect the drop ourselves by comparing where
the chip was released against each group's on-screen box.

> 🧠 **Takeaway:** for a kids' touch app, prefer pointer-based dragging (Framer
> Motion / Pointer Events) over native HTML5 DnD.

---

## 🧲 The draggable number chip

```tsx
<motion.div
  key={resetNonce}        // bump to snap the chip back to start
  drag                    // make it draggable (touch + mouse)
  dragSnapToOrigin        // if not dropped on a target, glide back
  onDragEnd={(_e, info) => handleDragEnd(info.point)}
  whileDrag={{ scale: 1.15, zIndex: 10 }}  // grows while held
>
  {question.answer}
</motion.div>
```

- **`drag`** — enables dragging in any direction.
- **`dragSnapToOrigin`** — if released in empty space, the chip animates back home.
- **`onDragEnd`** gives us `info.point` — the pointer's **screen coordinates** at
  release. That's what we use to figure out which group it landed on.
- **`whileDrag`** scales it up so the child sees it "lift".

---

## 📦 The drop targets + hit detection

Each group registers its DOM element in a `ref` map keyed by its count:

```tsx
ref={(el) => { el ? groupRefs.current.set(count, el) : groupRefs.current.delete(count); }}
```

On drop, we check the release point against each group's bounding box:

```tsx
const handleDragEnd = (point) => {
  let droppedOn = null;
  groupRefs.current.forEach((el, count) => {
    const r = el.getBoundingClientRect();
    if (point.x >= r.left && point.x <= r.right &&
        point.y >= r.top  && point.y <= r.bottom) {
      droppedOn = count;
    }
  });
  // correct if the group we dropped on equals the answer
};
```

`getBoundingClientRect()` returns an element's position/size on screen. If the drop
point falls inside a group's rectangle, that's the group the child chose.

> 🧠 **Why measure boxes ourselves?** Because we're not using native DnD, there's no
> "drop event" telling us the target. Comparing the release point to each target's
> rectangle is the simple, reliable way to know where it landed.

---

## ⭐ Reusing the quiz plumbing

This quiz **reuses** what `numbers05` built:

- the **same `quizStore`** (`addCorrect`/`addWrong`, the ⭐ tally),
- the **same feedback sounds** (`useSound` + `FEEDBACK_AUDIO`),
- the **same `makeTapQuestion`** generator (answer + groups to show).

Only the *interaction* differs (drag vs tap). That's the payoff of separating
question logic + tally from the UI back in B6.

### Wrong answer → spring back

```tsx
setResetNonce((n) => n + 1); // changes the chip's key -> it remounts at origin
```

Changing the chip's `key` remounts it, snapping it back to the start for another go —
a gentle "not quite, try again," no scary feedback.

---

## 🔗 Two-round quiz session (`QuizRunner`)

The runner now drives a small **state machine**: `tap → drag → done`.

```tsx
type Stage = "tap" | "drag" | "done";
// tap quiz finishes -> setStage("drag")
// drag quiz finishes -> setStage("done") -> celebrate
```

So one quiz session is: tap-the-answer round, then drag-and-drop round, then the 🎉
star total. The star tally carries across both rounds (same store).

---

## 🧪 Running it (after `npm install`)

```bash
npm run dev
# /learn/numbers/easy/quiz
#   round 1: tap the matching number
#   round 2: drag the number onto the matching group
```

---

## ✅ Result

Kids get a second, hands-on quiz style — dragging numerals onto matching groups —
that works properly on touchscreens, reuses all the quiz plumbing, and chains with
the tap quiz into one rewarding session.

---

## ➡️ Next ticket

**B8 · `numbers07-celebration-confetti`** — a confetti / star-burst celebration on
correct answers (Framer Motion) plus the encouraging audio feedback, to make wins
feel big.
