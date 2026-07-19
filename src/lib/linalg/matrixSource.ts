/**
 * Shared matrix source for desks: catalog preset or custom edit buffer.
 */

import { formatFrac, parseFrac, type Frac } from './frac';
import {
  type Matrix,
  cloneMatrix,
} from './matrix';
import { PRESETS, defaultPreset, presetById, type MatrixPreset } from './catalog';
import { decodeMatrix } from './urlMatrix';

export const MAX_EDIT_DIM = 5;

export type MatrixSource =
  | { kind: 'preset'; id: string }
  | { kind: 'custom'; matrix: Matrix; label?: string };

export function sourceMatrix(src: MatrixSource): Matrix {
  if (src.kind === 'preset') {
    return cloneMatrix((presetById(src.id) ?? defaultPreset()).matrix);
  }
  return cloneMatrix(src.matrix);
}

export function sourceLabel(src: MatrixSource): string {
  if (src.kind === 'preset') {
    return (presetById(src.id) ?? defaultPreset()).label;
  }
  return src.label ?? 'Custom';
}

export function sourceBlurb(src: MatrixSource): string {
  if (src.kind === 'preset') {
    return (presetById(src.id) ?? defaultPreset()).blurb;
  }
  return 'Custom matrix — shareable via ?A=… in the URL when you copy the link.';
}

/**
 * Resolve matrix source from deep-link params.
 * Prefer ?A= encoded matrix; else ?preset=.
 * @param fallbackPreset — desk-specific default (do not use Strang on Basis/Eigen).
 */
export function sourceFromParams(
  preset: string | null,
  encodedA: string | null,
  fallbackPreset?: string,
): MatrixSource {
  if (encodedA) {
    const M = decodeMatrix(encodedA);
    if (M) return { kind: 'custom', matrix: M, label: 'URL matrix' };
  }
  if (preset && presetById(preset)) return { kind: 'preset', id: preset };
  const fb =
    fallbackPreset && presetById(fallbackPreset)
      ? fallbackPreset
      : defaultPreset().id;
  return { kind: 'preset', id: fb };
}

export function matrixToStrings(A: Matrix): string[][] {
  return A.map((row) => row.map((c) => formatFrac(c).replace(/−/g, '-')));
}

export function stringsToMatrix(cells: string[][]): Matrix | null {
  if (cells.length === 0) return null;
  const n = cells[0]!.length;
  const out: Matrix = [];
  for (const row of cells) {
    if (row.length !== n) return null;
    const parsed: Frac[] = [];
    for (const s of row) {
      const f = parseFrac(s);
      if (!f) return null;
      parsed.push(f);
    }
    out.push(parsed);
  }
  return out;
}

export function resizeStringGrid(
  cells: string[][],
  m: number,
  n: number,
): string[][] {
  const mm = Math.max(1, Math.min(MAX_EDIT_DIM, m));
  const nn = Math.max(1, Math.min(MAX_EDIT_DIM, n));
  const out: string[][] = [];
  for (let i = 0; i < mm; i++) {
    const row: string[] = [];
    for (let j = 0; j < nn; j++) {
      row.push(cells[i]?.[j] ?? '0');
    }
    out.push(row);
  }
  return out;
}

export function emptyStringGrid(m: number, n: number): string[][] {
  return resizeStringGrid([], m, n);
}

export { PRESETS, defaultPreset, presetById };
export type { MatrixPreset };

