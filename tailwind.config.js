/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Helvetica", "Arial", "sans-serif"],
        display: ["Transforma Mix", "Playfair Display", "Georgia", "serif"],
      },
      colors: {
        slate: { 25: "#fafbfc" },
        brand: {
          50: "#f0f4ff",
          100: "#e0eaff",
          500: "#4f6ef7",
          600: "#3a56e8",
          900: "#1a2570",
          blue: "#025bdf",
          navy: "#070c48",
          secondary: "#19eba0",
          navyLight: "#0f1560",
          dark: "#ffffff",
          charcoal: "#1a1a1a",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        cursor: "blink 0.8s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
      },
    },
  },
  plugins: [],
};
