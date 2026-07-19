/**
 * Orthogonal projection onto C(A) and least-squares solutions over ℚ.
 *
 * Normal equations: Aᵀ A x̂ = Aᵀ b  (always consistent).
 * p = A x̂ ∈ C(A),  r = b − p ∈ N(Aᵀ).
 */

import { isZero, neg, ZERO } from './frac';
import {
  type Matrix,
  type Vector,
  column,
  cols,
  matMul,
  matVec,
  rows,
  transpose,
  vecAdd,
  vecDot,
  isZeroVec,
} from './matrix';
import { rrefAugmented } from './rref';
import { fourSubspaces } from './subspaces';
import { solve } from './solve';

export interface ProjectResult {
  m: number;
  n: number;
  rank: number;
  fullColumnRank: boolean;
  bInColumnSpace: boolean;
  hatX: Vector;
  projection: Vector;
  residual: Vector;
  normalMatrix: Matrix;
  normalRhs: Vector;
  checks: ProjectChecks;
}

export interface ProjectChecks {
  residualLeftNull: boolean;
  projectionInCol: boolean;
  residualOrthoProjection: boolean;
  normalSatisfied: boolean;
  allPass: boolean;
}

export function project(A: Matrix, b: Vector): ProjectResult {
  const m = rows(A);
  const n = cols(A);
  if (b.length !== m) throw new Error('project: shape');

  const At = transpose(A);
  const normalMatrix = matMul(At, A);
  const normalRhs = matVec(At, b);
  const normalSolve = rrefAugmented(normalMatrix, normalRhs);

  const hatX =
    normalSolve.particular ??
    (Array.from({ length: n }, () => ZERO) as Vector);

  const projection = matVec(A, hatX);
  const residual = vecAdd(b, projection.map(neg));

  const fs = fourSubspaces(A);
  const membership = solve(A, b);

  const AtR = matVec(At, residual);
  const residualLeftNull = isZeroVec(AtR);
  const projectionInCol = solve(A, projection).consistent;
  const residualOrthoProjection = isZero(vecDot(residual, projection));
  const normalSatisfied = isZeroVec(
    vecAdd(matVec(normalMatrix, hatX), normalRhs.map(neg)),
  );

  const allPass =
    residualLeftNull &&
    projectionInCol &&
    residualOrthoProjection &&
    normalSatisfied;

  return {
    m,
    n,
    rank: fs.rank,
    fullColumnRank: fs.rank === n,
    bInColumnSpace: membership.consistent,
    hatX,
    projection,
    residual,
    normalMatrix,
    normalRhs,
    checks: {
      residualLeftNull,
      projectionInCol,
      residualOrthoProjection,
      normalSatisfied,
      allPass,
    },
  };
}

export function columnVectors(A: Matrix): Vector[] {
  const n = cols(A);
  return Array.from({ length: n }, (_, j) => column(A, j));
}
