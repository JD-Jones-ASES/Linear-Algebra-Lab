/**
 * Human connection tours — multi-stop stories with deep links.
 */

export interface TourStop {
  href: string;
  label: string;
  lookAt: string;
}

export interface Tour {
  id: string;
  title: string;
  blurb: string;
  stops: TourStop[];
}

function note(s: string): string {
  return encodeURIComponent(s);
}

export const TOURS: Tour[] = [
  {
    id: 'meet-four',
    title: 'Meet the four subspaces',
    blurb:
      'Start with a friendly wide matrix, read the four dimensions, then see how a tall matrix flips the story to the left nullspace.',
    stops: [
      {
        href: `/spaces?preset=strang&note=${note(
          'Start here: C(A) and C(Aᵀ) both dim 2; N(A) dim 1; N(Aᵀ) trivial.',
        )}`,
        label: 'Spaces · wide 2×3',
        lookAt: 'four dim badges',
      },
      {
        href: `/matrix?preset=strang&tab=rref&note=${note(
          'Same matrix in RREF — pivots and the free column that builds N(A).',
        )}`,
        label: 'Matrix · RREF',
        lookAt: 'pivot / free marks',
      },
      {
        href: `/spaces?preset=tall&focus=leftNull&note=${note(
          'Transpose the geometry: tall matrix, nontrivial left nullspace.',
        )}`,
        label: 'Spaces · tall, left null',
        lookAt: 'N(Aᵀ) basis',
      },
    ],
  },
  {
    id: 'axb-story',
    title: 'When does A x = b have a solution?',
    blurb:
      'Column space is the gatekeeper. Same singular A, two different b vectors — one in, one out.',
    stops: [
      {
        href: `/spaces?preset=singular&focus=col&note=${note(
          'Column space is a line in ℚ². b must land on that line.',
        )}`,
        label: 'Spaces · C(A) of singular 2×2',
        lookAt: 'column basis',
      },
      {
        href: `/solve?preset=singular&b=in&thm=solvability&note=${note(
          'b in C(A) — solutions exist (a whole line of them).',
        )}`,
        label: 'Solve · consistent',
        lookAt: 'particular + nullspace',
      },
      {
        href: `/solve?preset=singular&b=out&thm=solvability&note=${note(
          'b off the line — no solution. Rank of [A|b] jumps.',
        )}`,
        label: 'Solve · inconsistent',
        lookAt: 'inconsistent badge',
      },
    ],
  },
  {
    id: 'rank-collapse',
    title: 'What rank-1 collapses',
    blurb:
      'One independent column (and row). Nullspaces on both sides get large — watch dims 1,2,1,2.',
    stops: [
      {
        href: `/spaces?preset=rank1&thm=four-subspaces&note=${note(
          'Rank-1 3×3: dim C(A)=1, dim N(A)=2, dim N(Aᵀ)=2.',
        )}`,
        label: 'Spaces · rank-1',
        lookAt: 'dims 1,2,1,2',
      },
      {
        href: `/matrix?preset=rank1&tab=both&note=${note(
          'A and RREF side by side — only one pivot survives.',
        )}`,
        label: 'Matrix · A and RREF',
        lookAt: 'single pivot column',
      },
    ],
  },
,

  {
    id: 'projection-picture',
    title: 'Projection and residual',
    blurb:
      'When Ax = b has no exact solution, the Project desk finds the nearest p in C(A). The leftover r lives in N(Aᵀ).',
    stops: [
      {
        href: `/solve?preset=singular&b=out&note=${note(
          'Inconsistent: b is not in C(A).',
        )}`,
        label: 'Solve · inconsistent',
        lookAt: 'inconsistent badge',
      },
      {
        href: `/project?preset=singular&b=out&thm=projection&note=${note(
          'Same A and b-class: projection p and residual r with Aᵀr = 0.',
        )}`,
        label: 'Project · residual',
        lookAt: 'p, r, geometry',
      },
      {
        href: `/spaces?preset=singular&focus=leftNull&note=${note(
          'Left nullspace direction matches the residual line.',
        )}`,
        label: 'Spaces · N(Aᵀ)',
        lookAt: 'left null basis',
      },
    ],
  },
];

export function tourById(id: string | null | undefined): Tour | null {
  if (!id) return null;
  return TOURS.find((t) => t.id === id) ?? null;
}
