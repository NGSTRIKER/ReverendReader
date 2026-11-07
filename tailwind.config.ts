import type { Config } from "tailwindcss";

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

// One typeface for the whole product. Every family alias resolves to it so a
// stray `font-mono` or `font-sans` can never introduce a second face.
const signature = ["var(--font-sig)", "Georgia", "Times New Roman", "serif"];

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
        sans: signature,
        serif: signature,
        mono: signature,
      },
      boxShadow: {
        pop: "0 1px 2px rgb(var(--shadow) / 0.06), 0 8px 24px -6px rgb(var(--shadow) / 0.18)",
        sheet: "0 0 0 1px rgb(var(--line)), 0 24px 48px -12px rgb(var(--shadow) / 0.28)",
      },
    },
  },
  plugins: [],
};

export default config;
