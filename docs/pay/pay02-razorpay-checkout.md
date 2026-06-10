# 💳 pay02-razorpay-checkout

> **Phase D · Ticket D7** — Open the **Razorpay checkout** on the client using the
> order from `pay01`, so the parent can actually pay.

> ⚠️ **Money ticket.** Note the recurring rule: the client opens the popup and
> *reports* the result, but the server still **verifies** everything (pay03).

---

## 🎯 Goal

Turn the server-created order into an actual payment: load Razorpay's checkout popup,
let the parent pay, and hand the result to the verify API.

---

## 🪝 The checkout hook — [`useRazorpayCheckout`](../../src/hooks/useRazorpayCheckout.ts)

`buy(target)` runs the whole client side of a purchase:

```
1. POST /api/payments/create-order { target } -> { orderId, amount, keyId, label }
2. load Razorpay's checkout.js (once, on demand)
3. open the popup with the order
4. on success -> POST the result to /api/payments/verify (pay03)
```

### Loading the script on demand

```ts
function loadCheckoutScript() {
  if (window.Razorpay) return resolve(true);       // already loaded
  // else inject <script src="checkout.razorpay.com/v1/checkout.js"> once
}
```

We don't put the script in the app layout — it only loads when a parent actually
starts a purchase. Less weight for the 99% of the time no one is buying.

### Opening the popup

```ts
const rzp = new window.Razorpay({
  key: order.keyId,            // PUBLIC key id (safe in browser)
  amount: order.amountInPaise, // from the server, in paise
  order_id: order.orderId,
  handler: async (response) => { /* verify server-side */ },
  modal: { ondismiss: () => ... },   // parent closed the popup
});
rzp.open();
```

> 🧠 **We never touch card numbers.** Razorpay's popup collects and processes the
> card details on *their* domain. Our app never sees them — which keeps us out of
> PCI-compliance scope. That's a big reason to use a gateway popup rather than a
> custom card form.

### The success handler → verify

```ts
handler: async (response) => {
  const verifyRes = await fetch("/api/payments/verify", {
    method: "POST",
    body: JSON.stringify({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    }),
  });
  verifyRes.ok ? onPaid?.() : setError("could not be verified");
}
```

> 🔐 **Critical:** Razorpay calling our `handler` means the popup *thinks* it
> succeeded — but we do **NOT** grant access here. We send the three values
> (`order_id`, `payment_id`, `signature`) to **our** server, which cryptographically
> verifies them (pay03) before unlocking anything. A client can fake a `handler`
> call; it cannot fake a valid signature.

> ⚠️ `/api/payments/verify` is built in **pay03** (next ticket). Until then this POST
> 404s — the checkout opens and pays, but access isn't granted yet.

---

## 🔘 The buy button — [`BuyButton`](../../src/components/parent/BuyButton.tsx)

A thin wrapper: shows `label — ₹price`, calls `buy(target)`, shows a pending state and
any error. On a verified payment (`onPaid`) it `router.refresh()`es so the now-unlocked
content updates.

```tsx
const { buy, pending, error } = useRazorpayCheckout(() => router.refresh());
```

---

## 🛒 The buy section — [`UnlockModules`](../../src/components/parent/UnlockModules.tsx)

A **server component** that decides what's still buyable and renders buttons:

```tsx
const buyable = getPaidModules().filter((m) => !unlocked.has(m.slug));
// renders: the ₹39 "ALL" bundle first, then each remaining ₹5 module
```

- If the parent owns the **bundle** (`"ALL"`), everything's unlocked → "All modules
  unlocked 🎉", nothing to sell.
- Otherwise it lists the bundle (best value, first) + each not-yet-owned paid module.

> 🧠 **Only show what's buyable.** Computing `unlockedSlugs` on the server and
> filtering means a parent never sees a "buy" button for something they already own.

---

## 🖥️ Wiring — [`/parent/page.tsx`](../../src/app/parent/page.tsx)

The dashboard loads the parent's existing access and passes it down:

```tsx
const access = await prisma.moduleAccess.findMany({ where: { parentId }, select: { module: true } });
const unlockedSlugs = access.map((a) => a.module);
const hasBundle = unlockedSlugs.includes(BUNDLE_SLUG);
...
<UnlockModules unlockedSlugs={unlockedSlugs} hasBundle={hasBundle} />
```

So the buy section sits in the PIN-protected dashboard — checkout is reachable only
from behind the parent gate, exactly as required.

---

## 🧪 Running it (after `npm install` + Razorpay test keys; pay03 for full success)

```bash
npm run dev
# /parent -> unlock -> "Unlock modules" -> tap a module -> Razorpay popup opens
#   (use Razorpay TEST card details to pay)
```

---

## ✅ Result

Parents can open Razorpay's secure checkout from the dashboard and pay for a module or
the bundle. The success path forwards to server-side verification (pay03) — the client
never grants access itself, and we never handle card data.

---

## ➡️ Next ticket

**D8 · `pay03-verify-and-grant-access`** — the crucial one: verify the Razorpay HMAC
signature **server-side**, mark the `Payment` PAID, and create `ModuleAccess`
atomically. Never trust the client.
