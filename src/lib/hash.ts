import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * Generic secret hashing (SERVER ONLY) — used for both the parent PIN and the
 * login password.
 *
 * Uses Node's built-in scrypt (no dependency). Stores "salt:hash" (hex). Verify
 * re-derives from the entered secret + stored salt and compares in constant time.
 * `server-only` makes the build fail if this is imported into client code.
 */

const scryptAsync = promisify(scrypt);
const KEYLEN = 64;

/** Hash a secret for storage. Returns "salt:hash" (hex). */
export async function hashSecret(secret: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(secret, salt, KEYLEN)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

/**
 * Verify a secret against a stored "salt:hash".
 * Returns false (never throws) on any malformed input.
 */
export async function verifySecret(
  secret: string,
  stored: string | null | undefined
): Promise<boolean> {
  if (!stored || !stored.includes(":")) return false;

  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;

  const derived = (await scryptAsync(secret, salt, KEYLEN)) as Buffer;
  const storedBuf = Buffer.from(hashHex, "hex");

  if (storedBuf.length !== derived.length) return false;
  return timingSafeEqual(derived, storedBuf);
}
