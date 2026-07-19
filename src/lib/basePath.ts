/**
 * Site base path for GitHub Pages project sites (e.g. `/Algebra-Lab/`).
 * Locally and in e2e, base is `/`.
 *
 * Keep data hrefs as root-app paths (`/homs?preset=…`); call `withBase` only
 * when rendering `<a href>`.
 */

/** Always ends with `/`. */
export function siteBase(): string {
  const b = (import.meta.env.BASE_URL as string | undefined) ?? '/';
  return b.endsWith('/') ? b : `${b}/`;
}

/**
 * Prefix an in-app path with the deploy base.
 * - `withBase('/homs?x=1')` → `/Algebra-Lab/homs?x=1` (on Pages)
 * - `withBase('#eat-x')` stays a fragment
 * - external `https://…` URLs pass through
 */
export function withBase(path: string): string {
  if (!path) return siteBase();
  if (/^https?:\/\//i.test(path) || path.startsWith('//')) return path;
  if (path.startsWith('#')) return path;
  if (path === '/') return siteBase();

  const base = siteBase();
  const cleaned = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${cleaned}`;
}
