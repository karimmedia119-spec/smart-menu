/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          bg: "#FAF8F5",       // Luxurious warm off-white linen/alabaster
          surface: "#F4EFEB",  // Soft warm surface
          card: "#FFFFFF",     // Pure crisp white card
          border: "#E8E2D9",   // Warm soft beige border
          borderLight: "#F0EAE1",
          text: "#1C1917",     // Deep warm charcoal text (Stone 900)
          muted: "#78716C",    // Warm muted stone (Stone 500)
          subtle: "#A8A29E",   // Stone 400
          accent: "#D97706",   // Warm Amber / Golden Honey
          accentHover: "#B45309",
        },
        apple: {
          blue: "#0071E3",
          gold: "#F59E0B",
          emerald: "#059669",
          rose: "#E11D48",
          amber: "#D97706",
          bronze: "#92400E",
        },
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "Cairo", "Tajawal", "sans-serif"],
      },
      boxShadow: {
        warm: "0 10px 30px -5px rgba(60, 50, 40, 0.05), 0 4px 12px -2px rgba(60, 50, 40, 0.03)",
        warmLg: "0 20px 40px -10px rgba(60, 50, 40, 0.08), 0 8px 16px -4px rgba(60, 50, 40, 0.04)",
        warmGlow: "0 0 25px -4px rgba(217, 119, 6, 0.15)",
        glass: "0 8px 32px 0 rgba(60, 50, 40, 0.06)",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};
