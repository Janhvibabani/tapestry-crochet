"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { HandednessToggle } from "@/components/ui/HandednessToggle";
import { PaperCard } from "@/components/ui/PaperCard";
import { hasProgress, stitchNumber } from "@/lib/progress";
import { LIMITS } from "@/lib/types";
import { useProject } from "@/store/project";

type Change = { kind: "cols" | "colors"; value: number };

export function SettingsPanel() {
  const { image, cols, colors, progress, gridCols, handedness, setCols, setColors } = useProject();
  const [draftCols, setDraftCols] = useState(cols);
  const [pending, setPending] = useState<Change | null>(null);
  const canChange = image !== null;

  const apply = (c: Change) => (c.kind === "cols" ? setCols(c.value) : setColors(c.value));
  const request = (c: Change) => {
    if (hasProgress(progress, gridCols, handedness)) setPending(c);
    else apply(c);
  };

  // Debounce the width slider so dragging doesn't re-pixelate on every pixel.
  useEffect(() => {
    if (draftCols === cols) return;
    const t = setTimeout(() => request({ kind: "cols", value: draftCols }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftCols]);

  return (
    <PaperCard tone="lilac" tilt={-1} tape="butter" className="px-5 pb-6 pt-8">
      <h2 className="font-display text-2xl">your tapestry</h2>

      {!canChange && (
        <p className="paper mt-3 bg-butter px-3 py-2 text-base">
          Your pattern is saved. To change the size or colours, upload your picture again.
        </p>
      )}

      <div className="mt-4 space-y-5">
        <div>
          <label htmlFor="cols" className="flex items-baseline justify-between text-lg">
            <span>stitches wide</span>
            <input
              type="number"
              aria-label="stitches wide (number)"
              min={LIMITS.colsMin}
              max={LIMITS.colsMax}
              value={draftCols}
              disabled={!canChange}
              onChange={(e) => setDraftCols(Number(e.target.value) || LIMITS.colsMin)}
              onBlur={() => setDraftCols((v) => Math.min(LIMITS.colsMax, Math.max(LIMITS.colsMin, v)))}
              className="paper w-20 bg-paper px-2 py-0.5 text-right"
            />
          </label>
          <input
            id="cols"
            type="range"
            min={LIMITS.colsMin}
            max={LIMITS.colsMax}
            value={draftCols}
            disabled={!canChange}
            onChange={(e) => setDraftCols(Number(e.target.value))}
            className="mt-2 w-full accent-[#5b3a29]"
          />
        </div>

        <div>
          <span id="colors-label" className="text-lg">
            colours
          </span>
          <div role="group" aria-labelledby="colors-label" className="mt-2 flex items-center gap-3">
            <Button
              tone="paper"
              aria-label="fewer colours"
              disabled={!canChange || colors <= LIMITS.colorsMin}
              onClick={() => request({ kind: "colors", value: colors - 1 })}
            >
              −
            </Button>
            <output aria-live="polite" className="min-w-8 text-center font-display text-2xl">
              {colors}
            </output>
            <Button
              tone="paper"
              aria-label="more colours"
              disabled={!canChange || colors >= LIMITS.colorsMax}
              onClick={() => request({ kind: "colors", value: colors + 1 })}
            >
              +
            </Button>
          </div>
        </div>

        <HandednessToggle />
      </div>

      {pending && (
        <ConfirmDialog
          open
          title="start the pattern over?"
          message={`You're on row ${progress.row}, stitch ${stitchNumber(progress, gridCols, handedness)}. Changing the ${
            pending.kind === "cols" ? "width" : "colours"
          } makes a new grid and resets your place.`}
          confirmLabel="change it"
          onConfirm={() => {
            apply(pending);
            setPending(null);
          }}
          onCancel={() => {
            if (pending.kind === "cols") setDraftCols(cols);
            setPending(null);
          }}
        />
      )}
    </PaperCard>
  );
}
