/**
 * Site-level constants. The public URL comes from the environment so nothing
 * production-specific is hardcoded across the app.
 */

const FALLBACK_URL = "http://localhost:3000";

function normalizeUrl(value: string | undefined): string {
  const raw = (value ?? "").trim();
  if (!raw) return FALLBACK_URL;
  try {
    const url = new URL(raw);
    return url.origin + (url.pathname === "/" ? "" : url.pathname.replace(/\/$/, ""));
  } catch {
    return FALLBACK_URL;
  }
}

export const APP_URL = normalizeUrl(process.env.NEXT_PUBLIC_APP_URL);

export const APP_NAME = "MalluImposter";
export const APP_SHORT_NAME = "MalluImposter";
export const APP_DESCRIPTION =
  "A Malayalam & English imposter party game for one phone. One word, one imposter — can you find them?";

export const THEME_COLOR_DARK = "#0a0d14";
export const THEME_COLOR_LIGHT = "#f6f3ec";
