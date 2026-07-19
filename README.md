# Linear Algebra Lab

**v0.3.1** · Interactive desk for **linear algebra over exact rationals ℚ** — four fundamental subspaces, projections, basis change, eigenvalues, 2D/3D geometry.

> Explore the matrix, then name the subspaces.

**Live site:** [https://jd-jones-ases.github.io/Linear-Algebra-Lab/](https://jd-jones-ases.github.io/Linear-Algebra-Lab/)

Sibling to [Algebra Lab](https://github.com/JD-Jones-ASES/Algebra-Lab).

## Desks

| Desk | Route | Highlights |
|------|-------|------------|
| Matrix | `/matrix` | Edit A, RREF, det as area (2×2), share / send-to |
| Spaces | `/spaces` | C(A), N(A), C(Aᵀ), N(Aᵀ) + viz |
| Solve | `/solve` | Ax=b, **editable b**, affine xₚ + N(A) |
| Project | `/project` | Least squares, editable b, residual |
| Basis | `/basis` | P, P⁻¹, [T]_B, Gram–Schmidt |
| Eigen | `/eigen` | λ over ℚ (n≤3), eigenspaces |

Guide: Theorems · Connect · Glossary · Theory · Map

## Deep links

- `?preset=area2` — catalog
- `?A=1,2;3,4` — custom matrix (`;` rows, `,` entries, `n/d` fractions)
- `?b=in|out|1,2` — RHS mode or custom vector on Solve/Project
- `?thm=` · `?note=` · `?focus=` · `?tab=` · `?T=` (basis map)

## Run

```bash
pnpm install && pnpm dev
pnpm test && pnpm test:e2e && pnpm build
```

Pages deploy sets `ASTRO_BASE=/Linear-Algebra-Lab` (see `.github/workflows/pages.yml`).

## Scope

- Exact ℚ only (no float SVD)
- Interactive size ≤ 5×5
- Eigenvalues only when they split over ℚ
- Implementation badges ≠ formal proofs

## License

MIT © 2026 JD Jones
