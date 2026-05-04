import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        ink: {
          50: "#f7f8fa",
          100: "#eef0f3",
          200: "#dde1e7",
          300: "#c1c7d0",
          400: "#8a93a2",
          500: "#5b6473",
          600: "#3f4754",
          700: "#2b313b",
          800: "#1c2129",
          900: "#0f1318",
        },
        accent: {
          50: "#eef4ff",
          100: "#dbe6ff",
          500: "#3b6cf3",
          600: "#2a55d6",
          700: "#1e44b3",
        },
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(15 19 24 / 0.04), 0 1px 3px 0 rgb(15 19 24 / 0.06)",
        pop: "0 8px 24px -6px rgb(15 19 24 / 0.12), 0 2px 6px -2px rgb(15 19 24 / 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
