"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { logOut } from "@/app/(auth)/actions";

/**
 * Log-out button; clears the session and returns home.
 *
 * `className` lets each place style it — a subtle text link on the home page, or a
 * full button in the dashboard's pinned corner. `label` overrides the text.
 */
export function LogoutButton({
  className = "text-sm font-bold text-gray-500 disabled:opacity-50",
  label = "Log out",
}: Readonly<{
  className?: string;
  label?: string;
}> = {}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await logOut();
          router.replace("/");
          router.refresh();
        })
      }
      className={className}
    >
      {pending ? "…" : label}
    </button>
  );
}
