import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2F855A", // Chakra green.600 - forest green
          dark: "#22543D", // Chakra green.800 - dark forest
          light: "#48BB78", // Chakra green.400 - vibrant green
        },
        background: {
          DEFAULT: "#F0FFF4", // Chakra green.50 - very light green
          dark: "#C6F6D5", // Chakra green.100 - light green
        },
        text: {
          DEFAULT: "#1A202C", // Dark gray for readability
          light: "#4A5568", // Medium gray
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
