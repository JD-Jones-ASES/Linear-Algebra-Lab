# Linear Algebra Lab

**v0.2.0** · Interactive desk for **linear algebra over exact rationals ℚ** — editable matrices, RREF, the **four fundamental subspaces**, solving Ax = b, **orthogonal projection / least squares**, with **2D SVG and 3D (Three.js)** pictures when ambient dimension is 2 or 3.

> Explore the matrix, then name the subspaces.

Sibling portal to [Algebra Lab](https://github.com/JD-Jones-ASES/Algebra-Lab). Same Guide / Desk / Orient pattern.

## Features

| Area | Route | Highlights |
|------|-------|------------|
| **Home** | `/` | Portal hub — Guide vs Desk |
| **Theorem shelf** | `/theorems` | Four subspaces, rank–nullity, projection, normal equations |
| **Connect** | `/connect` | Tours with prepared deep links |
| **Glossary** | `/glossary` | A–Z with “See it” deep links |
| **Matrix** | `/matrix` | Edit ℚ matrices, RREF, pivots, column vectors viz |
| **Spaces** | `/spaces` | C(A), N(A), C(Aᵀ), N(Aᵀ) + codomain picture |
| **Solve** | `/solve` | Ax = b exact consistency |
| **Project** | `/project` | Least squares, p ∈ C(A), r ∈ N(Aᵀ), 2D/3D geometry |
| **Map / Theory** | `/map`, `/theory` | Landscape + light prose |

Deep links (`?preset=`, `?focus=`, `?tab=`, `?b=`, `?thm=`, `?note=`, `?tag=`) land fully prepared.

## Stack

- Astro + React islands + TypeScript
- Pure domain under `src/lib/linalg/` (exact ℚ)
- Pedagogy under `src/lib/connect/`
- Viz: SVG 2D + Three.js 3D (display float only)
- Vitest + Playwright
- pnpm

**Level:** L1 static client-only site.

## Run

```bash
pnpm install
pnpm dev
# → http://localhost:4321/
```

```bash
pnpm test
pnpm test:e2e
pnpm build
```

## Pedagogy spine

**Four fundamental subspaces** (Strang): dims r, n−r, r, m−r.  
**Projection:** b = p + r with p ∈ C(A), r ∈ N(Aᵀ).

Verification badges certify the **implementation**, not a proof assistant. Drawings use float scale; algebra stays exact ℚ.

## Scope (v0.2)

- Exact fractions only in editors (no decimals)
- Editable size ≤ 5×5
- Viz for ambient dim 2 and 3
- Custom matrices are session-local (tours use presets)
- Local git only until JD wants a remote

## Credits

- **JD Jones** — concept, priorities, testing, product judgment
- **Grok (xAI)** — design, engineering, and implementation

## License

[MIT](./LICENSE) © 2026 JD Jones
