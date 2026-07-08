import type { Config } from "tailwindcss";

// MBB exec aesthetic: warm paper canvas, ink + a single deep-blue accent,
// serif headlines over Inter body. Muted, authoritative, data-forward.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // token names kept stable; values re-skinned
        hsb: {
          navy: "#1B2430", // ink — headlines & primary text
          blue: "#0E4C7E", // restrained accent
          "blue-700": "#0B3A61",
          tint: "#F0EDE6", // warm sand surface for chips
          soft: "#CBB994", // muted brass hairline accent
          ink: "#141A22",
        },
        paper: "#FBF9F4", // warm off-white canvas
        rag: {
          green: "#3B7A57",
          "green-soft": "#E7EFE8",
          amber: "#B07D2B",
          "amber-soft": "#F3EBDA",
          red: "#A6474A",
          "red-soft": "#F1E3E1",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Source Serif 4'", "Georgia", "Cambria", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(20,26,34,0.04)",
        soft: "0 6px 20px -8px rgba(20,26,34,0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
