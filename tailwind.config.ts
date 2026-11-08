import type { Config } from "tailwindcss";

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: token("paper"),
        surface: token("surface"),
        sunken: token("sunken"),
        ink: token("ink"),
        muted: token("muted"),
        faint: token("faint"),
        line: token("line"),
        "line-strong": token("line-strong"),
        accent: token("accent"),
        "accent-hover": token("accent-hover"),
        "on-accent": token("on-accent"),
        danger: token("danger"),
        success: token("success"),
      },
      fontFamily: {
        playfair: ["'Playfair Display'", "Georgia", "serif"],
        dmsans: ["'DM Sans'", "system-ui", "-apple-system", "sans-serif"],
        serif: ["var(--font-serif)", "EB Garamond", "Garamond", "Georgia", "serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
        sans: ["'DM Sans'", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        literary: ["var(--font-serif)", "Palatino", "Georgia", "serif"],
      },
      boxShadow: {
        pop: "0 1px 2px rgb(var(--shadow) / 0.05), 0 8px 24px -4px rgb(var(--shadow) / 0.14)",
        sheet: "0 0 0 1px rgb(var(--line)), 0 20px 40px -10px rgb(var(--shadow) / 0.22)",
      },
    },
  },
  plugins: [],
};

export default config;
