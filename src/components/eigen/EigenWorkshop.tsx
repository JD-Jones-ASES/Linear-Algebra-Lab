import { useEffect, useMemo, useState } from 'react';
import '../shared/workshop.css';
import { WorkshopErrorBoundary } from '../shared/WorkshopErrorBoundary';
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
import { eigen } from '../../lib/linalg/eigen';
import { formatFrac } from '../../lib/linalg/frac';
import { type Matrix, rows, cols } from '../../lib/linalg/matrix';
import { withBase } from '../../lib/basePath';
import { AmbientViz } from '../viz/AmbientViz';
import { ShareBar, SendToBar } from '../shared/ShareBar';

const EIGEN_PRESETS = [
  'eigen-diag',
  'eigen-sym',
  'eigen-jordan',
  'id2',
  'id3',
  'full3',
  'singular',
  'basis-rot',
];

export default function EigenWorkshop() {
  const [source, setSource] = useState<MatrixSource>({
    kind: 'preset',
    id: 'eigen-sym',
  });
  const [banner, setBanner] = useState(EMPTY_BANNER);

  useEffect(() => {
    setSource(
      sourceFromParams(clientParam('preset'), clientParam('A'), 'eigen-sym'),
    );
    setBanner(clientBannerFromDeepLink());
  }, []);

  const A = useMemo(() => sourceMatrix(source), [source]);
  const er = useMemo(() => eigen(A), [A]);
  const label = sourceLabel(source);
  const square = rows(A) === cols(A);

  const eigenVecs =
    (rows(A) === 2 || rows(A) === 3) && er.pairs.length > 0
      ? er.pairs.flatMap((p, pi) =>
          p.eigenspace.map((v, vi) => ({
            id: `ev${pi}-${vi}`,
            v,
            color: ['#4ecdc4', '#e8b84a', '#f07178', '#b794f6'][pi % 4]!,
            label: `λ=${formatFrac(p.lambda)} v${vi + 1}`,
          })),
        )
      : [];

  return (
    <WorkshopErrorBoundary desk="Eigen">
    <div className="workshop">
      <header className="workshop__head">
        <h1>Eigen</h1>
        <p className="workshop__lede">
          Eigenvalues and eigenspaces over exact ℚ for n ≤ 3. We only list
          eigenvalues that split over the rationals — complex or irrational roots
          stay off-stage (with an honest label).
        </p>
      </header>

      <TourBanner
        title={banner.title}
        expect={banner.expect}
        detail={banner.detail}
        thmId={banner.thmId}
      />
      <TheoremChipRow theorems={theoremsForRoom('eigen')} />

      <div className="panel">
        <h2 className="panel__title">Matrix A · {label}</h2>
        <p className="panel__meta">{sourceBlurb(source)}</p>
        <div className="preset-bar" role="group" aria-label="Eigen presets">
          {PRESETS.filter((p) => EIGEN_PRESETS.includes(p.id)).map((p) => (
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
                id: source.kind === 'preset' ? source.id : 'eigen-sym',
              })
            }
          />
        </div>
        {!square ? (
          <p className="panel__meta">Eigenvalues need a square matrix.</p>
        ) : (
          <MatrixView A={A} caption={`A · ${label}`} />
        )}
        <ShareBar
          path="/eigen"
          matrix={A}
          presetId={source.kind === 'preset' ? source.id : null}
        />
        <SendToBar
          matrix={A}
          presetId={source.kind === 'preset' ? source.id : null}
        />
      </div>

      {square ? (
        <div className="two-col">
          <div className="panel">
            <h2 className="panel__title">Spectrum over ℚ</h2>
            <p className="panel__meta mono">χ_A(λ) ≈ {er.charPolyLabel}</p>
            <div className="stat-row">
              <div className={`stat ${er.splitsOverQ ? 'stat--teal' : 'stat--amber'}`}>
                <span className="stat__k">splits over ℚ?</span>
                <span className="stat__v">{er.splitsOverQ ? 'yes' : 'partial/no'}</span>
              </div>
              <div className="stat">
                <span className="stat__k">pairs found</span>
                <span className="stat__v">{er.pairs.length}</span>
              </div>
            </div>

            {er.pairs.length === 0 ? (
              <p className="panel__meta">
                No rational eigenvalues detected (try Diag(2,3) or Symmetric 2×2).
              </p>
            ) : (
              er.pairs.map((p, i) => (
                <div key={i} style={{ marginBottom: '0.85rem' }}>
                  <p className="panel__meta">
                    <strong className="mono">λ = {formatFrac(p.lambda)}</strong>
                    {' · '}
                    alg mult {p.algebraicMult}, geo mult {p.geometricMult}
                  </p>
                  {p.eigenspace.map((v, j) => (
                    <VectorView key={j} v={v} label={`v${j + 1}`} />
                  ))}
                </div>
              ))
            )}

            <div className="verify-strip">
              <Badge ok={er.checks.allAvEqualsLambdaV} label="A v = λ v" />
            </div>
          </div>

          {eigenVecs.length > 0 ? (
            <div className="panel">
              <h2 className="panel__title">Eigenspace picture</h2>
              <AmbientViz ambient={rows(A)} vectors={eigenVecs} A={null} />
            </div>
          ) : (
            <div className="panel">
              <h2 className="panel__title">Geometry</h2>
              <p className="viz-fallback">
                Eigenlines/planes draw when ambient dim is 2 or 3 and ℚ-eigenvectors
                exist.
              </p>
            </div>
          )}
        </div>
      ) : null}

      <aside className="continue-card">
        <h2>Where next</h2>
        <ul>
          <li>
            <a href={withBase('/basis?preset=eigen-sym&T=eigen-sym')}>
              Basis desk
            </a>{' '}
            — eigenbasis diagonalizes T
          </li>
          <li>
            <a href={withBase('/theorems#eigenvalue')}>Eigenvalue theorem</a>
          </li>
        </ul>
      </aside>
    </div>
    </WorkshopErrorBoundary>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`verify-badge${ok ? ' is-pass' : ' is-fail'}`}>
      {ok ? '✓' : '✗'} {label}
    </span>
  );
}
