# Tapestry Crochet — Frontend Design

_Date: 2026-11-15 · Status: approved_

## Intent

A cute, whimsical web app that turns any uploaded image into a crochet
tapestry pattern. People upload a photo, it gets pixelated into a grid
where **one cell = one stitch = exactly one yarn colour**, and the app
generates a row-by-row pattern (which colour, how many stitches,
which direction) plus a "crochet mode" that tracks where you are while
you work.

Frontend only for now; a backend (accounts, saving, sharing) comes later.

## Who it's for

People who already know basic crochet (our call — the user didn't
specify). The pattern is clear and compact; it does not teach stitches.

## Goals

- Upload an image → pixelated grid with a strictly limited palette.
- Readable, accurate per-row pattern with colour runs and direction.
- Handedness-aware direction annotations.
- Crochet mode: pick the current row & stitch, see it highlighted,
  step forward/back, progress persisted.
- Look and feel matching the "tiny treasures" poster reference.
- Mobile friendly (people crochet with their phone next to them).

## Non-goals (for now)

- Backend, accounts, cloud saving, sharing links.
- Teaching crochet / stitch tutorials.
- Stitch aspect-ratio correction — **stitches are treated as square**
  (explicit user decision).
- Working in the round; only flat, turned rows.
- PDF export.

## Anti-goals

- A pixel with blended / mixed colours. Every cell must be exactly one
  palette colour.
- A generic, corporate-looking UI. It must feel hand-drawn and pastel.
- Losing a crocheter's place on refresh.

## Crochet rules (domain)

- Rows are numbered **from the bottom** (Row 1 = bottom row of the
  image), because tapestries are worked bottom-up.
