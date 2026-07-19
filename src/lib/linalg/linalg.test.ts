import { describe, expect, it } from 'vitest';
import { frac, eq, formatFrac, mul, add, ZERO, ONE } from './frac';
import {
  fromNumbers,
  matMul,
  matVec,
  transpose,
  det,
  identity,
  formatMatrix,
} from './matrix';
import { rref, rank } from './rref';
import { fourSubspaces } from './subspaces';
import { solve, verifySolution, inColumnSpace } from './solve';
import { presetById, PRESETS } from './catalog';

describe('frac', () => {
  it('reduces and formats', () => {
    expect(formatFrac(frac(2, 4))).toBe('1/2');
    expect(formatFrac(frac(-6, 9))).toBe('−2/3');
    expect(formatFrac(ZERO)).toBe('0');
    expect(eq(add(frac(1, 2), frac(1, 3)), frac(5, 6))).toBe(true);
    expect(eq(mul(frac(2, 3), frac(3, 4)), frac(1, 2))).toBe(true);
  });
});

describe('rref + rank', () => {
  it('identity has full rank', () => {
    const A = identity(3);
    const r = rref(A);
    expect(r.rank).toBe(3);
    expect(r.nullspace).toHaveLength(0);
    expect(r.pivotCols).toEqual([0, 1, 2]);
  });

  it('rank-1 matrix', () => {
    const A = fromNumbers([
      [1, 2, 3],
      [2, 4, 6],
      [3, 6, 9],
    ]);
    expect(rank(A)).toBe(1);
    const r = rref(A);
    expect(r.nullspace).toHaveLength(2);
    for (const x of r.nullspace) {
      const Ax = matVec(A, x);
      expect(Ax.every((c) => c.n === 0)).toBe(true);
    }
  });

  it('wide Strang-like matrix', () => {
    const A = fromNumbers([
      [1, 2, 3],
      [2, 5, 7],
    ]);
    const r = rref(A);
    expect(r.rank).toBe(2);
    expect(r.freeCols).toHaveLength(1);
    expect(r.nullspace).toHaveLength(1);
  });
});

describe('four fundamental subspaces', () => {
  it('passes all checks on every catalog preset', () => {
    for (const p of PRESETS) {
      const fs = fourSubspaces(p.matrix);
      expect(fs.checks.allPass, p.id).toBe(true);
      expect(fs.rank + fs.nullspace.dimension).toBe(fs.n);
      expect(fs.col.dimension).toBe(fs.rank);
      expect(fs.row.dimension).toBe(fs.rank);
      expect(fs.leftNull.dimension).toBe(fs.m - fs.rank);
    }
  });

  it('rank-1 example dims', () => {
    const A = presetById('rank1')!.matrix;
    const fs = fourSubspaces(A);
    expect(fs.rank).toBe(1);
    expect(fs.col.dimension).toBe(1);
    expect(fs.nullspace.dimension).toBe(2);
    expect(fs.row.dimension).toBe(1);
    expect(fs.leftNull.dimension).toBe(2);
  });

  it('tall matrix has left nullspace', () => {
    const A = presetById('tall')!.matrix;
    const fs = fourSubspaces(A);
    expect(fs.m).toBe(3);
    expect(fs.n).toBe(2);
    expect(fs.rank).toBe(2);
    expect(fs.leftNull.dimension).toBe(1);
    expect(fs.nullspace.dimension).toBe(0);
  });
});

describe('solve Ax=b', () => {
  it('solves full-rank square', () => {
    const A = fromNumbers([
      [2, 1],
      [1, 2],
    ]);
    const b = fromNumbers([[5], [4]]).map((r) => r[0]!);
    // b = (5,4)
    const s = solve(A, b);
    expect(s.consistent).toBe(true);
    expect(s.particular).not.toBeNull();
    expect(verifySolution(A, s.particular!, b)).toBe(true);
  });

  it('detects inconsistency', () => {
    const A = fromNumbers([
      [1, 2],
      [2, 4],
    ]);
    const b = [frac(1), frac(1)]; // second row would need 2
    const s = solve(A, b);
    expect(s.consistent).toBe(false);
    expect(inColumnSpace(A, b)).toBe(false);
  });

  it('underdetermined has free vars', () => {
    const A = fromNumbers([
      [1, 2, 3],
      [0, 1, 1],
    ]);
    const b = [ONE, frac(1)];
    const s = solve(A, b);
    expect(s.consistent).toBe(true);
    expect(s.nullspace.length).toBeGreaterThan(0);
    expect(verifySolution(A, s.particular!, b)).toBe(true);
  });
});

describe('matrix ops', () => {
  it('mul and transpose', () => {
    const A = fromNumbers([
      [1, 2],
      [3, 4],
    ]);
    const B = fromNumbers([
      [0, 1],
      [1, 0],
    ]);
    const C = matMul(A, B);
    expect(formatMatrix(C)).toContain('2');
    expect(det(A).n).toBe(-2);
    expect(rowsMatch(transpose(A), fromNumbers([[1, 3], [2, 4]]))).toBe(true);
  });
});

function rowsMatch(A: ReturnType<typeof fromNumbers>, B: ReturnType<typeof fromNumbers>) {
  return A.every((row, i) => row.every((x, j) => eq(x, B[i]![j]!)));
}
