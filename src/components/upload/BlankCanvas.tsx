"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { LIMITS } from "@/lib/types";
import { useProject } from "@/store/project";

const clamp = (v: string, lo: number, hi: number, fallback: number) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback;
};

export function BlankCanvas() {
  const router = useRouter();
  const newBlank = useProject((s) => s.newBlank);
  const hasProject = useProject((s) => s.grid !== null);
  const [open, setOpen] = useState(false);
  const [cols, setCols] = useState("40");
  const [rows, setRows] = useState("40");
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) ref.current?.showModal();
  }, [open]);

  const create = () => {
    newBlank(clamp(cols, LIMITS.colsMin, LIMITS.colsMax, 40), clamp(rows, 1, LIMITS.rowsMax, 40));
    // Close the modal first: the page we leave can stay in the document during navigation.
    ref.current?.close();
    setOpen(false);
    router.push("/edit");
  };

  return (
    <>
      <Button tone="lilac" onClick={() => setOpen(true)} className="w-full">
        ▦ start with a blank canvas
      </Button>
      {open && (
        <dialog
          ref={ref}
          onCancel={(e) => {
            e.preventDefault();
            setOpen(false);
          }}
          className="paper stitched m-auto w-[min(92vw,26rem)] bg-lilac p-6 text-ink backdrop:bg-ink/30"
        >
          <form
            method="dialog"
            onSubmit={(e) => {
              e.preventDefault();
              create();
            }}
          >
            <h2 className="font-display text-2xl">a blank canvas</h2>
            <p className="mt-1 text-base">How big should your tapestry be? You can draw it stitch by stitch next.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                stitches wide
                <input
                  type="number"
                  inputMode="numeric"
                  min={LIMITS.colsMin}
                  max={LIMITS.colsMax}
                  value={cols}
                  onChange={(e) => setCols(e.target.value)}
                  className="paper min-h-11 bg-paper px-3"
                />
                <span className="text-sm text-ink-soft">
                  {LIMITS.colsMin}–{LIMITS.colsMax}
                </span>
              </label>
              <label className="flex flex-col gap-1">
                rows
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={LIMITS.rowsMax}
                  value={rows}
                  onChange={(e) => setRows(e.target.value)}
                  className="paper min-h-11 bg-paper px-3"
                />
                <span className="text-sm text-ink-soft">1–{LIMITS.rowsMax}</span>
              </label>
            </div>
            {hasProject && <p className="mt-3 text-base">This replaces the tapestry you have saved now.</p>}
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <Button
                tone="paper"
                onClick={() => {
                  ref.current?.close();
                  setOpen(false);
                }}
              >
                cancel
              </Button>
              <Button tone="butter" type="submit">
                start drawing
              </Button>
            </div>
          </form>
        </dialog>
      )}
    </>
  );
}
