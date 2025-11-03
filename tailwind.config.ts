import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d8ff',
          300: '#a5bcff',
          400: '#8196ff',
          500: '#6370ff',
          600: '#4c46f5',
          700: '#3f36d8',
          800: '#342eae',
          900: '#1a1838',
          950: '#0f0f1e',
        },
      },
    },
  },
  plugins: [],
};
export default config;

