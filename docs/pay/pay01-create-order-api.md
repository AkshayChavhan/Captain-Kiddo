# 💳 pay01-create-order-api

> **Phase D · Ticket D6** — Start the Razorpay flow: a server API that creates a
> Razorpay **order** and a **PENDING `Payment`** row (amount in paise).

> ⚠️ **Money ticket.** This and the next two handle real payments. The security
> choices are called out for your review.

---

## 🎯 Goal

When a parent chooses to unlock a paid module (or the ₹39 bundle), the **server**
creates a Razorpay order and records a pending payment. The client gets just enough
to open the checkout — and **never** gets to decide the price.

---

## 🧩 The 3-step Razorpay flow (where this fits)

```
1. CREATE ORDER (this ticket, pay01) — server makes an order + PENDING Payment
2. CHECKOUT      (pay02)             — client opens Razorpay, parent pays
3. VERIFY        (pay03)             — server checks the signature -> PAID + access
```

This ticket is **step 1**.

---

## 🔐 Razorpay client — [`src/lib/razorpay.ts`](../../src/lib/razorpay.ts)

```ts
import "server-only";
export const razorpay = new Razorpay({ key_id, key_secret });
```

- Reads `NEXT_PUBLIC_RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` from env.
- **`server-only`** → the build fails if this (and the secret) is ever imported into
  client code. The secret must never reach the browser.
- **Test vs live keys** is decided purely by your `.env`: use `rzp_test_...` in dev,
  live keys only in production. *(Worth confirming your `.env` has test keys.)*

---

## 💰 Server-side pricing — [`src/lib/pricing.ts`](../../src/lib/pricing.ts)

The single most important security idea in payments:

> **The client says WHAT to buy. The server decides HOW MUCH.**

```ts
resolvePurchase("animals") -> { target: "animals", amountInPaise: 500, label: "Unlock Animals" }
resolvePurchase("ALL")     -> { target: "ALL",     amountInPaise: 3900, label: "Unlock all modules" }
resolvePurchase("numbers") -> null   // free module, not purchasable
resolvePurchase("bogus")   -> null   // unknown
```

The amount comes from our **config** (the module registry / bundle constant), never
from the request body. If a malicious client sent `amount: 1`, it wouldn't matter —
we never read their amount. We also reject free/unknown targets here.

> 🧠 **Why this matters:** if the server trusted a client-sent price, anyone could buy
> a ₹5 module for ₹0.01 by editing the request. Resolving price server-side from
> config makes that impossible.

---

## 🌐 The route — [`/api/payments/create-order`](../../src/app/api/payments/create-order/route.ts)

### Gated to the parent

```ts
if (!isParentAreaUnlocked()) return 403;     // PIN must have been entered
const parentId = await getActiveParentId();
if (!parentId) return 401;
```

Checkout can only be started from behind the **parent PIN** — kids can't trigger a
purchase. This is the server enforcing the brief's rule, not just the UI.

### Create the order (amount in paise)

```ts
const order = await razorpay.orders.create({
  amount: purchase.amountInPaise,   // integer paise, e.g. 500
  currency: "INR",
  notes: { parentId, target: purchase.target },
});
```

Razorpay itself expects the amount in **paise** — which is exactly how we store money
everywhere, so no conversion, no float. The `notes` carry our own context (who, what)
for later reference.

### Record a PENDING payment

```ts
await prisma.payment.create({
  data: { parentId, module: purchase.target, amountInPaise: purchase.amountInPaise,
          currency: "INR", status: "PENDING", razorpayOrderId: order.id },
});
```

We write the payment as **PENDING** *before* the parent pays. It only becomes `PAID`
after the server verifies the signature in `pay03`. The unique `razorpayOrderId`
(from `schema03`) ties this row to the order.

### Return only what checkout needs

```ts
return { orderId, amountInPaise, currency, keyId: NEXT_PUBLIC_RAZORPAY_KEY_ID, label };
```

We send the **public** key id (safe in the browser) and the order id — **never the
secret**.

---

## 🧪 Running it (after `npm install` + Razorpay test keys in .env)

```bash
npm run dev
# (from the parent area) POST /api/payments/create-order { target: "animals" }
#   -> { orderId, amountInPaise: 500, keyId, ... }, and a PENDING Payment row exists
```

---

## ✅ Result

The server can create a Razorpay order for an authoritative, config-derived price and
record a pending payment — gated behind the parent PIN, with the secret kept
server-side and the client unable to influence the amount.

---

## ➡️ Next ticket

**D7 · `pay02-razorpay-checkout`** — open the Razorpay checkout on the client using
the order from this API, so the parent can actually pay.
