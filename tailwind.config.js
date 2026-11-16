/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Palette Backgrounds
        dark: {
          900: "#0b0e14", // Main page background
          800: "#151922", // Cards and forms background
          700: "#1e2430", // Inputs and fields background
          600: "#2b3345", // Borders and dividers color
        },
        // Brand color & primary actions
        primary: {
          DEFAULT: "#3b82f6",
          hover: "#2563eb",
          light: "#60a5fa",
        },
        // Crypto market indicators (P&L)
        crypto: {
          green: "#10b981", // Green candle / profit
          red: "#ef4444", // Red candle / loss
          yellow: "#f59e0b", // Warning or pending balances
        },
      },
    },
  },
  plugins: [],
};
