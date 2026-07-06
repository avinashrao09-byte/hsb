import type { Config } from "tailwindcss";

// HSB brand tokens — extracted live from hsb.edu.in
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        hsb: {
          navy: "#1D3C74",   // dominant brand
          blue: "#1955A6",   // primary
          "blue-2": "#126AB3",
          "blue-3": "#3567B0",
          "blue-4": "#244A9A",
          tint: "#ECF2FA",   // light surface
          soft: "#A3C5E9",   // soft accent
          green: "#61CE70",  // CTA
          magenta: "#CC3366",// rare highlight
          ink: "#33373D",
        },
        // Tier colors (traffic light)
        tier: {
          green: "#61CE70",
          yellow: "#E8A93D",
          red: "#CC3366",
        },
      },
      fontFamily: {
        // Lexend loaded via next/font; Gilroy is licensed — add files to use it
        sans: ["var(--font-lexend)", "Lexend", "system-ui", "sans-serif"],
        display: ["Gilroy", "var(--font-lexend)", "Lexend", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
