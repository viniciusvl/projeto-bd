/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta extraída da logo do sistema (tons de azul + acento teal).
        brand: {
          50: "#eef7fd",
          100: "#d6ebfa",
          200: "#b0d8f4",
          300: "#7cbeec",
          400: "#45a0e0",
          500: "#1c86d4",
          600: "#1069b4",
          700: "#0d5391",
          800: "#0f4677",
          900: "#123c63",
          950: "#0c2743",
        },
        accent: {
          400: "#4dd0c4",
          500: "#2bb9ac",
          600: "#1f9789",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 70, 119, 0.08), 0 1px 2px rgba(15, 70, 119, 0.06)",
        modal: "0 20px 60px rgba(12, 39, 67, 0.25)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.15s ease-out",
        "slide-up": "slide-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
