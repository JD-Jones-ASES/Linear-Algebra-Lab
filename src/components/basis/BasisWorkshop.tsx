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
  presetById,
  type MatrixSource,
  sourceMatrix,
  sourceLabel,
  sourceBlurb,
  sourceFromParams,
} from '../../lib/linalg/matrixSource';
import { changeOfBasis } from '../../lib/linalg/changeOfBasis';
import { gramSchmidtColumns } from '../../lib/linalg/gramSchmidt';
import { encodeMatrix } from '../../lib/linalg/urlMatrix';
import { formatFrac } from '../../lib/linalg/frac';
import { cols, rows } from '../../lib/linalg/matrix';
import { withBase } from '../../lib/basePath';
import { AmbientViz } from '../viz/AmbientViz';
import { column } from '../../lib/linalg/matrix';

export default function BasisWorkshop() {
  const [source, setSource] = useState<MatrixSource>({
    kind: 'preset',
    id: 'basis-rot',
  });
  const [mapSource, setMapSource] = useState<MatrixSource>({
    kind: 'preset',
    id: 'eigen-sym',
  });
  const [banner, setBanner] = useState(EMPTY_BANNER);

  useEffect(() => {
    // Must not fall back to Strang (2×3) — change-of-basis needs square P
    setSource(
      sourceFromParams(clientParam('preset'), clientParam('A'), 'basis-rot'),
    );
    const tp = clientParam('T');
    if (tp && presetById(tp)) {
      setMapSource({ kind: 'preset', id: tp });
    } else {
      setMapSource(
        sourceFromParams(null, null, 'eigen-sym'),
      );
    }
    setBanner(clientBannerFromDeepLink());
  }, []);

  const P = useMemo(() => sourceMatrix(source), [source]);
  const T = useMemo(() => sourceMatrix(mapSource), [mapSource]);
  const cob = useMemo(() => changeOfBasis(P, T), [P, T]);
  const gs = useMemo(() => gramSchmidtColumns(P), [P]);
  const label = sourceLabel(source);

  const basisVecs =
    rows(P) === 2 || rows(P) === 3
      ? Array.from({ length: cols(P) }, (_, j) => ({
          id: `b${j}`,
          v: column(P, j),
          color: ['#4ecdc4', '#e8b84a', '#f07178'][j % 3]!,
          label: `b${j + 1}`,
        }))
      : [];

  const shareHref = withBase(`/basis?A=${encodeURIComponent(encodeMatrix(P))}`);

  return (
    <div className="workshop">
      <header className="workshop__head">
        <h1>Basis · coordinates</h1>
        <p className="workshop__lede">
          Columns of P are a basis B. When P is invertible, [v]_B = P⁻¹v and the
          matrix of a map T becomes [T]_B = P⁻¹ T P. Gram–Schmidt orthogonalizes
          the columns over ℚ.
        </p>
      </header>

      <TourBanner
        title={banner.title}
        expect={banner.expect}
        detail={banner.detail}
        thmId={banner.thmId}
      />
      <TheoremChipRow theorems={theoremsForRoom('basis')} />

      <div className="panel">
        <h2 className="panel__title">Basis matrix P · {label}</h2>
        <p className="panel__meta">{sourceBlurb(source)}</p>
        <div className="preset-bar" role="group" aria-label="Basis presets">
          {PRESETS.filter(
            (p) =>
              p.tags.includes('square') &&
              (p.id.startsWith('basis') ||
                p.id.startsWith('eigen') ||
                p.id.startsWith('id') ||
                p.id === 'full3'),
          ).map((p) => (
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
            matrix={P}
            onApply={(M) => setSource({ kind: 'custom', matrix: M })}
            onReset={() =>
              setSource({
                kind: 'preset',
                id: source.kind === 'preset' ? source.id : 'basis-rot',
              })
            }
          />
        </div>
        <p className="panel__meta" style={{ marginTop: '0.5rem' }}>
          Share:{' '}
          <a href={shareHref} className="mono">
            ?A={encodeMatrix(P)}
          </a>
        </p>
      </div>

      <div className="two-col">
        <div className="panel">
          <h2 className="panel__title">Change of basis</h2>
          <div className="stat-row">
            <div className={`stat ${cob.invertible ? 'stat--teal' : 'stat--rose'}`}>
              <span className="stat__k">P invertible?</span>
              <span className="stat__v">{cob.invertible ? 'yes' : 'no'}</span>
            </div>
            <div className="stat">
              <span className="stat__k">det P</span>
              <span className="stat__v">
                {cob.square ? formatFrac(cob.detP) : '—'}
              </span>
            </div>
          </div>
          {cob.message ? (
            <p className="panel__meta" role="status">
              {cob.message}
            </p>
          ) : null}
          <MatrixView A={P} caption="P (columns = basis)" />
          {cob.Pinv ? (
            <>
              <div style={{ height: '0.75rem' }} />
              <MatrixView A={cob.Pinv} caption="P⁻¹" />
            </>
          ) : cob.square ? (
            <p className="panel__meta">Singular P — not a basis of ℚⁿ.</p>
          ) : null}
          <div className="verify-strip">
            <Badge ok={cob.checks.PPinvIsI} label="P P⁻¹ = I" />
          </div>
          {cob.eCoords ? (
            <>
              <p className="panel__meta">Coordinates of eⱼ in basis B:</p>
              {cob.eCoords.map((v, j) => (
                <VectorView key={j} v={v} label={`[e${j + 1}]_B`} />
              ))}
            </>
          ) : null}
        </div>

        <div className="panel">
          <h2 className="panel__title">Map T in basis B</h2>
          <p className="panel__meta">Optional square map — [T]_B = P⁻¹ T P</p>
          <div className="preset-bar" role="group" aria-label="Map T presets">
            {PRESETS.filter((p) => p.tags.includes('square')).slice(0, 8).map((p) => (
              <button
                key={p.id}
                type="button"
                className={`preset-chip${mapSource.kind === 'preset' && mapSource.id === p.id ? ' is-on' : ''}`}
                onClick={() => setMapSource({ kind: 'preset', id: p.id })}
              >
                {p.label}
              </button>
            ))}
          </div>
          <MatrixView A={T} caption="T (standard basis)" />
          {cob.T_B ? (
            <>
              <div style={{ height: '0.5rem' }} />
              <MatrixView A={cob.T_B} caption="[T]_B = P⁻¹ T P" />
              <div className="verify-strip">
                <Badge ok={cob.checks.similarTrace} label="tr T = tr [T]_B" />
              </div>
            </>
          ) : (
            <p className="panel__meta">Need invertible P and matching size T.</p>
          )}
        </div>
      </div>

      <div className="two-col">
        <div className="panel">
          <h2 className="panel__title">Gram–Schmidt on columns of P</h2>
          <p className="panel__meta">
            Rank {gs.rank}
            {gs.orthogonalChecks ? ' · pairwise orthogonal ✓' : ' · check failed'}
          </p>
          {gs.basis.length === 0 ? (
            <p className="panel__meta">No nonzero orthogonal vectors.</p>
          ) : (
            gs.basis.map((v, i) => (
              <VectorView key={i} v={v} label={`u${i + 1}`} />
            ))
          )}
          <div className="verify-strip">
            <Badge ok={gs.orthogonalChecks} label="uᵢ · uⱼ = 0 (i≠j)" />
          </div>
        </div>
        {basisVecs.length > 0 ? (
          <div className="panel">
            <h2 className="panel__title">Basis vectors</h2>
            <AmbientViz ambient={rows(P)} vectors={basisVecs} A={P} />
          </div>
        ) : null}
      </div>

      <aside className="continue-card">
        <h2>Where next</h2>
        <ul>
          <li>
            <a href={withBase('/eigen?preset=eigen-sym')}>Eigen desk</a> — when B is
            eigenbasis, [T]_B is diagonal
          </li>
          <li>
            <a href={withBase('/spaces')}>Four subspaces</a>
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
