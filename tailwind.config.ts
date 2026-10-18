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
        catppuccin: {
          base: "#1e1e2e",
          mantle: "#181825",
          crust: "#11111b",
          surface0: "#313244",
          surface1: "#45475a",
          surface2: "#585b70",
          overlay0: "#6c7086",
          overlay1: "#7f849c",
          overlay2: "#9399b2",
          subtext0: "#a6adc8",
          subtext1: "#bac2de",
          text: "#cdd6f4",
          blue: "#89b4fa",
          sapphire: "#74c7ec",
          sky: "#89dceb",
          teal: "#94e2d5",
          lavender: "#b4befe",
          mauve: "#cba6f7",
          red: "#f38ba8",
          peach: "#fab387",
          yellow: "#f9e2af",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "Cambria", "'Times New Roman'", "Times", "serif"],
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        mono: ["var(--font-mono)", "Menlo", "Monaco", "Consolas", "'Liberation Mono'", "monospace"],
        literary: ["'Palatino Linotype'", "Palatino", "Book Antiqua", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
