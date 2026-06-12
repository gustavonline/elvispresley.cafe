import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        night: "#130d10",
        plum: "#5e303c",
        velvet: "#aa4c64",
        neon: "#f4648a",
        gold: "#f4c41a",
        bronze: "#655414",
        shell: "#d4bc9c",
      },
      fontFamily: {
        display: ['"Bebas Neue"', "Impact", "Arial Narrow", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 18px rgba(244, 100, 138, 0.68), 0 0 42px rgba(244, 196, 26, 0.24)",
      },
    },
  },
  plugins: [],
};

export default config;
