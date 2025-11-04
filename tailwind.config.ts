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
          DEFAULT: "var(--color-primary, #2F855A)", // Chakra green.600 - forest green
          dark: "var(--color-primary-dark, #22543D)", // Chakra green.800 - dark forest
          light: "var(--color-primary-light, #48BB78)", // Chakra green.400 - vibrant green
        },
        background: {
          DEFAULT: "var(--color-background, #F0FFF4)", // Chakra green.50 - very light green
          dark: "var(--color-background-dark, #C6F6D5)", // Chakra green.100 - light green
        },
        text: {
          DEFAULT: "var(--color-text, #1A202C)", // Dark gray for readability
          light: "var(--color-text-light, #4A5568)", // Medium gray
        },
        // Optional theme colors
        secondary: {
          DEFAULT: "var(--color-secondary, #2F855A)",
        },
        accent: {
          DEFAULT: "var(--color-accent, #2F855A)",
        },
        error: {
          DEFAULT: "var(--color-error, #E53E3E)",
        },
        success: {
          DEFAULT: "var(--color-success, #38A169)",
        },
        warning: {
          DEFAULT: "var(--color-warning, #D69E2E)",
        },
        info: {
          DEFAULT: "var(--color-info, #3182CE)",
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
