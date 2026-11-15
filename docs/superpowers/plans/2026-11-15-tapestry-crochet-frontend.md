# Tapestry Crochet Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A pastel, poster-styled Next.js app that turns an uploaded image into a one-colour-per-stitch crochet grid, a handedness-aware row pattern, and a crochet-mode row tracker.

**Architecture:** Everything runs in the browser. Pure TypeScript modules in `src/lib/` do pixelation (cell averaging + k-means), pattern building, palette merging and progress stepping, all unit-tested with Vitest. A Zustand store (persisted to localStorage) holds the grid/palette/settings/progress; three App Router pages (`/`, `/studio`, `/crochet`) render it with shared hand-drawn UI components.

**Tech Stack:** Next.js (latest, App Router, TypeScript, `src/` dir), Tailwind CSS v4, Zustand (+ `persist`), Vitest, `next/font/google`.

**Spec:** `docs/superpowers/specs/2026-11-15-tapestry-crochet-frontend-design.md` (visual reference: `docs/reference/tiny-treasures-poster.png`)

## Global Constraints

- One cell = one stitch = exactly one palette colour. Stitches are square (no aspect correction).
- Rows numbered from the bottom: pattern Row 1 = last array row of the grid (`grid[rows - 1]`).
- Right-handed: Row 1 right→left, alternating. Left-handed: Row 1 left→right, alternating.
- Runs and stitch numbers are in working order (direction of that row).
- Stitches wide: 10–150, default 40. Colours: 2–12, default 6. Handedness default right.
- Default colour names "Colour A", "Colour B", … .
- Progress stored as physical `{ row (1-based from bottom), col (0-based from left) }`; resets only on a new grid, with confirm if progress is past Row 1 stitch 1.
- The original image is never persisted; only grid/palette/settings/progress.
- Mobile first; no horizontal page scroll; grid scrolls in its own container; tap targets ≥ 44px.
- Palette tokens: cream bg `#FBF5E9`, ink brown `#5B3A29`, mint `#CFE8DC`, lilac `#E3D3EE`, butter `#F8EDB5`, peach `#F9D7C0`, baby blue `#CFE2F3`, blush `#F6CFD8`.
- Fonts: display `Cherry Bomb One`, body `Patrick Hand`.

## Review Focus

1. Very tall/narrow image (e.g. 100×2000 px at 150 wide) → rows capped at 300 with cols reduced to keep proportions, not a 3000-row grid that freezes the page. *(Task 2 test `caps rows at 300`)*
2. Image with fewer distinct colours than requested (2-colour logo, 6 colours asked) → palette shrinks to the colours actually used; no empty or duplicate swatches. *(Task 2 test `drops unused palette entries`)*
3. Transparent PNG → transparent areas become white, not black. *(Task 2 test `composites transparency onto white`)*
4. Stale/out-of-range saved progress (e.g. grid replaced, localStorage edited) → position clamped into the grid, no crash. *(Task 4 test `clampPosition`)*
5. Unsupported/undecodable file (HEIC on desktop Chrome, a PDF) → friendly "couldn't read that image" message, app stays usable. *(Task 7 manual check)*

---

### Task 1: Project scaffold + test runner

**Files:**
- Create: Next.js app via `create-next-app` in repo root; `vitest.config.ts`; `src/lib/types.ts`; `src/lib/types.test.ts`
- Modify: `package.json` (add `"test": "vitest run"`), `.gitignore`

**Interfaces:**
- Produces (`src/lib/types.ts`):
  ```ts
  export type RGB = [number, number, number];
  export type Handedness = "right" | "left";
  export type Direction = "rtl" | "ltr";
  export interface PaletteColor { rgb: RGB; name: string }
  export type Grid = number[][]; // grid[y][x], y=0 is TOP of image; values index into palette
  export const LIMITS = { colsMin: 10, colsMax: 150, colsDefault: 40, colorsMin: 2, colorsMax: 12, colorsDefault: 6, rowsMax: 300 } as const;
  export function defaultColorName(i: number): string; // 0 -> "Colour A"
  ```

