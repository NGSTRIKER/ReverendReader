"use client";

import { Moon, Sun } from "lucide-react";
import { applyThemeChoice, readThemeChoice, resolveTheme } from "@/lib/theme";

/**
 * Flips between light and dark. The icon is chosen by CSS from the resolved
 * theme, so server HTML is correct before hydration.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const toggle = () => {
    const current = resolveTheme(readThemeChoice());
    applyThemeChoice(current === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`icon-btn ${className}`}
      aria-label="Toggle light and dark theme"
      title="Toggle theme"
    >
      <Moon className="only-light h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden="true" />
      <Sun className="only-dark h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden="true" />
    </button>
  );
}
