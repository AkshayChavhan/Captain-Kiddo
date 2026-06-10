"use server";

import { prisma } from "@/lib/prisma";
import { hashSecret, verifySecret } from "@/lib/hash";
import { createSession, destroySession } from "@/lib/session";

/**
 * Auth server actions — sign up, log in, log out. Server-only ("use server"), so
 * passwords are hashed/verified on the server and never compared on the client.
 *
 * Login = the Parent account: signing up creates a Parent; logging in starts a
 * signed session for that Parent.
 */

export interface AuthResult {
  ok: boolean;
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Create a new Parent account and log them in. */
export async function signUp(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const password = input.password ?? "";

  if (!name) return { ok: false, error: "Please enter your name." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid email." };
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }

  // Email is unique — reject if taken.
  const existing = await prisma.parent.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) return { ok: false, error: "That email is already registered." };

  const passwordHash = await hashSecret(password);
  const parent = await prisma.parent.create({
    data: { name, email, passwordHash },
    select: { id: true },
  });

  createSession(parent.id);
  return { ok: true };
}

/** Log in an existing Parent. */
export async function logIn(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const email = input.email?.trim().toLowerCase();
  const password = input.password ?? "";

  if (!EMAIL_RE.test(email) || !password) {
    return { ok: false, error: "Enter your email and password." };
  }

  const parent = await prisma.parent.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  // Same generic message whether the email or password is wrong (don't reveal
  // which emails exist).
  const valid =
    parent?.passwordHash &&
    (await verifySecret(password, parent.passwordHash));
  if (!parent || !valid) {
    return { ok: false, error: "Wrong email or password." };
  }

  createSession(parent.id);
  return { ok: true };
}

/** Log out (clear the session). */
export async function logOut(): Promise<void> {
  destroySession();
}
