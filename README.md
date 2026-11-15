# tiny tapestry

Turn any picture into a crochet tapestry pattern. One colour per stitch, row by row.

- **Upload** a picture. It's pixelated into a grid where every cell is one stitch in exactly one yarn colour.
- **Pattern**: choose how many stitches wide (10–300; rows follow the picture's shape up to 500, stitches are square) and how many colours (2–12). Rename colours after your yarn, change a colour's shade, add colours, or replace one colour with another everywhere.
- **Fix the pattern by hand**: turn on *edit stitches* and tap or drag to repaint stitches, delete rows you don't want, and undo any edit.
- **Left or right handed**: right-handers work Row 1 right → left, left-handers left → right, and every row turns. Each row in the pattern shows its direction, and the stitch counts are in working order. Row 1 is the bottom of the tapestry.
- **Crochet mode** (full screen): pick the row and stitch you're on (or tap the grid). Your place is saved on this device.

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
