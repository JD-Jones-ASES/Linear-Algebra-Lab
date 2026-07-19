import { useEffect, useMemo, useState } from 'react';
import '../shared/workshop.css';
import { TourBanner } from '../shared/TourBanner';
import { TheoremChipRow } from '../shared/TheoremChip';
import { MatrixView, VectorView } from '../shared/MatrixView';
import { clientBannerFromDeepLink, clientParam } from '../../lib/connect/deepLink';
import { theoremsForRoom } from '../../lib/connect/theorems';
import { PRESETS, presetById, defaultPreset } from '../../lib/linalg/catalog';
import {
  fourSubspaces,
  rankNullityLine,
  type SubspaceId,
  subspaceById,
} from '../../lib/linalg/subspaces';
import { formatFrac } from '../../lib/linalg/frac';
import { withBase } from '../../lib/basePath';

const FOCUS_IDS: SubspaceId[] = ['col', 'null', 'row', 'leftNull'];

function parseFocus(raw: string | null): SubspaceId | null {
  if (raw && (FOCUS_IDS as string[]).includes(raw)) return raw as SubspaceId;
  return null;
}

export default function SpacesWorkshop() {
  const [presetId, setPresetId] = useState(defaultPreset().id);
  const [focus, setFocus] = useState<SubspaceId | null>(null);
  const [banner, setBanner] = useState(clientBannerFromDeepLink());

  useEffect(() => {
    const p = clientParam('preset');
    if (p && presetById(p)) setPresetId(p);
    setFocus(parseFocus(clientParam('focus')));
    setBanner(clientBannerFromDeepLink());
  }, []);

  const preset = presetById(presetId) ?? defaultPreset();
  const fs = useMemo(() => fourSubspaces(preset.matrix), [preset]);
  const focused = focus ? subspaceById(fs, focus) : null;

  const cards: { id: SubspaceId; space: typeof fs.col }[] = [
    { id: 'col', space: fs.col },
    { id: 'null', space: fs.nullspace },
    { id: 'row', space: fs.row },
    { id: 'leftNull', space: fs.leftNull },
  ];

  return (
    <div className="workshop">
      <header className="workshop__head">
        <h1>Four fundamental subspaces</h1>
        <p className="workshop__lede">
          The spine of this lab. One m×n matrix carves four subspaces — dimensions{' '}
          r, n−r, r, m−r — with orthogonal pairs C(A)⊥N(Aᵀ) and C(Aᵀ)⊥N(A).
        </p>
      </header>

      <TourBanner
        title={banner.title}
        expect={banner.expect}
        detail={banner.detail}
        thmId={banner.thmId}
      />

      <TheoremChipRow theorems={theoremsForRoom('spaces')} />

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

      <div className="two-col">
        <div className="panel">
          <h2 className="panel__title">Matrix A</h2>
          <MatrixView
            A={preset.matrix}
            pivotCols={fs.pivotCols}
            freeCols={fs.freeCols}
            caption={`${preset.label} · ${fs.m}×${fs.n}`}
          />
          <p className="panel__meta" style={{ marginTop: '0.75rem' }}>
            {rankNullityLine(fs)}
          </p>
        </div>
        <div className="panel">
          <h2 className="panel__title">Dimensions at a glance</h2>
          <div className="stat-row">
            <div className="stat stat--teal">
              <span className="stat__k">dim C(A)</span>
              <span className="stat__v">{fs.col.dimension}</span>
            </div>
            <div className="stat stat--rose">
              <span className="stat__k">dim N(A)</span>
              <span className="stat__v">{fs.nullspace.dimension}</span>
            </div>
            <div className="stat stat--amber">
              <span className="stat__k">dim C(Aᵀ)</span>
              <span className="stat__v">{fs.row.dimension}</span>
            </div>
            <div className="stat stat--violet">
              <span className="stat__k">dim N(Aᵀ)</span>
              <span className="stat__v">{fs.leftNull.dimension}</span>
            </div>
          </div>
          <p className="panel__meta">
            Expected pattern: r = {fs.rank}, n−r = {fs.n - fs.rank}, r = {fs.rank}, m−r ={' '}
            {fs.m - fs.rank}
          </p>
          <div className="verify-strip" aria-label="Subspace identity checks">
            <Badge ok={fs.checks.rankNullity} label="rank–nullity" />
            <Badge ok={fs.checks.rankEqualsRowRank} label="row rank = col rank" />
            <Badge ok={fs.checks.colPerpLeftNull} label="C(A) ⊥ N(Aᵀ)" />
            <Badge ok={fs.checks.rowPerpNull} label="C(Aᵀ) ⊥ N(A)" />
            <Badge ok={fs.checks.nullInKernel} label="N(A) ⊂ ker" />
            <Badge ok={fs.checks.leftNullInCokernel} label="N(Aᵀ) ⊂ ker Aᵀ" />
          </div>
        </div>
      </div>

      <div className="space-grid" role="list" aria-label="Four fundamental subspaces">
        {cards.map(({ id, space }) => (
          <button
            key={id}
            type="button"
            role="listitem"
            className={`space-card space-card--${id}${focus === id ? ' is-focus' : ''}`}
            aria-pressed={focus === id}
            onClick={() => setFocus(focus === id ? null : id)}
          >
            <span className="space-card__sym">{space.symbol}</span>
            <span className="space-card__name">{space.name}</span>
            <span className="space-card__dim">
              dim = {space.dimension}
              <span style={{ color: 'var(--chalk-mute)' }}>
                {' '}
                ⊆ ℚ{sup(space.ambient)}
              </span>
            </span>
            {space.basis.length === 0 ? (
              <p className="space-card__basis">trivial — {'{0}'} only</p>
            ) : (
              <ul className="space-card__basis">
                {space.basis.map((v, i) => (
                  <li key={i}>
                    v{i + 1} = ({v.map(formatFrac).join(', ')})
                  </li>
                ))}
              </ul>
            )}
          </button>
        ))}
      </div>

      {focused ? (
        <div className="panel" aria-live="polite">
          <h2 className="panel__title">
            Focus · {focused.symbol} — {focused.name}
          </h2>
          <p className="panel__meta">
            Ambient ℚ{sup(focused.ambient)} · dimension {focused.dimension} · basis size{' '}
            {focused.basis.length}
          </p>
          {focused.basis.length === 0 ? (
            <p className="panel__meta">Only the zero vector.</p>
          ) : (
            focused.basis.map((v, i) => (
              <VectorView key={i} v={v} label={`basis ${i + 1}`} />
            ))
          )}
        </div>
      ) : null}

      <aside className="continue-card">
        <h2>Where next</h2>
        <ul>
          <li>
            <a href={withBase(`/matrix?preset=${presetId}&tab=rref`)}>
              Matrix RREF
            </a>{' '}
            — pivots that built these bases
          </li>
          <li>
            <a href={withBase(`/solve?preset=${presetId}`)}>Solve A x = b</a> — b ∈ C(A)?
          </li>
          <li>
            <a href={withBase('/theorems#four-subspaces')}>Theorem shelf</a> — name the
            picture
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

function sup(n: number): string {
  const map: Record<string, string> = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
  };
  return String(n)
    .split('')
    .map((c) => map[c] ?? c)
    .join('');
}
