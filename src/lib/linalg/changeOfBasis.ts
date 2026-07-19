/**
 * Change of basis over ℚ.
 * Columns of P = basis B.  [v]_B = P^{-1} v,  [T]_B = P^{-1} T P.
 */

import { add, eq } from './frac';
import {
  type Matrix,
  type Vector,
  matMul,
  matVec,
  cols,
  rows,
  cloneMatrix,
  identity,
  det,
  matEq,
} from './matrix';
import { matInverse } from './inverse';

export interface ChangeOfBasisResult {
  n: number;
  P: Matrix;
  Pinv: Matrix | null;
  invertible: boolean;
  detP: ReturnType<typeof det>;
  /** [T]_B if T provided and P invertible */
  T_B: Matrix | null;
  /** Coordinates of standard basis vectors e_j in B */
  eCoords: Vector[] | null;
  checks: {
    PPinvIsI: boolean;
    similarTrace: boolean;
    allPass: boolean;
  };
}

export function changeOfBasis(
  P: Matrix,
  T?: Matrix | null,
): ChangeOfBasisResult {
  const n = rows(P);
  if (n !== cols(P)) throw new Error('changeOfBasis: P must be square');
  if (T && (rows(T) !== n || cols(T) !== n)) {
    throw new Error('changeOfBasis: T shape');
  }

  const Pinv = matInverse(P);
  const invertible = Pinv !== null;
  const detP = det(P);

  let T_B: Matrix | null = null;
  if (invertible && T && Pinv) {
    T_B = matMul(Pinv, matMul(T, P));
  }

  let eCoords: Vector[] | null = null;
  if (invertible && Pinv) {
    eCoords = [];
    for (let j = 0; j < n; j++) {
      const e = Array.from({ length: n }, (_, i) =>
        i === j ? { n: 1, d: 1 } : { n: 0, d: 1 },
      );
      eCoords.push(matVec(Pinv, e));
    }
  }

  let PPinvIsI = false;
  if (Pinv) {
    PPinvIsI = matEq(matMul(P, Pinv), identity(n));
  }

  let similarTrace = true;
  if (T_B && T) {
    similarTrace = eq(matrixTrace(T), matrixTrace(T_B));
  }

  return {
    n,
    P: cloneMatrix(P),
    Pinv,
    invertible,
    detP,
    T_B,
    eCoords,
    checks: {
      PPinvIsI,
      similarTrace,
      allPass: invertible ? PPinvIsI && similarTrace : true,
    },
  };
}

export function matrixTrace(A: Matrix) {
  let t = { n: 0, d: 1 };
  for (let i = 0; i < rows(A); i++) t = add(t, A[i]![i]!);
  return t;
}

/** Express v in basis with columns of P: [v]_B = P^{-1} v */
export function coordsInBasis(P: Matrix, v: Vector): Vector | null {
  const Pinv = matInverse(P);
  if (!Pinv) return null;
  return matVec(Pinv, v);
}
