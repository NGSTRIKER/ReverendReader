const DEFAULT_PRODUCTION_ORIGIN = "https://reverend-reader.vercel.app";

function parseOrigin(value: string | undefined, allowLocalHttp: boolean): string | null {
  if (!value) return null;
  try {
    const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(candidate);
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) return null;
    if (url.protocol !== "https:" && !(allowLocalHttp && local && url.protocol === "http:")) return null;
    return url.origin;
  } catch {
    return null;
  }
}

function parseForwardedHost(value: string | null): string | null {
  if (!value) return null;
  const firstHost = value.split(",", 1)[0]?.trim();
  if (!firstHost || /[\s/@?#\\]/.test(firstHost)) return null;
  try {
    const url = new URL(`https://${firstHost}`);
    if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) return null;
    return url.host.toLowerCase();
  } catch {
    return null;
  }
}

/** Resolve an OAuth callback origin only from canonical or exact Vercel hosts. */
export function getSafeBaseOrigin(
  requestUrl: string,
  forwardedHost: string | null,
  env: NodeJS.ProcessEnv = process.env
): string {
  const isDevelopment = env.NODE_ENV === "development";
  const allowedOrigins = new Set<string>();

  const canonical = parseOrigin(env.NEXT_PUBLIC_SITE_URL, isDevelopment);
  if (canonical) allowedOrigins.add(canonical);

  for (const vercelHost of [
    env.VERCEL_URL,
    env.VERCEL_BRANCH_URL,
    env.VERCEL_PROJECT_PRODUCTION_URL,
  ]) {
    const origin = parseOrigin(vercelHost, false);
    if (origin) allowedOrigins.add(origin);
  }

  if (isDevelopment) {
    for (const localHost of ["localhost:3000", "127.0.0.1:3000"]) {
      const origin = parseOrigin(`http://${localHost}`, true);
      if (origin) allowedOrigins.add(origin);
    }
  }

  const host = parseForwardedHost(forwardedHost);
  if (host) {
    for (const origin of allowedOrigins) {
      if (new URL(origin).host.toLowerCase() === host) return origin;
    }
  }

  // A request URL is accepted only when its host is in the configured allowlist.
  try {
    const requestOrigin = new URL(requestUrl).origin;
    if (allowedOrigins.has(requestOrigin)) return requestOrigin;
  } catch {
    // Use the canonical fallback below.
  }

  return canonical ||
    parseOrigin(env.VERCEL_PROJECT_PRODUCTION_URL, false) ||
    parseOrigin(env.VERCEL_URL, false) ||
    (isDevelopment ? "http://localhost:3000" : DEFAULT_PRODUCTION_ORIGIN);
}
