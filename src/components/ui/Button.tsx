import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { toneBg, type Tone } from "./tones";

const base =
  "paper inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2 text-lg leading-none select-none " +
  "transition-[transform,box-shadow] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_2px_0_rgb(91_58_41/0.2)] " +
  "disabled:opacity-45 disabled:pointer-events-none";

type Variant = { tone?: Tone; size?: "md" | "sm"; className?: string; children: ReactNode };

const sizeCls = (size: "md" | "sm") => (size === "sm" ? "min-h-9 px-3 py-1 text-base" : "");

export function Button({ tone = "butter", size = "md", className = "", ...rest }: Variant & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={`${base} ${toneBg[tone]} ${sizeCls(size)} ${className}`} {...rest} />;
}

export function ButtonLink({ href, tone = "butter", size = "md", className = "", children }: Variant & { href: string }) {
  return (
    <Link href={href} className={`${base} ${toneBg[tone]} ${sizeCls(size)} ${className}`}>
      {children}
    </Link>
  );
}
