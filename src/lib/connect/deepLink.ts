/**
 * Deep-link helpers for workshop islands.
 *
 * Astro static SSR often freezes searchParams at build time (empty). Always
 * re-read `window.location.search` on the client so tour links land correctly.
 */

import { theoremById, type NamedTheorem } from './theorems';

export function clientSearchParams(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

export function clientParam(name: string): string | null {
  return clientSearchParams().get(name);
}

export function clientParamNumber(name: string): number | undefined {
  const raw = clientParam(name);
  if (raw === null || raw === '') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/** Optional human banner from ?note= or tour catalog. */
export function clientNote(): string | null {
  const note = clientParam('note');
  if (note) {
    try {
      return decodeURIComponent(note.replace(/\+/g, ' '));
    } catch {
      return note;
    }
  }
  return null;
}

/** Named theorem from ?thm=id */
export function clientTheorem(): NamedTheorem | null {
  return theoremById(clientParam('thm'));
}

export type DeepLinkBanner = {
  title?: string;
  expect: string | null;
  detail?: string;
  thmId: string | null;
};

/** SSR-safe empty banner — never read window during useState init (hydration). */
export const EMPTY_BANNER: DeepLinkBanner = {
  expect: null,
  thmId: null,
};

/** Banner fields: theorem sticky note wins over generic note when both set.
 * Call only in useEffect / event handlers, not during SSR render. */
export function clientBannerFromDeepLink(): DeepLinkBanner {
  const thm = clientTheorem();
  const note = clientNote();
  if (thm) {
    return {
      title: thm.name,
      expect: note ?? thm.lookFor,
      detail: `${thm.formal} — ${thm.why}`,
      thmId: thm.id,
    };
  }
  if (note) {
    return { expect: note, thmId: null };
  }
  return { ...EMPTY_BANNER };
}
