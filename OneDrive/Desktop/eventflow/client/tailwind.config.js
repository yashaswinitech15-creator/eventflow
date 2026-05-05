/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0e9ff",
          100: "#e0d2ff",
          200: "#c1a5ff",
          300: "#a37aff",
          400: "#844fff",
          500: "#6C3EF5",
          600: "#5a2ed6",
          700: "#4521b0",
          800: "#32168a",
          900: "#1f0d64",
        },
        accent: {
          DEFAULT: "#F5A623",
          dark: "#d4891a",
        },
        surface: {
          light: "#ffffff",
          dark: "#0f0f13",
        },
      },
      fontFamily: {
        display: ["'Clash Display'", "system-ui", "sans-serif"],
        body: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s infinite",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: { "0%": { transform: "translateY(20px)", opacity: 0 }, "100%": { transform: "translateY(0)", opacity: 1 } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
    },
  },
  plugins: [],
};
