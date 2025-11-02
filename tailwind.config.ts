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
        coffee: {
          50: '#faf7f4',
          100: '#f5ebe3',
          200: '#e8d4c4',
          300: '#d9b8a0',
          400: '#c9997b',
          500: '#b67d5d',
          600: '#9d6747',
          700: '#7f523a',
          800: '#6b4632',
          900: '#5a3c2b',
        },
      },
    },
  },
  plugins: [],
};
export default config;
