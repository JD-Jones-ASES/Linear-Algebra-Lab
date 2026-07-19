/**
 * Exact rational arithmetic (ℚ).
 * Fractions are always stored reduced with positive denominator.
 */

export type Frac = Readonly<{ n: number; d: number }>;

export const ZERO: Frac = Object.freeze({ n: 0, d: 1 });
export const ONE: Frac = Object.freeze({ n: 1, d: 1 });
export const NEG_ONE: Frac = Object.freeze({ n: -1, d: 1 });

function gcd(a: number, b: number): number {
  a = Math.abs(a | 0);
  b = Math.abs(b | 0);
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

/** Build a reduced fraction. Denominator must be non-zero. */
export function frac(n: number, d = 1): Frac {
  if (!Number.isFinite(n) || !Number.isFinite(d)) {
    throw new Error('frac: non-finite');
  }
  if (d === 0) throw new Error('frac: division by zero');
  // Keep integers in safe range for exact ops on small matrices
  n = Math.trunc(n);
  d = Math.trunc(d);
  if (d < 0) {
    n = -n;
    d = -d;
  }
  if (n === 0) return ZERO;
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

export function fromInt(n: number): Frac {
  return frac(n, 1);
}

export function isZero(a: Frac): boolean {
  return a.n === 0;
}

export function isOne(a: Frac): boolean {
  return a.n === 1 && a.d === 1;
}

export function eq(a: Frac, b: Frac): boolean {
  return a.n === b.n && a.d === b.d;
}

export function neg(a: Frac): Frac {
  if (a.n === 0) return ZERO;
  return { n: -a.n, d: a.d };
}

export function abs(a: Frac): Frac {
  return a.n < 0 ? neg(a) : a;
}

export function add(a: Frac, b: Frac): Frac {
  return frac(a.n * b.d + b.n * a.d, a.d * b.d);
}

export function sub(a: Frac, b: Frac): Frac {
  return frac(a.n * b.d - b.n * a.d, a.d * b.d);
}

export function mul(a: Frac, b: Frac): Frac {
  return frac(a.n * b.n, a.d * b.d);
}

export function inv(a: Frac): Frac {
  if (a.n === 0) throw new Error('inv: zero');
  return frac(a.d, a.n);
}

export function div(a: Frac, b: Frac): Frac {
  if (b.n === 0) throw new Error('div: zero');
  return frac(a.n * b.d, a.d * b.n);
}

export function cmp(a: Frac, b: Frac): number {
  const lhs = a.n * b.d;
  const rhs = b.n * a.d;
  return lhs === rhs ? 0 : lhs < rhs ? -1 : 1;
}

/** Unicode-friendly fraction string: 0, −3, 2/5, −3/4 */
export function formatFrac(a: Frac): string {
  if (a.n === 0) return '0';
  const sign = a.n < 0 ? '−' : '';
  const n = Math.abs(a.n);
  if (a.d === 1) return `${sign}${n}`;
  return `${sign}${n}/${a.d}`;
}

/** Parse "3", "-1/2", "0", "−2" (unicode minus). */
export function parseFrac(s: string): Frac | null {
  const t = s.trim().replace(/−/g, '-').replace(/\s+/g, '');
  if (!t) return null;
  const m = t.match(/^(-?\d+)(?:\/(-?\d+))?$/);
  if (!m) return null;
  const n = Number(m[1]);
  const d = m[2] !== undefined ? Number(m[2]) : 1;
  if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null;
  return frac(n, d);
}
