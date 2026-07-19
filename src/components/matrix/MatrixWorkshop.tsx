import { useEffect, useMemo, useState } from 'react';
import '../shared/workshop.css';
import { TourBanner } from '../shared/TourBanner';
import { TheoremChipRow } from '../shared/TheoremChip';
import { MatrixView } from '../shared/MatrixView';
import { clientBannerFromDeepLink, clientParam } from '../../lib/connect/deepLink';
import { theoremsForRoom } from '../../lib/connect/theorems';
import { PRESETS, presetById, defaultPreset } from '../../lib/linalg/catalog';
import { fourSubspaces } from '../../lib/linalg/subspaces';
import { det, cols, rows } from '../../lib/linalg/matrix';
import { formatFrac, isZero } from '../../lib/linalg/frac';
import { withBase } from '../../lib/basePath';

type Tab = 'A' | 'rref' | 'both';

export default function MatrixWorkshop() {
  const [presetId, setPresetId] = useState(defaultPreset().id);
  const [tab, setTab] = useState<Tab>('both');
  const [banner, setBanner] = useState(clientBannerFromDeepLink());

  useEffect(() => {
    const p = clientParam('preset');
    if (p && presetById(p)) setPresetId(p);
    const t = clientParam('tab');
    if (t === 'A' || t === 'rref' || t === 'both') setTab(t);
    setBanner(clientBannerFromDeepLink());
  }, []);

  const preset = presetById(presetId) ?? defaultPreset();
  const fs = useMemo(() => fourSubspaces(preset.matrix), [preset]);
  const square = rows(preset.matrix) === cols(preset.matrix);
  const d = square ? det(preset.matrix) : null;

  return (
    <div className="workshop">
      <header className="workshop__head">
        <h1>Matrix desk</h1>
        <p className="workshop__lede">
          Exact rationals ℚ. Pick a matrix, read rank and RREF, mark pivots vs free
          columns — the same bookkeeping that feeds the four subspaces.
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
          <span className="stat__v">{fs.rank}</span>
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

      <div className="panel">
        <div className="tab-bar" role="tablist" aria-label="Matrix views">
          {(
            [
              ['A', 'A'],
              ['rref', 'RREF'],
              ['both', 'A + RREF'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              className={`tab-btn${tab === id ? ' is-on' : ''}`}
              aria-selected={tab === id}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'A' || tab === 'both' ? (
          <MatrixView
            A={preset.matrix}
            pivotCols={fs.pivotCols}
            freeCols={fs.freeCols}
            caption={`A · ${preset.label}`}
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

      <aside className="continue-card">
        <h2>Where next</h2>
        <ul>
          <li>
            <a
              href={withBase(
                `/spaces?preset=${presetId}&note=${encodeURIComponent(
                  'Same matrix — four fundamental subspaces.',
                )}`,
              )}
            >
              Four subspaces
            </a>{' '}
            for C(A), N(A), C(Aᵀ), N(Aᵀ)
          </li>
          <li>
            <a href={withBase(`/solve?preset=${presetId}`)}>Solve A x = b</a> with
            this A
          </li>
        </ul>
      </aside>
    </div>
  );
}
