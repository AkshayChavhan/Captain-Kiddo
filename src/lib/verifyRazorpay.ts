import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Razorpay signature verification (SERVER ONLY).
 *
 * After checkout, Razorpay returns order_id, payment_id, and a signature. The
 * signature is HMAC-SHA256 of "<order_id>|<payment_id>" keyed with our SECRET.
 * Only someone holding the secret (i.e. Razorpay + our server) can produce it, so
 * a valid signature proves the payment is genuine — the client cannot forge it.
 *
 * We recompute the HMAC and compare in CONSTANT TIME. Never trust the client.
 */
export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false; // no secret -> cannot verify -> deny

  const { orderId, paymentId, signature } = params;
  if (!orderId || !paymentId || !signature) return false;

  // The exact payload Razorpay signs.
  const expected = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  // Constant-time compare (guard equal length first so timingSafeEqual won't throw).
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
