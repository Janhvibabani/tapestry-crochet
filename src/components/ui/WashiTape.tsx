import type { CSSProperties } from "react";
import type { Tone } from "./tones";

const stripe: Record<Tone, string> = {
  mint: "#a9cba4",
  lilac: "#c9b2dc",
  butter: "#efd77a",
  peach: "#f0b48f",
  blue: "#9fc2e3",
  blush: "#eaa6b8",
  paper: "#e8dcc6",
};

/** A strip of semi-transparent striped washi tape, positioned by the parent. */
export function WashiTape({ tone = "blush", className = "", style }: { tone?: Tone; className?: string; style?: CSSProperties }) {
  const c = stripe[tone];
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute block h-7 w-24 opacity-85 ${className}`}
      style={{
        backgroundImage: `repeating-linear-gradient(135deg, ${c}cc 0 7px, ${c}55 7px 14px)`,
        clipPath: "polygon(3% 0, 97% 4%, 100% 50%, 96% 100%, 2% 96%, 0 50%)",
        ...style,
      }}
    />
  );
}
