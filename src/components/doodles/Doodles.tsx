import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const INK = "#5b3a29";

export function Star({ fill = "#f8edb5", ...p }: P & { fill?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden {...p}>
      <path
        d="M24 4.5c1.6 0 4.2 9.1 5.7 10.4 1.5 1.3 11.2 1.6 11.7 3.1.5 1.6-7.4 7-8 8.9-.6 1.9 2.5 11.2 1.2 12.2-1.3 1-9-4.9-10.6-4.9s-9.3 5.9-10.6 4.9c-1.3-1 1.8-10.3 1.2-12.2-.6-1.9-8.5-7.3-8-8.9.5-1.5 10.2-1.8 11.7-3.1C19.8 13.6 22.4 4.5 24 4.5Z"
        fill={fill}
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The little snail-shell spiral from the poster. */
export function Swirl({ fill = "#f6cfd8", ...p }: P & { fill?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden {...p}>
      <path
        d="M32 58c-14 0-25-10-25-24S17 8 31 8c11 0 19 8 19 18s-7 16-15 16-13-5-13-11 4-10 9-10 8 3 8 7"
        fill={fill}
        stroke={INK}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M32 58c9 0 21-4 25-12" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** A loose loopy strand of yarn. */
export function YarnSquiggle({ stroke = "#a9cba4", ...p }: P & { stroke?: string }) {
  return (
    <svg viewBox="0 0 300 120" fill="none" aria-hidden {...p}>
      <path
        d="M4 90c30-60 60-70 70-40s-30 40-20 10 50-40 80-10 10 50 40 30 40-70 70-50 20 40 50 30"
        stroke={stroke}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** A four-hole sewing button sticker. */
export function SewButton({ fill = "#cfe2f3", ...p }: P & { fill?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden {...p}>
      <circle cx="24" cy="24" r="19" fill={fill} stroke={INK} strokeWidth="2.4" />
      <circle cx="24" cy="24" r="13" fill="none" stroke={INK} strokeWidth="1.4" opacity=".5" />
      {[
        [19, 19],
        [29, 19],
        [19, 29],
        [29, 29],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="2.6" fill="#fffaf0" stroke={INK} strokeWidth="1.6" />
      ))}
    </svg>
  );
}

/** A ball of yarn with a crochet hook. */
export function YarnBall({ fill = "#f6cfd8", ...p }: P & { fill?: string }) {
  return (
    <svg viewBox="0 0 80 72" aria-hidden {...p}>
      <circle cx="34" cy="38" r="26" fill={fill} stroke={INK} strokeWidth="2.6" />
      <path d="M12 30c10 6 30 6 44-6M10 42c14 6 34 6 48-6M18 56c10-12 24-22 40-24M24 16c6 12 8 30 4 46" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" opacity=".7" />
      <path d="M58 52c8 4 14 10 18 16" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M64 6 44 50" stroke="#cfe2f3" strokeWidth="6" strokeLinecap="round" />
      <path d="M64 6 44 50" stroke={INK} strokeWidth="1.6" strokeLinecap="round" opacity=".6" />
      <path d="M66 4c-2-3 2-5 3-1" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
