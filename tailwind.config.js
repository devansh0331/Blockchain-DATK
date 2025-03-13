const withMT = require("@material-tailwind/react/utils/withMT");
/** @type {import('tailwindcss').Config} */

module.exports = withMT({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        off: "#F5FAFE",
        text: "#0C6CF2",
        darkText: "#262262",
        dark: "#1A2B6B",
        darkOff: "#DFE7FB",
        // "blockchain-dark": "#0a0a0a",
        // "blockchain-primary": "#1f2937",
        // "blockchain-secondary": "#374151",
        // "blockchain-accent": "#3b82f6",
      },
    },
  },
  plugins: [],
});
