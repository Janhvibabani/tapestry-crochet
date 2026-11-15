/** How much to wash out a row (0 = full colour). */
export const FOCUS_DIM = 0.5;
export const DONE_DIM = 0.62;

/**
 * Focus mode: everything but the current row goes dimmer.
 * Normal mode: only finished rows (below the current one) fade.
 */
export function rowDim(row: number, currentRow: number, focus: boolean): number {
  if (focus) return row === currentRow ? 0 : FOCUS_DIM;
  return row < currentRow ? DONE_DIM : 0;
}
