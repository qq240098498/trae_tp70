/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        navy: {
          50: "#F0F4FA",
          100: "#DCE5F3",
          200: "#B5C8E7",
          300: "#8EAADB",
          400: "#678DCF",
          500: "#406FC3",
          600: "#2F5499",
          700: "#233E72",
          800: "#17294C",
          900: "#0F2C59",
          950: "#0A1E3D",
        },
        gold: {
          50: "#FBF7EE",
          100: "#F5EAD0",
          200: "#EBD5A1",
          300: "#E1C073",
          400: "#D7AB44",
          500: "#C9A962",
          600: "#B18F47",
          700: "#8E7038",
          800: "#6B5229",
          900: "#48351A",
        },
      },
      fontFamily: {
        sans: [
          '"Noto Sans SC"',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          "system-ui",
          "sans-serif",
        ],
        mono: ['"JetBrains Mono"', '"SF Mono"', "Consolas", "monospace"],
      },
      boxShadow: {
        card: "0 2px 12px rgba(15, 44, 89, 0.06), 0 1px 4px rgba(15, 44, 89, 0.04)",
        "card-hover":
          "0 8px 24px rgba(15, 44, 89, 0.10), 0 2px 8px rgba(15, 44, 89, 0.06)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out both",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
