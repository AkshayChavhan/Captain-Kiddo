import "server-only";
import Razorpay from "razorpay";

/**
 * Razorpay client singleton (SERVER ONLY).
 *
 * Reads the key id + SECRET from env. The secret must NEVER reach the client —
 * `server-only` makes the build fail if this file is imported into client code.
 *
 * Use TEST keys (rzp_test_...) in development and LIVE keys only in production;
 * which keys are used is decided entirely by your .env values.
 */

const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  // Fail loudly at startup rather than silently mis-charging later.
  // (In dev without keys set, payment routes will throw a clear error.)
  console.warn(
    "[razorpay] Missing NEXT_PUBLIC_RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET — payments will not work."
  );
}

export const razorpay = new Razorpay({
  key_id: keyId ?? "",
  key_secret: keySecret ?? "",
});
