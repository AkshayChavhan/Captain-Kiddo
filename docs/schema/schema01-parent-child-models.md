# 🗄️ schema01-parent-child-models

> **Phase A · Ticket A4** — Start the Prisma schema: the MongoDB datasource setup
> plus the **`Parent`** and **`Child`** models.

---

## 🎯 Goal

Create the first two database models and learn the **Prisma + MongoDB** building
blocks we'll reuse for every model after this.

---

## 🧩 What is Prisma (in one minute)?

**Prisma** is an **ORM** — a tool that lets us talk to the database using
*type-safe JavaScript/TypeScript* instead of raw queries. We describe our data once
in `schema.prisma`, and Prisma:

1. **Generates a client** so we can write `prisma.child.findMany()` with full
   autocomplete and type checking.
2. **Syncs the shape** to MongoDB with `npm run db:push`.

---

## 🔧 The top of the file: generator + datasource

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

- **`generator client`** → "generate the JS/TS client we import as `@prisma/client`".
- **`datasource db`** → which database we use:
  - `provider = "mongodb"` — we're on MongoDB.
  - `url = env("DATABASE_URL")` — read the connection string from `.env` (the one
    we set up in `setup03`). Secrets stay out of the schema file. ✅

---

## 🆔 The MongoDB id pattern (memorize this)

Every model starts its id with the **exact same line**:

```prisma
id String @id @default(auto()) @map("_id") @db.ObjectId
```

Breaking it down:

| Part | Meaning |
|------|---------|
| `@id` | This field is the primary key. |
| `@default(auto())` | MongoDB auto-generates the id. |
| `@map("_id")` | In Mongo the id column is literally called `_id`; this maps our `id` to it. |
| `@db.ObjectId` | Store it as a real Mongo **ObjectId** type (not a plain string). |

> 🧠 **Rule from the brief:** *all relations use `@db.ObjectId`.* So any field that
> points to another model's id (a "foreign key") also gets `@db.ObjectId`.

---

## 👨‍👩‍👧 The `Parent` model

The **account owner**. Key fields:

```prisma
email   String  @unique   // no two parents share an email
name    String?           // "?" = optional
pinHash String?           // the parent PIN, HASHED (never plain text)
```

### 🔐 Why `pinHash`, not `pin`?

The brief says the **paywall/checkout is gated behind a parent PIN** so kids can't
buy things. We must store that PIN safely:

- ❌ **Never** store the PIN as plain text. If the DB leaked, every PIN would be
  exposed.
- ✅ Store a **one-way hash** of it. When the parent types their PIN, the server
  hashes the input and compares hashes. We can verify it without ever keeping the
  real PIN.

(The actual hashing/checking logic comes later in the `parent01-pin-protection`
ticket — here we just give it a safe home in the schema.)

### Timestamps

```prisma
createdAt DateTime @default(now())   // set once, when the row is created
updatedAt DateTime @updatedAt        // auto-updates on every change
```
Almost every model gets these — they're handy for sorting and debugging.

### The relation

```prisma
children Child[]   // one parent -> many children
```
This says a parent has an **array of children**. It's the "one" side of a
one-to-many relationship.

---

## 🧒 The `Child` model

A **kid profile**. Key fields:

```prisma
name       String
age        Int               // 3–6 for our audience
avatar     String?           // chosen avatar image key/url
totalStars Int    @default(0) // reward currency, starts at 0
```

### ⭐ Why `totalStars` is an `Int`

Stars are a **counted currency** kids earn and spend in the reward shop. Counts are
always whole numbers → `Int`, default `0`. (Same spirit as the money rule: discrete
values are integers, never floats.)

### The relation back to the parent

```prisma
parentId String @db.ObjectId
parent   Parent @relation(fields: [parentId], references: [id], onDelete: Cascade)
```

This is the **"many" side** of the relationship:

| Part | Meaning |
|------|---------|
| `parentId @db.ObjectId` | The foreign key — which parent owns this child. |
| `@relation(fields: [parentId], references: [id])` | Links `parentId` → `Parent.id`. |
| `onDelete: Cascade` | If a parent is deleted, their children are deleted too (no orphans). |

### Index

```prisma
@@index([parentId])
```
We'll often query "all children of this parent", so we **index** `parentId` to make
that fast.

---

## 🏷️ `@@map` — friendly collection names

```prisma
@@map("parents")   // on Parent
@@map("children")  // on Child
```
By default Prisma would name the Mongo collection after the model (`Parent`).
`@@map` lets us use clean, lowercase, plural collection names (`parents`,
`children`) — a common convention.

---

## 🧪 How you'd apply this (later)

Once `.env` has a real `DATABASE_URL`:

```bash
npm run db:push      # creates the `parents` & `children` collections in MongoDB
npm run db:generate  # regenerates the type-safe client
```

(We don't run these yet — more models are coming in A5–A8, and we push once the
schema is fuller.)

---

## ✅ Result

The schema now has its **foundation**: the MongoDB datasource, the reusable id
pattern, and the `Parent ↔ Child` relationship — with the parent PIN stored safely
as a hash.

---

## ➡️ Next ticket

**A5 · `schema02-progress-testresult`** — add the **tier-aware `Progress`** model
(tracks Easy/Medium/Hard completion per child per module) and the **`TestResult`**
model (quiz attempts vs scores, later used to find "weak areas").
