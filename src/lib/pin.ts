import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * Parent PIN hashing + verification (SERVER ONLY).
 *
 * The parent PIN gates the paywall/parent area so kids can't make purchases. We
 * NEVER store the PIN in plain text and NEVER compare it on the client.
 *
 * Hashing uses Node's built-in scrypt (no extra dependency). We store the result
 * as "salt:hash" (both hex). Verifying re-derives the hash from the entered PIN
 * with the stored salt and compares in constant time.
 *
 * The `server-only` import makes the build FAIL if this file is ever imported
 * into a client bundle — a guardrail so the crypto never leaks to the browser.
 */

const scryptAsync = promisify(scrypt);
const KEYLEN = 64;

/** Hash a PIN for storage. Returns "salt:hash" (hex). */
export async function hashPin(pin: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(pin, salt, KEYLEN)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

/**
 * Verify an entered PIN against a stored "salt:hash".
 * Returns false (never throws) on any malformed input.
 */
export async function verifyPin(
  pin: string,
  stored: string | null | undefined
): Promise<boolean> {
  if (!stored || !stored.includes(":")) return false;

  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;

  const derived = (await scryptAsync(pin, salt, KEYLEN)) as Buffer;
  const storedBuf = Buffer.from(hashHex, "hex");

  // Lengths must match for timingSafeEqual; guard so it doesn't throw.
  if (storedBuf.length !== derived.length) return false;

  // Constant-time compare to avoid leaking info via timing.
  return timingSafeEqual(derived, storedBuf);
}
