# Linear Algebra Lab — Agent Rules

Conventions for coding agents working in this repository.

## Goal

Interactive linear algebra desk over **exact rationals ℚ**: compute matrices, read off the **four fundamental subspaces**, solve Ax = b, then label pictures with **connection tours**, a **theorem shelf**, and a **glossary**.

Tagline habit: *Explore the matrix, then name the subspaces.*

## Engineering level

**L1 — Simple app**

Personal math tool, single user, static client-only site, no multi-tenant data. Prefer the simplest approach that meets the goal. Do not enterprise-ify unless the project is deliberately re-leveled.

## Stack

- Astro + React islands + TypeScript
- Domain: pure TS under `src/lib/linalg/` (no UI imports)
- Pedagogy data: `src/lib/connect/` (tours, theorems, glossary, deepLink)
- Vitest (math) + Playwright (smoke e2e)
- pnpm

## Commands

```bash
pnpm install
pnpm dev
pnpm test        # Vitest
pnpm test:e2e    # Playwright (starts dev server)
pnpm build
pnpm preview
```

## Pedagogy rules

1. **Deep links land fully prepared** — preset, highlighted subspace, `?thm=` / `?note=` / `?tag=`. No “then pick the right matrix.”
2. **Banners say what to look at** — especially when two dimensions live in one room (rank vs nullity).
3. **Theorem shelf = labels, not a second textbook** — display is the picture; name is the sticky note.
4. **Glossary “See it”** uses the same deep-link rule as tours.
5. **Four Fundamental Subspaces** is the spine — C(A), N(A), C(Aᵀ), N(Aᵀ) with dim relations.
6. **Unicode math in UI** — never raw LaTeX.
7. **Astro whitespace** — after `</em>` / `</a>` / `</strong>`, use `{' '}` or same-line space.

## Information architecture

- **Guide:** Theorems, Connect, Glossary, Theory
- **Desk:** Matrix, Spaces (four subspaces), Solve (Ax = b)
- **Orient:** Map (`/map`), Home

## Domain notes

- Default field: **ℚ (exact fractions)**. Float ℝ is out of scope for v0.1 unless labeled later.
- Prefer extending `src/lib/linalg` before UI hacks.
- Verification badges certify the **implementation** (rank–nullity identities, subspace membership), not a proof assistant.
- Keep matrix UI comfortable for small sizes (e.g. m,n ≤ 6 for interactive desks).

## GitHub Pages (when public)

- Data hrefs stay root-app (`/spaces?preset=…`); call `withBase()` from `src/lib/basePath.ts` when rendering `<a href>`.
- Deploy would set `ASTRO_BASE=/Linear-Algebra-Lab`.

## Related

Brain pattern: `Grok-Brain/Docs/portal-pattern.md` · sibling: Algebra Lab.
