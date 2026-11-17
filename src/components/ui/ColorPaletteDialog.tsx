"use client";

import { useEffect, useRef, useState } from "react";
import { hexToRgb, parseHex, rgbCss, rgbToHex } from "@/lib/color";
import type { RGB } from "@/lib/types";
import { YARN_COLORS } from "@/lib/yarnColors";

interface Props {
  title: string;
  /** Highlighted as the current colour, if any. */
  current?: RGB;
  onPick(rgb: RGB, yarnName?: string): void;
  /** Optional line under the title. */
  hint?: string;
  onClose(): void;
}

const same = (a?: RGB, b?: RGB) =>
  !!a && !!b && a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

/** A full yarn colour palette in a modal, plus a custom colour picker. */
export function ColorPaletteDialog({
  title,
  hint,
  current,
  onPick,
  onClose,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const custom = useRef<HTMLInputElement>(null);
  const [hex, setHex] = useState("");
  const typed = parseHex(hex);
  const hexError = hex.trim() !== "" && !typed;

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
        <div>
          <h2 className="font-display text-2xl">{title}</h2>
          {hint && <p className="text-base text-ink-soft">{hint}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="close"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-2xl hover:bg-blush"
        >
          ×
        </button>
      </div>

      <form
        className="mt-4 border-b-2 border-dashed border-ink/20 pb-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (typed) onPick(typed);
        }}
      >
        <label htmlFor="hex-code" className="text-base">
          type a hex code
        </label>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span
            aria-hidden
            className="h-11 w-11 shrink-0 rounded-xl border-2 border-ink/40"
            style={{
              background: typed
                ? rgbCss(typed)
                : "repeating-linear-gradient(45deg,#fffaf0 0 6px,#eee4d4 6px 12px)",
            }}
          />
          <input
            id="hex-code"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            placeholder="#E8A0B4"
            autoComplete="off"
            spellCheck={false}
            maxLength={7}
            aria-invalid={hexError}
            aria-describedby="hex-help"
            className="paper min-h-11 w-36 bg-paper px-3 font-mono uppercase"
          />
          <button
            type="submit"
            disabled={!typed}
            className="paper min-h-11 bg-mint px-4 disabled:opacity-45"
          >
            use this colour
          </button>
          <label className="paper relative inline-flex min-h-11 cursor-pointer items-center gap-2 bg-butter px-4 has-focus-visible:outline-2 has-focus-visible:outline-dashed has-focus-visible:outline-offset-3">
            <input
              ref={custom}
              type="color"
              aria-label="pick a colour with the colour wheel"
              defaultValue={current ? rgbToHex(current) : "#f6cfd8"}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            <span
              className="h-5 w-5 rounded-full border border-ink/50 bg-[conic-gradient(#f6cfd8,#f8edb5,#cfe8dc,#cfe2f3,#e3d3ee,#f6cfd8)]"
              aria-hidden
            />
            colour wheel…
          </label>
        </div>
        <p
          id="hex-help"
          className={`mt-1 text-sm ${hexError ? "text-[#b3261e]" : "text-ink-soft"}`}
        >
          {hexError
            ? "That isn't a hex code. Use 6 characters like #E8A0B4 (or 3 like #FAB)."
            : "6 characters like #E8A0B4, or 3 like #FAB."}
        </p>
      </form>
      <p className="mt-4 text-base">or pick a yarn colour</p>
      <ul className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(4.25rem,1fr))] gap-x-2 gap-y-3">
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
                  same(current, c.rgb)
                    ? "border-ink ring-2 ring-ink ring-offset-2 ring-offset-paper"
                    : "border-ink/40"
                }`}
                style={{ background: rgbCss(c.rgb) }}
              />
              <span className="text-sm leading-tight">{c.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </dialog>
  );
}
