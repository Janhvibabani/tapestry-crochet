"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gutterWidth, StitchGrid, useFitCellSize } from "@/components/grid/StitchGrid";
import { Button } from "@/components/ui/Button";
import { ColorPaletteDialog } from "@/components/ui/ColorPaletteDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { rgbCss } from "@/lib/color";
import type { Position } from "@/lib/progress";
import type { RGB } from "@/lib/types";
import { useLockScroll } from "@/lib/useLockScroll";
import { useHydrated, useProject } from "@/store/project";

type Tool = "brush" | "fill" | "erase" | "move";

const TOOLS: { id: Tool; icon: string; label: string; hint: string }[] = [
  { id: "brush", icon: "✎", label: "brush", hint: "tap or drag to colour stitches" },
  { id: "fill", icon: "◩", label: "fill", hint: "tap to colour a whole patch of one colour" },
  { id: "erase", icon: "⌫", label: "eraser", hint: "tap or drag to turn stitches white" },
  { id: "move", icon: "✋", label: "move", hint: "drag to scroll around without painting" },
];

const WHITE: RGB = [255, 255, 255];
const MIN = 6;
const MAX = 56;

export default function EditPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { grid, palette, gridCols, rows, canUndo, undo, beginEdit, paint, fill, ensureColor, tidyPalette } = useProject();
  const boxRef = useRef<HTMLDivElement>(null);
  const fit = useFitCellSize(boxRef, gridCols, gutterWidth(true), MIN, 40, rows);
  const [zoom, setZoom] = useState<number | null>(null);
  const cellSize = zoom ?? fit;
  const [tool, setTool] = useState<Tool>("brush");
  const [color, setColor] = useState<{ rgb: RGB; name?: string } | null>(null);
  const [picking, setPicking] = useState(false);
  const strokeColor = useRef(0);
  useLockScroll();

  // Colours nobody uses any more are cleared away when you leave the editor.
  useEffect(() => () => useProject.getState().tidyPalette(), []);

  if (!hydrated) return null;
  if (!grid) return <EmptyState />;

  const brush = color ?? palette.find((p) => p.rgb.join() !== WHITE.join()) ?? palette[0];
  const active = TOOLS.find((t) => t.id === tool)!;

  /** Undo snapshot + palette index for the colour this action paints with. */
  const startAction = () => {
    beginEdit();
    strokeColor.current = tool === "erase" ? ensureColor(WHITE, "snow white") : ensureColor(brush.rgb, brush.name);
    return strokeColor.current;
  };

  const painting = tool === "brush" || tool === "erase";

  const toolButtons = TOOLS.map((t) => (
    <Button
      key={t.id}
      tone={tool === t.id ? "butter" : "paper"}
      size="sm"
      aria-pressed={tool === t.id}
      onClick={() => setTool(t.id)}
      className="flex-1 lg:flex-none lg:justify-start"
    >
      <span aria-hidden className="text-lg">
        {t.icon}
      </span>
      <span>{t.label}</span>
    </Button>
  ));

  const colourPicker = (
    <div className="flex min-w-0 items-center gap-2 lg:flex-col lg:items-start">
      <button
        type="button"
        onClick={() => setPicking(true)}
        aria-label={`paint colour: ${brush.name}. Choose another colour`}
        className="paper flex min-h-11 shrink-0 items-center gap-2 bg-paper px-2"
      >
        <span className="h-8 w-8 rounded-lg border-2 border-ink/50" style={{ background: rgbCss(brush.rgb) }} aria-hidden />
        <span className="hidden max-w-28 truncate text-base sm:inline">{brush.name}</span>
        <span aria-hidden>▾</span>
      </button>
      <ul aria-label="your colours" className="flex min-w-0 gap-1.5 overflow-x-auto py-1 lg:flex-wrap">
        {palette.map((p) => (
          <li key={p.name} className="shrink-0">
            <button
              type="button"
              title={p.name}
              aria-label={`paint with ${p.name}`}
              aria-pressed={brush.rgb.join() === p.rgb.join()}
              onClick={() => {
                setColor({ rgb: p.rgb, name: p.name });
                if (tool === "erase" || tool === "move") setTool("brush");
              }}
              className={`block h-11 w-11 rounded-lg border-2 ${brush.rgb.join() === p.rgb.join() ? "border-ink ring-2 ring-ink ring-offset-1" : "border-ink/30"}`}
              style={{ background: rgbCss(p.rgb) }}
            />
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="dotted fixed inset-0 z-50 flex flex-col overflow-hidden bg-cream" role="dialog" aria-label="Edit stitches">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b-[2.5px] border-ink bg-mint px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-5">
        <p className="font-display text-xl sm:text-2xl">edit stitches</p>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button tone="paper" size="sm" disabled={!canUndo} onClick={undo} aria-label="undo">
            ↶<span className="hidden sm:inline">undo</span>
          </Button>
          <Button tone="paper" size="sm" aria-label="zoom out" disabled={cellSize <= MIN} onClick={() => setZoom(Math.max(MIN, cellSize - 4))}>
            −
          </Button>
          <Button tone="paper" size="sm" aria-label="zoom in" disabled={cellSize >= MAX} onClick={() => setZoom(Math.min(MAX, cellSize + 4))}>
            +
          </Button>
          <Button
            tone="blush"
            size="sm"
            onClick={() => {
              tidyPalette();
              router.push("/studio");
            }}
          >
            done
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* desktop tool panel */}
        <aside className="hidden w-72 shrink-0 flex-col gap-5 overflow-y-auto border-r-[2.5px] border-ink bg-paper/90 p-5 lg:flex">
          <div>
            <h2 className="mb-2 font-display text-lg">tools</h2>
            <div className="flex flex-col gap-2">{toolButtons}</div>
          </div>
          <div>
            <h2 className="mb-2 font-display text-lg">colour</h2>
            {colourPicker}
          </div>
          <p className="text-base text-ink-soft">
            {active.label}: {active.hint}.
          </p>
        </aside>

        <div ref={boxRef} className="plaid min-h-0 flex-1 overflow-auto p-3">
          <StitchGrid
            grid={grid}
            palette={palette}
            cellSize={cellSize}
            showRowNumbers
            onPaintStart={painting ? () => void startAction() : undefined}
            onPaint={painting ? (p: Position) => paint(p, strokeColor.current) : undefined}
            onCellClick={tool === "fill" ? (p: Position) => fill(p, startAction()) : undefined}
            label={`Stitch grid, ${gridCols} by ${rows}. Tool: ${active.label}.`}
          />
        </div>

        {/* phone toolbar */}
        <div className="shrink-0 space-y-2 border-t-[2.5px] border-ink bg-cream px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 lg:hidden">
          <p className="text-sm text-ink-soft">
            {active.label}: {active.hint}
          </p>
          <div className="flex gap-1.5">{toolButtons}</div>
          {colourPicker}
        </div>
      </div>

      {picking && (
        <ColorPaletteDialog
          title="paint with…"
          current={brush.rgb}
          onClose={() => setPicking(false)}
          onPick={(rgb, name) => {
            setColor({ rgb, name });
            if (tool === "erase" || tool === "move") setTool("brush");
            setPicking(false);
          }}
        />
      )}
    </div>
  );
}
