/**
 * Named theorems — sticky notes on glass already in the desks.
 */

export interface TheoremStop {
  href: string;
  label: string;
  lookAt: string;
}

export interface NamedTheorem {
  id: string;
  name: string;
  formal: string;
  why: string;
  lookFor: string;
  rooms: Array<'matrix' | 'spaces' | 'solve' | 'project' | 'basis' | 'eigen' | 'connect'>;
  stops: TheoremStop[];
}

function note(s: string): string {
  return encodeURIComponent(s);
}

export const THEOREMS: NamedTheorem[] = [
  {
    id: 'four-subspaces',
    name: 'Four fundamental subspaces',
    formal: 'C(A), N(A), C(Aᵀ), N(Aᵀ) with dim r, n−r, r, m−r',
    why: 'One matrix carves four subspaces. Their dimensions and orthogonalities are the architecture of A x = b.',
    lookFor:
      'Four dim badges should read r, n−r, r, m−r and the verify strip should be all green.',
    rooms: ['spaces', 'matrix'],
    stops: [
      {
        href: `/spaces?preset=strang&thm=four-subspaces&note=${note(
          'Wide 2×3: rank 2, nullity 1. Four dims: 2, 1, 2, 0.',
        )}`,
        label: 'Spaces · Strang 2×3',
        lookAt: 'dims 2,1,2,0 and N(A) one basis vector',
      },
      {
        href: `/spaces?preset=tall&focus=leftNull&thm=four-subspaces&note=${note(
          'Tall 3×2: left nullspace dim 1 — dependence among three rows in image of ℝ².',
        )}`,
        label: 'Spaces · tall matrix, left null',
        lookAt: 'N(Aᵀ) highlighted, dim m−r = 1',
      },
      {
        href: `/spaces?preset=rank1&thm=four-subspaces&note=${note(
          'Rank-1: big nullspace (dim 2) and left nullspace (dim 2).',
        )}`,
        label: 'Spaces · rank-1',
        lookAt: 'dims 1,2,1,2',
      },
    ],
  },
  {
    id: 'rank-nullity',
    name: 'Rank–nullity theorem',
    formal: 'rank(A) + dim N(A) = n',
    why: 'Pivot columns plus free columns partition the n unknowns. Every free variable grows the nullspace by one.',
    lookFor: 'rank + nullity equals the number of columns n.',
    rooms: ['spaces', 'matrix'],
    stops: [
      {
        href: `/spaces?preset=strang&thm=rank-nullity&note=${note(
          'rank 2 + nullity 1 = 3 = n. Free column paints the nullspace.',
        )}`,
        label: 'Spaces · free column',
        lookAt: 'rank–nullity line and freeCols',
      },
      {
        href: `/matrix?preset=full3&thm=rank-nullity&note=${note(
          'Full column rank: nullity 0, rank = n = 3.',
        )}`,
        label: 'Matrix · full rank 3×3',
        lookAt: 'rank 3, empty nullspace',
      },
    ],
  },
  {
    id: 'ftla',
    name: 'Fundamental theorem (part I)',
    formal: 'dim C(A) = dim C(Aᵀ) = r ·· C(A)⊥N(Aᵀ), C(Aᵀ)⊥N(A)',
    why: 'Row rank equals column rank, and the two orthogonal pairs split the domain and codomain.',
    lookFor: 'Matching r on C(A) and C(Aᵀ); orthogonality checks green.',
    rooms: ['spaces'],
    stops: [
      {
        href: `/spaces?preset=dep-rows&focus=leftNull&thm=ftla&note=${note(
          'Row dependence → nontrivial left nullspace, orthogonal to every column.',
        )}`,
        label: 'Spaces · dependent rows',
        lookAt: 'left null basis · columns = 0',
      },
    ],
  },
  {
    id: 'solvability',
    name: 'Solvability of A x = b',
    formal: 'A x = b has a solution  ⇔  b ∈ C(A)',
    why: 'b must be a combination of the columns. If not, the augmented matrix gains an extra pivot.',
    lookFor:
      'Consistent systems land b in the column space; inconsistent ones show rank[A|b] > rank(A).',
    rooms: ['solve', 'spaces'],
    stops: [
      {
        href: `/solve?preset=singular&b=in&thm=solvability&note=${note(
          'b is a multiple of the columns — consistent, free variable remains.',
        )}`,
        label: 'Solve · singular, b in C(A)',
        lookAt: 'consistent badge, particular solution',
      },
      {
        href: `/solve?preset=singular&b=out&thm=solvability&note=${note(
          'b not in C(A) — inconsistent. Watch rank of the augmented matrix.',
        )}`,
        label: 'Solve · singular, b outside',
        lookAt: 'inconsistent, no particular solution',
      },
    ],
  },
  {
    id: 'rref-pivots',
    name: 'Pivots and free variables',
    formal: 'RREF isolates pivot columns; free columns parametrize N(A)',
    why: 'The reduced form is bookkeeping: each pivot solves for one variable; free variables become basis directions in the nullspace.',
    lookFor: 'Highlighted pivot columns in RREF; free columns match nullity.',
    rooms: ['matrix', 'spaces'],
    stops: [
      {
        href: `/matrix?preset=strang&tab=rref&thm=rref-pivots&note=${note(
          'RREF of the 2×3: two pivots, one free column.',
        )}`,
        label: 'Matrix · RREF view',
        lookAt: 'pivot vs free column marks',
      },
    ],
  },
  {
    id: 'projection',
    name: 'Projection theorem',
    formal: 'b = p + r with p ∈ C(A), r ∈ N(Aᵀ), p ⊥ r',
    why: 'The closest point of C(A) to b is the orthogonal projection. Least squares solves AᵀA x̂ = Aᵀb so that the residual is perpendicular to every column.',
    lookFor: 'p in the column space, residual orthogonal (Aᵀr = 0), verify badges green.',
    rooms: ['project', 'spaces'],
    stops: [
      {
        href: `/project?preset=singular&b=out&thm=projection&note=${note(
          'b outside C(A): p is the nearest column-space point; r points along N(Aᵀ).',
        )}`,
        label: 'Project · singular, b out',
        lookAt: 'p, r, and Aᵀr = 0',
      },
      {
        href: `/project?preset=tall&b=out&thm=projection&note=${note(
          'Tall matrix: residual in left nullspace — watch the 3D picture.',
        )}`,
        label: 'Project · tall matrix',
        lookAt: 'geometry panel',
      },
    ],
  },
  {
    id: 'normal-eq',
    name: 'Normal equations',
    formal: 'Aᵀ A x̂ = Aᵀ b',
    why: 'Multiplying by Aᵀ turns a possibly inconsistent system into a consistent system whose solution minimizes ‖Ax − b‖.',
    lookFor: 'Normal matrix AᵀA displayed; AᵀA x̂ = Aᵀb badge green.',
    rooms: ['project'],
    stops: [
      {
        href: `/project?preset=strang&b=out&thm=normal-eq&note=${note(
          'Wide matrix: AᵀA is 3×3; LS still yields a unique projection p.',
        )}`,
        label: 'Project · Strang 2×3',
        lookAt: 'AᵀA and x̂',
      },
    ],
  },
  {
    id: 'change-of-basis',
    name: 'Change of basis',
    formal: '[v]_B = P⁻¹ v ·· [T]_B = P⁻¹ T P',
    why: 'The same linear map wears different matrix clothes in different bases. Similarity preserves eigenvalues and trace.',
    lookFor: 'P invertible, P P⁻¹ = I, and tr T = tr [T]_B.',
    rooms: ['basis'],
    stops: [
      {
        href: `/basis?preset=basis-rot&T=eigen-sym&thm=change-of-basis&note=${note(
          'P from Integer basis; T symmetric — compare T and [T]_B.',
        )}`,
        label: 'Basis · P and [T]_B',
        lookAt: 'P⁻¹ and similarity trace badge',
      },
    ],
  },
  {
    id: 'gram-schmidt',
    name: 'Gram–Schmidt',
    formal: 'v_k ↦ u_k orthogonal by subtracting projections',
    why: 'Builds an orthogonal basis from any spanning list — the algorithm behind QR in exact arithmetic.',
    lookFor: 'Orthogonal uᵢ with uᵢ · uⱼ = 0 for i ≠ j.',
    rooms: ['basis'],
    stops: [
      {
        href: `/basis?preset=basis-rot&thm=gram-schmidt&note=${note(
          'Columns of P run through Gram–Schmidt — check pairwise dots.',
        )}`,
        label: 'Basis · Gram–Schmidt',
        lookAt: 'orthogonal badge',
      },
    ],
  },
  {
    id: 'eigenvalue',
    name: 'Eigenvalue equation',
    formal: 'A v = λ v with v ≠ 0',
    why: 'Eigenvectors are directions the map only stretches. Over ℚ we only see eigenvalues that split rationally.',
    lookFor: 'A v = λ v badges green; eigenlines in the geometry panel.',
    rooms: ['eigen', 'basis'],
    stops: [
      {
        href: `/eigen?preset=eigen-sym&thm=eigenvalue&note=${note(
          'λ = 3 and λ = 1 with orthogonal eigenspaces.',
        )}`,
        label: 'Eigen · symmetric',
        lookAt: 'pairs and picture',
      },
      {
        href: `/eigen?preset=eigen-jordan&thm=eigenvalue&note=${note(
          'Jordan block: alg mult 2, geo mult 1.',
        )}`,
        label: 'Eigen · Jordan',
        lookAt: 'geometric multiplicity',
      },
    ],
  },
  {
    id: 'affine-solution',
    name: 'Affine solution set',
    formal: 'x = xₚ + N(A) when consistent',
    why: 'All solutions are a particular solution plus every nullspace vector — an affine translate of N(A).',
    lookFor: 'Particular xₚ and nullspace directions; free vars match dim.',
    rooms: ['solve'],
    stops: [
      {
        href: `/solve?preset=strang&b=in&thm=affine-solution&note=${note(
          'Underdetermined: line of solutions through xₚ along N(A).',
        )}`,
        label: 'Solve · free variable',
        lookAt: 'particular + nullspace',
      },
    ],
  },
];

export function theoremById(id: string | null | undefined): NamedTheorem | null {
  if (!id) return null;
  return THEOREMS.find((t) => t && t.id === id) ?? null;
}

export function theoremsForRoom(
  room: NamedTheorem['rooms'][number],
): NamedTheorem[] {
  return THEOREMS.filter((t) => t && t.rooms.includes(room));
}
