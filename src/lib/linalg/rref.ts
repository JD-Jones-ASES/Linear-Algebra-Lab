/**
 * Exact reduced row echelon form over ℚ, plus nullspace basis.
 */

import { type Frac, ZERO, ONE, add, sub, mul, div, neg, isZero } from './frac';
import {
  type Matrix,
  type Vector,
  cloneMatrix,
  rows,
  cols,
  zeros,
} from './matrix';

export interface RrefResult {
  /** Reduced row echelon form */
  rref: Matrix;
  /** Number of nonzero rows / pivot count */
  rank: number;
  /** Column indices of pivots (increasing) */
  pivotCols: number[];
  /** Free variable column indices */
  freeCols: number[];
  /**
   * Nullspace basis for A x = 0 (vectors in ℚⁿ).
   * One vector per free column; empty if full column rank.
   */
  nullspace: Vector[];
}

/**
 * Gaussian elimination to RREF.
 * Partial pivoting: first nonzero entry in column (exact field — any nonzero works).
 */
export function rref(A: Matrix): RrefResult {
  const m = rows(A);
  const n = cols(A);
  const M = cloneMatrix(A);
  const pivotCols: number[] = [];
  let row = 0;

  for (let col = 0; col < n && row < m; col++) {
    let piv = -1;
    for (let i = row; i < m; i++) {
      if (!isZero(M[i]![col]!)) {
        piv = i;
        break;
      }
    }
    if (piv < 0) continue;

    if (piv !== row) {
      [M[row], M[piv]] = [M[piv]!, M[row]!];
    }

    // Scale pivot row to 1
    const pivot = M[row]![col]!;
    for (let j = col; j < n; j++) {
      M[row]![j] = div(M[row]![j]!, pivot);
    }

    // Eliminate column in all other rows
    for (let i = 0; i < m; i++) {
      if (i === row || isZero(M[i]![col]!)) continue;
      const f = M[i]![col]!;
      for (let j = col; j < n; j++) {
        M[i]![j] = sub(M[i]![j]!, mul(f, M[row]![j]!));
      }
    }

    pivotCols.push(col);
    row++;
  }

  const rank = pivotCols.length;
  const freeCols: number[] = [];
  for (let j = 0; j < n; j++) {
    if (!pivotCols.includes(j)) freeCols.push(j);
  }

  const nullspace = buildNullspace(M, pivotCols, freeCols, n);
  return { rref: M, rank, pivotCols, freeCols, nullspace };
}

/**
 * From RREF: for each free variable x_f = 1 (others free 0), back-solve pivots.
 * RREF row for pivot p: x_p + Σ_f a_{row,f} x_f = 0  ⇒  x_p = −Σ a_{row,f} x_f
 */
function buildNullspace(
  R: Matrix,
  pivotCols: number[],
  freeCols: number[],
  n: number,
): Vector[] {
  const basis: Vector[] = [];
  for (const free of freeCols) {
    const x: Vector = Array.from({ length: n }, () => ZERO);
    x[free] = ONE;
    for (let r = 0; r < pivotCols.length; r++) {
      const pcol = pivotCols[r]!;
      // R[r][pcol] should be 1; free-column entry contributes
      const coeff = R[r]![free]!;
      x[pcol] = neg(coeff);
    }
    basis.push(x);
  }
  return basis;
}

/** Augment A|b and RREF for solving A x = b. */
export function rrefAugmented(A: Matrix, b: Vector): RrefResult & { consistent: boolean; particular: Vector | null } {
  const m = rows(A);
  const n = cols(A);
  if (b.length !== m) throw new Error('rrefAugmented: shape');
  const Aug = A.map((row, i) => [...row, b[i]!]);
  const res = rref(Aug);

  // Inconsistent if a row is [0 … 0 | c] with c ≠ 0
  let consistent = true;
  for (let i = 0; i < m; i++) {
    const row = res.rref[i]!;
    const allZeroLeft = row.slice(0, n).every(isZero);
    if (allZeroLeft && !isZero(row[n]!)) {
      consistent = false;
      break;
    }
  }

  if (!consistent) {
    return { ...res, consistent: false, particular: null };
  }

  // Pivot columns among the first n only
  const pivotCols = res.pivotCols.filter((c) => c < n);
  const freeCols: number[] = [];
  for (let j = 0; j < n; j++) {
    if (!pivotCols.includes(j)) freeCols.push(j);
  }

  // Particular solution: free vars = 0
  const particular: Vector = Array.from({ length: n }, () => ZERO);
  for (let r = 0; r < pivotCols.length; r++) {
    const pcol = pivotCols[r]!;
    particular[pcol] = res.rref[r]![n]!; // RHS after RREF
  }

  // Nullspace of A (not augmented): free vars on original A
  const nullspace = buildNullspace(
    res.rref.map((row) => row.slice(0, n)),
    pivotCols,
    freeCols,
    n,
  );

  return {
    rref: res.rref,
    rank: pivotCols.length,
    pivotCols,
    freeCols,
    nullspace,
    consistent: true,
    particular,
  };
}

/** Rank only. */
export function rank(A: Matrix): number {
  return rref(A).rank;
}
