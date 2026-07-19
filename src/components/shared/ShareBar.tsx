import { useState } from 'react';
import { withBase } from '../../lib/basePath';
import { encodeMatrix } from '../../lib/linalg/urlMatrix';
import type { Matrix } from '../../lib/linalg/matrix';

interface Props {
  /** Desk path without base, e.g. /matrix */
  path: string;
  matrix: Matrix;
  /** Extra query params (preset preferred when not custom) */
  extra?: Record<string, string>;
  /** Prefer ?preset= over ?A= when set */
  presetId?: string | null;
}

/**
 * Copy / open shareable deep link for the current matrix.
 */
export function ShareBar({ path, matrix, extra = {}, presetId }: Props) {
  const [status, setStatus] = useState<string | null>(null);

  const buildHref = () => {
    const params = new URLSearchParams();
    if (presetId) {
      params.set('preset', presetId);
    } else {
      params.set('A', encodeMatrix(matrix));
    }
    for (const [k, v] of Object.entries(extra)) {
      if (v !== undefined && v !== '') params.set(k, v);
    }
    const q = params.toString();
    return withBase(`${path}${q ? `?${q}` : ''}`);
  };

  const href = buildHref();

  const copy = async () => {
    try {
      const abs =
        typeof window !== 'undefined'
          ? new URL(href, window.location.origin).href
          : href;
      await navigator.clipboard.writeText(abs);
      setStatus('Copied');
      setTimeout(() => setStatus(null), 1500);
    } catch {
      setStatus('Copy failed — use the link');
    }
  };

  return (
    <div className="share-bar" data-share-bar="true">
      <span className="share-bar__label">Share</span>
      <a className="share-bar__link mono" href={href}>
        {presetId ? `?preset=${presetId}` : `?A=${encodeMatrix(matrix)}`}
      </a>
      <button type="button" className="tab-btn" onClick={copy}>
        Copy link
      </button>
      {status ? (
        <span className="share-bar__status" role="status">
          {status}
        </span>
      ) : null}
    </div>
  );
}

interface SendProps {
  matrix: Matrix;
  presetId?: string | null;
}

const DESTINATIONS = [
  { path: '/matrix', label: 'Matrix' },
  { path: '/spaces', label: 'Spaces' },
  { path: '/solve', label: 'Solve' },
  { path: '/project', label: 'Project' },
  { path: '/basis', label: 'Basis' },
  { path: '/eigen', label: 'Eigen' },
] as const;

/** Jump to another desk with the same matrix encoded. */
export function SendToBar({ matrix, presetId }: SendProps) {
  return (
    <div className="send-bar" role="navigation" aria-label="Send matrix to desk">
      <span className="share-bar__label">Send to</span>
      <ul className="send-bar__list">
        {DESTINATIONS.map((d) => {
          const params = new URLSearchParams();
          if (presetId) params.set('preset', presetId);
          else params.set('A', encodeMatrix(matrix));
          const href = withBase(`${d.path}?${params.toString()}`);
          return (
            <li key={d.path}>
              <a className="thm-chip" href={href}>
                {d.label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
