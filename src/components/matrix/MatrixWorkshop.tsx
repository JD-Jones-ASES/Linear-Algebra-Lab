import { useEffect, useMemo, useState } from 'react';
import '../shared/workshop.css';
import { TourBanner } from '../shared/TourBanner';
import { TheoremChipRow } from '../shared/TheoremChip';
import { MatrixView } from '../shared/MatrixView';
import { MatrixEditor } from '../shared/MatrixEditor';
import { clientBannerFromDeepLink, clientParam, EMPTY_BANNER } from '../../lib/connect/deepLink';
import { theoremsForRoom } from '../../lib/connect/theorems';
import {
  PRESETS,
  presetById,
  defaultPreset,
  type MatrixSource,
  sourceMatrix,
  sourceLabel,
  sourceBlurb,
  sourceFromParams,
} from '../../lib/linalg/matrixSource';
import { fourSubspaces } from '../../lib/linalg/subspaces';
import { det, cols, rows, type Matrix } from '../../lib/linalg/matrix';
import { formatFrac, isZero } from '../../lib/linalg/frac';
import { withBase } from '../../lib/basePath';
import { AmbientViz } from '../viz/AmbientViz';
import { column } from '../../lib/linalg/matrix';

type Tab = 'A' | 'rref' | 'both';

