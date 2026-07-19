import { useMemo } from 'react';
import type { Vector, Matrix } from '../../lib/linalg/matrix';
import { rows } from '../../lib/linalg/matrix';
import { formatFrac } from '../../lib/linalg/frac';
import { vecToNumbers } from '../../lib/linalg/view';
import { fourSubspaces } from '../../lib/linalg/subspaces';
import { VectorPlane2D, type DrawnVec2 } from './VectorPlane2D';
import { VectorSpace3D, type DrawnVec3 } from './VectorSpace3D';

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

function matrixKey(A: Matrix | null | undefined): string {
  if (!A) return '';
  return A.map((row) => row.map((c) => `${c.n}/${c.d}`).join(',')).join(';');
}

function vectorsKey(vectors: NamedVec[]): string {
  return vectors
    .map(
      (x) =>
        `${x.id}:${x.v.map(formatFrac).join(',')}:${x.color}:${x.label}:${x.dashed ? 1 : 0}`,
    )
    .join('|');
}

export function AmbientViz({ ambient, vectors, A = null, title }: Props) {
  const vKey = vectorsKey(vectors);
  const aKey = matrixKey(A);

  const prepared = useMemo(() => {
    if (ambient === 2) {
      const drawn: DrawnVec2[] = vectors
        .filter((x) => x.v.length >= 2)
        .map((x) => {
          const n = vecToNumbers(x.v);
          return {
            id: x.id,
            v: [n[0]!, n[1]!] as [number, number],
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
      return { kind: '2d' as const, drawn, lineSpan, planeSpan };
    }

    if (ambient === 3) {
      const drawn: DrawnVec3[] = vectors
        .filter((x) => x.v.length >= 3)
        .map((x) => {
          const n = vecToNumbers(x.v);
          return {
            id: x.id,
            v: [n[0]!, n[1]!, n[2]!] as [number, number, number],
            color: x.color,
            label: x.label,
            dashed: x.dashed,
          };
        });
      let planeSpan:
        | [[number, number, number], [number, number, number]]
        | null = null;
      if (A && rows(A) === 3) {
        const fs = fourSubspaces(A);
        if (fs.rank >= 2 && fs.col.basis.length >= 2) {
          const a = vecToNumbers(fs.col.basis[0]!);
          const b = vecToNumbers(fs.col.basis[1]!);
          planeSpan = [
            [a[0]!, a[1]!, a[2]!],
            [b[0]!, b[1]!, b[2]!],
          ];
        }
      }
      return { kind: '3d' as const, drawn, planeSpan };
    }

    return { kind: 'none' as const };
    // vKey / aKey encode content so new array identities do not rebuild drawn props
    // eslint-disable-next-line react-hooks/exhaustive-deps -- vectors/A read from render when keys change
  }, [ambient, vKey, aKey]);

  if (prepared.kind === 'none') {
    return (
      <p className="viz-fallback">
        Ambient dimension {ambient} — drawings only for ℚ² and ℚ³. Tables above still
        hold.
      </p>
    );
  }

  if (prepared.kind === '2d') {
    return (
      <VectorPlane2D
        vectors={prepared.drawn}
        lineSpan={prepared.lineSpan}
        planeSpan={prepared.planeSpan}
        title={title ?? 'Codomain ℝ² (display)'}
      />
    );
  }

  return (
    <VectorSpace3D
      vectors={prepared.drawn}
      planeSpan={prepared.planeSpan}
      title={title ?? 'Codomain ℝ³ (display) · drag to orbit'}
    />
  );
}
