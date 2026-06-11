import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        night: "#09070b",
        velvet: "#7a1022",
        neon: "#23d7ff",
        gold: "#f4c45f",
        shell: "#fff2d8",
      },
      fontFamily: {
        display: ['"Bebas Neue"', "Impact", "Arial Narrow", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 18px rgba(35, 215, 255, 0.75), 0 0 42px rgba(236, 72, 153, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
