import type { Config } from "tailwindcss";

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: [
    "variant",
    [
      ':root[data-theme="dark"] &',
      '@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) & }',
    ],
  ],
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
        times: ['"Times New Roman"', "Times", "Georgia", "serif"],
        dmsans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        serif: ["Bookerly", "var(--font-serif)", "EB Garamond", "Georgia", "serif"],
        editorial: ["var(--font-serif)", "EB Garamond", "Georgia", "serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        literary: ["Literata", "Georgia", "serif"],
        bellota: ["var(--font-bellota)", '"Bellota"', "system-ui", "sans-serif"],
        dyslexic: ['"OpenDyslexic"', "var(--font-sans)", "system-ui", "sans-serif"],
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
