"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signUp, logIn } from "@/app/(auth)/actions";

/**
 * AuthForm — combined Log in / Sign up form.
 *
 * Toggles between modes. Calls the server actions (which hash/verify on the
 * server) and, on success, sends the parent to where they were headed (or home).
 */
export function AuthForm({
  redirectTo = "/",
}: Readonly<{
  redirectTo?: string;
}>) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<"login" | "signup">("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res =
        mode === "signup"
          ? await signUp({ name, email, password })
          : await logIn({ email, password });
      if (res.ok) {
        router.replace(redirectTo);
        router.refresh();
      } else {
        setError(res.error ?? "Something went wrong.");
      }
    });
  };

  return (
    <div className="kiddo-card flex w-full max-w-sm flex-col gap-4 bg-white">
      <h1 className="font-kiddo text-3xl font-bold">
        {mode === "signup" ? "Create account" : "Welcome back!"}
      </h1>

      {mode === "signup" && (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="rounded-kiddo border-2 border-gray-200 p-3 text-lg"
        />
      )}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        autoComplete="email"
        className="rounded-kiddo border-2 border-gray-200 p-3 text-lg"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        className="rounded-kiddo border-2 border-gray-200 p-3 text-lg"
      />

      {error && <p className="font-bold text-kiddo-red">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="kiddo-btn bg-kiddo-green disabled:opacity-50"
      >
        {pending ? "…" : mode === "signup" ? "Sign up" : "Log in"}
      </button>

      <button
        type="button"
        onClick={() => {
          setMode((m) => (m === "signup" ? "login" : "signup"));
          setError(null);
        }}
        className="text-sm font-bold text-kiddo-purple"
      >
        {mode === "signup"
          ? "Already have an account? Log in"
          : "New here? Create an account"}
      </button>
    </div>
  );
}
