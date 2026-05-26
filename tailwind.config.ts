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
        brand: {
          50:  "#f0f4ff",
          100: "#dce6ff",
          200: "#b9ccff",
          300: "#85a8ff",
          400: "#4d7bff",
          500: "#1a4fff",
          600: "#0033e6",
          700: "#0028b8",
          800: "#002196",
          900: "#001a78",
        },
      },
    },
  },
  plugins: [],
};

export default config;
