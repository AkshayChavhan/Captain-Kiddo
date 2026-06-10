# 🔐 pay03-verify-and-grant-access

> **Phase D · Ticket D8** (the critical one) — Verify the Razorpay **HMAC signature
> server-side**, mark the `Payment` **PAID**, and create **`ModuleAccess`**
> atomically. **Never trust the client.**

> ⚠️ This is the security linchpin of the entire payment system. Read carefully.

---

## 🎯 Goal

A request arrives claiming "the payment succeeded — give me access." We must **prove**
it's real before granting anything. The proof is a cryptographic signature only
Razorpay (using our secret) could have produced.

---

## ✍️ How the signature works — [`src/lib/verifyRazorpay.ts`](../../src/lib/verifyRazorpay.ts)

After checkout, Razorpay returns `order_id`, `payment_id`, and a `signature`. That
signature is:

```
HMAC_SHA256( "<order_id>|<payment_id>", OUR_SECRET_KEY )
```

We **recompute** it on our server and compare:

```ts
const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
// constant-time compare expected vs the signature the client sent
return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
```

### Why this is trustworthy

- The HMAC depends on **our secret key**, which only Razorpay and our server know.
- An attacker can send any `order_id`/`payment_id` they like — but they **cannot
  produce a matching signature** without the secret. So a valid signature *proves*
  Razorpay actually processed this payment.
- **`timingSafeEqual`** compares in constant time, so an attacker can't brute-force
  the signature byte-by-byte by measuring response times.
- **`server-only`** + reading the secret from env keeps the key off the client.

> 🧠 **This is the whole reason the client can't cheat.** Earlier tickets kept saying
> "verify server-side" — *this* is what that means. The popup's "success" is just a
> claim; the signature is the proof.

---

## ⚛️ Grant access atomically — [`src/lib/grantAccess.ts`](../../src/lib/grantAccess.ts)

Once verified, we flip the payment to PAID **and** create the access row in **one
transaction**:

```ts
prisma.$transaction(async (tx) => {
  const payment = await tx.payment.findUnique({ where: { razorpayOrderId } });
  if (payment.status === "PAID") return { ok: true };   // idempotent

  await tx.payment.update({ where: { id: payment.id },
    data: { status: "PAID", razorpayPaymentId, razorpaySignature } });

  await tx.moduleAccess.upsert({
    where: { parentId_module: { parentId: payment.parentId, module: payment.module } },
    create: { parentId: payment.parentId, module: payment.module, paymentId: payment.id },
    update: {},
  });
});
```

### Three safety properties

1. **Atomic** (`$transaction`): the payment can't be marked PAID without the access
   row being created, or vice versa. They succeed together or roll back together.
2. **Idempotent**: if `verify` is called twice (network retry, double-submit), the
   second call sees `status === "PAID"` and returns success **without** re-granting.
3. **Constraint backstop**: the `upsert` keyed on `@@unique([parentId, module])`
   (from `schema03`) means even a race can't create duplicate access — the `update:
   {}` branch just no-ops.

> 🧠 **Why so much care about duplicates?** Payment webhooks/callbacks can fire more
> than once. Idempotency + the unique constraint ensure "pay once, granted once" no
> matter how many times verify runs. This is standard payment-system hygiene.

### The bundle

`payment.module` is either a module slug or `"ALL"`. Granting `"ALL"` creates one
`ModuleAccess` row with `module = "ALL"` — and the access helpers (`canAccessModule`,
`canAccessMedia`) already treat `"ALL"` as "everything unlocked". No special-casing
needed here.

---

## 🌐 The route — [`/api/payments/verify`](../../src/app/api/payments/verify/route.ts)

```ts
const valid = verifyRazorpaySignature({ orderId, paymentId, signature });
if (!valid) return 400;                       // FAIL -> grant nothing

const result = await markPaidAndGrant(orderId, { paymentId, signature });
return result.ok ? { ok: true } : 400;
```

Strict order: **verify first, grant second.** If verification fails, we mark nothing
and grant nothing — the PENDING payment just stays pending. Access is *only* ever
created behind a passed signature check.

This closes the loop the checkout (`pay02`) was calling into — paid modules now
actually unlock.

---

## 🔁 The full flow, end to end

```
pay01  server: create order + PENDING Payment (price from config)
pay02  client: Razorpay popup -> parent pays -> forwards result
pay03  server: VERIFY signature ✔ -> Payment PAID + ModuleAccess (atomic)
        └─ canAccessModule / canAccessMedia now return true -> 🔓 unlocked
```

Money is integer paise throughout; the secret never leaves the server; the client
never decides price or grants access.

---

## 🧪 Running it (after `npm install` + Razorpay TEST keys)

```bash
npm run dev
# /parent -> unlock -> buy a module -> pay with a Razorpay TEST card
#   -> verify passes -> Payment PAID, ModuleAccess created
#   -> that module's 🔒 is gone for all the parent's children
```

> 💳 Use Razorpay's official **test card numbers** in test mode — no real charge.

---

## ✅ Result — payments complete

The Razorpay flow is end-to-end and secure: server-created orders, a PCI-safe popup,
and **server-side HMAC verification** that atomically marks the payment PAID and
grants per-parent access — idempotently, with money as integer paise, and the client
trusted for nothing.

---

## ➡️ Next ticket

**D9 · `shop01-reward-shop`** — the reward shop: kids spend their earned `totalStars`
to unlock avatars/stickers/themes (the `Unlock` model), deducting from their balance
atomically. (Stars, not money.)
