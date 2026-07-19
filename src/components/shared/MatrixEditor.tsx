import { useEffect, useState } from 'react';
import {
  MAX_EDIT_DIM,
  emptyStringGrid,
  matrixToStrings,
  resizeStringGrid,
  stringsToMatrix,
} from '../../lib/linalg/matrixSource';
import type { Matrix } from '../../lib/linalg/matrix';
import { cols, rows } from '../../lib/linalg/matrix';

interface Props {
  matrix: Matrix;
  onApply: (A: Matrix) => void;
  onReset?: () => void;
  resetLabel?: string;
}

export function MatrixEditor({
  matrix,
  onApply,
  onReset,
  resetLabel = 'Reset',
}: Props) {
  const [cells, setCells] = useState(() => matrixToStrings(matrix));
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCells(matrixToStrings(matrix));
    setError(null);
  }, [matrix]);

  useEffect(() => {
    setReady(true);
  }, []);

  const m = cells.length;
  const n = cells[0]?.length ?? 0;

  const setCell = (i: number, j: number, value: string) => {
    setCells((prev) => {
      const next = prev.map((row) => [...row]);
      next[i]![j] = value;
      return next;
    });
    setError(null);
  };

  const resize = (nm: number, nn: number) => {
    setCells((prev) => resizeStringGrid(prev, nm, nn));
    setError(null);
  };

  const apply = () => {
    const A = stringsToMatrix(cells);
    if (!A) {
      setError('Use integers or fractions like 3, -1/2, 0 (exact ℚ only).');
      return;
    }
    setError(null);
    onApply(A);
  };

  return (
    <div
      className="matrix-editor"
      data-matrix-editor="true"
      data-editor-ready={ready ? 'true' : 'false'}
    >
      <div className="matrix-editor__toolbar">
        <label className="matrix-editor__dim">
          Rows
          <input
            type="number"
            min={1}
            max={MAX_EDIT_DIM}
            value={m}
            aria-label="Number of rows"
            onChange={(e) => resize(Number(e.target.value) || 1, n)}
          />
        </label>
        <label className="matrix-editor__dim">
          Cols
          <input
            type="number"
            min={1}
            max={MAX_EDIT_DIM}
            value={n}
            aria-label="Number of columns"
            onChange={(e) => resize(m, Number(e.target.value) || 1)}
          />
        </label>
        <span className="matrix-editor__cap">
          max {MAX_EDIT_DIM}×{MAX_EDIT_DIM}
        </span>
        <button type="button" className="tab-btn is-on" onClick={apply}>
          Apply
        </button>
        {onReset ? (
          <button type="button" className="tab-btn" onClick={onReset}>
            {resetLabel}
          </button>
        ) : null}
        <button
          type="button"
          className="tab-btn"
          onClick={() => {
            const grid = emptyStringGrid(m, n);
            setCells(grid);
            setError(null);
            const A = stringsToMatrix(grid);
            if (A) onApply(A);
          }}
        >
          Clear
        </button>
      </div>

      <div
        className="matrix-editor__grid"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(3.2rem, 4.5rem))` }}
        role="group"
        aria-label={`Editable matrix ${m} by ${n}`}
      >
        {cells.map((row, i) =>
          row.map((val, j) => (
            <input
              key={`${i}-${j}`}
              className="matrix-editor__cell mono"
              value={val}
              aria-label={`Entry row ${i + 1} column ${j + 1}`}
              onChange={(e) => setCell(i, j, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  apply();
                }
              }}
            />
          )),
        )}
      </div>

      {error ? (
        <p className="matrix-editor__error" role="alert">
          {error}
        </p>
      ) : (
        <p className="matrix-editor__hint">
          Exact fractions only · {rows(matrix)}×{cols(matrix)} committed · Apply to
          recompute
        </p>
      )}
    </div>
  );
}
