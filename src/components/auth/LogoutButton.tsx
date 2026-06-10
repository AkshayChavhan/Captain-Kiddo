"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { logOut } from "@/app/(auth)/actions";

/** A small log-out button; clears the session and refreshes. */
export function LogoutButton() {
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
      className="text-sm font-bold text-gray-500 disabled:opacity-50"
    >
      Log out
    </button>
  );
}
