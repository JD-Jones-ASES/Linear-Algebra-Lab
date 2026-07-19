# Linear Algebra Lab

**v0.3.0** · Interactive desk for **linear algebra over exact rationals ℚ** — four fundamental subspaces, projections, change of basis, eigenvalues, 2D/3D geometry.

> Explore the matrix, then name the subspaces.

**Private repo** (for now): [JD-Jones-ASES/Linear-Algebra-Lab](https://github.com/JD-Jones-ASES/Linear-Algebra-Lab)

Sibling to [Algebra Lab](https://github.com/JD-Jones-ASES/Algebra-Lab).

## Features

| Area | Route | Highlights |
|------|-------|------------|
| Matrix | `/matrix` | Edit ℚ matrices, RREF, `?A=` deep links |
| Spaces | `/spaces` | Four fundamental subspaces + viz |
| Solve | `/solve` | Ax=b, affine solution set xₚ + N(A) |
| Project | `/project` | Least squares, residual in N(Aᵀ) |
| Basis | `/basis` | P, P⁻¹, [T]_B, Gram–Schmidt |
| Eigen | `/eigen` | λ and eigenspaces over ℚ (n≤3) |
| Guide | `/theorems`, `/connect`, `/glossary` | Labels + deep links |

## Run

```bash
pnpm install
pnpm dev
pnpm test
pnpm test:e2e
pnpm build
```

## Deep links

- `?preset=strang` — catalog
- `?A=1,2;3,4` — custom matrix (rows `;`, entries `,`, fractions `n/d`)
- `?thm=`, `?note=`, `?focus=`, `?b=in|out`, `?T=` (basis desk map)

## Stack

Astro + React + TypeScript · pure `src/lib/linalg` · Three.js 3D · Vitest + Playwright · pnpm · L1 static

## License

MIT © 2026 JD Jones
