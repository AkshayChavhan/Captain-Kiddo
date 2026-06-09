# 🔌 setup04-prisma-client-singleton

> **Phase A · Ticket A9** — Create a hot-reload-safe **Prisma Client singleton** at
> [`src/lib/prisma.ts`](../../src/lib/prisma.ts).

---

## 🎯 Goal

Make **one** shared database client that the whole app imports — and make it safe
against Next.js hot-reloading in development.

---

## ❓ The problem this solves

To talk to the database, we use a **`PrismaClient`**. Each client opens a pool of
**connections** to MongoDB. Databases allow only a limited number of connections.

Here's the trap. In development, **Next.js hot-reloads** your code every time you
save a file. If our code did this:

```ts
// ❌ naive version
export const prisma = new PrismaClient();
```

…then **every save would create a brand-new client** with brand-new connections.
After a dozen edits you'd see:

```
Error: Too many connections
```

We need exactly **one** client that survives reloads.

---

## 🧠 The "singleton" pattern

A **singleton** means "only ever one instance of this thing." The trick to surviving
hot reloads is to stash that single instance on **`globalThis`**.

> `globalThis` is the one object in JavaScript that **persists across Next.js hot
> reloads**. Normal module variables get wiped on reload; `globalThis` does not.

So the plan is:
1. Look on `globalThis` for an existing client.
2. If found → reuse it.
3. If not → create one (and, in dev, save it on `globalThis` for next time).

---

## 📄 The code, explained

```ts
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]   // chatty in dev (great for learning)
      : ["error"],                   // quiet in prod
  });
};
```
A small factory function that builds the client the same way everywhere. In **dev**
it logs every query (so you can *see* what Prisma runs — very educational); in
**prod** it only logs errors.

```ts
type GlobalWithPrisma = typeof globalThis & {
  prismaGlobal?: ReturnType<typeof prismaClientSingleton>;
};
const globalForPrisma = globalThis as GlobalWithPrisma;
```
TypeScript doesn't know `globalThis` might carry our client, so we describe that with
a type. `ReturnType<typeof prismaClientSingleton>` just means "whatever type the
factory returns" — i.e. a `PrismaClient`.

```ts
export const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton();
```
The heart of it. The `??` (nullish-coalescing) operator means:
> "Use the cached `prismaGlobal` if it exists; **otherwise** create a new one."

```ts
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaGlobal = prisma;
}
```
In **development**, save the instance on `globalThis` so the *next* hot reload finds
and reuses it. In **production** we skip this — there are no hot reloads, so the
global stays clean.

---

## 🚀 How we use it everywhere

Thanks to the `@/` alias (from `setup01`), any file can do:

```ts
import { prisma } from "@/lib/prisma";

const kids = await prisma.child.findMany();
const parent = await prisma.parent.findUnique({ where: { email } });
```

Every part of the app shares this **one** client. We never write
`new PrismaClient()` anywhere else again.

---

## 🧪 Note on running it

This file imports from `@prisma/client`, which only exists after you run:

```bash
npm install         # installs dependencies
npm run db:generate # generates the typed client from schema.prisma
```

Until then your editor may show an "`@prisma/client` not found" hint — that's
expected; it resolves once the client is generated.

---

## ✅ Result

The app now has a single, shared, hot-reload-safe database client. No more "too many
connections" in development, and a clean single instance in production.

---

## ➡️ Next ticket

**A10 · `setup05-module-registry`** — build the central **module registry** config:
one array describing every learning module (slug, title, emoji, color, isFree,
priceInPaise) so adding a new module is a **one-line change**.
