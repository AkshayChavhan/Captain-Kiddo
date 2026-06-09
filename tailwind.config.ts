import type { Config } from "tailwindcss";

/**
 * Tailwind config.
 *
 * `content` tells Tailwind which files to scan for class names so it can strip
 * unused CSS. We expand the `theme` with kid-friendly colors/shapes in the
 * `theme01-tailwind-kid-theme` ticket.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
