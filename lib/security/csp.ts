export function createContentSecurityPolicy(
  nonce: string,
  supabaseUrl: string,
  isDevelopment: boolean
): string {
  let supabaseOrigin = "https://placeholder.supabase.co";
  try {
    supabaseOrigin = new URL(supabaseUrl).origin;
  } catch {
    supabaseOrigin = "https://placeholder.supabase.co";
  }
  const supabaseSocketOrigin = supabaseOrigin.replace(/^https:/, "wss:").replace(/^http:/, "ws:");
  const developmentEval = isDevelopment ? " 'unsafe-eval'" : "";

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'${developmentEval} https://va.vercel-scripts.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://cdn.discordapp.com https://*.supabase.co",
    "font-src 'self' data:",
    `connect-src 'self' ${supabaseOrigin} ${supabaseSocketOrigin} https://va.vercel-scripts.com https://*.vercel-insights.com`,
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    `form-action 'self' ${supabaseOrigin}`,
  ].join("; ");
}
