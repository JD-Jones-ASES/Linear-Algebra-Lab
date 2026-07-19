/**
 * Glossary — dictionary entries with “See it” deep links.
 * Built from day one so desks and tours share vocabulary.
 */

export interface GlossarySee {
  href: string;
  label: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  also?: string[];
  def: string;
  see: GlossarySee[];
  tags: GlossaryTag[];
}

export type GlossaryTag =
  | 'matrix'
  | 'spaces'
  | 'solve'
  | 'project'
  | 'theorems'
  | 'general';

export const GLOSSARY_TAG_ORDER: GlossaryTag[] = [
  'matrix',
  'spaces',
  'solve',
  'project',
  'theorems',
  'general',
,

  {
    id: 'projection',
    term: 'Projection',
    also: ['orthogonal projection', 'proj'],
    def: 'The closest vector p in a subspace V to a given b. For V = C(A), p = A x̂ where x̂ solves the normal equations.',
    see: [
      {
        href: `/project?preset=singular&b=out&thm=projection&note=${note(
          'p is the foot of the perpendicular from b to C(A).',
        )}`,
        label: 'Project · p and r',
      },
    ],
    tags: ['project', 'spaces', 'theorems'],
  },
  {
    id: 'residual',
    term: 'Residual',
    also: ['b − p', 'error'],
    def: 'r = b − p after projection onto C(A). Always in the left nullspace: Aᵀ r = 0.',
    see: [
      {
        href: `/project?preset=tall&b=out&note=${note(
          'Residual along N(Aᵀ).',
        )}`,
        label: 'Project · residual',
      },
    ],
    tags: ['project'],
  },
  {
    id: 'least-squares',
    term: 'Least squares',
    also: ['LS'],
    def: 'Choosing x to minimize ‖A x − b‖. Equivalent to solving Aᵀ A x = Aᵀ b when working with the Euclidean norm.',
    see: [
      {
        href: `/project?preset=strang&b=out&thm=normal-eq&note=${note(
          'Normal equations for a wide matrix.',
        )}`,
        label: 'Project · normal equations',
      },
    ],
    tags: ['project', 'theorems'],
  },
  {
    id: 'normal-equations',
    term: 'Normal equations',
    def: 'The square system Aᵀ A x̂ = Aᵀ b. Always consistent; solutions are least-squares minimizers.',
    see: [
      {
        href: `/project?preset=singular&b=out&thm=normal-eq&note=${note(
          'Read AᵀA and the satisfied badge.',
        )}`,
        label: 'Project · AᵀA',
      },
    ],
    tags: ['project', 'theorems'],
  },
,

  {
    id: 'eigenvalue',
    term: 'Eigenvalue',
    also: ['λ'],
    def: 'A scalar λ with A v = λ v for some nonzero v. Over ℚ we only list eigenvalues that appear as rational roots of the characteristic polynomial.',
    see: [
      {
        href: `/eigen?preset=eigen-sym&thm=eigenvalue&note=${note('λ = 3 and 1.')}`,
        label: 'Eigen · symmetric',
      },
    ],
    tags: ['eigen', 'theorems'],
  },
  {
    id: 'eigenvector',
    term: 'Eigenvector',
    def: 'A nonzero vector v with A v = λ v. The eigenspace for λ is ker(A − λI).',
    see: [
      {
        href: `/eigen?preset=eigen-diag&note=${note('Axis eigenvectors for a diagonal matrix.')}`,
        label: 'Eigen · diagonal',
      },
    ],
    tags: ['eigen'],
  },
  {
    id: 'change-of-basis',
    term: 'Change of basis',
    also: ['[v]_B'],
    def: 'Coordinates of v relative to basis B (columns of P) are P⁻¹ v. Matrices of maps transform by similarity.',
    see: [
      {
        href: `/basis?preset=basis-rot&thm=change-of-basis&note=${note('P and P⁻¹.')}`,
        label: 'Basis desk',
      },
    ],
    tags: ['basis', 'theorems'],
  },
  {
    id: 'gram-schmidt',
    term: 'Gram–Schmidt',
    def: 'Algorithm that turns a list of vectors into an orthogonal list by subtracting successive projections.',
    see: [
      {
        href: `/basis?preset=basis-rot&thm=gram-schmidt&note=${note('Orthogonal uᵢ.')}`,
        label: 'Basis · GS',
      },
    ],
    tags: ['basis'],
  },
];

