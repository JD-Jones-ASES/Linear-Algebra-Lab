/**
 * Four fundamental subspaces of an m×n matrix A over ℚ.
 *
 *   C(A)   column space  ⊆ ℚᵐ   dim = r
 *   N(A)   nullspace     ⊆ ℚⁿ   dim = n − r
 *   C(Aᵀ)  row space     ⊆ ℚⁿ   dim = r
 *   N(Aᵀ)  left nullspace ⊆ ℚᵐ  dim = m − r
 *
 * Identities verified: rank–nullity, dim C(A)=dim C(Aᵀ), orthogonality C(A) ⊥ N(Aᵀ), C(Aᵀ) ⊥ N(A).
 */

import { isZero } from './frac';
import {
  type Matrix,
  type Vector,
  column,
  cols,
  matVec,
  rows,
  transpose,
  vecDot,
  isZeroVec,
} from './matrix';
import { rref } from './rref';

export type SubspaceId = 'col' | 'null' | 'row' | 'leftNull';

export interface Subspace {
  id: SubspaceId;
  /** Display name */
  name: string;
  /** Short formal label */
  symbol: string;
  /** Ambient dimension */
  ambient: number;
  dimension: number;
  /** Basis vectors (as column vectors in ambient space) */
  basis: Vector[];
}

export interface FourSubspaces {
  m: number;
  n: number;
  rank: number;
  /** Pivot columns of A (0-based) */
  pivotCols: number[];
  freeCols: number[];
  rref: Matrix;
  col: Subspace;
  nullspace: Subspace;
  row: Subspace;
  leftNull: Subspace;
  /** Implementation checks that should all pass for correct RREF */
  checks: SubspaceChecks;
}

export interface SubspaceChecks {
  rankNullity: boolean;
  rankEqualsRowRank: boolean;
  colPerpLeftNull: boolean;
  rowPerpNull: boolean;
  nullInKernel: boolean;
  leftNullInCokernel: boolean;
  allPass: boolean;
}

export function fourSubspaces(A: Matrix): FourSubspaces {
  const m = rows(A);
  const n = cols(A);
  const red = rref(A);
  const r = red.rank;

  // Column space: original pivot columns
  const colBasis = red.pivotCols.map((j) => column(A, j));

  // Nullspace from RREF
  const nullBasis = red.nullspace;

  // Row space: nonzero rows of RREF (same span as original rows)
  const rowBasis: Vector[] = [];
  for (let i = 0; i < r; i++) {
    rowBasis.push(red.rref[i]!.map((x) => ({ n: x.n, d: x.d })));
  }

  // Left nullspace: nullspace of Aᵀ
  const At = transpose(A);
  const leftRed = rref(At);
  const leftBasis = leftRed.nullspace;

  const col: Subspace = {
    id: 'col',
    name: 'Column space',
    symbol: 'C(A)',
    ambient: m,
    dimension: r,
    basis: colBasis,
  };
  const nullspace: Subspace = {
    id: 'null',
    name: 'Nullspace',
    symbol: 'N(A)',
    ambient: n,
    dimension: n - r,
    basis: nullBasis,
  };
  const row: Subspace = {
    id: 'row',
    name: 'Row space',
    symbol: 'C(Aᵀ)',
    ambient: n,
    dimension: r,
    basis: rowBasis,
  };
  const leftNull: Subspace = {
    id: 'leftNull',
    name: 'Left nullspace',
    symbol: 'N(Aᵀ)',
    ambient: m,
    dimension: m - r,
    basis: leftBasis,
  };

  const checks = runChecks(A, col, nullspace, row, leftNull, r, m, n);

  return {
    m,
    n,
    rank: r,
    pivotCols: red.pivotCols,
    freeCols: red.freeCols,
    rref: red.rref,
    col,
    nullspace,
    row,
    leftNull,
    checks,
  };
}

function runChecks(
  A: Matrix,
  col: Subspace,
  nullspace: Subspace,
  row: Subspace,
  leftNull: Subspace,
  r: number,
  m: number,
  n: number,
): SubspaceChecks {
  const rankNullity = nullspace.dimension === n - r && col.dimension === r;
  const rankEqualsRowRank = row.dimension === r && leftNull.dimension === m - r;

  // C(A) ⊥ N(Aᵀ): every col basis · every left-null basis = 0
  let colPerpLeftNull = true;
  for (const c of col.basis) {
    for (const y of leftNull.basis) {
      if (!isZero(vecDot(c, y))) colPerpLeftNull = false;
    }
  }

  // C(Aᵀ) ⊥ N(A)
  let rowPerpNull = true;
  for (const rw of row.basis) {
    for (const x of nullspace.basis) {
      if (!isZero(vecDot(rw, x))) rowPerpNull = false;
    }
  }

  let nullInKernel = true;
  for (const x of nullspace.basis) {
    if (!isZeroVec(matVec(A, x))) nullInKernel = false;
  }

  const At = transpose(A);
  let leftNullInCokernel = true;
  for (const y of leftNull.basis) {
    if (!isZeroVec(matVec(At, y))) leftNullInCokernel = false;
  }

  const allPass =
    rankNullity &&
    rankEqualsRowRank &&
    colPerpLeftNull &&
    rowPerpNull &&
    nullInKernel &&
    leftNullInCokernel;

  return {
    rankNullity,
    rankEqualsRowRank,
    colPerpLeftNull,
    rowPerpNull,
    nullInKernel,
    leftNullInCokernel,
    allPass,
  };
}

/** Rank–nullity statement for display. */
export function rankNullityLine(fs: FourSubspaces): string {
  const { n, rank: r, nullspace } = fs;
  return `rank + nullity = ${r} + ${nullspace.dimension} = ${n} = n`;
}

export function emptyBasisNote(dim: number): string {
  return dim === 0 ? '{0} only — trivial subspace' : '';
}

/** Helper for UI: which subspace ids exist with positive dimension. */
export function activeSubspaces(fs: FourSubspaces): SubspaceId[] {
  const out: SubspaceId[] = [];
  if (fs.col.dimension > 0) out.push('col');
  if (fs.nullspace.dimension > 0) out.push('null');
  if (fs.row.dimension > 0) out.push('row');
  if (fs.leftNull.dimension > 0) out.push('leftNull');
  // Always list all four in UI even if dim 0 — caller decides
  return out;
}

export function subspaceById(fs: FourSubspaces, id: SubspaceId): Subspace {
  switch (id) {
    case 'col':
      return fs.col;
    case 'null':
      return fs.nullspace;
    case 'row':
      return fs.row;
    case 'leftNull':
      return fs.leftNull;
  }
}