- [ ] **Step 1:** Scaffold: `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes` (move `docs/` aside temporarily if it refuses a non-empty dir). Install `zustand`, dev `vitest`.
- [ ] **Step 2:** Add `vitest.config.ts` (node environment, `@` alias → `src`) and the `test` script.
- [ ] **Step 3: Failing test** `defaultColorName`: `expect(defaultColorName(0)).toBe("Colour A"); expect(defaultColorName(11)).toBe("Colour L")`.
- [ ] **Step 4:** Run `npm test` → FAIL (module missing). Implement `types.ts`. Run → PASS. `npm run build` → succeeds.
- [ ] **Step 5: Commit** `chore: scaffold next app with vitest`.

### Task 2: Pixelation (cell averaging + k-means)

**Files:**
- Create: `src/lib/pixelate.ts`, `src/lib/kmeans.ts`, `src/lib/pixelate.test.ts`

**Interfaces:**
- Consumes: `RGB`, `Grid`, `PaletteColor`, `LIMITS`, `defaultColorName`
- Produces:
  ```ts
  export function gridSize(imgW: number, imgH: number, cols: number): { cols: number; rows: number };
  export function averageCells(data: Uint8ClampedArray, imgW: number, imgH: number, cols: number, rows: number): RGB[]; // row-major, top-left first; alpha composited on white
  export function kmeans(points: RGB[], k: number, seed?: number): { centroids: RGB[]; assignments: number[] };
  export function pixelate(data: Uint8ClampedArray, imgW: number, imgH: number, cols: number, colors: number): { grid: Grid; palette: PaletteColor[]; cols: number; rows: number };
  ```

- [ ] **Step 1: Failing tests** in `pixelate.test.ts` (build RGBA `Uint8ClampedArray` fixtures in a helper):
  - `gridSize(400, 200, 40)` → `{cols:40, rows:20}`; `gridSize(100, 100, 40)` → `{40,40}`.
  - `caps rows at 300`: `gridSize(100, 2000, 150)` → `rows === 300`, `cols === 15`.
  - `averageCells` on a 4×2 image (left half red, right half blue), 2×1 cells → `[[255,0,0],[0,0,255]]`.
  - `composites transparency onto white`: a fully transparent 2×2 image → `[[255,255,255]]` for 1×1.
  - `kmeans` is deterministic: same input twice → identical output.
  - `one colour per cell`: `pixelate` on a 40×40 gradient with colors 6 → every grid value is an integer in `[0, palette.length)`, `palette.length <= 6`, grid is `rows × cols`.
  - `drops unused palette entries`: 2-colour image, colors 6 → `palette.length === 2`, names `"Colour A"`, `"Colour B"`.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implement. `gridSize`: `rows = round(cols*imgH/imgW)` clamped ≥1; if `rows > LIMITS.rowsMax`, `rows = rowsMax`, `cols = max(1, round(rowsMax*imgW/imgH))`. `averageCells`: for each cell, average the source pixels whose centres fall in it (box average), composite each pixel `c*a + 255*(1-a)`. `kmeans`: distance in CIE Lab, k-means++ init with a mulberry32 seeded RNG (default seed 42), max 20 iterations, `k = min(k, distinct points)`. `pixelate`: gridSize → averageCells → kmeans → reshape into grid → remove empty clusters and reindex → round centroids to integer RGB → name with `defaultColorName`.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5: Commit** `feat: pixelate image into single-colour stitch grid`.

### Task 3: Pattern + palette operations

**Files:**
- Create: `src/lib/pattern.ts`, `src/lib/palette.ts`, `src/lib/pattern.test.ts`, `src/lib/palette.test.ts`

**Interfaces:**
- Consumes: `Grid`, `Handedness`, `Direction`, `PaletteColor`
- Produces:
  ```ts
  // pattern.ts
  export interface Run { color: number; count: number }
  export interface PatternRow { row: number; direction: Direction; runs: Run[] } // row is 1-based from bottom
  export function rowDirection(row: number, handedness: Handedness): Direction;
  export function gridRow(grid: Grid, row: number): number[]; // physical left→right cells of pattern row `row`
  export function buildPattern(grid: Grid, handedness: Handedness): PatternRow[]; // Row 1 first
  export function colorTotals(grid: Grid, paletteSize: number): number[];
  // palette.ts
  export function mergeColors(grid: Grid, palette: PaletteColor[], from: number, into: number): { grid: Grid; palette: PaletteColor[] };
  export function renameColor(palette: PaletteColor[], i: number, name: string): PaletteColor[];
  ```

