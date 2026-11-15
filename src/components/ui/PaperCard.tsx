import type { ElementType, ReactNode } from "react";
import { toneBg, type Tone } from "./tones";
import { WashiTape } from "./WashiTape";

interface Props {
  tone?: Tone;
  /** Degrees; small values (-3..3) look hand placed. Flattened on phones. */
  tilt?: number;
  tape?: Tone | false;
  stitched?: boolean;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export function PaperCard({ tone = "paper", tilt = 0, tape = false, stitched = false, as: Tag = "section", className = "", children }: Props) {
  return (
    <Tag
      className={`paper ${stitched ? "stitched" : ""} ${toneBg[tone]} sm:rotate-(--tilt) ${className}`}
      style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}
    >
      {tape && <WashiTape tone={tape} className="-top-4 left-1/2 -translate-x-1/2 -rotate-3" />}
      {children}
    </Tag>
  );
}
