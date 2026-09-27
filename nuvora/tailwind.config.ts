import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nuvora: {
          green: "#16A34A",
          "green-deep": "#0F7A3A",
          "green-soft": "#1F8F4C",
          // Theme-aware surfaces: values come from CSS variables in index.css
          // so the same "bg-nuvora-dark" class renders correctly in both
          // dark mode (the brand default) and light mode.
          dark: "var(--nuvora-bg)",
          surface: "var(--nuvora-surface)",
          card: "var(--nuvora-card)",
          border: "var(--nuvora-border)",
          white: "var(--nuvora-text)",
          muted: "var(--nuvora-muted)",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
      boxShadow: {
        glow: "0 0 60px -15px rgba(22, 163, 74, 0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
} satisfies Config;
