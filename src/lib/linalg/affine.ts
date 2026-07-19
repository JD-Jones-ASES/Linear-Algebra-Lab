/**
 * Affine solution set geometry: x = xₚ + N(A) when A x = b is consistent.
 */

import type { Matrix, Vector } from './matrix';
import { solve, type SolveResult } from './solve';
import { vecAdd, vecScale } from './matrix';
import type { Frac } from './frac';

export interface AffineSolution {
  consistent: boolean;
  particular: Vector | null;
  /** Directions spanning the solution affine space */
  directions: Vector[];
  /** dim of solution set (= nullity) when consistent */
  dimension: number;
  /** Sample points: xₚ + t d for small t on first direction */
  samples: Vector[];
  solve: SolveResult;
}

export function affineSolution(A: Matrix, b: Vector): AffineSolution {
  const s = solve(A, b);
  if (!s.consistent || !s.particular) {
    return {
      consistent: false,
      particular: null,
      directions: [],
      dimension: -1,
      samples: [],
      solve: s,
    };
  }
  const directions = s.nullspace;
  const samples: Vector[] = [s.particular.map((c) => ({ n: c.n, d: c.d }))];
  if (directions[0]) {
    const tvals: Frac[] = [
      { n: 1, d: 1 },
      { n: -1, d: 1 },
    ];
    for (const t of tvals) {
      samples.push(vecAdd(s.particular, vecScale(t, directions[0]!)));
    }
  }
  return {
    consistent: true,
    particular: s.particular,
    directions,
    dimension: directions.length,
    samples,
    solve: s,
  };
}
