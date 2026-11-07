export type ThemeChoice = "light" | "dark" | "system";

export const THEME_COOKIE = "reverend_theme";

export function parseThemeCookie(value: string | undefined | null): "light" | "dark" | undefined {
  return value === "light" || value === "dark" ? value : undefined;
}

/** Reads the explicit choice from the root element (set server-side from the cookie). */
export function readThemeChoice(): ThemeChoice {
  if (typeof document === "undefined") return "system";
  return parseThemeCookie(document.documentElement.dataset.theme) ?? "system";
}

export function resolveTheme(choice: ThemeChoice): "light" | "dark" {
  if (choice !== "system") return choice;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyThemeChoice(choice: ThemeChoice): void {
  const root = document.documentElement;
  if (choice === "system") {
    delete root.dataset.theme;
    document.cookie = `${THEME_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  } else {
    root.dataset.theme = choice;
    document.cookie = `${THEME_COOKIE}=${choice}; path=/; max-age=31536000; SameSite=Lax`;
  }
  window.dispatchEvent(new CustomEvent("reverend:theme", { detail: choice }));
}
