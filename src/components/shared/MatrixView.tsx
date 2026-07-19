import { formatFrac, type Frac } from '../../lib/linalg/frac';
import type { Matrix } from '../../lib/linalg/matrix';
import { cols, rows } from '../../lib/linalg/matrix';

interface Props {
  A: Matrix;
  /** 0-based pivot columns to mark */
  pivotCols?: number[];
  freeCols?: number[];
  /** Optional caption */
  caption?: string;
  /** Compact density */
  compact?: boolean;
  /** Highlight a column index */
  highlightCol?: number | null;
  className?: string;
}

export function MatrixView({
  A,
  pivotCols = [],
  freeCols = [],
  caption,
  compact,
  highlightCol = null,
  className = '',
}: Props) {
  const m = rows(A);
  const n = cols(A);
  if (m === 0) {
    return <p className="matrix-empty">Empty matrix</p>;
  }

  return (
    <figure className={`matrix-figure ${compact ? 'matrix-figure--compact' : ''} ${className}`.trim()}>
      <div
        className="matrix-scroll"
        role="table"
        aria-label={caption ?? `Matrix ${m} by ${n}`}
      >
        <div
          className="matrix-grid"
          style={{
            gridTemplateColumns: `repeat(${n}, minmax(2.2rem, auto))`,
          }}
        >
          {A.map((row, i) =>
            row.map((cell, j) => {
              const isPivot = pivotCols.includes(j);
              const isFree = freeCols.includes(j);
              const isHi = highlightCol === j;
              const classes = [
                'matrix-cell',
                isPivot ? 'is-pivot' : '',
                isFree ? 'is-free' : '',
                isHi ? 'is-hi' : '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <span
                  key={`${i}-${j}`}
                  className={classes}
                  role="cell"
                  title={cellTitle(cell, isPivot, isFree)}
                >
                  {formatFrac(cell)}
                </span>
              );
            }),
          )}
        </div>
      </div>
      {caption ? <figcaption className="matrix-caption">{caption}</figcaption> : null}
      {(pivotCols.length > 0 || freeCols.length > 0) && (
        <p className="matrix-legend">
          {pivotCols.length > 0 ? (
            <span>
              <i className="swatch swatch--pivot" aria-hidden="true" /> pivot cols{' '}
              {pivotCols.map((c) => c + 1).join(', ')}
            </span>
          ) : null}
          {freeCols.length > 0 ? (
            <span>
              <i className="swatch swatch--free" aria-hidden="true" /> free cols{' '}
              {freeCols.map((c) => c + 1).join(', ')}
            </span>
          ) : null}
        </p>
      )}
    </figure>
  );
}

function cellTitle(cell: Frac, isPivot: boolean, isFree: boolean): string {
  const bits = [formatFrac(cell)];
  if (isPivot) bits.push('pivot column');
  if (isFree) bits.push('free column');
  return bits.join(' · ');
}

interface VecProps {
  v: Frac[];
  label?: string;
}

export function VectorView({ v, label }: VecProps) {
  return (
    <div className="vector-view">
      {label ? <span className="vector-view__label">{label}</span> : null}
      <span className="vector-view__body mono">
        ({v.map(formatFrac).join(', ')})
      </span>
    </div>
  );
}
