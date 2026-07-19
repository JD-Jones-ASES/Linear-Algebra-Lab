/**
 * Eigenvalues / eigenvectors over ℚ for small matrices (n ≤ 3).
 * Only reports eigenvalues that split over ℚ (rational roots / quadratic formula when disc is a square).
 */

import {
  type Frac,
  ZERO,
  ONE,
  add,
  sub,
  mul,
  div,
  neg,
  isZero,
  eq,
  frac,
  fromInt,
} from './frac';
import {
  type Matrix,
  type Vector,
  rows,
  cols,
  cloneMatrix,
  identity,
  matVec,
  vecEq,
  zeros,
} from './matrix';
import { rref } from './rref';
import { fourSubspaces } from './subspaces';

export interface Eigenpair {
  lambda: Frac;
  /** Basis of eigenspace ker(A − λI) */
  eigenspace: Vector[];
  algebraicMult: number;
  geometricMult: number;
}

export interface EigenResult {
  n: number;
  /** Characteristic polynomial monic coeffs of λ^n + c_{n-1} λ^{n-1} + … + c_0 as [c_{n-1},…,c_0] with leading 1 omitted display */
  charPolyLabel: string;
  pairs: Eigenpair[];
  /** True if we found n eigenvalues counting multiplicity over ℚ */
  splitsOverQ: boolean;
  checks: {
    allAvEqualsLambdaV: boolean;
    allPass: boolean;
  };
}

export function eigen(A: Matrix): EigenResult {
  const n = rows(A);
  if (n !== cols(A)) throw new Error('eigen: not square');
  if (n > 3) {
    return {
      n,
      charPolyLabel: 'n>3 — not computed',
      pairs: [],
      splitsOverQ: false,
      checks: { allAvEqualsLambdaV: true, allPass: true },
    };
  }

  const candidates = rationalEigenCandidates(A);
  const pairs: Eigenpair[] = [];
  const seen: Frac[] = [];

  for (const lambda of candidates) {
    if (seen.some((s) => eq(s, lambda))) continue;
    const Ami = subLambdaI(A, lambda);
    const fs = fourSubspaces(Ami);
    if (fs.nullspace.dimension === 0) continue;
    const alg = algebraicMultiplicity(A, lambda);
    pairs.push({
      lambda,
      eigenspace: fs.nullspace.basis,
      algebraicMult: alg,
      geometricMult: fs.nullspace.dimension,
    });
    seen.push(lambda);
  }

  let algSum = 0;
  for (const p of pairs) algSum += p.algebraicMult;
  const splitsOverQ = algSum === n && pairs.length > 0;

  let allAv = true;
  for (const p of pairs) {
    for (const v of p.eigenspace) {
      const Av = matVec(A, v);
      const lv = v.map((c) => mul(p.lambda, c));
      if (!vecEq(Av, lv)) allAv = false;
    }
  }

  return {
    n,
    charPolyLabel: charPolyLabel(A),
    pairs,
    splitsOverQ,
    checks: {
      allAvEqualsLambdaV: allAv,
      allPass: allAv,
    },
  };
}

function subLambdaI(A: Matrix, lambda: Frac): Matrix {
  const n = rows(A);
  const M = cloneMatrix(A);
  for (let i = 0; i < n; i++) {
    M[i]![i] = sub(M[i]![i]!, lambda);
  }
  return M;
}

/** Rational root candidates from char poly / traces for n=1,2,3. */
function rationalEigenCandidates(A: Matrix): Frac[] {
  const n = rows(A);
  if (n === 1) return [A[0]![0]!];

  if (n === 2) {
    // λ² − tr λ + det = 0
    const tr = add(A[0]![0]!, A[1]![1]!);
    const d = sub(mul(A[0]![0]!, A[1]![1]!), mul(A[0]![1]!, A[1]![0]!));
    const disc = sub(mul(tr, tr), mul(fromInt(4), d));
    // disc = p/q — need perfect square in ℚ
    const sq = rationalSqrt(disc);
    if (!sq) {
      // still try rational roots ± factors of det
      return uniqueFracs([...factorCandidates(d), tr]);
    }
    const two = fromInt(2);
    const l1 = div(add(tr, sq), two);
    const l2 = div(sub(tr, sq), two);
    return uniqueFracs([l1, l2]);
  }

  // n === 3: rational root theorem on monic char poly with integer coeffs if A integer
  // χ(λ) = det(λI − A) = λ³ − tr λ² + σ λ − det
  const tr = add(add(A[0]![0]!, A[1]![1]!), A[2]![2]!);
  const detA = det3(A);
  const sigma = add(
    add(
      sub(mul(A[0]![0]!, A[1]![1]!), mul(A[0]![1]!, A[1]![0]!)),
      sub(mul(A[0]![0]!, A[2]![2]!), mul(A[0]![2]!, A[2]![0]!)),
    ),
    sub(mul(A[1]![1]!, A[2]![2]!), mul(A[1]![2]!, A[2]![1]!)),
  );
  // Try rational roots: factors of constant term / leading
  const cands = uniqueFracs([
    ...factorCandidates(detA),
    ...factorCandidates(tr),
    ZERO,
    ONE,
    neg(ONE),
    tr,
  ]);
  const roots: Frac[] = [];
  for (const r of cands) {
    // χ(r) = r³ − tr r² + σ r − det
    const r2 = mul(r, r);
    const r3 = mul(r2, r);
    const val = sub(add(sub(r3, mul(tr, r2)), mul(sigma, r)), detA);
    if (isZero(val)) roots.push(r);
  }
  return uniqueFracs(roots);
}

