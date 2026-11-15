"use client";

import { useEffect, useRef } from "react";
import { hexToRgb, rgbCss, rgbToHex } from "@/lib/color";
import type { PaletteColor, RGB } from "@/lib/types";
import { YARN_COLORS } from "@/lib/yarnColors";
import { Button } from "./Button";

interface Props {
  title: string;
  /** Highlighted as the current colour, if any. */
  current?: RGB;
  onPick(rgb: RGB, yarnName?: string): void;
  /** Optional "use one of your colours" row (merges into that colour). */
  own?: { palette: PaletteColor[]; exclude: number; onPick(index: number): void };
  onClose(): void;
}

const same = (a?: RGB, b?: RGB) => !!a && !!b && a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

/** A full yarn colour palette in a modal, plus a custom colour picker. */
export function ColorPaletteDialog({ title, current, onPick, own, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const custom = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  // Native "change" fires once when the system picker is closed (React's onChange fires while dragging).
  useEffect(() => {
    const el = custom.current;
    if (!el) return;
    const done = () => onPick(hexToRgb(el.value));
    el.addEventListener("change", done);
    return () => el.removeEventListener("change", done);
  }, [onPick]);

  const others = own?.palette.map((p, i) => ({ p, i })).filter(({ i }) => i !== own.exclude) ?? [];

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="paper m-auto max-h-[90dvh] w-[min(94vw,40rem)] overflow-y-auto bg-paper p-5 text-ink backdrop:bg-ink/30 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-2xl">{title}</h2>
        <button type="button" onClick={onClose} aria-label="close" className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-2xl hover:bg-blush">
          ×
        </button>
      </div>

      <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(4.25rem,1fr))] gap-x-2 gap-y-3">
        {YARN_COLORS.map((c) => (
          <li key={c.name}>
            <button
              type="button"
              aria-pressed={same(current, c.rgb)}
              onClick={() => onPick(c.rgb, c.name)}
              className="group flex w-full flex-col items-center gap-1 rounded-xl text-center"
            >
              <span
                aria-hidden
                className={`block h-11 w-full rounded-xl border-2 transition-transform group-hover:scale-105 ${
                  same(current, c.rgb) ? "border-ink ring-2 ring-ink ring-offset-2 ring-offset-paper" : "border-ink/40"
                }`}
                style={{ background: rgbCss(c.rgb) }}
              />
              <span className="text-sm leading-tight">{c.name}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="paper relative inline-flex min-h-11 cursor-pointer items-center gap-2 bg-butter px-4 has-focus-visible:outline-2 has-focus-visible:outline-dashed has-focus-visible:outline-offset-3">
          <input
            ref={custom}
            type="color"
            aria-label="custom colour"
            defaultValue={current ? rgbToHex(current) : "#f6cfd8"}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <span className="h-5 w-5 rounded-full border border-ink/50 bg-[conic-gradient(#f6cfd8,#f8edb5,#cfe8dc,#cfe2f3,#e3d3ee,#f6cfd8)]" aria-hidden />
          any other colour…
        </label>
      </div>

      {own && others.length > 0 && (
        <div className="mt-5 border-t-2 border-dashed border-ink/20 pt-4">
          <p className="text-base text-ink-soft">or use one of your colours (all its stitches join that colour)</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {others.map(({ p, i }) => (
              <Button key={i} tone="paper" size="sm" onClick={() => own.onPick(i)}>
                <span className="h-4 w-4 rounded-full border border-ink/50" style={{ background: rgbCss(p.rgb) }} aria-hidden />
                {p.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </dialog>
  );
}