function note(s: string): string {
  return encodeURIComponent(s);
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    id: 'matrix',
    term: 'Matrix',
    def: 'A rectangular array of numbers. An m×n matrix maps ℚⁿ → ℚᵐ by x ↦ A x (column vectors).',
    see: [
      {
        href: `/matrix?preset=strang&note=${note('A 2×3 matrix — two rows, three columns.')}`,
        label: 'Matrix · 2×3',
      },
    ],
    tags: ['matrix', 'general'],
  },
  {
    id: 'column-space',
    term: 'Column space',
    also: ['C(A)', 'image', 'range'],
    def: 'The span of the columns of A — all vectors A x as x varies. Subspace of ℚᵐ. Dimension = rank(A).',
    see: [
      {
        href: `/spaces?preset=strang&focus=col&note=${note('C(A) spanned by the two pivot columns.')}`,
        label: 'Spaces · C(A)',
      },
      { href: '/theorems#four-subspaces', label: 'Theorem · four subspaces' },
    ],
    tags: ['spaces', 'theorems'],
  },
  {
    id: 'nullspace',
    term: 'Nullspace',
    also: ['N(A)', 'kernel', 'ker A'],
    def: 'All x in ℚⁿ with A x = 0. Dimension is the nullity n − rank(A). Basis vectors come from free variables in RREF.',
    see: [
      {
        href: `/spaces?preset=strang&focus=null&note=${note('One free variable → one nullspace basis vector.')}`,
        label: 'Spaces · N(A)',
      },
      {
        href: `/spaces?preset=rank1&focus=null&thm=rank-nullity&note=${note('Rank-1: nullity 2.')}`,
        label: 'Spaces · large nullspace',
      },
    ],
    tags: ['spaces', 'theorems'],
  },
  {
    id: 'row-space',
    term: 'Row space',
    also: ['C(Aᵀ)'],
    def: 'The span of the rows of A — equivalently the column space of Aᵀ. Subspace of ℚⁿ with dimension rank(A).',
    see: [
      {
        href: `/spaces?preset=strang&focus=row&note=${note('Row space lives in ℚⁿ; dim equals rank.')}`,
        label: 'Spaces · C(Aᵀ)',
      },
    ],
    tags: ['spaces'],
  },
  {
    id: 'left-nullspace',
    term: 'Left nullspace',
    also: ['N(Aᵀ)', 'cokernel'],
    def: 'All y in ℚᵐ with Aᵀ y = 0 (equivalently yᵀ A = 0). Orthogonal complement of C(A). Dimension m − rank(A).',
    see: [
      {
        href: `/spaces?preset=tall&focus=leftNull&note=${note('Tall matrix: nontrivial left nullspace.')}`,
        label: 'Spaces · N(Aᵀ)',
      },
    ],
    tags: ['spaces'],
  },
  {
    id: 'rank',
    term: 'Rank',
    also: ['rank(A)'],
    def: 'Dimension of the column space (equals dimension of the row space). Number of pivots in RREF.',
    see: [
      {
        href: `/matrix?preset=rank1&note=${note('Only one pivot — rank 1.')}`,
        label: 'Matrix · rank-1',
      },
      { href: '/theorems#rank-nullity', label: 'Theorem · rank–nullity' },
    ],
    tags: ['matrix', 'spaces', 'theorems'],
  },
  {
    id: 'nullity',
    term: 'Nullity',
    def: 'Dimension of the nullspace. Rank–nullity: rank + nullity = n (number of columns).',
    see: [
      {
        href: `/spaces?preset=strang&thm=rank-nullity&note=${note('nullity = n − r = 1.')}`,
        label: 'Spaces · rank–nullity',
      },
    ],
    tags: ['spaces', 'theorems'],
  },
  {
    id: 'rref',
    term: 'RREF',
    also: ['reduced row echelon form'],
    def: 'A matrix form with leading 1 pivots, zeros above and below each pivot, and pivot columns in staircase order. Unique for each row space.',
    see: [
      {
        href: `/matrix?preset=strang&tab=rref&thm=rref-pivots&note=${note('RREF with pivots and free columns marked.')}`,
        label: 'Matrix · RREF',
      },
    ],
    tags: ['matrix'],
  },
  {
    id: 'pivot',
    term: 'Pivot',
    also: ['pivot column'],
    def: 'A leading 1 in RREF. Pivot columns of A form a basis for the column space. Non-pivot columns are free.',
    see: [
      {
        href: `/matrix?preset=strang&tab=rref&note=${note('Pivot columns highlighted in RREF.')}`,
        label: 'Matrix · pivots',
      },
    ],
    tags: ['matrix'],
  },
  {
    id: 'free-variable',
    term: 'Free variable',
    def: 'A variable whose column has no pivot. Set free variables to basis patterns (one 1, rest 0) to build a nullspace basis.',
    see: [
      {
        href: `/spaces?preset=strang&focus=null&note=${note('Free column → nullspace basis vector.')}`,
        label: 'Spaces · free → N(A)',
      },
    ],
    tags: ['matrix', 'spaces'],
  },
  {
    id: 'linear-combination',
    term: 'Linear combination',
    def: 'A sum c₁v₁ + … + cₖvₖ with scalar coefficients. Column space = all linear combinations of the columns.',
    see: [
      {
        href: `/solve?preset=strang&b=in&note=${note('b as a combination of columns — a solution x.')}`,
        label: 'Solve · b in C(A)',
      },
    ],
    tags: ['general', 'solve'],
  },
  {
    id: 'span',
    term: 'Span',
    def: 'The set of all linear combinations of a list of vectors. Always a subspace.',
    see: [
      {
        href: `/spaces?preset=full3&focus=col&note=${note('Full rank: columns span all of ℚ³.')}`,
        label: 'Spaces · full span',
      },
    ],
    tags: ['general', 'spaces'],
  },
  {
    id: 'subspace',
    term: 'Subspace',
    def: 'A subset of a vector space closed under addition and scalar multiplication. The four fundamental subspaces are the starring examples for a matrix.',
    see: [
      {
        href: `/spaces?preset=strang&thm=four-subspaces&note=${note('Four subspaces of one matrix.')}`,
        label: 'Spaces · four subspaces',
      },
    ],
    tags: ['spaces', 'general'],
  },
  {
    id: 'basis',
    term: 'Basis',
    def: 'A linearly independent spanning set. Dimension is the number of vectors in any basis. Desks show bases for each fundamental subspace.',
    see: [
      {
        href: `/spaces?preset=dep-rows&note=${note('Bases listed under each subspace card.')}`,
        label: 'Spaces · bases',
      },
    ],
    tags: ['spaces', 'general'],
  },
  {
    id: 'dimension',
    term: 'Dimension',
    def: 'Number of vectors in a basis. For the four subspaces of m×n rank-r A: r, n−r, r, m−r.',
    see: [
      {
        href: `/spaces?preset=rank1&note=${note('Read the four dim badges: 1, 2, 1, 2.')}`,
        label: 'Spaces · dimensions',
      },
    ],
    tags: ['spaces', 'theorems'],
  },
  {
    id: 'transpose',
    term: 'Transpose',
    also: ['Aᵀ'],
    def: 'Rows become columns: (Aᵀ)ᵢⱼ = Aⱼᵢ. Row space of A is column space of Aᵀ; left nullspace is nullspace of Aᵀ.',
    see: [
      {
        href: `/matrix?preset=tall&tab=both&note=${note('Tall A — transpose is wide; left null of A is null of Aᵀ.')}`,
        label: 'Matrix · tall A',
      },
    ],
    tags: ['matrix', 'spaces'],
  },
  {
    id: 'consistent',
    term: 'Consistent system',
    def: 'A x = b has at least one solution. Equivalent to b ∈ C(A), or rank[A|b] = rank(A).',
    see: [
      {
        href: `/solve?preset=singular&b=in&thm=solvability&note=${note('Consistent: b in the column space.')}`,
        label: 'Solve · consistent',
      },
    ],
    tags: ['solve', 'theorems'],
  },
  {
    id: 'inconsistent',
    term: 'Inconsistent system',
    def: 'A x = b has no solution. The augmented matrix has a row [0 … 0 | c] with c ≠ 0.',
    see: [
      {
        href: `/solve?preset=singular&b=out&thm=solvability&note=${note('Inconsistent: b outside C(A).')}`,
        label: 'Solve · inconsistent',
      },
    ],
    tags: ['solve'],
  },
  {
    id: 'particular-solution',
    term: 'Particular solution',
    def: 'One solution xₚ of A x = b. The general solution is xₚ + N(A) when consistent.',
    see: [
      {
        href: `/solve?preset=strang&b=in&note=${note('Particular solution with free variables set to 0.')}`,
        label: 'Solve · particular',
      },
    ],
    tags: ['solve'],
  },
  {
    id: 'orthogonal',
    term: 'Orthogonal complement',
    def: 'For a subspace V, V⊥ is all vectors with dot product 0 against every vector in V. C(A)⊥ = N(Aᵀ) and C(Aᵀ)⊥ = N(A).',
    see: [
      {
        href: `/spaces?preset=dep-rows&thm=ftla&note=${note('Verify strip checks C(A) ⊥ N(Aᵀ).')}`,
        label: 'Spaces · orthogonality checks',
      },
    ],
    tags: ['spaces', 'theorems'],
  },
  {
    id: 'determinant',
    term: 'Determinant',
    also: ['det A'],
    def: 'A scalar for square matrices. det A ≠ 0 ⇔ A is invertible ⇔ full rank ⇔ N(A) = {0}.',
    see: [
      {
        href: `/matrix?preset=full3&note=${note('Full rank 3×3 — nonzero determinant.')}`,
        label: 'Matrix · invertible',
      },
      {
        href: `/matrix?preset=singular&note=${note('Singular 2×2 — det = 0.')}`,
        label: 'Matrix · singular',
      },
    ],
    tags: ['matrix'],
  },
  {
    id: 'exact-rationals',
    term: 'Exact rationals',
    also: ['ℚ'],
    def: 'This lab computes over fractions in lowest terms — no floating-point drift. Verification identities hold exactly.',
    see: [
      {
        href: `/matrix?preset=strang&tab=rref&note=${note('RREF entries are exact fractions.')}`,
        label: 'Matrix · exact RREF',
      },
    ],
    tags: ['general', 'matrix'],
  },
];

export function glossaryById(id: string): GlossaryTerm | undefined {
  return GLOSSARY.find((t) => t.id === id);
}

export function glossaryLetters(terms: GlossaryTerm[] = GLOSSARY): string[] {
  const set = new Set(terms.map((t) => t.term[0]!.toUpperCase()));
  return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter((L) => set.has(L));
}
