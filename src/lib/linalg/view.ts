/**
 * Display helpers: exact ℚ → float for SVG/Three drawing only.
 * Never use these for verification.
 */

import type { Frac } from './frac';
import type { Matrix, Vector } from './matrix';
import { cols, rows } from './matrix';

export function fracToNumber(a: Frac): number {
  return a.n / a.d;
}

export function vecToNumbers(v: Vector): number[] {
  return v.map(fracToNumber);
}

export function matrixToNumbers(A: Matrix): number[][] {
  return A.map((row) => row.map(fracToNumber));
}

/** Max absolute entry — for auto-scaling drawings. */
export function maxAbsEntries(...vecs: number[][]): number {
  let m = 0;
  for (const v of vecs) {
    for (const x of v) {
      const a = Math.abs(x);
      if (a > m) m = a;
    }
  }
  return m === 0 ? 1 : m;
}

export function ambientDim(A: Matrix): { m: number; n: number } {
  return { m: rows(A), n: cols(A) };
}
