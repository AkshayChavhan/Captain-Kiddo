import type { Config } from "tailwindcss";

/**
 * Tailwind config — the KID-FRIENDLY theme.
 *
 * `content` tells Tailwind which files to scan for class names so it can strip
 * unused CSS. The `theme.extend` below adds our design language:
 *   - bright, cheerful colors
 *   - extra-round corners (soft, friendly shapes)
 *   - large minimum tap-target sizes (little fingers need big buttons)
 *   - playful animations (bounce, wiggle) for celebratory feedback
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      // --- Bright, cheerful palette (matches the module registry colors) ----
      colors: {
        kiddo: {
          red: "#FF6B6B",
          teal: "#4ECDC4",
          yellow: "#FFD93D",
          purple: "#6C5CE7",
          green: "#00B894",
          orange: "#E17055",
          pink: "#FD79A8",
          blue: "#74B9FF",
        },
      },

      // --- Soft, rounded shapes --------------------------------------------
      borderRadius: {
        kiddo: "1.5rem", // default friendly roundness for cards/buttons
        blob: "2.5rem",  // extra-round for big playful surfaces
      },

      // --- Big tap targets (accessibility for ages 3-6) ---------------------
      // Apple/Google recommend ~44-48px minimum; kids do better even bigger.
      minWidth: {
        tap: "4rem", // 64px — comfy minimum for a kid's button
      },
      minHeight: {
        tap: "4rem",
      },

      // --- Playful display font (wire up the actual font file later) --------
      fontFamily: {
        kiddo: ["var(--font-kiddo)", "Comic Sans MS", "system-ui", "sans-serif"],
      },

      // --- Celebratory animations ------------------------------------------
      keyframes: {
        bounceIn: {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "60%": { transform: "scale(1.1)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
      },
      animation: {
        bounceIn: "bounceIn 0.5s ease-out",
        wiggle: "wiggle 0.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
