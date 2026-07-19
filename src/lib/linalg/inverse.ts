/**
 * Matrix inverse over ℚ via RREF of [A | I].
 */

import { type Matrix, identity, rows, cols, zeros } from './matrix';
import { rref } from './rref';

/** Inverse of square A, or null if singular. */
export function matInverse(A: Matrix): Matrix | null {
  const n = rows(A);
  if (n !== cols(A)) throw new Error('matInverse: not square');
  if (n === 0) return [];

  const I = identity(n);
  const Aug = A.map((row, i) => [...row, ...I[i]!]);
  const { rref: R, rank } = rref(Aug);
  if (rank < n) return null;

  const inv: Matrix = zeros(n, n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      inv[i]![j] = R[i]![n + j]!;
    }
  }
  return inv;
}

export function isInvertible(A: Matrix): boolean {
  return matInverse(A) !== null;
}
