import type { ReactNode } from "react";

const fills = { blush: "#f6cfd8", lilac: "#e3d3ee", mint: "#cfe8dc", butter: "#f8edb5", peach: "#f9d7c0", blue: "#cfe2f3" };

/** Scalloped wax-seal sticker with hand-lettered text, like the poster's "stamp rally". */
export function Stamp({ tone = "blush", className = "", children }: { tone?: keyof typeof fills; className?: string; children: ReactNode }) {
  const bumps = 14;
  const pts: string[] = [];
  for (let i = 0; i <= bumps * 2; i++) {
    const a = (i / (bumps * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? 48 : 44;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`);
  }
  return (
    <span className={`relative inline-grid place-items-center ${className}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        <polygon points={pts.join(" ")} fill={fills[tone]} stroke="#5b3a29" strokeWidth="2.4" strokeLinejoin="round" />
        <circle cx="50" cy="50" r="34" fill="none" stroke="#5b3a29" strokeWidth="1.6" strokeDasharray="4 4" opacity=".5" />
      </svg>
      <span className="relative px-6 text-center font-display leading-tight">{children}</span>
    </span>
  );
}
