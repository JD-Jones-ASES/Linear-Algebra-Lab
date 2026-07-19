# Linear Algebra Lab

**v0.1.0** · Interactive desk for **linear algebra over exact rationals ℚ** — matrices, RREF, the **four fundamental subspaces**, solving Ax = b, with a theorem shelf, connection tours, and a glossary.

> Explore the matrix, then name the subspaces.

Sibling portal to [Algebra Lab](https://github.com/JD-Jones-ASES/Algebra-Lab). Same Guide / Desk / Orient pattern.

## Features

| Area | Route | Highlights |
|------|-------|------------|
| **Home** | `/` | Portal hub — Guide vs Desk |
| **Theorem shelf** | `/theorems` | Four subspaces, rank–nullity, FTLA, solvability, pivots |
| **Connect** | `/connect` | Tours across rooms with prepared deep links |
| **Glossary** | `/glossary` | A–Z terms with “See it” deep links |
| **Matrix** | `/matrix` | A / RREF / both, pivots vs free columns, rank, det |
| **Spaces** | `/spaces` | C(A), N(A), C(Aᵀ), N(Aᵀ) bases + identity checks |
| **Solve** | `/solve` | Ax = b consistency, particular + nullspace |
| **Map / Theory** | `/map`, `/theory` | Landscape + light prose |

Deep links (`?preset=`, `?focus=`, `?tab=`, `?b=`, `?thm=`, `?note=`, `?tag=`) land fully prepared. Amber banners state what you should already see.

## Stack

- [Astro](https://astro.build) + React islands + TypeScript
- Pure domain math under `src/lib/linalg/` (no UI imports)
- Pedagogy data under `src/lib/connect/`
- Vitest (unit) + Playwright (smoke e2e)
- pnpm

**Level:** L1 simple personal app — static, client-only, no backend.

## Requirements

- Node.js ≥ 22.12
- pnpm

## Run

```bash
pnpm install
pnpm dev
# → http://localhost:4321/
```

```bash
pnpm test        # Vitest (domain math)
pnpm test:e2e    # Playwright smoke
pnpm build
pnpm preview
```

## Project layout

| Path | Role |
|------|------|
| `src/lib/linalg/` | Exact ℚ matrices, RREF, four subspaces, solve |
| `src/lib/connect/` | Tours, theorems, glossary, deep-link helpers |
| `src/components/*/` | Workshops, shelf, shared UI |
| `e2e/` | Playwright smoke tests |
| `AGENTS.md` | Conventions for coding agents |

## Pedagogy spine

**Four fundamental subspaces** (Strang):

| Symbol | Name | Ambient | dim |
|--------|------|---------|-----|
| C(A) | Column space | ℚᵐ | r |
| N(A) | Nullspace | ℚⁿ | n − r |
| C(Aᵀ) | Row space | ℚⁿ | r |
| N(Aᵀ) | Left nullspace | ℚᵐ | m − r |

Verification badges certify the **implementation** (rank–nullity, orthogonality, kernel membership), not a formal proof assistant.

## Scope limits (v0.1)

- Exact rationals only (no float ℝ/ℂ yet)
- Catalog presets; small m, n
- No eigenvalues / SVD / least squares yet
- Unicode math in the UI — never raw LaTeX
- Local git only until JD wants a remote

## Credits

- **JD Jones** — concept, priorities, testing, product judgment
- **Grok (xAI)** — design, engineering, and implementation

## License

[MIT](./LICENSE) © 2026 JD Jones
