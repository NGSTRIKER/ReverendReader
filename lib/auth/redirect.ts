/**
 * Validates and sanitizes redirect destination paths to prevent Open Redirect attacks.
 * Only permits relative paths on the same origin (starting with a single '/' and not '//' or containing '\').
 */
export function getSafeRedirectUrl(target: string | null | undefined, defaultPath = "/"): string {
  if (!target) return defaultPath;

  const trimmed = target.trim();
  if (!trimmed) return defaultPath;

  try {
    // Decode URI component to protect against double-encoding bypasses (%2f%2f etc.)
    const decoded = decodeURIComponent(trimmed);

    // Ensure it starts with '/' but not '//' or '/\' and does not contain protocol specifiers
    if (
      decoded.startsWith("/") &&
      !decoded.startsWith("//") &&
      !decoded.startsWith("/\\") &&
      !decoded.includes(":") &&
      !decoded.includes("\\")
    ) {
      return trimmed;
    }
  } catch {
    // Malformed URI component
  }

  return defaultPath;
}
