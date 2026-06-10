import { NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/verifyRazorpay";
import { markPaidAndGrant } from "@/lib/grantAccess";

/**
 * POST /api/payments/verify
 *
 * Step 3 (final) of the Razorpay flow. The client forwards the checkout result;
 * we VERIFY the signature server-side and, only if valid, mark the Payment PAID
 * and grant ModuleAccess — atomically.
 *
 * SECURITY: the client is never trusted. A request reaches here claiming a
 * payment succeeded; we only believe it if the HMAC signature (computable only
 * with our secret) checks out. A failed check marks nothing and grants nothing.
 *
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof orderId !== "string" ||
    typeof paymentId !== "string" ||
    typeof signature !== "string"
  ) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // 1. Verify the signature SERVER-SIDE. This is the gate — fail = deny.
  const valid = verifyRazorpaySignature({ orderId, paymentId, signature });
  if (!valid) {
    return NextResponse.json(
      { error: "Signature verification failed" },
      { status: 400 }
    );
  }

  // 2. Only now: mark PAID + grant access, atomically.
  const result = await markPaidAndGrant(orderId, { paymentId, signature });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Could not grant access" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
