/**
 * Change of basis over ℚ.
 * Columns of P = basis B.  [v]_B = P^{-1} v,  [T]_B = P^{-1} T P.
 */

import { add, eq, type Frac, ZERO } from './frac';
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
  zeros,
} from './matrix';
import { matInverse } from './inverse';

export interface ChangeOfBasisResult {
  n: number;
  m: number;
  square: boolean;
  P: Matrix;
  Pinv: Matrix | null;
  invertible: boolean;
  detP: Frac;
  /** [T]_B if T provided and P invertible */
  T_B: Matrix | null;
  /** Coordinates of standard basis vectors e_j in B */
  eCoords: Vector[] | null;
  /** Human reason when not a full change-of-basis */
  message: string | null;
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
  const m = rows(P);
  const n = cols(P);
  const square = m === n && m > 0;

  if (!square) {
    return {
      n,
      m,
      square: false,
      P: cloneMatrix(P),
      Pinv: null,
      invertible: false,
      detP: ZERO,
      T_B: null,
      eCoords: null,
      message: `P is ${m}×${n} — need a square matrix (columns form a basis of ℚⁿ).`,
      checks: {
        PPinvIsI: false,
        similarTrace: true,
        allPass: false,
      },
    };
  }

  if (T && (rows(T) !== n || cols(T) !== n)) {
    // T wrong shape — still report P invertibility
    const PinvOnly = matInverse(P);
    return {
      n,
      m,
      square: true,
      P: cloneMatrix(P),
      Pinv: PinvOnly,
      invertible: PinvOnly !== null,
      detP: det(P),
      T_B: null,
      eCoords: PinvOnly
        ? Array.from({ length: n }, (_, j) => {
            const e = Array.from({ length: n }, (_, i) =>
              i === j ? { n: 1, d: 1 } : { n: 0, d: 1 },
            );
            return matVec(PinvOnly, e);
          })
        : null,
      message: `Map T is ${rows(T)}×${cols(T)}; need ${n}×${n} to form [T]_B.`,
      checks: {
        PPinvIsI: PinvOnly ? matEq(matMul(P, PinvOnly), identity(n)) : false,
        similarTrace: true,
        allPass: false,
      },
    };
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
    m,
    square: true,
    P: cloneMatrix(P),
    Pinv,
    invertible,
    detP,
    T_B,
    eCoords,
    message: invertible
      ? null
      : 'P is singular — columns are linearly dependent, not a basis of ℚⁿ.',
    checks: {
      PPinvIsI,
      similarTrace,
      allPass: invertible ? PPinvIsI && similarTrace : false,
    },
  };
}

export function matrixTrace(A: Matrix) {
  let t = { n: 0, d: 1 };
  for (let i = 0; i < rows(A); i++) t = add(t, A[i]![i]!);
  return t;
}

/** Express v in basis with columns of P: [v]_B = P⁻¹ v */
export function coordsInBasis(P: Matrix, v: Vector): Vector | null {
  if (rows(P) !== cols(P)) return null;
  const Pinv = matInverse(P);
  if (!Pinv) return null;
  return matVec(Pinv, v);
}
