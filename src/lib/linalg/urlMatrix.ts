/**
 * URL encode/decode for shareable custom matrices.
 * Format: rows `;` separated, entries `,` separated. Fractions as n/d.
 * Example: A=1,2;3,4  or  A=1/2,0;0,1
 */

import { formatFrac, parseFrac } from './frac';
import { type Matrix, rows, cols } from './matrix';
import { MAX_EDIT_DIM } from './matrixSource';

export function encodeMatrix(A: Matrix): string {
  return A.map((row) =>
    row.map((c) => formatFrac(c).replace(/−/g, '-')).join(','),
  ).join(';');
}

export function decodeMatrix(raw: string | null | undefined): Matrix | null {
  if (!raw) return null;
  const rowStrs = raw
    .trim()
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  if (rowStrs.length === 0 || rowStrs.length > MAX_EDIT_DIM) return null;
  const matrix: Matrix = [];
  let n = -1;
  for (const rs of rowStrs) {
    const cells = rs.split(',').map((s) => s.trim());
    if (cells.length === 0 || cells.length > MAX_EDIT_DIM) return null;
    if (n < 0) n = cells.length;
    if (cells.length !== n) return null;
    const row = [];
    for (const c of cells) {
      const f = parseFrac(c);
      if (!f) return null;
      row.push(f);
    }
    matrix.push(row);
  }
  return matrix;
}

/** Build query fragment for sharing (without leading ?). */
export function matrixQuery(A: Matrix, extra: Record<string, string> = {}): string {
  const params = new URLSearchParams();
  params.set('A', encodeMatrix(A));
  for (const [k, v] of Object.entries(extra)) params.set(k, v);
  return params.toString();
}

export function matrixFromSearch(
  search: string | URLSearchParams,
): Matrix | null {
  const sp =
    typeof search === 'string'
      ? new URLSearchParams(
          search.startsWith('?') ? search.slice(1) : search,
        )
      : search;
  return decodeMatrix(sp.get('A'));
}

export function describeEncoded(A: Matrix): string {
  return `${rows(A)}×${cols(A)} · ${encodeMatrix(A)}`;
}
