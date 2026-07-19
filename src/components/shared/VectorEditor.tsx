import { useEffect, useState } from 'react';
import {
  formatFrac,
  parseFrac,
  type Frac,
  ZERO,
} from '../../lib/linalg/frac';
import type { Vector } from '../../lib/linalg/matrix';

interface Props {
  vector: Vector;
  onApply: (v: Vector) => void;
  label?: string;
}

/**
 * Edit a column vector over exact ℚ (length follows parent).
 */
export function VectorEditor({ vector, onApply, label = 'b' }: Props) {
  const [cells, setCells] = useState(() =>
    vector.map((c) => formatFrac(c).replace(/−/g, '-')),
  );
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCells(vector.map((c) => formatFrac(c).replace(/−/g, '-')));
    setError(null);
  }, [vector]);

  useEffect(() => {
    setReady(true);
  }, []);

  // Resize buffer if ambient dim changes
  useEffect(() => {
    setCells((prev) => {
      const next = Array.from({ length: vector.length }, (_, i) => prev[i] ?? '0');
      return next;
    });
  }, [vector.length]);

  const apply = () => {
    const parsed: Frac[] = [];
    for (const s of cells) {
      const f = parseFrac(s);
      if (!f) {
        setError('Use integers or fractions like 3, -1/2, 0.');
        return;
      }
      parsed.push(f);
    }
    if (parsed.length !== vector.length) {
      setError(`Need ${vector.length} entries.`);
      return;
    }
    setError(null);
    onApply(parsed);
  };

  return (
    <div className="vector-editor" data-vector-editor="true" data-editor-ready={ready ? 'true' : 'false'}>
      <div className="vector-editor__row">
        <span className="vector-view__label">{label} =</span>
        <span className="mono">(</span>
        {cells.map((val, i) => (
          <input
            key={i}
            className="matrix-editor__cell mono"
            style={{ minWidth: '3rem', width: '3.5rem' }}
            value={val}
            aria-label={`${label} entry ${i + 1}`}
            onChange={(e) => {
              const next = [...cells];
              next[i] = e.target.value;
              setCells(next);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                apply();
              }
            }}
          />
        ))}
        <span className="mono">)</span>
        <button type="button" className="tab-btn is-on" onClick={apply}>
          Apply {label}
        </button>
      </div>
      {error ? (
        <p className="matrix-editor__error" role="alert">
          {error}
        </p>
      ) : (
        <p className="matrix-editor__hint">Exact fractions · Apply to recompute</p>
      )}
    </div>
  );
}

export function zeroVector(m: number): Vector {
  return Array.from({ length: m }, () => ZERO);
}
