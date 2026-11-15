/**
 * New scroll offset (one axis) so the stitch under the pointer stays under it after zooming.
 * `point` is the pointer's distance from the scroll box's edge, `origin` where the grid starts in the content.
 */
export function scrollAfterZoom(a: { scroll: number; point: number; origin: number; oldSize: number; newSize: number }): number {
  const content = a.scroll + a.point;
  if (content <= a.origin) return a.scroll; // pointer over the row numbers: nothing to anchor to
  const cells = (content - a.origin) / a.oldSize;
  return Math.max(0, a.origin + cells * a.newSize - a.point);
}

export function clampZoom(size: number, min: number, max: number): number {
  return Math.round(Math.min(max, Math.max(min, size)) * 100) / 100;
}

/** Range of cells (x1/y1 exclusive) inside a viewport given in grid pixel coordinates, plus one cell of margin. */
export function visibleCells(v: { x: number; y: number; w: number; h: number; cellSize: number; cols: number; rows: number }) {
  return {
    x0: Math.max(0, Math.floor(v.x / v.cellSize) - 1),
    x1: Math.min(v.cols, Math.ceil((v.x + v.w) / v.cellSize) + 1),
    y0: Math.max(0, Math.floor(v.y / v.cellSize) - 1),
    y1: Math.min(v.rows, Math.ceil((v.y + v.h) / v.cellSize) + 1),
  };
}