- [ ] **Step 1: Failing tests:**
  - `rowDirection(1,"right")==="rtl"`, `(2,"right")==="ltr"`, `(1,"left")==="ltr"`, `(2,"left")==="rtl"`.
  - With `grid = [[0,0,1],[2,1,1]]` (top row, bottom row): `gridRow(grid,1)` → `[2,1,1]`.
  - `buildPattern(grid,"right")[0]` → `{row:1, direction:"rtl", runs:[{color:1,count:2},{color:2,count:1}]}`; `[1]` → `{row:2, direction:"ltr", runs:[{color:0,count:2},{color:1,count:1}]}`.
  - `buildPattern(grid,"left")[0].runs` → `[{color:2,count:1},{color:1,count:2}]`.
  - Every row's run counts sum to `cols`.
  - `colorTotals(grid,3)` → `[2,3,1]`.
  - `mergeColors(grid, 3-colour palette, 0, 2)` → palette length 2 (old 0 removed), grid `[[1,1,0],[1,0,0]]` (indices re-mapped: old 1→0, old 2→1, old 0→1).
  - `mergeColors` with `from === into` → returns inputs unchanged.
  - `renameColor` trims; empty name falls back to existing name.
- [ ] **Step 2:** `npm test` → FAIL. **Step 3:** Implement. **Step 4:** `npm test` → PASS.
- [ ] **Step 5: Commit** `feat: build handedness-aware row pattern and palette ops`.

### Task 4: Crochet progress logic

**Files:**
- Create: `src/lib/progress.ts`, `src/lib/progress.test.ts`

**Interfaces:**
- Consumes: `rowDirection`, `Handedness`
- Produces:
  ```ts
  export interface Position { row: number; col: number } // row 1-based from bottom, col 0-based from left
  export const START: (cols: number, handedness: Handedness) => Position; // row 1, first stitch in working order
  export function stitchNumber(p: Position, cols: number, h: Handedness): number; // 1-based, working order
  export function positionFromStitch(row: number, stitch: number, cols: number, h: Handedness): Position;
  export function nextStitch(p: Position, rows: number, cols: number, h: Handedness): Position; // end of row -> stitch 1 of next row; stays at last stitch of last row
  export function prevStitch(p: Position, rows: number, cols: number, h: Handedness): Position; // start of row -> last stitch of previous row; stays at START
  export function changeRow(p: Position, delta: number, rows: number, cols: number, h: Handedness): Position; // keeps stitch number, clamps row
  export function clampPosition(p: Position, rows: number, cols: number): Position;
  export function hasProgress(p: Position, cols: number, h: Handedness): boolean; // false only at START
  ```

- [ ] **Step 1: Failing tests** (cols 5, rows 3):
  - `START(5,"right")` → `{row:1,col:4}`; `START(5,"left")` → `{row:1,col:0}`.
  - `stitchNumber({row:1,col:4},5,"right")===1`; `stitchNumber({row:2,col:4},5,"right")===5`.
  - `nextStitch({row:1,col:0},3,5,"right")` → `{row:2,col:0}` (turned; row 2 starts at left).
  - `nextStitch({row:3,col:4},3,5,"right")` (last stitch of last row) → unchanged.
  - `prevStitch(START)` → START. `prevStitch({row:2,col:0},…,"right")` → `{row:1,col:0}`.
  - `positionFromStitch(2,1,5,"left")` → `{row:2,col:4}`.
  - Switching handedness keeps the physical cell: same `Position`, `stitchNumber` changes from 1 to 5.
  - `clampPosition({row:99,col:-3},3,5)` → `{row:3,col:0}`.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS.
- [ ] **Step 5: Commit** `feat: crochet progress stepping`.

### Task 5: Store + image loading

**Files:**
- Create: `src/store/project.ts`, `src/lib/loadImage.ts`, `src/store/project.test.ts`

**Interfaces:**
- Consumes: everything in `src/lib`
- Produces:
  ```ts
  // loadImage.ts (browser only)
  export interface LoadedImage { data: Uint8ClampedArray; width: number; height: number; url: string }
  export function loadImage(file: File, maxSide?: number /* default 1200 */): Promise<LoadedImage>; // rejects with Error("unreadable") on decode failure
  // project.ts
  export interface ProjectState {
    image: LoadedImage | null;            // NOT persisted
    cols: number; colors: number; handedness: Handedness;
    grid: Grid | null; palette: PaletteColor[]; rows: number;
    progress: Position;
    setImage(img: LoadedImage): void;      // stores image + regenerates grid
    setCols(n: number): void; setColors(n: number): void; // clamp to LIMITS, regenerate if image present
    setHandedness(h: Handedness): void;    // progress untouched
    rename(i: number, name: string): void; merge(from: number, into: number): void;
    setProgress(p: Position): void;        // clamped
  }
  export const useProject: UseBoundStore<…>; // zustand + persist, key "tapestry-project-v1", partialize excludes `image`
  ```
  Regenerating resets `progress` to `START`. The confirm-before-reset dialog lives in the UI (Task 7), using `hasProgress`.

