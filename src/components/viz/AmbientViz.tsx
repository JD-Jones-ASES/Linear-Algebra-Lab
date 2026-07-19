import type { Vector } from '../../lib/linalg/matrix';
import { vecToNumbers } from '../../lib/linalg/view';
import { VectorPlane2D, type DrawnVec2 } from './VectorPlane2D';
import { VectorSpace3D, type DrawnVec3 } from './VectorSpace3D';
import { fourSubspaces } from '../../lib/linalg/subspaces';
import type { Matrix } from '../../lib/linalg/matrix';
import { rows } from '../../lib/linalg/matrix';

export interface NamedVec {
  id: string;
  v: Vector;
  color: string;
  label: string;
  dashed?: boolean;
}

interface Props {
  /** Codomain ambient dimension (length of vectors) */
  ambient: number;
  vectors: NamedVec[];
  /** Optional matrix whose C(A) is shaded when dim matches */
  A?: Matrix | null;
  title?: string;
}

export function AmbientViz({ ambient, vectors, A = null, title }: Props) {
  if (ambient !== 2 && ambient !== 3) {
    return (
      <p className="viz-fallback">
        Ambient dimension {ambient} — drawings only for ℚ² and ℚ³. Tables above still
        hold.
      </p>
    );
  }

  if (ambient === 2) {
    const drawn: DrawnVec2[] = vectors
      .filter((x) => x.v.length >= 2)
      .map((x) => {
        const n = vecToNumbers(x.v);
        return {
          id: x.id,
          v: [n[0]!, n[1]!],
          color: x.color,
          label: x.label,
          dashed: x.dashed,
        };
      });
    let lineSpan: [number, number] | null = null;
    let planeSpan: [[number, number], [number, number]] | null = null;
    if (A && rows(A) === 2) {
      const fs = fourSubspaces(A);
      if (fs.rank === 1 && fs.col.basis[0]) {
        const n = vecToNumbers(fs.col.basis[0]);
        lineSpan = [n[0]!, n[1]!];
      } else if (fs.rank >= 2 && fs.col.basis.length >= 2) {
        const a = vecToNumbers(fs.col.basis[0]!);
        const b = vecToNumbers(fs.col.basis[1]!);
        planeSpan = [
          [a[0]!, a[1]!],
          [b[0]!, b[1]!],
        ];
      }
    }
    return (
      <VectorPlane2D
        vectors={drawn}
        lineSpan={lineSpan}
        planeSpan={planeSpan}
        title={title ?? 'Codomain ℝ² (display)'}
      />
    );
  }

  // ambient === 3
  const drawn: DrawnVec3[] = vectors
    .filter((x) => x.v.length >= 3)
    .map((x) => {
      const n = vecToNumbers(x.v);
      return {
        id: x.id,
        v: [n[0]!, n[1]!, n[2]!],
        color: x.color,
        label: x.label,
        dashed: x.dashed,
      };
    });
  let planeSpan: [[number, number, number], [number, number, number]] | null =
    null;
  if (A && rows(A) === 3) {
    const fs = fourSubspaces(A);
    if (fs.rank >= 2 && fs.col.basis.length >= 2) {
      const a = vecToNumbers(fs.col.basis[0]!);
      const b = vecToNumbers(fs.col.basis[1]!);
      planeSpan = [
        [a[0]!, a[1]!, a[2]!],
        [b[0]!, b[1]!, b[2]!],
      ];
    } else if (fs.rank === 1 && fs.col.basis[0]) {
      // line only — still pass one vector as degenerate; 3D component draws vectors
      planeSpan = null;
    }
  }
  return (
    <VectorSpace3D
      vectors={drawn}
      planeSpan={planeSpan}
      title={title ?? 'Codomain ℝ³ (display) · drag to orbit'}
    />
  );
}
