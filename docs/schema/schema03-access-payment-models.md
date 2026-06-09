# 🗄️ schema03-access-payment-models

> **Phase A · Ticket A6** — Add the **`PaymentStatus`** enum, the **`ModuleAccess`**
> model (what a parent has unlocked), and the **`Payment`** model (Razorpay records).

---

## 🎯 Goal

Model **money and access** correctly and safely. This is the most rules-heavy part
of the schema, so read carefully — every field here defends a business rule.

---

## 💰 The golden money rule

> **Money is ALWAYS an integer number of paise. Never a float.**

- ₹5 → `500`
- ₹39 → `3900`

Floats (`5.00`) cause rounding errors (`0.1 + 0.2 ≠ 0.3` in computers). Real payment
systems store the smallest currency unit as an integer. So our `amountInPaise`
field is an **`Int`**.

---

## 🔄 The `PaymentStatus` enum

```prisma
enum PaymentStatus {
  PENDING
  PAID
  FAILED
}
```

A payment moves through a **lifecycle**:

1. **PENDING** — we created an order; the parent hasn't paid yet (or we haven't
   verified it).
2. **PAID** — the **server verified** the Razorpay signature. ✅ Only now is it real.
3. **FAILED** — verification or the payment itself failed.

> 🔐 **Critical:** a payment becomes `PAID` **only after server-side verification**,
> never because the client said so. More on this below.

---

## 🔓 The `ModuleAccess` model — what a parent unlocked

```prisma
model ModuleAccess {
  module    String   // "animals", or "ALL" for the bundle
  parentId  String   @db.ObjectId
  paymentId String?  @db.ObjectId
  @@unique([parentId, module])
}
```

### Access is tied to the PARENT (not the child)

The brief: *"pay once, all their children get access."* So `ModuleAccess` links to
**`parentId`**, not a child. When we check if a kid can play a module, we look at
**their parent's** access rows.

### The `@@unique([parentId, module])` constraint

A parent can't unlock the same module twice — the database enforces it. If a buy is
retried, we won't create duplicate access.

### The `"ALL"` bundle

The ₹39 "unlock everything" bundle is represented by a special module slug
**`"ALL"`**. The access check treats `"ALL"` as "every paid module is unlocked."
(Clean trick: no separate bundle table needed.)

### Why `paymentId` is optional

```prisma
paymentId String?  @db.ObjectId
```

A single ₹5 buy creates one payment → one access row. The ₹39 bundle creates one
payment but possibly **several** access rows. Making the link optional keeps both
cases flexible.

---

## 🧾 The `Payment` model — the Razorpay record

```prisma
model Payment {
  amountInPaise     Int           // 500 = ₹5
  currency          String        @default("INR")
  status            PaymentStatus @default(PENDING)
  module            String        // single slug or "ALL"
  razorpayOrderId   String        @unique
  razorpayPaymentId String?
  razorpaySignature String?
  parentId          String        @db.ObjectId
}
```

### The Razorpay flow this schema supports (preview of Phase D)

1. **Create order** (server): make a `Payment` row with `status = PENDING`,
   `amountInPaise = 500`, and a `razorpayOrderId` from Razorpay. → ticket `pay01`
2. **Checkout** (client): the parent pays in the Razorpay popup. Razorpay returns a
   `razorpayPaymentId` + `razorpaySignature`. → ticket `pay02`
3. **Verify** (server): recompute the HMAC SHA256 signature from the order id +
   payment id using our **secret key**. If it matches → set `status = PAID` and
   create the `ModuleAccess` row, **atomically**. → ticket `pay03`

### 🔐 Why the signature fields exist

```prisma
razorpayOrderId   String  @unique   // created by us up front
razorpayPaymentId String?           // comes back from checkout
razorpaySignature String?           // comes back from checkout — we verify it
```

We store what Razorpay sends back so the **server** can verify it. **We never trust
the client's word** that a payment succeeded — a kid (or attacker) could fake that.
The signature is cryptographic proof, checkable only with our secret key.

`razorpayOrderId` is `@unique` so the same order can't be processed twice.

---

## 🔗 Back-relations added to `Parent`

```prisma
moduleAccess  ModuleAccess[] // paid modules this parent unlocked
payments      Payment[]      // this parent's payment records
```

So from a parent we can list everything they've unlocked and every payment they've
made.

---

## 🧠 How the pieces fit together

```
Parent ──< Payment        (a parent makes many payments)
Parent ──< ModuleAccess   (a parent unlocks many modules)
Payment ──< ModuleAccess  (a verified payment grants access row(s))
```

A verified `Payment` is the *cause*; a `ModuleAccess` row is the *effect*. Access
checks read `ModuleAccess`; the audit trail of *how* it was granted lives in
`Payment`.

---

## ✅ Result

The schema can now safely represent: a pending order, a server-verified paid
payment, and the resulting per-parent module access — all with money as integer
paise and verification kept server-side.

---

## ➡️ Next ticket

**A7 · `schema04-unlock-rewardshop`** — add the **`Unlock`** model for the reward
shop, where kids spend their `totalStars` on avatars, stickers, and themes.