function algebraicMultiplicity(A: Matrix, lambda: Frac): number {
  const n = rows(A);
  // For n=2 with both roots equal, mult 2; crude: count how many times (λ works as root of char)
  if (n === 1) return 1;
  if (n === 2) {
    const tr = add(A[0]![0]!, A[1]![1]!);
    const d = sub(mul(A[0]![0]!, A[1]![1]!), mul(A[0]![1]!, A[1]![0]!));
    const disc = sub(mul(tr, tr), mul(fromInt(4), d));
    if (isZero(disc) && eq(div(tr, fromInt(2)), lambda)) return 2;
    return 1;
  }
  // n=3: factor (λ−r) and check quadratic
  let mult = 1;
  // If (A−λI)^2 also has bigger nullity — optional; keep 1 unless double root test
  const Ami = subLambdaI(A, lambda);
  // derivative-style: if all 2x2 principal minors of χ vanish hard — skip; use power
  // Check char poly derivative zero at λ for multiple root
  const tr = add(add(A[0]![0]!, A[1]![1]!), A[2]![2]!);
  const sigma = add(
    add(
      sub(mul(A[0]![0]!, A[1]![1]!), mul(A[0]![1]!, A[1]![0]!)),
      sub(mul(A[0]![0]!, A[2]![2]!), mul(A[0]![2]!, A[2]![0]!)),
    ),
    sub(mul(A[1]![1]!, A[2]![2]!), mul(A[1]![2]!, A[2]![1]!)),
  );
  // χ' = 3λ² − 2 tr λ + σ
  const lp = lambda;
  const deriv = add(
    sub(mul(fromInt(3), mul(lp, lp)), mul(mul(fromInt(2), tr), lp)),
    sigma,
  );
  if (isZero(deriv)) mult = 2;
  // triple: χ''=6λ−2tr = 0 and deriv 0
  const deriv2 = sub(mul(fromInt(6), lp), mul(fromInt(2), tr));
  if (isZero(deriv) && isZero(deriv2)) mult = 3;
  return mult;
}

function charPolyLabel(A: Matrix): string {
  const n = rows(A);
  if (n === 1) return `λ − (${fmt(A[0]![0]!)})`;
  if (n === 2) {
    const tr = add(A[0]![0]!, A[1]![1]!);
    const d = sub(mul(A[0]![0]!, A[1]![1]!), mul(A[0]![1]!, A[1]![0]!));
    return `λ² − (${fmt(tr)})λ + (${fmt(d)})`;
  }
  const tr = add(add(A[0]![0]!, A[1]![1]!), A[2]![2]!);
  const detA = det3(A);
  return `λ³ − (${fmt(tr)})λ² + … − (${fmt(detA)})`;
}

function fmt(a: Frac): string {
  if (a.d === 1) return String(a.n);
  return `${a.n}/${a.d}`;
}

function det3(A: Matrix): Frac {
  const a = A[0]![0]!,
    b = A[0]![1]!,
    c = A[0]![2]!;
  const d = A[1]![0]!,
    e = A[1]![1]!,
    f = A[1]![2]!;
  const g = A[2]![0]!,
    h = A[2]![1]!,
    i = A[2]![2]!;
  return add(
    sub(mul(a, sub(mul(e, i), mul(f, h))), mul(b, sub(mul(d, i), mul(f, g)))),
    mul(c, sub(mul(d, h), mul(e, g))),
  );
}

/** Integer factors as rationals for rational root candidates. */
function factorCandidates(c: Frac): Frac[] {
  // Map to integer: c = n/d → try ± factors of n
  const n = Math.abs(c.n);
  const out: Frac[] = [ZERO, ONE, neg(ONE)];
  for (let k = 1; k * k <= n && k <= 24; k++) {
    if (n % k === 0) {
      out.push(fromInt(k), fromInt(-k), frac(k, c.d), frac(-k, c.d));
      const m = n / k;
      if (m !== k) {
        out.push(fromInt(m), fromInt(-m), frac(m, c.d), frac(-m, c.d));
      }
    }
  }
  return out;
}

function uniqueFracs(list: Frac[]): Frac[] {
  const out: Frac[] = [];
  for (const f of list) {
    if (!out.some((g) => eq(g, f))) out.push(f);
  }
  return out;
}

/** Square root in ℚ if perfect square fraction. */
function rationalSqrt(a: Frac): Frac | null {
  if (a.n < 0) return null;
  if (isZero(a)) return ZERO;
  const sn = iSqrt(a.n);
  const sd = iSqrt(a.d);
  if (sn === null || sd === null) return null;
  return frac(sn, sd);
}

function iSqrt(n: number): number | null {
  if (n < 0) return null;
  const r = Math.round(Math.sqrt(n));
  return r * r === n ? r : null;
}
