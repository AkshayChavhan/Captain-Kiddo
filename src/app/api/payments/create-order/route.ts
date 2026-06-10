import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { resolvePurchase } from "@/lib/pricing";
import { getActiveParentId } from "@/lib/activeParent";

/**
 * POST /api/payments/create-order
 *
 * Step 1 of the Razorpay flow. The logged-in parent chooses what to buy. The
 * SERVER decides the price, creates a Razorpay order, and writes a PENDING
 * Payment row. We return only what the client needs for checkout.
 *
 * SECURITY:
 *  - Gated: requires a logged-in parent.
 *  - The AMOUNT is resolved server-side from config — the client's body only says
 *    WHAT to buy ("animals" / "ALL"), never HOW MUCH. Never trust the client price.
 *
 * Body: { target: string }  // a module slug or "ALL"
 */
export async function POST(request: Request) {
  // --- Gate: logged-in parent only ---
  const parentId = await getActiveParentId();
  if (!parentId) {
    return NextResponse.json({ error: "Please log in" }, { status: 401 });
  }

  // --- Parse + resolve what's being bought ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const target = (body as { target?: unknown })?.target;
  if (typeof target !== "string") {
    return NextResponse.json({ error: "target required" }, { status: 400 });
  }

  const purchase = resolvePurchase(target);
  if (!purchase) {
    return NextResponse.json(
      { error: "Not purchasable" },
      { status: 400 }
    );
  }

  // --- Create the Razorpay order (amount in paise, integer) ---
  let order;
  try {
    order = await razorpay.orders.create({
      amount: purchase.amountInPaise, // paise, integer — never a float
      currency: "INR",
      notes: { parentId, target: purchase.target },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not create order" },
      { status: 502 }
    );
  }

  // --- Record a PENDING payment we'll verify later ---
  await prisma.payment.create({
    data: {
      parentId,
      module: purchase.target,
      amountInPaise: purchase.amountInPaise,
      currency: "INR",
      status: "PENDING",
      razorpayOrderId: order.id,
    },
  });

  // Return only what checkout needs (incl. the PUBLIC key id, not the secret).
  return NextResponse.json({
    orderId: order.id,
    amountInPaise: purchase.amountInPaise,
    currency: "INR",
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    label: purchase.label,
  });
}
