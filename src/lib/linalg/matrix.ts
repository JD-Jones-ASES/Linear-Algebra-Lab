/**
 * Dense matrices over ℚ (row-major Frac[][]).
 */

import {
  type Frac,
  ZERO,
  ONE,
  add,
  sub,
  mul,
  neg,
  inv,
  isZero,
  eq,
  formatFrac,
  fromInt,
} from './frac';

export type Matrix = Frac[][];
export type Vector = Frac[];

export function rows(A: Matrix): number {
  return A.length;
}

export function cols(A: Matrix): number {
  return A[0]?.length ?? 0;
}

export function shape(A: Matrix): { m: number; n: number } {
  return { m: rows(A), n: cols(A) };
}

export function cloneMatrix(A: Matrix): Matrix {
  return A.map((r) => r.map((x) => ({ n: x.n, d: x.d })));
}

export function zeros(m: number, n: number): Matrix {
  return Array.from({ length: m }, () => Array.from({ length: n }, () => ZERO));
}

export function identity(n: number): Matrix {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? ONE : ZERO)),
  );
}

/** Build from nested integer arrays. */
export function fromNumbers(data: number[][]): Matrix {
  if (data.length === 0) return [];
  const n = data[0]!.length;
  return data.map((row) => {
    if (row.length !== n) throw new Error('fromNumbers: ragged rows');
    return row.map((x) => fromInt(x));
  });
}

export function transpose(A: Matrix): Matrix {
  const m = rows(A);
  const n = cols(A);
  const T = zeros(n, m);
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      T[j]![i] = A[i]![j]!;
    }
  }
  return T;
}

export function matAdd(A: Matrix, B: Matrix): Matrix {
  const { m, n } = shape(A);
  if (rows(B) !== m || cols(B) !== n) throw new Error('matAdd: shape');
  return A.map((row, i) => row.map((a, j) => add(a, B[i]![j]!)));
}

export function matMul(A: Matrix, B: Matrix): Matrix {
  const m = rows(A);
  const k = cols(A);
  const n = cols(B);
  if (rows(B) !== k) throw new Error('matMul: shape');
  const C = zeros(m, n);
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let s = ZERO;
      for (let t = 0; t < k; t++) {
        s = add(s, mul(A[i]![t]!, B[t]![j]!));
      }
      C[i]![j] = s;
    }
  }
  return C;
}

export function matVec(A: Matrix, v: Vector): Vector {
  if (v.length !== cols(A)) throw new Error('matVec: shape');
  return A.map((row) => {
    let s = ZERO;
    for (let j = 0; j < row.length; j++) {
      s = add(s, mul(row[j]!, v[j]!));
    }
    return s;
  });
}

export function vecAdd(u: Vector, v: Vector): Vector {
  if (u.length !== v.length) throw new Error('vecAdd: shape');
  return u.map((a, i) => add(a, v[i]!));
}

export function vecScale(c: Frac, v: Vector): Vector {
  return v.map((x) => mul(c, x));
}

export function vecDot(u: Vector, v: Vector): Frac {
  if (u.length !== v.length) throw new Error('vecDot: shape');
  let s = ZERO;
  for (let i = 0; i < u.length; i++) {
    s = add(s, mul(u[i]!, v[i]!));
  }
  return s;
}

export function vecEq(u: Vector, v: Vector): boolean {
  if (u.length !== v.length) return false;
  return u.every((a, i) => eq(a, v[i]!));
}

export function isZeroVec(v: Vector): boolean {
  return v.every(isZero);
}

export function column(A: Matrix, j: number): Vector {
  return A.map((row) => row[j]!);
}

export function row(A: Matrix, i: number): Vector {
  return A[i]!.map((x) => ({ n: x.n, d: x.d }));
}

export function matEq(A: Matrix, B: Matrix): boolean {
  if (rows(A) !== rows(B) || cols(A) !== cols(B)) return false;
  for (let i = 0; i < rows(A); i++) {
    for (let j = 0; j < cols(A); j++) {
      if (!eq(A[i]![j]!, B[i]![j]!)) return false;
    }
  }
  return true;
}

/** Determinant via Gaussian elimination (exact ℚ). */
export function det(A: Matrix): Frac {
  const n = rows(A);
  if (n !== cols(A)) throw new Error('det: not square');
  if (n === 0) return ONE;
  const M = cloneMatrix(A);
  let d = ONE;
  for (let col = 0; col < n; col++) {
    let piv = -1;
    for (let i = col; i < n; i++) {
      if (!isZero(M[i]![col]!)) {
        piv = i;
        break;
      }
    }
    if (piv < 0) return ZERO;
    if (piv !== col) {
      [M[col], M[piv]] = [M[piv]!, M[col]!];
      d = neg(d);
    }
    const pivot = M[col]![col]!;
    d = mul(d, pivot);
    for (let i = col + 1; i < n; i++) {
      if (isZero(M[i]![col]!)) continue;
      const f = mul(M[i]![col]!, inv(pivot));
      for (let j = col; j < n; j++) {
        M[i]![j] = sub(M[i]![j]!, mul(f, M[col]![j]!));
      }
    }
  }
  return d;
}

export function formatVector(v: Vector): string {
  return `(${v.map(formatFrac).join(', ')})`;
}

export function formatMatrix(A: Matrix): string {
  return A.map((row) => `[${row.map(formatFrac).join('  ')}]`).join('\n');
}
