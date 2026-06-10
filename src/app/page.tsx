import Link from "next/link";
import { MODULES } from "@/config/modules";
import { getActiveParentId } from "@/lib/activeParent";
import { LogoutButton } from "@/components/auth/LogoutButton";

/**
 * Home page (route "/") — the module grid.
 *
 * Shows a tappable card for every learning module. Tapping one goes to that
 * module's home (/learn/<slug>) where the difficulty tiers live. A guest sees a
 * "Log in" prompt; logged-in parents see a log-out option.
 */
export default async function HomePage() {
  const loggedIn = Boolean(await getActiveParentId());

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 p-6">
      <header className="flex flex-col items-center gap-2 pt-6 text-center">
        <div className="text-7xl">🦸</div>
        <h1 className="font-kiddo text-4xl font-bold">Captain Kiddo</h1>
        <p className="text-lg text-gray-600">What shall we learn today?</p>

        {/* Auth status */}
        {loggedIn ? (
          <LogoutButton />
        ) : (
          <Link href="/login" className="kiddo-btn bg-kiddo-blue px-5 py-2 text-lg">
            Log in to play all games
          </Link>
        )}
      </header>

      <section className="grid w-full max-w-md grid-cols-2 gap-5">
        {MODULES.map((module) => (
          <Link key={module.slug} href={`/learn/${module.slug}`} className="block">
            <div
              className="kiddo-card flex min-h-tap flex-col items-center justify-center gap-2 text-center text-white"
              style={{ backgroundColor: module.color }}
            >
              <div className="text-5xl">{module.emoji}</div>
              <div className="text-xl font-bold">{module.title}</div>
            </div>
          </Link>
        ))}

        {/* Alphabet tracing activity (learn to write letters). */}
        <Link href="/trace" className="block">
          <div className="kiddo-card flex min-h-tap flex-col items-center justify-center gap-2 bg-kiddo-pink text-center text-white">
            <div className="text-5xl">✍️</div>
            <div className="text-xl font-bold">Trace Letters</div>
          </div>
        </Link>
      </section>
    </main>
  );
}
