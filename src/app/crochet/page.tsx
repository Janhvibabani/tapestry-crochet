"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CrochetControls } from "@/components/crochet/CrochetControls";
import { RowFocus } from "@/components/crochet/RowFocus";
import { Star } from "@/components/doodles/Doodles";
import { gutterWidth, StitchGrid, useFitCellSize } from "@/components/grid/StitchGrid";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { HandednessToggle } from "@/components/ui/HandednessToggle";
import { buildPattern } from "@/lib/pattern";
import { stitchNumber } from "@/lib/progress";
import { useHydrated, useProject } from "@/store/project";

const MIN = 4;
const MAX = 48;

/** Browser full screen (not available on iPhone Safari, where the page itself already fills the screen). */
function useFullscreen() {
  const isFull = useSyncExternalStore(
    (cb) => {
      document.addEventListener("fullscreenchange", cb);
      return () => document.removeEventListener("fullscreenchange", cb);
    },
    () => document.fullscreenElement !== null,
    () => false,
  );
  const supported = useSyncExternalStore(
    () => () => {},
    () => document.fullscreenEnabled === true,
    () => false,
  );
  const toggle = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen().catch(() => {});
  };
  return { isFull, supported, toggle };
}

export default function CrochetPage() {
  const hydrated = useHydrated();
  const { grid, palette, progress, rows, gridCols, handedness, setProgress } = useProject();
  const boxRef = useRef<HTMLDivElement>(null);
  const fit = useFitCellSize(boxRef, gridCols, gutterWidth(true), MIN, 36, rows);
  const [zoom, setZoom] = useState<number | null>(null);
  const cellSize = zoom ?? fit;
  const fs = useFullscreen();

  // The page behind this full-screen view shouldn't scroll.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      if (document.fullscreenElement) void document.exitFullscreen();
    };
  }, []);

  // Keep the current stitch in view.
  useEffect(() => {
    const box = boxRef.current;
    if (!box || !grid) return;
    const x = gutterWidth(true) + 4 + progress.col * cellSize;
    const y = 4 + (rows - progress.row) * cellSize;
    box.scrollTo({ left: Math.max(0, x - box.clientWidth / 2), top: Math.max(0, y - box.clientHeight / 2), behavior: "smooth" });
  }, [progress, cellSize, rows, grid]);

  if (!hydrated) return null;
  if (!grid) return <EmptyState />;

  const pattern = buildPattern(grid, handedness);
  const row = pattern[progress.row - 1];
  if (!row) return <EmptyState />;
  const stitch = stitchNumber(progress, gridCols, handedness);

  return (
    <div className="dotted fixed inset-0 z-50 bg-cream flex flex-col overflow-hidden" role="dialog" aria-label="Crochet mode">
      {/* top bar */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b-[2.5px] border-ink bg-lilac px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-5">
        <p className="flex min-w-0 items-center gap-2 font-display text-xl sm:text-2xl">
          <Star className="h-6 w-6 shrink-0" /> <span className="hidden sm:inline">crochet mode</span>
        </p>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Button tone="paper" size="sm" aria-label="zoom out" disabled={cellSize <= MIN} onClick={() => setZoom(Math.max(MIN, cellSize - 3))}>
            −
          </Button>
          <Button tone="paper" size="sm" aria-label="zoom in" disabled={cellSize >= MAX} onClick={() => setZoom(Math.min(MAX, cellSize + 3))}>
            +
          </Button>
          {fs.supported && (
            <Button tone="paper" size="sm" onClick={fs.toggle} aria-pressed={fs.isFull} aria-label={fs.isFull ? "exit full screen" : "full screen"}>
              <span aria-hidden className="sm:hidden">{fs.isFull ? "⤡" : "⤢"}</span>
              <span className="hidden sm:inline">{fs.isFull ? "exit full screen" : "full screen"}</span>
            </Button>
          )}
          <Link
            href="/studio"
            aria-label="close crochet mode"
            className="paper grid h-11 w-11 place-items-center bg-blush text-2xl leading-none"
          >
            ×
          </Link>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* where you are (phones: top) */}
        <div className="shrink-0 border-b-2 border-dashed border-ink/30 px-4 py-3 lg:hidden">
          <RowFocus row={row} stitch={stitch} rows={rows} cols={gridCols} palette={palette} />
        </div>

        {/* the grid fills whatever space is left */}
        <div ref={boxRef} className="plaid min-h-0 flex-1 overflow-auto p-2">
          <StitchGrid
            grid={grid}
            palette={palette}
            cellSize={cellSize}
            highlightRow={progress.row}
            current={progress}
            onCellClick={setProgress}
            showRowNumbers
            label={`Stitch grid. You are on row ${progress.row}, stitch ${stitch}.`}
          />
        </div>

        {/* desktop side panel */}
        <aside className="hidden w-[25rem] shrink-0 flex-col gap-5 overflow-y-auto border-l-[2.5px] border-ink bg-paper/90 p-5 lg:flex">
          <RowFocus row={row} stitch={stitch} rows={rows} cols={gridCols} palette={palette} />
          <CrochetControls />
          <HandednessToggle />
          <p className="text-base text-ink-soft">Tap a stitch on the grid to jump there. Faded rows are done.</p>
        </aside>

        {/* phone controls, under your thumb */}
        <div className="shrink-0 border-t-[2.5px] border-ink bg-cream px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:hidden">
          <CrochetControls />
        </div>
      </div>
    </div>
  );
}
