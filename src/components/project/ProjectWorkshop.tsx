import { useEffect, useMemo, useState } from 'react';
import '../shared/workshop.css';
import { TourBanner } from '../shared/TourBanner';
import { TheoremChipRow } from '../shared/TheoremChip';
import { MatrixView, VectorView } from '../shared/MatrixView';
import { MatrixEditor } from '../shared/MatrixEditor';
import { clientBannerFromDeepLink, clientParam } from '../../lib/connect/deepLink';
import { theoremsForRoom } from '../../lib/connect/theorems';
import {
  PRESETS,
  presetById,
  defaultPreset,
  type MatrixSource,
  sourceMatrix,
  sourceLabel,
  sourceBlurb,
} from '../../lib/linalg/matrixSource';
import { fourSubspaces } from '../../lib/linalg/subspaces';
import { project } from '../../lib/linalg/project';
import {
  type Matrix,
  type Vector,
  column,
  cols,
  rows,
} from '../../lib/linalg/matrix';
import { ONE, ZERO, formatFrac } from '../../lib/linalg/frac';
import { withBase } from '../../lib/basePath';
import { AmbientViz } from '../viz/AmbientViz';

type BMode = 'in' | 'out';

export default function ProjectWorkshop() {
  const [source, setSource] = useState<MatrixSource>({
    kind: 'preset',
    id: 'singular',
  });
  const [bMode, setBMode] = useState<BMode>('out');
  const [banner, setBanner] = useState(clientBannerFromDeepLink());

  useEffect(() => {
    const p = clientParam('preset');
    if (p && presetById(p)) setSource({ kind: 'preset', id: p });
    const b = clientParam('b');
    if (b === 'in' || b === 'out') setBMode(b);
    setBanner(clientBannerFromDeepLink());
  }, []);

  const A = useMemo(() => sourceMatrix(source), [source]);
  const m = rows(A);
  const n = cols(A);
  const b = useMemo(() => pickB(A, bMode), [A, bMode]);
  const pr = useMemo(() => project(A, b), [A, b]);
  const fs = useMemo(() => fourSubspaces(A), [A]);
  const label = sourceLabel(source);

  const viz =
    m === 2 || m === 3
      ? [
          { id: 'b', v: b, color: '#e8b84a', label: 'b' },
          {
            id: 'p',
            v: pr.projection,
            color: '#4ecdc4',
            label: 'p = proj',
          },
          {
            id: 'r',
            v: pr.residual,
            color: '#f07178',
            label: 'r = b−p',
            dashed: true as const,
          },
        ]
      : [];

  return (
    <div className="workshop">
      <header className="workshop__head">
        <h1>Project · least squares</h1>
        <p className="workshop__lede">
          Even when A x = b has no solution, there is a closest p ∈ C(A). The
          residual r = b − p lives in the left nullspace N(Aᵀ). Normal equations:
          Aᵀ A x̂ = Aᵀ b.
        </p>
      </header>

      <TourBanner
        title={banner.title}
        expect={banner.expect}
        detail={banner.detail}
        thmId={banner.thmId}
      />

      <TheoremChipRow theorems={theoremsForRoom('project')} />

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
        <h2 className="panel__title">Vector b</h2>
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
      </div>

      <div className="two-col">
        <div className="panel">
          <h2 className="panel__title">Projection algebra</h2>
          <div className="stat-row">
            <div className={`stat ${pr.bInColumnSpace ? 'stat--teal' : 'stat--amber'}`}>
              <span className="stat__k">b ∈ C(A)?</span>
              <span className="stat__v">{pr.bInColumnSpace ? 'yes' : 'no'}</span>
            </div>
            <div className="stat">
              <span className="stat__k">rank</span>
              <span className="stat__v">{pr.rank}</span>
            </div>
            <div className="stat">
              <span className="stat__k">full col rank</span>
              <span className="stat__v">{pr.fullColumnRank ? 'yes' : 'no'}</span>
            </div>
          </div>

          <VectorView v={pr.hatX} label="x̂ (LS)" />
          <VectorView v={pr.projection} label="p = A x̂" />
          <VectorView v={pr.residual} label="r = b − p" />

          <p className="panel__meta" style={{ marginTop: '0.65rem' }}>
            Normal matrix AᵀA ({n}×{n}) · Aᵀb = (
            {pr.normalRhs.map(formatFrac).join(', ')})
          </p>
          <MatrixView A={pr.normalMatrix} caption="Aᵀ A" compact />

          <div className="verify-strip" aria-label="Projection checks">
            <Badge ok={pr.checks.residualLeftNull} label="Aᵀ r = 0" />
            <Badge ok={pr.checks.projectionInCol} label="p ∈ C(A)" />
            <Badge ok={pr.checks.residualOrthoProjection} label="p · r = 0" />
            <Badge ok={pr.checks.normalSatisfied} label="AᵀA x̂ = Aᵀb" />
          </div>
        </div>

        <div className="panel">
          <h2 className="panel__title">Geometry</h2>
          {viz.length > 0 ? (
            <AmbientViz
              ambient={m}
              vectors={viz}
              A={A}
              title={
                m === 3
                  ? 'ℝ³ display · drag to orbit'
                  : 'ℝ² display · C(A) shaded when full'
              }
            />
          ) : (
            <p className="viz-fallback">
              Drawings for ambient dim 2 or 3. This matrix has m = {m}.
            </p>
          )}
          <p className="panel__meta">
            dim C(A) = {fs.col.dimension}, dim N(Aᵀ) = {fs.leftNull.dimension}. Residual
            direction aligns with left nullspace when r ≠ 0.
          </p>
        </div>
      </div>

      <aside className="continue-card">
        <h2>Where next</h2>
        <ul>
          <li>
            <a
              href={withBase(
                source.kind === 'preset'
                  ? `/spaces?preset=${source.id}&focus=leftNull`
                  : '/spaces',
              )}
            >
              Left nullspace N(Aᵀ)
            </a>
          </li>
          <li>
            <a href={withBase('/theorems#projection')}>Projection theorem</a>
          </li>
          <li>
            <a
              href={withBase(
                source.kind === 'preset'
                  ? `/solve?preset=${source.id}&b=${bMode}`
                  : '/solve',
              )}
            >
              Exact solve desk
            </a>
          </li>
        </ul>
      </aside>
    </div>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`verify-badge${ok ? ' is-pass' : ' is-fail'}`}>
      {ok ? '✓' : '✗'} {label}
    </span>
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