export default function MatrixWorkshop() {
  const [source, setSource] = useState<MatrixSource>({
    kind: 'preset',
    id: defaultPreset().id,
  });
  const [tab, setTab] = useState<Tab>('both');
  const [banner, setBanner] = useState(EMPTY_BANNER);

  useEffect(() => {
    setSource(sourceFromParams(clientParam('preset'), clientParam('A')));
    const t = clientParam('tab');
    if (t === 'A' || t === 'rref' || t === 'both') setTab(t);
    setBanner(clientBannerFromDeepLink());
  }, []);

  const A = useMemo(() => sourceMatrix(source), [source]);
  const fs = useMemo(() => fourSubspaces(A), [A]);
  const square = rows(A) === cols(A);
  const d = square ? det(A) : null;
  const label = sourceLabel(source);
  const blurb = sourceBlurb(source);

  const applyCustom = (M: Matrix) => {
    setSource({ kind: 'custom', matrix: M });
  };

  const pickPreset = (id: string) => setSource({ kind: 'preset', id });

  const colVecs = useMemo(() => {
    if (rows(A) !== 2 && rows(A) !== 3) return [];
    return Array.from({ length: Math.min(cols(A), 4) }, (_, j) => ({
      id: `c${j}`,
      v: column(A, j),
      color: ['#4ecdc4', '#e8b84a', '#f07178', '#b794f6'][j % 4]!,
      label: `a${j + 1}`,
    }));
  }, [A]);

  return (
    <div className="workshop">
      <header className="workshop__head">
        <h1>Matrix desk</h1>
        <p className="workshop__lede">
          Exact rationals ℚ. Edit a matrix or pick a preset, read rank and RREF,
          mark pivots vs free columns.
        </p>
      </header>

      <TourBanner
        title={banner.title}
        expect={banner.expect}
        detail={banner.detail}
        thmId={banner.thmId}
      />

      <TheoremChipRow theorems={theoremsForRoom('matrix')} />

      <div className="panel">
        <h2 className="panel__title">Presets</h2>
        <p className="panel__meta">{blurb}</p>
        <div className="preset-bar" role="group" aria-label="Matrix presets">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`preset-chip${source.kind === 'preset' && source.id === p.id ? ' is-on' : ''}`}
              aria-pressed={source.kind === 'preset' && source.id === p.id}
              onClick={() => pickPreset(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2 className="panel__title">Edit matrix · {label}</h2>
        <MatrixEditor
          matrix={A}
          onApply={applyCustom}
          onReset={
            source.kind === 'preset'
              ? () => pickPreset(source.id)
              : () => pickPreset(defaultPreset().id)
          }
          resetLabel={source.kind === 'preset' ? 'Reset preset' : 'Load Strang 2×3'}
        />
      </div>

      <div className="stat-row" aria-label="Matrix statistics">
        <div className="stat stat--teal">
          <span className="stat__k">Shape</span>
          <span className="stat__v">
            {fs.m}×{fs.n}
          </span>
        </div>
        <div className="stat stat--amber">
          <span className="stat__k">Rank</span>
          <span className="stat__v" data-rank={fs.rank}>
            {fs.rank}
          </span>
        </div>
        <div className="stat stat--rose">
          <span className="stat__k">Nullity</span>
          <span className="stat__v">{fs.nullspace.dimension}</span>
        </div>
        {d !== null ? (
          <div className="stat">
            <span className="stat__k">det</span>
            <span className="stat__v">{formatFrac(d)}</span>
          </div>
        ) : null}
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="tab-bar" role="tablist" aria-label="Matrix views">
            {(
              [
                ['A', 'A'],
                ['rref', 'RREF'],
                ['both', 'A + RREF'],
              ] as const
            ).map(([id, lab]) => (
              <button
                key={id}
                type="button"
                role="tab"
                className={`tab-btn${tab === id ? ' is-on' : ''}`}
                aria-selected={tab === id}
                onClick={() => setTab(id)}
              >
                {lab}
              </button>
            ))}
          </div>

          {tab === 'A' || tab === 'both' ? (
            <MatrixView
              A={A}
              pivotCols={fs.pivotCols}
              freeCols={fs.freeCols}
              caption={`A · ${label}`}
            />
          ) : null}
          {tab === 'both' ? <div style={{ height: '0.75rem' }} /> : null}
          {tab === 'rref' || tab === 'both' ? (
            <MatrixView
              A={fs.rref}
              pivotCols={fs.pivotCols}
              freeCols={fs.freeCols}
              caption="RREF(A)"
            />
          ) : null}

          <div className="verify-strip" aria-label="Implementation checks">
            <span
              className={`verify-badge${fs.checks.rankNullity ? ' is-pass' : ' is-fail'}`}
            >
              rank + nullity = n
            </span>
            {d !== null ? (
              <span
                className={`verify-badge${
                  (isZero(d) && fs.rank < fs.n) || (!isZero(d) && fs.rank === fs.n)
                    ? ' is-pass'
                    : ' is-fail'
                }`}
              >
                det ↔ full rank
              </span>
            ) : (
              <span className="verify-badge is-pass">non-square · no det</span>
            )}
          </div>
        </div>

        {colVecs.length > 0 ? (
          <div className="panel">
            <h2 className="panel__title">Columns as vectors</h2>
            <AmbientViz ambient={rows(A)} vectors={colVecs} A={A} />
          </div>
        ) : null}
      </div>

      <aside className="continue-card">
        <h2>Where next</h2>
        <ul>
          <li>
            {source.kind === 'preset' ? (
              <a
                href={withBase(
                  `/spaces?preset=${source.id}&note=${encodeURIComponent(
                    'Same matrix — four fundamental subspaces.',
                  )}`,
                )}
              >
                Four subspaces
              </a>
            ) : (
              <span>Four subspaces (open Spaces and re-apply custom A)</span>
            )}{' '}
            for C(A), N(A), C(Aᵀ), N(Aᵀ)
          </li>
          <li>
            {source.kind === 'preset' ? (
              <a href={withBase(`/solve?preset=${source.id}`)}>Solve A x = b</a>
            ) : (
              <a href={withBase('/solve')}>Solve desk</a>
            )}
          </li>
          <li>
            {source.kind === 'preset' ? (
              <a href={withBase(`/project?preset=${source.id}`)}>Project / least squares</a>
            ) : (
              <a href={withBase('/project')}>Project desk</a>
            )}
          </li>
        </ul>
      </aside>
    </div>
  );
}
