import { redirect } from "next/navigation";
import { getActiveParentId } from "@/lib/activeParent";
import { AuthForm } from "@/components/auth/AuthForm";

/**
 * Login / sign-up page — /login
 *
 * If already logged in, bounce to the destination (or home). Otherwise show the
 * combined AuthForm. `?next=` lets gated pages send the parent here and back.
 */
export default async function LoginPage({
  searchParams,
}: Readonly<{
  searchParams: { next?: string };
}>) {
  // Only allow internal redirect targets (avoid open-redirect to other sites).
  const next =
    searchParams.next && searchParams.next.startsWith("/")
      ? searchParams.next
      : "/";

  if (await getActiveParentId()) redirect(next);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <div className="text-6xl">🦸</div>
      <AuthForm redirectTo={next} />
    </main>
  );
}
