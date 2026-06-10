import "server-only";
import { hashSecret, verifySecret } from "@/lib/hash";

/**
 * Parent PIN hashing + verification (SERVER ONLY).
 *
 * Thin wrapper over the generic secret hashing (src/lib/hash.ts) — the PIN and
 * the login password share the same scrypt + constant-time-compare logic. Kept as
 * its own named API so PIN callers read clearly.
 */

/** Hash a PIN for storage. Returns "salt:hash" (hex). */
export function hashPin(pin: string): Promise<string> {
  return hashSecret(pin);
}

/** Verify an entered PIN against a stored "salt:hash". */
export function verifyPin(
  pin: string,
  stored: string | null | undefined
): Promise<boolean> {
  return verifySecret(pin, stored);
}
