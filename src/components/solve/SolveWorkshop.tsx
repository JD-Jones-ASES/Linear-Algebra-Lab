import { useEffect, useMemo, useState } from 'react';
import '../shared/workshop.css';
import { TourBanner } from '../shared/TourBanner';
import { TheoremChipRow } from '../shared/TheoremChip';
import { MatrixView, VectorView } from '../shared/MatrixView';
import { MatrixEditor } from '../shared/MatrixEditor';
import { clientBannerFromDeepLink, clientParam, EMPTY_BANNER } from '../../lib/connect/deepLink';
import { theoremsForRoom } from '../../lib/connect/theorems';
import {
  PRESETS,
  type MatrixSource,
  sourceMatrix,
  sourceLabel,
  sourceBlurb,
  sourceFromParams,
} from '../../lib/linalg/matrixSource';
import { fourSubspaces } from '../../lib/linalg/subspaces';
import { solve } from '../../lib/linalg/solve';
import { affineSolution } from '../../lib/linalg/affine';
import { type Matrix, type Vector, column, cols, rows } from '../../lib/linalg/matrix';
import { ONE, ZERO } from '../../lib/linalg/frac';
import { withBase } from '../../lib/basePath';
import { AmbientViz } from '../viz/AmbientViz';

type BMode = 'in' | 'out';

export default function SolveWorkshop() {
  const [source, setSource] = useState<MatrixSource>({
    kind: 'preset',
    id: 'singular',
  });
  const [bMode, setBMode] = useState<BMode>('in');
  const [banner, setBanner] = useState(EMPTY_BANNER);

  useEffect(() => {
    setSource(sourceFromParams(clientParam('preset'), clientParam('A')));
    const b = clientParam('b');
    if (b === 'in' || b === 'out') setBMode(b);
    setBanner(clientBannerFromDeepLink());
  }, []);

  const A = useMemo(() => sourceMatrix(source), [source]);
  const m = rows(A);
  const n = cols(A);
  const b = useMemo(() => pickB(A, bMode), [A, bMode]);
  const result = useMemo(() => solve(A, b), [A, b]);
  const aff = useMemo(() => affineSolution(A, b), [A, b]);
  const fs = useMemo(() => fourSubspaces(A), [A]);
  const label = sourceLabel(source);

  const domainViz = useMemo(() => {
    if (!aff.consistent || !aff.particular) return [];
    if (n !== 2 && n !== 3) return [];
    const vecs = [
      {
        id: 'xp',
        v: aff.particular,
        color: '#e8b84a',
        label: 'xₚ',
      },
      ...aff.directions.map((d, i) => ({
        id: `n${i}`,
        v: d,
        color: '#f07178',
        label: `n${i + 1}`,
        dashed: true as const,
      })),
    ];
    return vecs;
  }, [aff, n]);

  const viz = useMemo(() => {
    if (m !== 2 && m !== 3) return [];
    return [
      { id: 'b', v: b, color: '#e8b84a', label: 'b' },
      ...fs.col.basis.map((v, i) => ({
        id: `c${i}`,
        v,
        color: '#4ecdc4',
        label: `a${i + 1}`,
      })),
    ];
  }, [m, b, fs]);

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
        <h2 className="panel__title">Matrix A · {label}</h2>
        <p className="panel__meta">{sourceBlurb(source)}</p>
        <div className="preset-bar" role="group" aria-label="Matrix presets">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`preset-chip${source.kind === 'preset' && source.id === p.id ? ' is-on' : ''}`}
              aria-pressed={source.kind === 'preset' && source.id === p.id}
              onClick={() => setSource({ kind: 'preset', id: p.id })}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div style={{ marginTop: '0.75rem' }}>
          <MatrixEditor
            matrix={A}
            onApply={(M: Matrix) => setSource({ kind: 'custom', matrix: M })}
            onReset={() =>
              setSource({
                kind: 'preset',
                id: source.kind === 'preset' ? source.id : 'singular',
              })
            }
          />
        </div>
        <div style={{ marginTop: '0.75rem' }}>
          <MatrixView A={A} caption={`${label} · ${m}×${n}`} />
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

      <div className="two-col">
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
                    Affine solution set: x = xₚ + N(A) · dim = {aff.dimension}
                  </p>
                  {result.nullspace.map((v, i) => (
                    <VectorView key={i} v={v} label={`n${i + 1}`} />
                  ))}
                  {aff.samples.length > 1 ? (
                    <p className="panel__meta">
                      Samples along first direction: xₚ ± n₁ also solve A x = b.
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="panel__meta">Unique solution (trivial nullspace).</p>
              )}
            </>
          ) : (
            <p className="panel__meta">
              No solution — b is not a linear combination of the columns.{' '}
              <a
                href={withBase(
                  source.kind === 'preset'
                    ? `/project?preset=${source.id}&b=out`
                    : '/project',
                )}
              >
                Project desk
              </a>{' '}
              finds the closest p ∈ C(A).
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

        {viz.length > 0 ? (
          <div className="panel">
            <h2 className="panel__title">Geometry · b vs C(A)</h2>
            <AmbientViz ambient={m} vectors={viz} A={A} />
          </div>
        ) : null}
      </div>

      {domainViz.length > 0 ? (
        <div className="panel">
          <h2 className="panel__title">Domain · affine solution set</h2>
          <p className="panel__meta">
            xₚ in the domain ℚⁿ with nullspace directions (dashed).
          </p>
          <AmbientViz ambient={n} vectors={domainViz} A={null} />
        </div>
      ) : null}
    </div>
  );
}

function pickB(A: Matrix, mode: BMode): Vector {
  const m = rows(A);
  const n = cols(A);
  const fs = fourSubspaces(A);

  if (mode === 'in' || fs.col.dimension === m) {
    if (fs.col.dimension === 0) {
      return Array.from({ length: m }, () => ZERO);
    }
    const j = fs.pivotCols[0] ?? 0;
    return column(A, Math.min(j, n - 1));
  }

  if (fs.leftNull.basis.length > 0) {
    return fs.leftNull.basis[0]!.map((c) => ({ n: c.n, d: c.d }));
  }

  return Array.from({ length: m }, (_, i) => (i === 0 ? ONE : ZERO));
}
