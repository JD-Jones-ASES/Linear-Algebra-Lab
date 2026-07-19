import { useEffect, useMemo, useState } from 'react';
import '../shared/workshop.css';
import { TourBanner } from '../shared/TourBanner';
import { TheoremChipRow } from '../shared/TheoremChip';
import { MatrixView, VectorView } from '../shared/MatrixView';
import { clientBannerFromDeepLink, clientParam } from '../../lib/connect/deepLink';
import { theoremsForRoom } from '../../lib/connect/theorems';
import { PRESETS, presetById, defaultPreset } from '../../lib/linalg/catalog';
import { fourSubspaces } from '../../lib/linalg/subspaces';
import { solve } from '../../lib/linalg/solve';
import { type Vector, column, cols, rows } from '../../lib/linalg/matrix';
import { ONE, ZERO } from '../../lib/linalg/frac';
import { withBase } from '../../lib/basePath';

type BMode = 'in' | 'out' | 'custom';

export default function SolveWorkshop() {
  const [presetId, setPresetId] = useState('singular');
  const [bMode, setBMode] = useState<BMode>('in');
  const [banner, setBanner] = useState(clientBannerFromDeepLink());

  useEffect(() => {
    const p = clientParam('preset');
    if (p && presetById(p)) setPresetId(p);
    const b = clientParam('b');
    if (b === 'in' || b === 'out' || b === 'custom') setBMode(b);
    setBanner(clientBannerFromDeepLink());
  }, []);

  const preset = presetById(presetId) ?? defaultPreset();
  const A = preset.matrix;
  const m = rows(A);
  const n = cols(A);

  const b = useMemo(() => pickB(A, bMode), [A, bMode, presetId]);
  const result = useMemo(() => solve(A, b), [A, b]);
  const fs = useMemo(() => fourSubspaces(A), [A]);

  return (
    <div className="workshop">
      <header className="workshop__head">
        <h1>Solve A x = b</h1>
        <p className="workshop__lede">
          Consistency is a column-space question: b must lie in C(A). When it does,
          the solution is a particular vector plus the nullspace.
        </p>
      </header>

      <TourBanner
        title={banner.title}
        expect={banner.expect}
        detail={banner.detail}
        thmId={banner.thmId}
      />

      <TheoremChipRow theorems={theoremsForRoom('solve')} />

      <div className="panel">
        <h2 className="panel__title">Matrix A</h2>
        <p className="panel__meta">{preset.blurb}</p>
        <div className="preset-bar" role="group" aria-label="Matrix presets">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`preset-chip${p.id === presetId ? ' is-on' : ''}`}
              aria-pressed={p.id === presetId}
              onClick={() => setPresetId(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div style={{ marginTop: '0.75rem' }}>
          <MatrixView A={A} caption={`${preset.label} · ${m}×${n}`} />
        </div>
      </div>

      <div className="panel">
        <h2 className="panel__title">Right-hand side b</h2>
        <div className="tab-bar" role="group" aria-label="Choose b">
          <button
            type="button"
            className={`tab-btn${bMode === 'in' ? ' is-on' : ''}`}
            aria-pressed={bMode === 'in'}
            onClick={() => setBMode('in')}
          >
            b ∈ C(A)
          </button>
          <button
            type="button"
            className={`tab-btn${bMode === 'out' ? ' is-on' : ''}`}
            aria-pressed={bMode === 'out'}
            onClick={() => setBMode('out')}
          >
            b ∉ C(A) (when possible)
          </button>
        </div>
        <VectorView v={b} label="b" />
        <p className="panel__meta">
          dim C(A) = {fs.col.dimension}
          {fs.col.dimension === m
            ? ' — full row rank, every b is reachable.'
            : fs.col.dimension === 0
              ? ' — only b = 0 is consistent.'
              : ' — some b land outside the column space.'}
        </p>
      </div>

      <div className="panel">
        <h2 className="panel__title">Result</h2>
        <div className="stat-row">
          <div className={`stat ${result.consistent ? 'stat--teal' : 'stat--rose'}`}>
            <span className="stat__k">Status</span>
            <span className="stat__v">
              {result.consistent ? 'consistent' : 'inconsistent'}
            </span>
          </div>
          <div className="stat">
            <span className="stat__k">rank(A)</span>
            <span className="stat__v">{result.rank}</span>
          </div>
          <div className="stat">
            <span className="stat__k">rank[A|b]</span>
            <span className="stat__v">{result.rankAug}</span>
          </div>
          <div className="stat">
            <span className="stat__k">free vars</span>
            <span className="stat__v">{result.freeCols.length}</span>
          </div>
        </div>

        {result.consistent && result.particular ? (
          <>
            <VectorView v={result.particular} label="particular xₚ" />
            {result.nullspace.length > 0 ? (
              <>
                <p className="panel__meta">
                  General solution: x = xₚ + N(A). Nullspace basis:
                </p>
                {result.nullspace.map((v, i) => (
                  <VectorView key={i} v={v} label={`n${i + 1}`} />
                ))}
              </>
            ) : (
              <p className="panel__meta">Unique solution (trivial nullspace).</p>
            )}
          </>
        ) : (
          <p className="panel__meta">
            No solution — b is not a linear combination of the columns. In the
            augmented RREF a row becomes [0 … 0 | c] with c ≠ 0.
          </p>
        )}

        <div className="verify-strip">
          <span
            className={`verify-badge${
              result.consistent === (result.rankAug === result.rank)
                ? ' is-pass'
                : ' is-fail'
            }`}
          >
            consistent ⇔ rank[A|b] = rank(A)
          </span>
          {result.consistent ? (
            <span
              className={`verify-badge${result.residualZero ? ' is-pass' : ' is-fail'}`}
            >
              A xₚ = b
            </span>
          ) : null}
        </div>
      </div>

      <aside className="continue-card">
        <h2>Where next</h2>
        <ul>
          <li>
            <a
              href={withBase(
                `/spaces?preset=${presetId}&focus=col&note=${encodeURIComponent(
                  'Column space is the set of reachable b.',
                )}`,
              )}
            >
              Column space C(A)
            </a>
          </li>
          <li>
            <a href={withBase('/theorems#solvability')}>Solvability theorem</a>
          </li>
        </ul>
      </aside>
    </div>
  );
}

/**
 * Pick a right-hand side:
 * - in: A e₁ (first column), or 0 if zero matrix
 * - out: try to find a vector outside C(A) when rank < m
 */
function pickB(A: ReturnType<typeof defaultPreset>['matrix'], mode: BMode): Vector {
  const m = rows(A);
  const n = cols(A);
  const fs = fourSubspaces(A);

  if (mode === 'in' || fs.col.dimension === m) {
    // Prefer first column if nonzero; else A * (1,0,...,0) still works; if zero matrix, b=0
    if (fs.col.dimension === 0) {
      return Array.from({ length: m }, () => ZERO);
    }
    // Use first pivot column, or first column
    const j = fs.pivotCols[0] ?? 0;
    return column(A, Math.min(j, n - 1));
  }

  // out: need b not in C(A)
  if (fs.leftNull.basis.length > 0) {
    // Any vector with nonzero dot against left-null basis is outside C(A)
    // Use the left-null basis vector itself (orthogonal to all columns ⇒ not in C unless 0)
    return fs.leftNull.basis[0]!.map((c) => ({ n: c.n, d: c.d }));
  }

  // Full row rank — cannot go outside; fall back to a standard vector
  return Array.from({ length: m }, (_, i) => (i === 0 ? ONE : ZERO));
}
