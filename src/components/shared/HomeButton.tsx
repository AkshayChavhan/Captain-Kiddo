import Link from "next/link";

/**
 * HomeButton — an icon-only 🏠 button pinned to the top-left corner.
 *
 * One consistent "go home" control used across module/learning screens (and the
 * parent dashboard). Icon only (no "Home" label), with an aria-label for
 * accessibility. The parent screen must be `relative` for the absolute position.
 */
export function HomeButton() {
  return (
    <Link
      href="/"
      aria-label="Go to home screen"
      className="kiddo-btn absolute left-4 top-4 z-10 flex h-12 w-12 items-center justify-center bg-kiddo-green p-0 text-2xl"
    >
      🏠
    </Link>
  );
}
