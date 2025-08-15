const { heroui } = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        '9': 'repeat(9, minmax(0, 1fr))',
      },
      gridTemplateRows: {
        '9': 'repeat(9, minmax(0, 1fr))',
      }
    },
  },
  plugins: [heroui()],
}