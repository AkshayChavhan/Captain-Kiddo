import type { ReactNode } from "react";

/**
 * DashboardSection — a colorful, rounded card wrapper for a dashboard section.
 *
 * Gives each part of the parent dashboard a cheerful, consistent look: an emoji +
 * title header in an accent color, on a soft rounded card. Same content inside,
 * just a happier frame.
 */
export function DashboardSection({
  emoji,
  title,
  accent = "bg-kiddo-purple",
  children,
}: Readonly<{
  emoji: string;
  title: string;
  /** Tailwind bg class for the header strip. */
  accent?: string;
  children: ReactNode;
}>) {
  return (
    <section className="w-full max-w-md overflow-hidden rounded-blob bg-white shadow-xl">
      {/* Colorful header strip */}
      <div
        className={`flex items-center gap-2 px-5 py-3 text-white ${accent}`}
      >
        <span className="text-2xl">{emoji}</span>
        <h2 className="font-kiddo text-xl font-bold">{title}</h2>
      </div>

      {/* Section content */}
      <div className="flex flex-col gap-4 p-5">{children}</div>
    </section>
  );
}
