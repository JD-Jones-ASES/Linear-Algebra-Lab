import { maxAbsEntries } from '../../lib/linalg/view';

export interface DrawnVec2 {
  id: string;
  /** length-2 components in display coords */
  v: [number, number];
  color: string;
  label: string;
  dashed?: boolean;
}

interface Props {
  vectors: DrawnVec2[];
  /** Optional span directions for a plane strip (two independent vectors) */
  planeSpan?: [[number, number], [number, number]] | null;
  /** Line span for 1D column space */
  lineSpan?: [number, number] | null;
  title?: string;
  ariaLabel?: string;
}

const W = 320;
const H = 320;
const PAD = 28;

export function VectorPlane2D({
  vectors,
  planeSpan = null,
  lineSpan = null,
  title,
  ariaLabel,
}: Props) {
  const all = [
    ...vectors.map((d) => d.v),
    ...(lineSpan ? [lineSpan] : []),
    ...(planeSpan ? planeSpan : []),
  ];
  const maxA = maxAbsEntries(...all) * 1.25;
  const scale = (Math.min(W, H) / 2 - PAD) / maxA;
  const cx = W / 2;
  const cy = H / 2;

  const toXY = (x: number, y: number): [number, number] => [
    cx + x * scale,
    cy - y * scale,
  ];

  const summary = vectors
    .map((d) => `${d.label}: (${d.v[0].toFixed(2)}, ${d.v[1].toFixed(2)})`)
    .join('; ');

  return (
    <div className="viz-panel">
      {title ? <p className="viz-panel__caption">{title}</p> : null}
      <div className="viz-svg-wrap" data-viz2d="true">
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={ariaLabel ?? `2D vector diagram. ${summary}`}
        >
          <rect width={W} height={H} fill="#0c1017" />
          {/* axes */}
          <line x1={PAD} y1={cy} x2={W - PAD} y2={cy} stroke="#2a3a50" strokeWidth={1} />
          <line x1={cx} y1={PAD} x2={cx} y2={H - PAD} stroke="#2a3a50" strokeWidth={1} />
          <text x={W - PAD - 4} y={cy - 6} fill="#6b7c90" fontSize={11}>
            x₁
          </text>
          <text x={cx + 6} y={PAD + 10} fill="#6b7c90" fontSize={11}>
            x₂
          </text>

          {planeSpan ? (
            <PlanePatch span={planeSpan} toXY={toXY} maxA={maxA} />
          ) : null}
          {lineSpan ? (
            <LineSpan dir={lineSpan} toXY={toXY} maxA={maxA} />
          ) : null}

          {vectors.map((d) => {
            const [x2, y2] = toXY(d.v[0], d.v[1]);
            const [x0, y0] = toXY(0, 0);
            return (
              <g key={d.id}>
                <line
                  x1={x0}
                  y1={y0}
                  x2={x2}
                  y2={y2}
                  stroke={d.color}
                  strokeWidth={2.2}
                  strokeDasharray={d.dashed ? '6 4' : undefined}
                  markerEnd={`url(#arrow-${d.id})`}
                />
                <defs>
                  <marker
                    id={`arrow-${d.id}`}
                    markerWidth="8"
                    markerHeight="8"
                    refX="6"
                    refY="3"
                    orient="auto"
                  >
                    <path d="M0,0 L6,3 L0,6 Z" fill={d.color} />
                  </marker>
                </defs>
                <text
                  x={x2 + 8}
                  y={y2 - 6}
                  fill={d.color}
                  fontSize={12}
                  fontFamily="ui-monospace, monospace"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <ul className="viz-legend">
        {vectors.map((d) => (
          <li key={d.id}>
            <i style={{ background: d.color }} aria-hidden="true" />
            {d.label}
          </li>
        ))}
      </ul>
      <p className="viz-panel__caption">Display scale uses float · math stays exact ℚ</p>
    </div>
  );
}

function LineSpan({
  dir,
  toXY,
  maxA,
}: {
  dir: [number, number];
  toXY: (x: number, y: number) => [number, number];
  maxA: number;
}) {
  const len = Math.hypot(dir[0], dir[1]) || 1;
  const ux = (dir[0] / len) * maxA;
  const uy = (dir[1] / len) * maxA;
  const [a, b] = toXY(-ux, -uy);
  const [c, d] = toXY(ux, uy);
  return (
    <line
      x1={a}
      y1={b}
      x2={c}
      y2={d}
      stroke="rgba(78, 205, 196, 0.35)"
      strokeWidth={10}
      strokeLinecap="round"
    />
  );
}

function PlanePatch({
  span,
  toXY,
  maxA,
}: {
  span: [[number, number], [number, number]];
  toXY: (x: number, y: number) => [number, number];
  maxA: number;
}) {
  // In 2D a "plane" span is the whole plane if independent — wash background lightly
  const det =
    span[0][0] * span[1][1] - span[0][1] * span[1][0];
  if (Math.abs(det) < 1e-9) {
    return <LineSpan dir={span[0]} toXY={toXY} maxA={maxA} />;
  }
  return (
    <rect
      x={PAD}
      y={PAD}
      width={W - 2 * PAD}
      height={H - 2 * PAD}
      fill="rgba(78, 205, 196, 0.06)"
    />
  );
}
