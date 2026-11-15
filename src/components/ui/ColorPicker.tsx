"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { hexToRgb, rgbToHex } from "@/lib/color";
import type { RGB } from "@/lib/types";

interface Props {
  value: RGB;
  label: string;
  /** Called once when the picker is closed with a new colour (not on every drag). */
  onPick(rgb: RGB): void;
  className?: string;
  children?: ReactNode;
}

/** A swatch-shaped native colour picker. */
export function ColorPicker({ value, label, onPick, className = "", children }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const cb = useRef(onPick);
  useEffect(() => {
    cb.current = onPick;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onChange = () => cb.current(hexToRgb(el.value));
    el.addEventListener("change", onChange);
    return () => el.removeEventListener("change", onChange);
  }, []);

  return (
    <label className={`relative cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-dashed has-focus-visible:outline-offset-3 ${className}`}>
      <input
        ref={ref}
        type="color"
        aria-label={label}
        defaultValue={rgbToHex(value)}
        key={rgbToHex(value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
      {children}
    </label>
  );
}
