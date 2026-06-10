# ✍️ trace01-trace-canvas

> **Phase E · Ticket E1** — A reusable canvas that captures finger/pointer drag
> paths (touch + mouse) and draws the stroke. The foundation of letter tracing.

---

## 🎯 Goal

Build the **surface** kids draw on: a `<canvas>` that follows their finger, draws the
line they make, and reports the **path of points** so later tickets can check if they
traced the letter correctly.

(See the feature spec: [`docs/trace/README.md`](./README.md).)

---

## 👆 Pointer events — touch *and* mouse, one code path

```tsx
onPointerDown={handleDown}
onPointerMove={handleMove}
onPointerUp={handleUp}
onPointerCancel={handleUp}
```

We use **Pointer Events** (not separate touch/mouse handlers). One pointer is a
finger, a stylus, or a mouse — same events for all. For a kids' touch app this is
exactly right (and it's the same choice we made for the drag-drop quiz in `numbers06`).

```tsx
e.currentTarget.setPointerCapture(e.pointerId);
```

**Pointer capture** keeps sending us events even if the finger drifts slightly off the
canvas mid-stroke — so a wobbly little hand doesn't accidentally "lift" the pen.

```css
touch-none   /* Tailwind -> touch-action: none */
```

`touch-action: none` stops the browser from scrolling/zooming the page while the child
drags on the canvas — essential, or tracing would scroll the screen.

---

## 📐 Screen coords → canvas coords

A canvas has an internal pixel size (`width`/`height`) that can differ from its
on-screen CSS size. So we convert:

```ts
const rect = canvas.getBoundingClientRect();
return {
  x: ((e.clientX - rect.left) / rect.width) * canvas.width,
  y: ((e.clientY - rect.top)  / rect.height) * canvas.height,
};
```

This maps where the finger touched **on screen** to a point in the **canvas's own
coordinate system**. Getting this right is what makes the drawn line land exactly
under the finger (and lets on-path detection in `trace03` compare against the letter
guide accurately).

---

## ✏️ Drawing the stroke

As the finger moves, we draw a line segment from the previous point to the new one:

```ts
ctx.beginPath();
ctx.moveTo(prev.x, prev.y);
ctx.lineTo(p.x, p.y);
ctx.stroke();
```

With round caps/joins and a thick line (`lineCap/lineJoin = "round"`, `lineWidth: 18`)
so it looks like a fat, friendly crayon stroke. Each `down` clears the canvas to start
a fresh attempt.

---

## 📤 Reporting the path

The component is **drawing-uncontrolled** (it renders the live stroke itself) but
**reports** what's happening via callbacks:

| Callback | When | Gives you |
|----------|------|-----------|
| `onStrokeStart` | finger down | — (begin a new attempt) |
| `onStrokeMove`  | each move | the new point + the full path so far |
| `onStrokeEnd`   | finger up | the complete path of points |

We accumulate points in a `pathRef` (a ref, not state — we don't want a re-render on
every pixel of movement; that would be janky). The path of `{x, y}` points is the raw
material the next tickets analyze.

> 🧠 **Why a ref for the path, not state?** A finger drag fires *many* move events per
> second. Storing each in React state would re-render constantly and stutter. A ref
> holds the path without re-rendering; we only surface it through callbacks when
> useful.

---

## 🧩 The overlay slot

```tsx
{children && <div className="pointer-events-none absolute inset-0">{children}</div>}
```

A `children` slot renders **above** the canvas but ignores pointer events
(`pointer-events-none`). That's where the **letter guide outline** (trace02) will go —
the child sees the letter to trace, but their finger still draws on the canvas
underneath.

---

## 🧪 Using it (preview)

```tsx
<TraceCanvas
  onStrokeEnd={(path) => console.log("traced path:", path)}
>
  {/* letter guide goes here in trace02 */}
</TraceCanvas>
```

---

## ✅ Result

We have a reusable, touch-friendly tracing surface: it follows the finger, draws a
crayon-like stroke, converts coordinates correctly, and reports the path — ready for
the letter guide and on-path checking to build on.

---

## ➡️ Next ticket

**E2 · `trace02-letter-guide-paths`** — define the letter outline guide data (the
stroke path for each letter A–Z) and show it as the overlay to trace over.
