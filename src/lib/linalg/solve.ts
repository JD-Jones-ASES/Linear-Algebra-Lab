/**
 * Solve A x = b over ℚ using RREF of the augmented matrix.
 */

import { type Frac, isZero, neg } from './frac';
import {
  type Matrix,
  type Vector,
  matVec,
  vecAdd,
  vecEq,
  vecScale,
  isZeroVec,
  cols,
  rows,
} from './matrix';
import { rrefAugmented } from './rref';

export interface SolveResult {
  consistent: boolean;
  /** Rank of A (not augmented) */
  rank: number;
  /** Rank of [A|b] — exceeds rank(A) iff inconsistent */
  rankAug: number;
  particular: Vector | null;
  /** Homogeneous nullspace basis */
  nullspace: Vector[];
  freeCols: number[];
  pivotCols: number[];
  /** A x − b for particular (should be 0 when consistent) */
  residualZero: boolean;
}

export function solve(A: Matrix, b: Vector): SolveResult {
  if (b.length !== rows(A)) throw new Error('solve: shape');
  const aug = rrefAugmented(A, b);
  const residualZero =
    aug.particular !== null &&
    isZeroVec(vecAdd(matVec(A, aug.particular), b.map(neg)));

  // rank of augmented: count nonzero rows in full RREF
  let rankAug = 0;
  for (const row of aug.rref) {
    if (!row.every(isZero)) rankAug++;
  }

  return {
    consistent: aug.consistent,
    rank: aug.rank,
    rankAug,
    particular: aug.particular,
    nullspace: aug.nullspace,
    freeCols: aug.freeCols,
    pivotCols: aug.pivotCols,
    residualZero: aug.consistent ? residualZero : false,
  };
}

/** b is in C(A) iff the system is consistent. */
export function inColumnSpace(A: Matrix, b: Vector): boolean {
  return solve(A, b).consistent;
}

/** General solution samples: particular + linear combo of nullspace (coeffs free). */
export function generalSolution(
  particular: Vector,
  nullspace: Vector[],
  coeffs: Frac[],
): Vector {
  if (coeffs.length !== nullspace.length) throw new Error('generalSolution: coeffs');
  let x = particular.map((c) => ({ n: c.n, d: c.d }));
  for (let i = 0; i < nullspace.length; i++) {
    x = vecAdd(x, vecScale(coeffs[i]!, nullspace[i]!));
  }
  return x;
}

export function verifySolution(A: Matrix, x: Vector, b: Vector): boolean {
  return vecEq(matVec(A, x), b);
}

export function ambientN(A: Matrix): number {
  return cols(A);
}
