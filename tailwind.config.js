/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      display: ["Poppins", "Arial", "sans-serif"],
      body: ["Open Sans", "Arial", "sans-serif"],
    },
    extend: {
      colors: {
        cyan: {
          50: "var(--theme-cyan-50)",
          100: "var(--theme-cyan-100)",
          200: "var(--theme-cyan-200)",
          300: "var(--theme-cyan-300)",
          400: "var(--theme-cyan-400)",
          500: "var(--theme-cyan-500)",
          600: "var(--theme-cyan-600)",
          700: "var(--theme-cyan-700)",
          800: "var(--theme-cyan-800)",
          900: "var(--theme-cyan-900)",
          950: "var(--theme-cyan-950)",
        },
        yellow: {
          50: "var(--theme-yellow-50)",
          100: "var(--theme-yellow-100)",
          200: "var(--theme-yellow-200)",
          300: "var(--theme-yellow-300)",
          400: "var(--theme-yellow-400)",
          500: "var(--theme-yellow-500)",
          600: "var(--theme-yellow-600)",
          700: "var(--theme-yellow-700)",
          800: "var(--theme-yellow-800)",
          900: "var(--theme-yellow-900)",
          950: "var(--theme-yellow-950)",
        },
      },
    },
  },
  plugins: [],
};
