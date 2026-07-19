import { formatFrac, type Frac, isZero } from '../../lib/linalg/frac';
import type { Matrix } from '../../lib/linalg/matrix';
import { column, rows, cols } from '../../lib/linalg/matrix';
import { vecToNumbers, maxAbsEntries } from '../../lib/linalg/view';

interface Props {
  A: Matrix;
  det: Frac;
}

const W = 320;
const H = 320;
const PAD = 28;

/**
 * 2×2 determinant as signed parallelogram area spanned by the columns.
 */
export function DetArea2D({ A, det: d }: Props) {
  if (rows(A) !== 2 || cols(A) !== 2) return null;

  const c0 = vecToNumbers(column(A, 0)) as [number, number];
  const c1 = vecToNumbers(column(A, 1)) as [number, number];
  const maxA = maxAbsEntries(c0, c1, [0, 0]) * 1.35;
  const scale = (Math.min(W, H) / 2 - PAD) / (maxA || 1);
  const cx = W / 2;
  const cy = H / 2;
  const to = (x: number, y: number): [number, number] => [
    cx + x * scale,
    cy - y * scale,
  ];

  const o = to(0, 0);
  const a = to(c0[0], c0[1]);
  const b = to(c1[0], c1[1]);
  const s = to(c0[0] + c1[0], c0[1] + c1[1]);
  const poly = `${o[0]},${o[1]} ${a[0]},${a[1]} ${s[0]},${s[1]} ${b[0]},${b[1]}`;

  const signed = formatFrac(d);
  const zero = isZero(d);

  return (
    <div className="viz-panel" data-det-area="true">
      <p className="viz-panel__caption">
        det A = {signed}
        {zero ? ' · area 0 (columns parallel)' : ' · signed parallelogram area'}
      </p>
      <div className="viz-svg-wrap">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Determinant area ${signed}`}>
          <rect width={W} height={H} fill="#0c1017" />
          <line x1={PAD} y1={cy} x2={W - PAD} y2={cy} stroke="#2a3a50" strokeWidth={1} />
          <line x1={cx} y1={PAD} x2={cx} y2={H - PAD} stroke="#2a3a50" strokeWidth={1} />
          <polygon
            points={poly}
            fill={zero ? 'rgba(240,113,120,0.12)' : 'rgba(78,205,196,0.2)'}
            stroke={zero ? '#f07178' : '#4ecdc4'}
            strokeWidth={1.5}
          />
          <line x1={o[0]} y1={o[1]} x2={a[0]} y2={a[1]} stroke="#4ecdc4" strokeWidth={2.2} />
          <line x1={o[0]} y1={o[1]} x2={b[0]} y2={b[1]} stroke="#e8b84a" strokeWidth={2.2} />
          <text x={a[0] + 6} y={a[1] - 6} fill="#4ecdc4" fontSize={12} fontFamily="ui-monospace, monospace">
            a₁
          </text>
          <text x={b[0] + 6} y={b[1] - 6} fill="#e8b84a" fontSize={12} fontFamily="ui-monospace, monospace">
            a₂
          </text>
          <text x={W / 2} y={H - 12} fill="#9aabbf" fontSize={11} textAnchor="middle" fontFamily="ui-monospace, monospace">
            area = |det A| · sign({signed})
          </text>
        </svg>
      </div>
      <ul className="viz-legend">
        <li>
          <i style={{ background: '#4ecdc4' }} /> a₁ (col 1)
        </li>
        <li>
          <i style={{ background: '#e8b84a' }} /> a₂ (col 2)
        </li>
        <li>
          <i style={{ background: zero ? '#f07178' : '#4ecdc4' }} /> parallelogram
        </li>
      </ul>
    </div>
  );
}

interface VolProps {
  det: Frac;
  n: number;
}

/** 3×3: det as signed volume note (no full 3D solid). */
export function DetVolumeNote({ det: d, n }: VolProps) {
  if (n !== 3) return null;
  return (
    <p className="panel__meta" data-det-volume="true">
      det A = {formatFrac(d)} — signed volume of the parallelepiped spanned by the three
      columns (display geometry lives in the column picture when n = 3).
    </p>
  );
}