- Flat work is turned at the end of every row, so direction alternates.
- **Right-handed:** Row 1 is worked right → left, Row 2 left → right, …
- **Left-handed:** Row 1 is worked left → right, Row 2 right → left, …
- The per-row pattern lists colour runs **in working order** (i.e. the
  order the crocheter meets them, following the row's direction).
- Stitch numbers inside a row ("stitch 5 of 40") are also counted in
  working order.

## Approaches considered

1. **All client-side (chosen).** Next.js (App Router) + TypeScript +
   Tailwind. Image is decoded into a `<canvas>` in the browser,
   downsampled, colour-quantised, and the grid kept in client state.
   No server needed; fast; the later backend only adds persistence.
2. **Server-side processing via Next API routes + sharp.** Would force
   building backend pieces now just to pixelate; slower round-trips. Rejected.
3. **Plain Vite SPA instead of Next.** User asked for Next.js and plans a
   backend later, which Next's route handlers make easy. Rejected.

## Design

### Pages

- `/` — landing: poster-style hero ("stitch your own tiny tapestry"),
  upload dropzone (click or drag; mobile uses the photo picker).
  After upload → navigate to `/studio`.
- `/studio` — settings panel + live pixelated preview + generated
  pattern. Button: "start crocheting ✿" → `/crochet`.
- `/crochet` — crochet mode / row tracker.
- If `/studio` or `/crochet` is opened with no project, show a cute empty
  state linking back to upload.

### Settings (studio)

- **Stitches wide** (slider + number input, range 10–150, default 40).
  Rows = round(width × imageHeight / imageWidth) since stitches are square.
- **Number of colours** (2–12, default 6).
- **Handedness**: right / left toggle (default right).
- **Palette editing**: rename a colour (e.g. "dusty pink"; default names
  are "Colour A, B, C…"), and merge one colour into another (all its
  stitches get reassigned; palette shrinks).
- Changing width or colour count re-runs pixelation (renames/merges reset
  in that case — acceptable for v1).

### Pixelation algorithm

1. Draw the image onto a canvas at `cols × rows` using area averaging
   (draw at the target size with high-quality smoothing, or average
   blocks manually) to get one averaged colour per cell.
2. Quantise those cell colours to N colours with k-means (k-means++ init,
   deterministic seed so the same input gives the same result), in a
   perceptual-ish space (Lab preferred, RGB acceptable).
3. Assign each cell to its nearest palette colour → `grid[row][col]` is a
   palette index. Exactly one colour per cell by construction.
4. Drop palette entries that end up with zero stitches.
- Transparent pixels: composite onto white before processing.
- Runs off the main thread is not required for v1 (grid sizes are small),
  but the pixelation lives in a pure function so it can move to a worker.

### Pattern output

- **Colour key**: swatch, name, total stitch count per colour, sorted by
  palette order.
- Summary: `cols × rows`, total stitches.
- **Rows** listed Row 1 (bottom) upward, each as:
  `Row 1 ← · 6 Colour A · 3 Colour B · 11 Colour C` with an arrow showing
  direction and a small swatch per run.
- Pure function `buildPattern(grid, handedness)` → rows with direction
  and runs (in working order). Unit tested.

### Crochet mode

- Zoomable / scrollable grid rendering (canvas or SVG; builder's call),
  big enough on mobile to tap.
- Row picker and stitch picker (number inputs / steppers), plus
  tapping a cell selects it.
- Current row highlighted; current stitch outlined; completed rows (below
  current) faded; direction arrow for current row.
- Current row's runs shown prominently with the active run emphasised
  ("you're in: 3 Colour B — stitch 2 of 3").
- Buttons: previous / next stitch, previous / next row. Next stitch at
  end of row advances to stitch 1 of the next row.
- Progress (row, stitch) persisted to `localStorage`.

### State & persistence

- Client store (Zustand with `persist`) holding: grid, palette
  (rgb + name), cols, rows, settings, handedness, progress.
- Persist only the grid/palette/settings/progress — **not** the original
  image (localStorage size limits). The original image lives in memory
  only, so reloading `/studio` after refresh shows the saved grid but
  re-pixelating with new settings needs a re-upload (show a hint).

### Progress rules (our call)

- Progress is stored as a **physical cell (row, col)**, not as
  "stitch N in working order". The displayed stitch number is derived
  from col + the row's direction, so switching handedness or merging
  colours keeps the crocheter on the same physical stitch.
- Progress resets only when a **new grid** is made (new upload, or
  re-pixelating with a different width / colour count). If there is
  progress beyond Row 1 stitch 1, ask for confirmation first
  ("you're on row 12 — start over?").

### Visual style (from reference poster)

Reference image: [`docs/reference/tiny-treasures-poster.png`](../../reference/tiny-treasures-poster.png).
Key traits: cream dotted background; chocolate-brown hand-lettered
swirly display type; tilted mint/lilac/butter/peach/blue paper cards
with wobbly brown outlines; plaid fabric, washi-tape roll, wax-seal
"stamp" badge, ticket stub, buttons, cookie and star stickers; loose
yarn-like squiggle lines threading between elements.

- Background: cream (#FBF5E9-ish) with faint pastel polka dots.
- Palette: mint, lilac, butter yellow, peach, baby blue, blush pink;
  ink colour is warm chocolate brown for text and outlines.
- Hand-drawn feel: wobbly 2–3px brown outlines, slightly rotated
  "paper" cards, washi-tape strips, doodled stars/swirls/squiggly yarn
  lines as decorative SVGs.
- Fonts (Google, via `next/font`): a bubbly/swirly display font for
  headings and a handwritten font for body/labels (builder picks exact
  fonts that match the reference).
- Mobile first: single column on phones, settings collapse above the
  preview; crochet controls sticky at the bottom of the screen with
  large tap targets. No horizontal page scroll (grid scrolls inside its
  own container).

### Testing

- Unit tests (Vitest) for: pixelation/quantisation (one colour per cell,
  palette size ≤ N), `buildPattern` (directions for both handedness,
  runs order, counts sum to cols), crochet-mode step logic.
- Manual check in the browser at desktop and phone widths.

## Left to the builder

- Exact fonts, exact hex values, and doodle artwork.
- Canvas vs SVG for grid rendering.
- Component structure and file layout.
- Whether k-means runs in Lab or RGB.

## Update 2026-11-15: editing, full-screen crochet mode, bigger patterns

Requested after the first build:
- Hand corrections: paint stitches with a chosen palette colour (tap/drag), change a colour's shade,
  add a colour, "replace with…" (all stitches of one colour become another), delete rows, undo (in memory, 40 steps).
  Changing width/colours after hand edits warns that edits will be lost.
- Crochet mode is a full-screen view (covers the site chrome) with an optional browser full-screen button.
- Limits raised: stitches wide 10–300 (was 150), rows cap 500 (was 300). ("max pixels" read as "allow bigger patterns".)
- Studio layout: wider page; settings + colours on the left, preview in the middle, "row by row" in its own right column (≥1280px).

## Update 2: full yarn palette, focus mode, stitch numbers

- Changing or adding a colour opens a full named yarn palette (48 colours) plus a custom colour picker; picking a yarn
  colour also takes its name if the colour still has its default name. Merging into an existing colour is kept as a
  secondary option inside that picker.
- Crochet mode has a **focus mode** (preference saved per device): current row drawn big with the next row above it
  (same column alignment), run chips for the row, next stitch / next row controls.
- Optional **stitch numbers** (per device): each stitch shows its position within its colour run, counted in that
  row's working direction (so it follows handedness) and restarting at 1 on every colour change. Shown on the grid when
  stitches are ≥14px (turning numbers on zooms in if needed); always shown in focus mode.

Correction (user): **focus mode** means the whole tapestry stays visible but goes dimmer, and only the current row stays
bright (no separate big-row view). Normal mode keeps fading only finished rows.

## Update 3: replace-everywhere colours, editor page, blank canvas

- Tapping a colour replaces it everywhere with any colour (full yarn palette or custom). If the new colour is already
  in the palette, the two are joined. The "merge into your colours" option is gone.
- No renaming: colours are named automatically after the nearest yarn colour (Lab distance), made unique ("cream 2").
- Editing moved to its own full-screen page `/edit`: tools brush, fill (4-way flood fill), eraser (paints white),
  move (pan without painting); paint colour = any yarn/custom colour or one already used; undo; zoom. Strokes are
  interpolated so fast drags leave no gaps. Colours no stitch uses are removed when leaving the editor.
- Landing page: "start with a blank canvas" (10–300 wide, 1–500 rows, all white) → opens the editor.
  Blank projects (`source: "blank"`) hide the picture-only width/colour controls in the studio.
- Favicon: yellow star.

## Update 4: freehand zoom in crochet mode

- Crochet mode zooms freely: two-finger pinch (touch), trackpad pinch / Ctrl or ⌘ + wheel (desktop), Safari gesture
  events. The stitch under the fingers/pointer stays put. Stitch size 2–80px; −/+ buttons step ×1.25 around the centre.
  One finger still scrolls; the page itself never zooms.
- The grid now draws only the visible area (canvas sized to the viewport, inside a full-size spacer), so deep zoom
  works on any tapestry size without hitting browser canvas limits. Row numbers stay pinned on the left edge.

Correction (user): zooming must change only the stitch-grid panel, never the whole page. In crochet mode a pinch
anywhere on screen zooms the grid (the overlay is `touch-action: pan-x pan-y` and catches pinches); the pattern
page's preview panel has the same pinch/trackpad zoom plus − / + / fit buttons, and scrolls inside itself.
