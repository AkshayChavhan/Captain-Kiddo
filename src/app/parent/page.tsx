import { isParentAreaUnlocked } from "@/lib/parentSession";
import { PinPad } from "@/components/parent/PinPad";

/**
 * Parent area entry — /parent
 *
 * If the area is locked, show the PIN pad. Once unlocked (correct PIN this
 * session), show the dashboard. The actual dashboard contents (child profiles,
 * progress, payments) are built in the following Phase D tickets; this ticket is
 * the PIN GATE that protects all of it.
 *
 * Server component so the lock check happens on the server — a kid can't bypass
 * it by tampering with client state.
 */
export default function ParentPage() {
  const unlocked = isParentAreaUnlocked();

  if (!unlocked) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <PinPad />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-6">
      <header className="pt-6 text-center">
        <h1 className="font-kiddo text-3xl font-bold">Parent Dashboard</h1>
        <p className="text-gray-600">Welcome back! 👋</p>
      </header>

      {/* Child profiles, progress, goals, and payments come in the next Phase D
          tickets (parent02–parent05, pay01–pay03, shop01). */}
      <p className="text-gray-500">Dashboard coming together…</p>
    </main>
  );
}
