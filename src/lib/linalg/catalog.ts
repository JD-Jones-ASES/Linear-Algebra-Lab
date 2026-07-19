/**
 * Named matrix presets for desks and deep links.
 * All entries are integer matrices (exact ℚ).
 */

import { type Matrix, fromNumbers, identity } from './matrix';

export interface MatrixPreset {
  id: string;
  /** Short UI label */
  label: string;
  /** One-line why this example exists */
  blurb: string;
  /** Tags for filters / pedagogy */
  tags: Array<'square' | 'tall' | 'wide' | 'full-rank' | 'deficient' | 'identity' | 'classic'>;
  matrix: Matrix;
}

function p(
  id: string,
  label: string,
  blurb: string,
  tags: MatrixPreset['tags'],
  data: number[][],
): MatrixPreset {
  return { id, label, blurb, tags, matrix: fromNumbers(data) };
}

export const PRESETS: MatrixPreset[] = [
  p(
    'id2',
    'I₂',
    'Identity — full rank, trivial nullspace.',
    ['square', 'full-rank', 'identity'],
    [
      [1, 0],
      [0, 1],
    ],
  ),
  p(
    'id3',
    'I₃',
    '3×3 identity — four subspaces at their simplest.',
    ['square', 'full-rank', 'identity', 'classic'],
    [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
  ),
  p(
    'rank1',
    'Rank-1 (3×3)',
    'All rows multiples of (1, 2, 3) — dim C(A)=1, big nullspace.',
    ['square', 'deficient', 'classic'],
    [
      [1, 2, 3],
      [2, 4, 6],
      [3, 6, 9],
    ],
  ),
  p(
    'strang',
    'Strang 2×3',
    'Classic wide matrix: rank 2, nullity 1 — free variable story.',
    ['wide', 'full-rank', 'classic'],
    [
      [1, 2, 3],
      [2, 5, 7],
    ],
  ),
  p(
    'tall',
    'Tall 3×2',
    'More equations than unknowns — left nullspace can be nontrivial.',
    ['tall', 'full-rank', 'classic'],
    [
      [1, 2],
      [3, 4],
      [5, 6],
    ],
  ),
  p(
    'dep-rows',
    'Dependent rows',
    'Row 3 = row1 + row2 — left nullspace sees the dependence.',
    ['square', 'deficient', 'classic'],
    [
      [1, 2, 1],
      [2, 1, 3],
      [3, 3, 4],
    ],
  ),
  p(
    'singular',
    'Singular 2×2',
    'det = 0 — columns parallel, N(A) one-dimensional.',
    ['square', 'deficient'],
    [
      [1, 2],
      [2, 4],
    ],
  ),
  p(
    'full3',
    'Full rank 3×3',
    'Invertible-looking integers — all four dims: 3,0,3,0.',
    ['square', 'full-rank'],
    [
      [2, 1, 0],
      [1, 2, 1],
      [0, 1, 2],
    ],
  ),
  p(
    'zero23',
    'Zero 2×3',
    'Everything collapses: rank 0, nullspace all of ℚ³.',
    ['wide', 'deficient'],
    [
      [0, 0, 0],
      [0, 0, 0],
    ],
  ),
  p(
    'proj',
    'Projection-ish',
    'Rank-1 projector flavor: columns in span of (1,1,0).',
    ['square', 'deficient'],
    [
      [1, 1, 0],
      [1, 1, 0],
      [0, 0, 0],
    ],
  ),
  p(
    'eigen-diag',
    'Diag(2,3)',
    'Diagonal — eigenvalues 2 and 3 on the nose.',
    ['square', 'full-rank', 'classic'],
    [
      [2, 0],
      [0, 3],
    ],
  ),
  p(
    'eigen-sym',
    'Symmetric 2×2',
    '[[2,1],[1,2]] — eigenvalues 3 and 1, orthogonal eigenspaces.',
    ['square', 'full-rank', 'classic'],
    [
      [2, 1],
      [1, 2],
    ],
  ),
  p(
    'eigen-jordan',
    'Jordan block',
    '[[1,1],[0,1]] — single eigenvalue 1, geometric mult 1.',
    ['square', 'full-rank'],
    [
      [1, 1],
      [0, 1],
    ],
  ),
  p(
    'basis-shear',
    'Shear basis P',
    'P = [[1,1],[0,1]] — change-of-basis friendly invertible matrix.',
    ['square', 'full-rank'],
    [
      [1, 1],
      [0, 1],
    ],
  ),
  p(
    'basis-rot',
    'Integer basis',
    'P = [[2,1],[1,2]] — full rank, good Gram–Schmidt demo.',
    ['square', 'full-rank', 'classic'],
    [
      [2, 1],
      [1, 2],
    ],
  ),

];

export function presetById(id: string | null | undefined): MatrixPreset | null {
  if (!id) return null;
  return PRESETS.find((p) => p.id === id) ?? null;
}

export function defaultPreset(): MatrixPreset {
  return PRESETS.find((p) => p.id === 'strang') ?? PRESETS[0]!;
}

/** Optional identity builder for UI size controls later */
export function identityPreset(n: number): Matrix {
  return identity(n);
}
