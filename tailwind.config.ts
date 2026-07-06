import type { Config } from "tailwindcss";

// HSB-inspired design system. Navy/blue carry the brand; slate neutrals and
// emerald/amber/rose tiers keep it clean and modern.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        hsb: {
          navy: "#1B335F", // deepened for contrast
          blue: "#1955A6",
          "blue-700": "#17478C",
          tint: "#EEF3FB", // subtle brand surface
          soft: "#A3C5E9",
          ink: "#0F172A",
        },
      },
      fontFamily: {
        sans: ["var(--font-lexend)", "Lexend", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-lexend)", "Lexend", "ui-sans-serif", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(16,24,40,0.04), 0 1px 3px 0 rgba(16,24,40,0.05)",
        soft: "0 8px 24px -8px rgba(16,24,40,0.12)",
      },
      borderRadius: {
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