- [ ] **Step 1: Failing tests** (vitest, store used via `useProject.getState()`, localStorage stubbed): `setCols(10)` then `setImage` with a 20×20 two-colour fixture → assert `grid[0].length === 10`, `grid.length === rows`, `palette.length === 2`, `progress` equals `START`. `setCols(500)` → `cols === 150`. `setHandedness("left")` leaves `progress` unchanged. `merge(0,1)` → palette length 1. `partialize` output has no `image` key.
- [ ] **Step 2:** FAIL. **Step 3:** Implement (`loadImage`: `createImageBitmap` → OffscreenCanvas/canvas scaled so the longest side ≤ maxSide → `getImageData`). **Step 4:** PASS.
- [ ] **Step 5: Commit** `feat: persisted project store and image loader`.

### Task 6: Visual system (theme, fonts, doodles, layout)

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`
- Create: `src/components/ui/PaperCard.tsx`, `Button.tsx`, `WashiTape.tsx`, `Stamp.tsx`, `src/components/doodles/Doodles.tsx` (Star, Swirl, YarnSquiggle, Button-sticker SVGs), `src/components/ui/SiteHeader.tsx`

**Interfaces:**
- Produces: `<PaperCard color="mint|lilac|butter|peach|blue|blush" tilt={-2..2} className>`; `<Button variant="primary|ghost" …buttonProps>`; `<WashiTape color className>`; `<Stamp color>{text}</Stamp>`; `<Star/> <Swirl/> <YarnSquiggle/>` (accept `className`, `aria-hidden`); `<SiteHeader/>` with logo linking `/` and nav to studio/crochet.

- [ ] **Step 1:** Tailwind v4 `@theme` tokens for the Global Constraints colours and fonts; body: cream background with radial-gradient pastel polka dots; ink-brown text.
- [ ] **Step 2:** Load fonts with `next/font/google` in `layout.tsx`; set metadata title "tiny tapestry".
- [ ] **Step 3:** Build components: wobbly 2.5px brown borders (SVG-filter or irregular `border-radius`), soft offset shadow, tilt via `rotate`, tilt disabled under `prefers-reduced-motion` hover effects. Doodles are hand-drawn-looking inline SVG strokes in ink brown with pastel fills, matching the poster reference.
- [ ] **Step 4:** `npm run build` → succeeds; `npm run lint` → clean.
- [ ] **Step 5: Commit** `feat: pastel hand-drawn visual system`.

### Task 7: Landing + upload (`/`)

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/upload/Dropzone.tsx`, `src/components/ui/ConfirmDialog.tsx`

**Interfaces:**
- Consumes: `loadImage`, `useProject`, `hasProgress`, UI components
- Produces: `<ConfirmDialog open title message confirmLabel onConfirm onCancel/>` (reused in Task 8).

- [ ] **Step 1:** Poster-style hero: swirly "tiny tapestry" title on a tilted mint card, subtitle "turn any picture into a crochet tapestry pattern", sticker badges ("one colour per stitch", "left & right handed", "row tracker"), doodles scattered (hidden/smaller on phones).
- [ ] **Step 2:** Dropzone: click/tap (`<input type="file" accept="image/*">`) and drag-and-drop; on success `setImage` then `router.push("/studio")`; if an existing project `hasProgress`, show `ConfirmDialog` ("you're on row N — start a new tapestry?") first; on `loadImage` rejection show "hmm, couldn't read that image — try a JPG or PNG" inline.
- [ ] **Step 3: Verify in browser** (`npm run dev`): upload JPG/PNG → lands on /studio; upload a `.pdf` renamed `.png` → friendly error; at 375px wide, no horizontal scroll.
- [ ] **Step 4: Commit** `feat: landing page and upload`.

### Task 8: Studio (`/studio`)

