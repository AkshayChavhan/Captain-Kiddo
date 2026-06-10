import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Login session (SERVER ONLY).
 *
 * After a parent logs in, we store their id in a cookie, SIGNED with an HMAC so it
 * can't be forged (a kid/attacker can't just set a cookie with someone's id). The
 * cookie value is "<parentId>.<signature>"; we verify the signature on every read.
 *
 * The signing key is AUTH_SECRET from env. `server-only` keeps this off the client.
 */

const COOKIE = "kk_session";
const TTL_DAYS = 30;

function secret(): string {
  // A stable server secret. In production AUTH_SECRET must be set.
  return process.env.AUTH_SECRET ?? "dev-insecure-secret-change-me";
}

function sign(parentId: string): string {
  return createHmac("sha256", secret()).update(parentId).digest("hex");
}

/** Create the login session cookie for a parent. */
export function createSession(parentId: string): void {
  const value = `${parentId}.${sign(parentId)}`;
  cookies().set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: TTL_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

/** Clear the session (log out). */
export function destroySession(): void {
  cookies().delete(COOKIE);
}

/**
 * Read the logged-in parent's id from the signed cookie, or null if not logged in
 * / the signature doesn't verify.
 */
export function getSessionParentId(): string | null {
  const raw = cookies().get(COOKIE)?.value;
  if (!raw || !raw.includes(".")) return null;

  const idx = raw.lastIndexOf(".");
  const parentId = raw.slice(0, idx);
  const providedSig = raw.slice(idx + 1);
  if (!parentId || !providedSig) return null;

  // Constant-time signature check.
  const expected = sign(parentId);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(providedSig, "utf8");
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;

  return parentId;
}
