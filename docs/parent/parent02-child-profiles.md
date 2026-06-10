# 👨‍👩‍👧 parent02-child-profiles

> **Phase D · Ticket D2** — Manage multiple **child profiles** (name, age, avatar)
> inside the PIN-protected parent area.

---

## 🎯 Goal

Let a parent add, view, and remove their kids' profiles. Each child has a name, age,
and a fun avatar — and all of this lives **behind the PIN gate** from D1.

---

## 🛡️ Server actions, gate enforced server-side — [`children/actions.ts`](../../src/app/parent/children/actions.ts)

The profile actions (`addChild`, `removeChild`) **re-check the gate on the server**,
not just in the UI:

```ts
async function requireParent() {
  if (!isParentAreaUnlocked()) return { ok: false, error: "Parent area is locked." };
  const parentId = await getActiveParentId();
  if (!parentId) return { ok: false, error: "No parent account found." };
  return { ok: true, parentId };
}
```

> 🔐 **Why re-check here?** A UI gate alone isn't security — a crafted request could
> call the action directly. By verifying `isParentAreaUnlocked()` **and** the active
> parent inside every action, the server is the real gatekeeper. Defense in depth.

### Children always belong to the active parent

We **never** accept a `parentId` from the client:

```ts
await prisma.child.create({ data: { ...input, parentId: guard.parentId } });
```

And deletes are **scoped** so a parent can only remove *their own* child:

```ts
await prisma.child.deleteMany({ where: { id: childId, parentId: guard.parentId } });
```

> 🧠 Using `deleteMany` with both `id` and `parentId` means a request to delete
> someone else's child simply matches nothing (`count === 0`) — it can't delete
> across accounts. This is an **authorization** check, not just authentication.

### Validation

`addChild` trims the name and bounds the age (1–12) before writing — never trust raw
input.

### `revalidatePath("/parent")`

After a change, we revalidate the parent page so its server-rendered child list
reflects the new data on the next render.

---

## 🎨 Avatar presets — [`src/config/avatars.ts`](../../src/config/avatars.ts)

```ts
export const AVATARS = ["🦄","🐯","🐸","🐧","🦊","🐼","🐵","🦁","🐰","🐨"];
export const DEFAULT_AVATAR = "🐻";
```

Avatars are emoji, stored as a string in `Child.avatar`. Keeping them in config means
adding one is a one-line change — and the **reward shop** (shop01) can later let kids
unlock more.

---

## 🖼️ The UI — [`ChildProfiles.tsx`](../../src/components/parent/ChildProfiles.tsx)

A client component that lists existing kids and toggles an add-form:

- Each profile card shows the avatar, name, "Age N · ⭐ stars", and a 🗑️ remove
  button.
- The add-form has a name input, an age stepper, and a tappable **avatar picker**.
- On save it calls `addChild`, clears the form, and `router.refresh()`es so the
  server re-renders the list.

### A naming gotcha worth learning: don't name a prop `children`

This component takes the list of kids. The natural name would be `children` — but
**`children` is a reserved React prop** (the content nested between a component's
tags). Passing it explicitly (`<ChildProfiles children={...} />`) is confusing and
the linter flags it (rule S6748). So we named the prop **`kids`** instead:

```tsx
<ChildProfiles kids={children} />   // page's local var is `children`, prop is `kids`
```

> 🧠 **Lesson:** avoid `children` as a custom prop name. Reserve it for actual nested
> JSX; use a domain name (`kids`, `items`, …) for data lists.

---

## 🖥️ Wiring into the dashboard — [`/parent/page.tsx`](../../src/app/parent/page.tsx)

The (now `async`) server page, when unlocked, fetches the active parent's children
and passes them down:

```tsx
const children = parentId
  ? await prisma.child.findMany({ where: { parentId }, select: {...}, orderBy: { createdAt: "asc" } })
  : [];
return <ChildProfiles kids={children} />;
```

We `select` only the fields the UI needs (id, name, age, avatar, totalStars) — not
the whole row — keeping the payload lean.

---

## 🧪 Running it (after `npm install` + unlocked parent area)

```bash
npm run dev
# /parent -> enter PIN -> "Add a child" -> name/age/avatar -> Save
#   the new profile appears; 🗑️ removes one
```

---

## ✅ Result

Parents can manage multiple child profiles from inside the protected area, with all
create/delete enforced server-side and scoped to their own account — the foundation
the per-child progress and goals build on next.

---

## ➡️ Next ticket

**D3 · `parent03-progress-dashboard`** — show per-child progress: modules completed,
tiers reached, and stars earned, read from the `Progress` rows.
