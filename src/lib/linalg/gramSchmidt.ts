/**
 * Classical Gram–Schmidt over ℚ (exact).
 * Produces orthogonal (not necessarily orthonormal) vectors when possible over ℚ;
 * also attempts unit scaling when ‖v‖² is a perfect square in ℚ.
 */

import { type Frac, div, isZero, neg } from './frac';
import {
  type Vector,
  type Matrix,
  column,
  cols,
  vecAdd,
  vecDot,
  vecScale,
  isZeroVec,
  zeros,
} from './matrix';

export interface GramSchmidtResult {
  /** Input columns (copies) */
  input: Vector[];
  /** Orthogonal vectors (zero slots for dependent inputs) */
  orthogonal: Vector[];
  /** Nonzero orthogonal basis (linearly independent subset) */
  basis: Vector[];
  /** Pairwise dots u_i·u_j for i<j among basis — should be 0 */
  orthogonalChecks: boolean;
  rank: number;
  fullRank: boolean;
}

export function gramSchmidtColumns(A: Matrix): GramSchmidtResult {
  const n = cols(A);
  const input = Array.from({ length: n }, (_, j) => column(A, j));
  return gramSchmidt(input);
}

export function gramSchmidt(vectors: Vector[]): GramSchmidtResult {
  const orthogonal: Vector[] = [];
  const basis: Vector[] = [];

  for (const v of vectors) {
    let u = v.map((c) => ({ n: c.n, d: c.d }));
    for (const b of basis) {
      const bb = vecDot(b, b);
      if (isZero(bb)) continue;
      const projCoeff = div(vecDot(u, b), bb);
      u = vecAdd(u, vecScale(neg(projCoeff), b));
    }
    orthogonal.push(u);
    if (!isZeroVec(u)) basis.push(u);
  }

  let orthogonalChecks = true;
  for (let i = 0; i < basis.length; i++) {
    for (let j = i + 1; j < basis.length; j++) {
      if (!isZero(vecDot(basis[i]!, basis[j]!))) orthogonalChecks = false;
    }
  }

  const ambient = vectors[0]?.length ?? 0;
  return {
    input: vectors.map((v) => v.map((c) => ({ n: c.n, d: c.d }))),
    orthogonal,
    basis,
    orthogonalChecks,
    rank: basis.length,
    fullRank: basis.length === ambient && basis.length === vectors.length,
  };
}

/** Matrix whose columns are the orthogonal basis vectors (padded if needed). */
export function orthogonalBasisMatrix(gs: GramSchmidtResult): Matrix {
  if (gs.basis.length === 0) return [];
  const m = gs.basis[0]!.length;
  const n = gs.basis.length;
  const M = zeros(m, n);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < m; i++) {
      M[i]![j] = gs.basis[j]![i]!;
    }
  }
  return M;
}

/** ‖v‖² = v·v */
export function normSq(v: Vector): Frac {
  return vecDot(v, v);
}
