# tiny tapestry

Turn any picture into a crochet tapestry pattern. One colour per stitch, row by row.

- **Upload** a picture (it's pixelated into a grid where every cell is one stitch in exactly one yarn colour), or **start with a blank canvas** of any size.
- **Pattern**: choose how many stitches wide (10–300; rows follow the picture's shape up to 500, stitches are square) and how many colours (2–12). Colours are named after the closest yarn colour. Tap a colour to replace it everywhere with any colour from a full yarn palette (or a custom colour); picking a colour you already have joins the two.
- **Download chart**: save a PNG chart with row numbers on the side each row starts (with arrows), stitch numbers, a 10-stitch grid and a colour key (name, hex code, stitch count).
- **Custom colours**: anywhere you pick a colour you can type a hex code (like `#E8A0B4`) or use the colour wheel.
- **Edit stitches** (full-screen editor): brush, fill a patch, eraser (white), move; paint with any colour; undo. Delete rows from the row-by-row list.
- **Left or right handed**: right-handers work Row 1 right → left, left-handers left → right, and every row turns. Each row in the pattern shows its direction, and the stitch counts are in working order. Row 1 is the bottom of the tapestry.
- **Crochet mode** (full screen): pick the row and stitch you're on (or tap the grid). Your place is saved on this device. Zoom freely: pinch with two fingers, pinch on a trackpad, or Ctrl/⌘ + scroll. Zooming only ever changes the stitch grid, never the page. The pattern preview zooms the same way.
  - **Focus mode** keeps the whole tapestry on screen but dims it, so only the row you're on stays bright.
  - **123** numbers every stitch within its colour run, counted in the direction you work that row and restarting at 1 when the colour changes.

Everything runs in the browser for now; there's no backend yet.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # unit tests (vitest)
npm run lint
npm run build
```

Code map: pure logic lives in `src/lib` (pixelation, pattern, progress), the saved project state in `src/store/project.ts`, pages in `src/app`.
Design spec: `docs/superpowers/specs/2026-11-15-tapestry-crochet-frontend-design.md`.