**Files:**
- Create: `src/app/studio/page.tsx`, `src/components/grid/StitchGrid.tsx`, `src/components/studio/SettingsPanel.tsx`, `PalettePanel.tsx`, `PatternList.tsx`, `src/components/ui/EmptyState.tsx`

**Interfaces:**
- Consumes: `useProject`, `buildPattern`, `colorTotals`, `rowDirection`, `stitchNumber`, `ConfirmDialog`
- Produces: `<StitchGrid grid palette cellSize highlightRow?={row} current?={Position} onCellClick?={(p: Position) => void} showRowNumbers/>` — canvas-rendered, sized `cols*cellSize × rows*cellSize`, inside an overflow-auto container; row numbers on the side (Row 1 at bottom); highlight row outlined, rows below `highlightRow` faded to 40%, current cell thick outline. Reused by Task 9.
  `<EmptyState/>` — "no tapestry yet" card linking to `/`.

- [ ] **Step 1:** `StitchGrid` (thin grid lines when `cellSize ≥ 8`; device-pixel-ratio aware).
- [ ] **Step 2:** `SettingsPanel`: stitches-wide slider + number input (10–150), colours stepper (2–12), handedness toggle (right/left with ✋ icons). If `image` is null (after a refresh), width/colour controls are disabled with hint "re-upload your picture to change size or colours"; changing width/colours when `hasProgress` → `ConfirmDialog` first.
- [ ] **Step 3:** `PalettePanel`: swatch + editable name + total stitches per colour; "merge into…" select per colour.
- [ ] **Step 4:** `PatternList`: summary "40 × 32 · 1,280 stitches", then Row 1…N each as `Row n ←` / `Row n →` with swatch chips "6 · dusty pink". Rows rendered in a scroll container (virtualisation not needed at ≤300 rows).
- [ ] **Step 5:** Page layout: phone = settings, preview, palette, pattern stacked; ≥ `lg` = settings+palette column left, preview+pattern right. "start crocheting ✿" button → `/crochet`. `EmptyState` when `grid` is null. Guard against hydration mismatch (render after store rehydrates).
- [ ] **Step 6: Verify in browser:** change width → grid re-renders with new size; 2 colours → only 2 swatches; rename shows in pattern; merge reduces palette and totals still sum to cols×rows; switch handedness flips arrows and run order; refresh keeps grid; 375px wide has no page-level horizontal scroll.
- [ ] **Step 7: Commit** `feat: studio with settings, palette and pattern`.

### Task 9: Crochet mode (`/crochet`)

**Files:**
- Create: `src/app/crochet/page.tsx`, `src/components/crochet/RowFocus.tsx`, `src/components/crochet/CrochetControls.tsx`

**Interfaces:**
- Consumes: `StitchGrid`, `useProject`, `buildPattern`, `progress.ts` functions, `EmptyState`

- [ ] **Step 1:** `RowFocus`: "Row 12 of 32 ←", current row's runs as chips with the active run emphasised, and "you're in: 3 dusty pink — stitch 2 of 3", plus "stitch 17 of 40".
- [ ] **Step 2:** `CrochetControls`: sticky bottom bar on phones (inline on desktop): ◀ stitch / stitch ▶, ▲ row / ▼ row buttons (≥44px), row number input (1–rows) and stitch number input (1–cols) that call `changeRow`/`positionFromStitch`; all writes go through `setProgress`.
- [ ] **Step 3:** Page: `StitchGrid` with `highlightRow=progress.row`, `current=progress`, cell tap → `setProgress`; auto-scroll current cell into view; zoom − / + buttons changing `cellSize` (min 6, max 40, default fits width). `EmptyState` when no grid. Handedness toggle available here too.
- [ ] **Step 4: Verify in browser:** next stitch at end of Row 1 (right-handed) moves to Row 2 at the left edge; tapping a cell moves there; refresh keeps place; switch handedness keeps the same cell highlighted; phone width: controls sticky and reachable.
- [ ] **Step 5: Commit** `feat: crochet mode row tracker`.

### Task 10: Final pass

- [ ] **Step 1:** `npm test`, `npm run lint`, `npm run build` all pass.
- [ ] **Step 2:** Browser walk-through of upload → studio → crochet at 375px and 1280px; compare look with `docs/reference/tiny-treasures-poster.png` and fix anything that reads generic.
- [ ] **Step 3:** Short `README.md`: what it is, `npm install`, `npm run dev`, `npm test`.
- [ ] **Step 4: Commit** `docs: readme`.
